# QA Review -- SoulMate

**Reviewer:** QA Engineer (automated review)
**Date:** 2026-03-03
**Scope:** All source files in `backend/src/` and `frontend/src/`
**Total files reviewed:** 54 backend + 33 frontend = 87 source files

---

## Critical Bugs (things that will crash or produce wrong results)

### CRIT-01: Refresh token expiration ignores `JWT_REFRESH_EXPIRATION` config value
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 372-377
```typescript
const refreshExpiration = this.configService.get<string>(
  'JWT_REFRESH_EXPIRATION',
  '7d',
);
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // HARDCODED 7 days, ignores refreshExpiration
```
The `refreshExpiration` variable is retrieved from config but never used. The expiry is always hardcoded to 7 days regardless of what is configured.

### CRIT-02: `isConfirmation()` false-positive on any short message
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, lines 592-602
```typescript
private isConfirmation(content: string): boolean {
  const confirmPhrases = [
    'da', 'yes', 'confirm', 'correct', 'right', 'ok', 'okay',
    'yes', 'agree', 'that is right', 'everything is correct',
  ];
  const normalized = content.toLowerCase().trim();
  return (
    confirmPhrases.some((p) => normalized.includes(p)) ||
    normalized.length < 20 // ANY message under 20 chars is treated as confirmation
  );
}
```
Any user message shorter than 20 characters (including "no", "wrong", "I disagree", or even a typo) will be treated as a confirmation when in the CONFIRMATION phase. This will prematurely finalize the consultation and trigger value extraction. The duplicate `'yes'` in the array is also wasteful.

### CRIT-03: Conversation completed even when user says "no" in CONFIRMATION phase
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, lines 347-363
When `currentPhase === 'CONFIRMATION'` and `this.isConfirmation(content)` returns `true` (which it will for "no" since "no" is < 20 chars), the conversation is marked `COMPLETED`, and the full extraction pipeline runs. This is a data-integrity bug.

### CRIT-04: Frontend phases do not match backend phases
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/types/index.ts`, lines 109-115
```typescript
export type ConsultationPhase =
  | "GREETING"
  | "REQUEST_EXPLORATION"  // Backend uses "SITUATION_EXPLORATION"
  | "VALUE_INTERVIEW"      // Backend uses "VALUE_ASSESSMENT"
  | "PREFERENCES"          // Backend uses "FORMAT_PREFERENCES"
  | "CONFIRMATION"
  | "COMPLETED";           // Not a phase in the backend schema
```
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/prisma/schema.prisma`, lines 238-248
The backend schema defines phases as: `GREETING`, `SITUATION_EXPLORATION`, `VALUE_ASSESSMENT`, `FORMAT_PREFERENCES`, `PROFESSIONAL_BACKGROUND`, `WORK_STYLE`, `CASE_QUESTIONS`, `SUMMARY`, `CONFIRMATION`. The frontend uses completely different phase names (`REQUEST_EXPLORATION`, `VALUE_INTERVIEW`, `PREFERENCES`). The `ChatProgress` component in `frontend/src/components/chat/chat-progress.tsx` (lines 13-19) and the consultation page simulation (lines 136-154) both use the mismatched names. This means the progress bar will never correctly track the backend phases. The `SUMMARY` phase from the backend is entirely missing from the frontend.

### CRIT-05: `UpdateUserDto` sends undefined fields, overwriting existing data with null
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/users/users.service.ts`, lines 56-67
```typescript
async updateMe(userId: string, dto: UpdateUserDto) {
  const user = await this.prisma.user.update({
    where: { id: userId },
    data: {
      firstName: dto.firstName,    // undefined if not sent -> sets to null
      lastName: dto.lastName,
      age: dto.age,
      gender: dto.gender,
      city: dto.city,
      timezone: dto.timezone,
    },
  });
```
When a client sends a PATCH request with only `{ firstName: "New" }`, all other fields (`lastName`, `age`, `gender`, `city`, `timezone`) will be `undefined`, and Prisma will set them to `null`, wiping the user's existing data. This should filter out `undefined` values or use a spread that only includes defined fields.

### CRIT-06: Avatar upload ignores the actual file
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/users/users.controller.ts`, lines 43-49
```typescript
async updateAvatar(
  @CurrentUser() user: JwtPayload,
  @UploadedFile() file: Express.Multer.File,
) {
  const avatarUrl = `https://cdn.soulmate.ru/avatars/${user.sub}.jpg`;
  return this.usersService.updateAvatar(user.sub, avatarUrl);
}
```
The `file` parameter is accepted but completely ignored. The URL is hardcoded. No file validation (size, type) is performed. If Multer is not properly configured, this endpoint will crash with a missing middleware error.

### CRIT-07: WebSocket CORS set to wildcard `'*'`
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`, lines 35-40
```typescript
@WebSocketGateway({
  namespace: 'ai-chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
```
Setting `origin: '*'` with `credentials: true` is invalid per the CORS spec and browsers will reject it. Additionally, `origin: '*'` is a security vulnerability in production for an authenticated WebSocket endpoint. The REST API correctly uses a configurable `CORS_ORIGINS` but the WebSocket gateway does not.

---

## Type Errors & Missing Imports

### TYPE-01: `require('crypto')` instead of import
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, line 391
```typescript
private hashToken(token: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}
```
Uses `require()` inside a method instead of a top-level `import`. This is inconsistent with the TypeScript/ES module style of the rest of the codebase and can cause issues with bundlers. Should use `import * as crypto from 'crypto'` at the top of the file.

### TYPE-02: Unsafe `as any` casts throughout the backend
Multiple files use `as any` to bypass type checking:
- `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/specialists/specialists.service.ts`, line 34: `type: dto.type as any`
- `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, line 103: `type: type as any`
- `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, line 105: `phase: initialPhase as any`
- `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, line 296: `currentPhase = nextPhase as unknown as typeof conversation.phase`
- `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, line 329: `phase: currentPhase as any`
- `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/specialists/catalog.service.ts`, line 29: `where.type = query.type as any`
- `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/specialists/catalog.service.ts`, line 52: `where.user = { ...where.user as any, gender: query.gender }`

These should use the proper Prisma enum types to get compile-time safety.

### TYPE-03: Missing `React` import in Skeleton component
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/components/ui/skeleton.tsx`, line 4
```typescript
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
```
`React` is referenced in the type annotation but never imported. This works in Next.js with the automatic JSX runtime but is technically incomplete and will break if the JSX transform changes or the file is used outside the Next.js context.

### TYPE-04: `ConsultationResult` type mismatch between frontend types and backend output
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/types/index.ts`, lines 163-169
The `ConsultationResult` type expects fields like `recommendedSpecialistType`, `valueProfile`, and `preferences`, but the backend's `extractedValues` (saved by `ai-chat.service.ts`) stores `ExtractedValueProfile` which has a completely different structure (`values`, `communicationStyle`, `requestType`, `requestSummary`, `summaryText`, `confidence`). The frontend `ConsultationSummary` component at `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/components/chat/consultation-summary.tsx` relies on `summary.preferences.priceRange` and `summary.recommendedSpecialistType`, which will be `undefined` when real backend data is used.

---

## Error Handling Issues

### ERR-01: No error handling for Redis connection failure at startup
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/common/redis/redis.service.ts`, lines 17-37
If Redis is unreachable at startup, the `retryStrategy` returns `null` after 3 retries, but `this.client` is still assigned the Redis instance. Subsequent calls to `get`, `set`, `del` will throw unhandled errors since the client is in a disconnected state. There is no health check or fallback mechanism.

### ERR-02: `onModuleDestroy` in Redis will crash if `client` was never initialized
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/common/redis/redis.service.ts`, lines 40-42
```typescript
async onModuleDestroy() {
  await this.client.quit();
}
```
If `onModuleInit` throws before `this.client` is assigned, `onModuleDestroy` will throw `Cannot read properties of undefined (reading 'quit')`.

### ERR-03: `JSON.parse` in `RedisService.getJson` can throw on corrupted data
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/common/redis/redis.service.ts`, lines 64-68
```typescript
async getJson<T>(key: string): Promise<T | null> {
  const raw = await this.client.get(key);
  if (!raw) return null;
  return JSON.parse(raw) as T; // No try-catch
}
```
If the stored value is corrupted or not valid JSON, this will throw an unhandled exception.

### ERR-04: `verifyEmail` does not check if user exists before updating
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 169-191
If the `userId` stored in Redis has since been deleted from the database, the `prisma.user.update` call on line 176 will throw a Prisma `RecordNotFoundError`. There is no try-catch or pre-check.

### ERR-05: Missing validation for `conversationId` in WebSocket gateway
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`, lines 82-98
The `handleJoinConversation` method does not verify that the conversation belongs to the authenticated user. Any authenticated user can join any conversation's room by providing its ID, potentially receiving streaming tokens and messages from other users' conversations.

### ERR-06: `processMessage` does not verify the conversation belongs to the user in the gateway
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`, lines 100-184
While `AiChatService.processMessage` does check `where: { id: conversationId, userId }`, an attacker can still receive streamed tokens by joining another user's conversation room (see ERR-05) since the room name is predictable (`conversation:{id}`).

### ERR-07: `PrismaService.onModuleInit` has no error handling for connection failure
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/common/prisma/prisma.service.ts`, lines 22-24
```typescript
async onModuleInit() {
  await this.$connect(); // Unhandled if DB is unreachable
  this.logger.log('Database connection established');
}
```
If the database is unreachable, the application will crash with an unhandled exception. Should have a retry mechanism or graceful error message.

### ERR-08: REST API endpoint `POST /ai/consultations/:id/messages` does not exist
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/app/consultation/page.tsx`, lines 111-113
```typescript
const { data } = await apiClient.post(
  `/ai/consultations/${conversationId}/messages`,
  { content: content.trim() }
);
```
The backend `AiController` at `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai.controller.ts` has no `POST /ai/consultations/:id/messages` endpoint. Messages are only sent through the WebSocket gateway. The REST fallback the frontend relies on will always 404.

---

## Logic Issues & Edge Cases

### LOGIC-01: Phase transition only occurs at `max` exchanges, never at `min`
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, lines 513-538
```typescript
private evaluatePhaseTransition(
  type: string, currentPhase: string, exchangeCount: number,
): { shouldTransition: boolean; nextPhase: string | null } {
  // ...
  if (exchangeCount >= phaseLimit.max) {
    // Only transitions at max
  }
  return { shouldTransition: false, nextPhase: null };
}
```
The `min` limits are defined but never used. The LLM is expected to gather enough data within `min` exchanges, but the system will always force the conversation to the `max` number of exchanges per phase. The `min` values serve no purpose.

### LOGIC-02: `initialPhase` is always `'GREETING'` regardless of type
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, lines 97-98
```typescript
const initialPhase =
  type === 'SPECIALIST_INTERVIEW' ? 'GREETING' : 'GREETING';
```
This ternary is redundant -- both branches return `'GREETING'`. Either this is correct and the ternary should be removed, or one of the branches should be a different value.

### LOGIC-03: Consultation limit check only applies for `CLIENT_CONSULTATION`, not `PROFILE_CORRECTION`
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, lines 86-95
The `PROFILE_CORRECTION` type bypasses the subscription limit check entirely, meaning a free user can create unlimited `PROFILE_CORRECTION` consultations.

### LOGIC-04: Consultation usage is incremented on confirm, not on creation
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`, lines 416-423
The AI consultation limit is checked when creating a consultation but the usage counter is only incremented when confirming. If a user creates a consultation but never confirms, they can create unlimited new consultations since the counter never increments.

### LOGIC-05: `deleteMe` sets `isActive = false` but claims deletion in 30 days
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/users/users.service.ts`, lines 80-94
The method calculates a `deleteAt` date but never stores it. There is no scheduled job to actually delete the account. The account is simply deactivated and will remain in the database indefinitely.

### LOGIC-06: No password complexity validation
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/dto/auth.dto.ts`, lines 16-17
```typescript
@IsString()
@MinLength(8)
password: string;
```
Only minimum length 8 is enforced. No uppercase, lowercase, digit, or special character requirements. This is a security weakness.

### LOGIC-07: `loginEmail` does not check `emailVerified`
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 194-232
A user can log in with email/password without ever verifying their email. The `emailVerified` field is never checked during login. This defeats the purpose of email verification.

### LOGIC-08: `CatalogQueryDto.specialization` should use `@Transform` for query arrays
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/specialists/dto/specialist.dto.ts`, lines 89-92
```typescript
@IsArray()
@IsString({ each: true })
@IsOptional()
specialization?: string[];
```
Query parameters come as strings, not arrays. A single `?specialization=X` will be a string `"X"`, not `["X"]`. The `@IsArray()` validation will reject it unless the client explicitly sends `?specialization[]=X`. A `@Transform` decorator is needed to normalize single values to arrays.

### LOGIC-09: OTP generation is not cryptographically secure
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, line 98
```typescript
const code = Math.floor(1000 + Math.random() * 9000).toString();
```
`Math.random()` is not cryptographically secure. For OTP generation, `crypto.randomInt(1000, 10000)` should be used.

### LOGIC-10: `loginPhone` rate limiting is missing
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 234-250
Unlike `registerPhone` which has OTP rate limiting, `loginPhone` has no rate limiting check. An attacker can repeatedly request OTPs for any phone number.

### LOGIC-11: `getPublicProfile` signature mismatch between controller and service
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/specialists/specialists.controller.ts`, line 81
```typescript
return this.specialistsService.getPublicProfile(id);
```
The service method `getPublicProfile` accepts `(specialistId: string, currentUserId?: string)` but the controller never passes `currentUserId`. The parameter exists in the service but is never used.

### LOGIC-12: Cookie path is hardcoded to `/v1/auth`
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.controller.ts`, lines 150, 158
```typescript
res.clearCookie('refresh_token', { path: '/v1/auth' });
// ...
res.cookie('refresh_token', token, {
  // ...
  path: '/v1/auth',
});
```
The path is hardcoded to `/v1/auth` but the API prefix is configurable via `API_PREFIX` env var (default `'v1'`). If the prefix changes, cookies will be set on the wrong path.

---

## Dead Code & Inconsistencies

### DEAD-01: `refreshExpiration` variable is assigned but never used
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 372-375
```typescript
const refreshExpiration = this.configService.get<string>(
  'JWT_REFRESH_EXPIRATION',
  '7d',
);
```
This value is fetched from config but never referenced. (See CRIT-01.)

### DEAD-02: Empty `BookingController` and `BookingService`
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/booking/booking.controller.ts` (lines 1-7)
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/booking/booking.service.ts` (lines 1-7)
Both are completely empty stub classes with no methods. The DTOs (`CreateBookingDto`, `CancelBookingDto`, `RescheduleBookingDto`, `SlotsQueryDto`, `UpdateScheduleDto`) are defined but never used by any controller.

### DEAD-03: Empty `ScheduleController`
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/booking/schedule.controller.ts` (lines 1-6)
The `ScheduleService` has working methods (`getMySchedule`, `updateSchedule`, `getAvailableSlots`) but the controller has no route handlers. The schedule functionality is inaccessible via HTTP.

### DEAD-04: `ScheduleService` `UpdateScheduleDto` is imported but not used by any controller
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/booking/schedule.service.ts`, line 3

### DEAD-05: `SendMessageDto` defined but never used
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/dto/ai.dto.ts`, lines 16-22
The `SendMessageDto` class is defined but not used by any controller or gateway. Messages are sent only via WebSocket, which uses its own `data` parameter validation.

### DEAD-06: `HelpCircle` and `Lock` imported but the `Lock` icon in `ChatProgress` has no interactive behavior
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/components/chat/chat-progress.tsx`, line 3
`HelpCircle` is imported and used (line 99) but the button it's in has no `onClick` handler and performs no action.

### DEAD-07: `MapPin` imported but never used in `SpecialistCard`
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/components/specialists/specialist-card.tsx`, line 4
```typescript
import { ShieldCheck, Star, Clock, MapPin } from "lucide-react";
```
`MapPin` and `Star` are imported but never used in the component.

### DEAD-08: Duplicate function `extractTopValues` / `getTopValues` in catalog vs specialists service
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/specialists/catalog.service.ts`, lines 165-174
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/specialists/specialists.service.ts`, lines 219-238
Both services have nearly identical private methods for extracting top values from a profile, but with slightly different implementations: `CatalogService.extractTopValues` returns raw keys while `SpecialistsService.getTopValues` maps them through a labels dictionary. This inconsistency means the catalog list shows raw keys like `"career"` while the detail page shows `"Career"`.

### DEAD-09: `AiModule` imports `JwtModule.register({})` without a secret
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai.module.ts`, line 12
```typescript
imports: [ValueProfileModule, JwtModule.register({})],
```
`JwtModule` is registered with an empty config (no `secret`). The `AiChatGateway` uses `this.jwtService.verify(token)` which will fail without a configured secret. This should either use `JwtModule.registerAsync` with the config service to inject `JWT_SECRET`, or import `JwtModule` from the `AuthModule` exports.

### DEAD-10: `useCallback` in consultation page has stale closure risks
**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/app/consultation/page.tsx`, lines 90-133
The `sendMessage` callback depends on `conversationId` and `phase` but the eslint-disable comment on line 63 suppresses the exhaustive-deps warning for `startConsultation`, not for `sendMessage`. The dependency array for `sendMessage` lists state setters from zustand which are stable, but `conversationId` and `phase` are read from the store at render time and may go stale in the closure.

---

## Test Coverage

### TEST-01: Zero test files exist
No `*.spec.ts`, `*.test.ts`, or `*.test.tsx` files were found anywhere in the project.

- **Backend:** 0 unit tests, 0 integration tests, 0 e2e tests
- **Frontend:** 0 component tests, 0 integration tests, 0 e2e tests

### Critical paths that need tests:
1. **Authentication flows** (register, login, OTP, JWT refresh, logout)
2. **Crisis detection** (keyword matching, crisis alert creation)
3. **Value extraction pipeline** (JSON parsing, normalization, default profiles)
4. **Matching scoring algorithm** (cosine similarity, style match, approach match)
5. **Phase transitions** (correct ordering, boundary conditions)
6. **WebSocket gateway** (auth, message handling, room isolation)
7. **Catalog filtering** (price ranges, specializations, pagination)
8. **Frontend stores** (auth state management, consultation state)
9. **Chat components** (bubble rendering, streaming, crisis alert display)

---

## Recommendations

### Priority 1 (Critical -- fix before any deployment)

1. **Fix `isConfirmation()` to properly detect negative responses.** Add rejection phrases (`no`, `wrong`, `incorrect`, `not right`) and remove the `< 20 chars` fallback. Consider asking the LLM to classify confirmation vs. rejection.

2. **Fix `UpdateUserDto` to not overwrite existing data with null.** Filter undefined values before passing to Prisma:
   ```typescript
   const data = Object.fromEntries(
     Object.entries(dto).filter(([_, v]) => v !== undefined)
   );
   ```

3. **Fix WebSocket CORS** to use the same `CORS_ORIGINS` config as the REST API, and remove `origin: '*'`.

4. **Fix `AiModule` `JwtModule` registration** to include the JWT secret from config, or the WebSocket authentication will silently fail.

5. **Align frontend phase names with backend phase names** or implement a mapping layer. The `ChatProgress` component shows incorrect progress when connected to the real backend.

6. **Add a REST endpoint for sending messages** (or implement WebSocket on the frontend) so the consultation page can actually communicate with the AI service.

### Priority 2 (High -- fix before beta)

7. **Add authorization check in `handleJoinConversation`** to verify the conversation belongs to the requesting user.

8. **Use `crypto.randomInt()` instead of `Math.random()`** for OTP generation.

9. **Add rate limiting to `loginPhone`** similar to `registerPhone`.

10. **Check `emailVerified` during `loginEmail`** or at least warn the user.

11. **Actually parse `JWT_REFRESH_EXPIRATION`** and use it for token expiry calculation.

12. **Add `@Transform` decorators to array query parameters** in `CatalogQueryDto`.

13. **Implement the `BookingController` and `ScheduleController`** routes or remove the dead DTOs.

### Priority 3 (Medium -- pre-production hardening)

14. **Add comprehensive test suites** for all critical paths listed above.

15. **Replace `as any` casts** with proper Prisma enum types throughout the backend.

16. **Add retry/health-check logic** for Redis and database connections.

17. **Implement actual file upload** for avatars and documents instead of hardcoded URLs.

18. **Add `try-catch` to `RedisService.getJson`** for corrupted JSON data.

19. **Unify the `extractTopValues`/`getTopValues` functions** into a shared utility.

20. **Remove unused imports** (`MapPin`, `Star` in specialist-card; duplicate `'yes'` in confirmation phrases).

21. **Implement the `deleteAt` scheduled deletion** or remove the misleading 30-day message from `deleteMe`.

22. **Add password complexity validation** beyond `@MinLength(8)`.

23. **Replace `require('crypto')` with a static `import`** in `auth.service.ts`.

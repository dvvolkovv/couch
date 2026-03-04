# Architecture Review -- SoulMate

**Reviewer:** System Architect
**Date:** 2026-03-03
**Codebase snapshot:** commit `20779c6` on `main`

---

## System Overview

SoulMate is a value-based psychologist/coach matching platform built for the Russian market. The core differentiator is that, rather than relying on manual questionnaire forms, the platform conducts a structured AI-driven conversation with both clients and specialists to extract multidimensional "value profiles." These profiles are then compared using a weighted scoring algorithm to produce personalized specialist recommendations.

The platform supports three user roles (Client, Specialist, Admin) and the core user journey is:

1. Client registers and enters an AI consultation (real-time chat via WebSocket).
2. The AI guides the client through structured phases: greeting, situation exploration, value assessment, format preferences, summary, and confirmation.
3. Upon completion, an LLM-based extraction pipeline converts the conversation transcript into a numeric value profile (10 value axes, 4 communication style dimensions, worldview, and preferences).
4. The profile is embedded as a 1536-dimensional vector (OpenAI `text-embedding-3-small`) and stored in PostgreSQL via pgvector.
5. A matching engine scores all approved specialists against the client using a weighted formula (value match, style match, approach match, worldview match, specialization relevance).
6. The client receives ranked recommendations, selects a specialist, and books a session.

Specialists undergo a parallel AI interview to produce their own value profile.

The system also includes crisis detection (keyword-based + LLM-in-prompt), booking/scheduling, payments (schema-ready but not implemented), subscriptions, reviews, direct messaging (Phase 2), and analytics event tracking.

---

## Backend Architecture

### Module Structure

The NestJS backend (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/`) is organized into a root `AppModule` with the following module graph:

```
AppModule
  +-- ConfigModule (global)
  +-- ThrottlerModule
  +-- PrismaModule (global)
  +-- RedisModule (global)
  +-- AuthModule
  +-- UsersModule
  +-- SpecialistsModule
  +-- AiModule --> ValueProfileModule
  +-- MatchingModule --> ValueProfileModule, AiModule
  +-- BookingModule
  +-- ValueProfileModule
```

**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/app.module.ts`

**Observations:**

- `PrismaModule` and `RedisModule` are correctly marked `@Global()`, avoiding repetitive imports.
- `ConfigModule` is global via `isGlobal: true`.
- The `AiModule` correctly imports `ValueProfileModule` and re-exports `JwtModule` for the WebSocket gateway's token verification.
- `MatchingModule` imports both `ValueProfileModule` and `AiModule` (for `LlmService`), which establishes a clear dependency chain. However, the `AiModule` importing `JwtModule.register({})` with an empty config is a smell -- it relies on the `ConfigService` only being used at the `AuthModule` level. The JWT secret is not injected here, meaning `jwtService.verify()` in `AiChatGateway` will only work if the default secret matches. This is fragile (see Weaknesses).

### API Design & REST Endpoints

**File:** Various controllers in `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/`

The API is mounted under a configurable global prefix (default `v1`) and uses the following route structure:

| Route Group | Endpoints | Auth |
|---|---|---|
| `POST /v1/auth/register/email` | Email registration | Public |
| `POST /v1/auth/register/phone` | Phone OTP registration | Public |
| `POST /v1/auth/verify/phone` | Verify OTP | Public |
| `POST /v1/auth/verify/email` | Verify email token | Public |
| `POST /v1/auth/login/email` | Email login | Public |
| `POST /v1/auth/login/phone` | Phone login (sends OTP) | Public |
| `POST /v1/auth/oauth/google` | Google OAuth (stub) | Public |
| `POST /v1/auth/oauth/vk` | VK OAuth (stub) | Public |
| `POST /v1/auth/refresh` | Refresh access token | Public |
| `POST /v1/auth/logout` | Logout | Authenticated |
| `GET /v1/users/me` | Current user profile | Authenticated |
| `PATCH /v1/users/me` | Update profile | Authenticated |
| `PATCH /v1/users/me/avatar` | Upload avatar | Authenticated |
| `DELETE /v1/users/me` | Soft-delete account | Authenticated |
| `POST /v1/specialists/apply` | Apply as specialist | Authenticated |
| `GET /v1/specialists/me` | Specialist's own profile | SPECIALIST |
| `PATCH /v1/specialists/me` | Update specialist profile | SPECIALIST |
| `GET /v1/specialists/:id` | Public specialist profile | Public |
| `GET /v1/catalog/specialists` | Catalog search/filter | Public |
| `GET /v1/catalog/specializations` | Available specializations | Public |
| `POST /v1/ai/consultations` | Create AI consultation | Authenticated |
| `GET /v1/ai/consultations` | List consultations | Authenticated |
| `GET /v1/ai/consultations/:id` | Get consultation + history | Authenticated |
| `POST /v1/ai/consultations/:id/confirm` | Confirm results | Authenticated |
| `GET /v1/value-profile/me` | Own value profile | Authenticated |
| `GET /v1/value-profile/specialist/:id` | Public specialist values | Public |
| `POST /v1/matching/recommendations` | Generate recommendations | Authenticated |
| `POST /v1/matching/feedback` | Submit feedback | Authenticated |
| `GET /v1/matching/score/:specialistId` | Individual match score | Authenticated |

**Observations:**

- REST conventions are generally well-followed. Resources are nouns, actions use POST.
- `POST /matching/recommendations` uses POST correctly since it triggers a computation (not idempotent), though `GET` with query parameters would also be defensible.
- Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`) are consistently applied.
- **Missing:** The `BookingController` and `ScheduleController` are empty scaffolds -- no endpoints are defined yet.

  **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/booking/booking.controller.ts` (7 lines, no routes)

- **Missing:** There is no REST endpoint for `processMessage` (sending a message in a consultation). The frontend `consultation/page.tsx` attempts to POST to `/ai/consultations/${conversationId}/messages`, but this route does not exist in `AiController`. Messages are only processed via the WebSocket gateway. This means the frontend's REST fallback will always fail, falling through to the demo simulation.

- The `TransformInterceptor` wraps all responses in `{ data: ... }`, providing a consistent envelope. Error responses use `{ error: { code, message, details? } }` via the `HttpExceptionFilter`. This is a good, consistent API contract.

### WebSocket Architecture

**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`

The AI chat uses a Socket.IO gateway mounted on the `/ai-chat` namespace. The protocol is well-designed:

- **Authentication:** JWT token extracted from `handshake.auth.token` or `handshake.query.token`, verified via `JwtService`. Unauthenticated connections are immediately disconnected.
- **Rooms:** Each conversation gets a room (`conversation:${id}`), enabling proper message isolation.
- **Events:** Clear separation of concerns with `join_conversation`, `send_message`, `typing` (client->server) and `ai_stream_start`, `ai_stream_token`, `ai_stream_end`, `phase_changed`, `crisis_detected`, `summary_ready`, `error` (server->client).
- **Streaming:** LLM tokens are streamed in real-time through the `onToken` callback, which emits `ai_stream_token` events.

**Issues:**

1. **JWT secret mismatch:** `AiModule` imports `JwtModule.register({})` with no secret. The `JwtStrategy` in `AuthModule` uses `ConfigService.get('JWT_SECRET')`, but this empty registration means `this.jwtService.verify(token)` in the gateway may use a different (empty/default) secret. This would silently fail to verify tokens. The fix is to use `JwtModule.registerAsync` with the same config factory, or to import the `AuthModule`'s exported `JwtModule`.

2. **No authorization check on room joins:** `handleJoinConversation` does not verify that the authenticated user actually owns the conversation they are joining. A user could join another user's conversation room and receive their AI responses.

3. **In-memory user tracking:** `connectedUsers` is a local `Map<string, string>`. In a multi-instance deployment behind a load balancer, this breaks -- a user connected to instance A cannot have messages processed by instance B. Socket.IO's Redis adapter would be needed for horizontal scaling.

4. **CORS wildcard:** The WebSocket gateway has `origin: '*'`, which is overly permissive and should match the frontend origin.

### Database Schema Analysis (Prisma)

**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/prisma/schema.prisma`

The schema is comprehensive with 22 models. Key observations:

**Strengths:**
- Consistent use of `@map("snake_case")` and `@@map("table_name")` for PostgreSQL naming conventions while keeping PascalCase in Prisma.
- CUID identifiers throughout (no sequential integer IDs exposed).
- Proper `onDelete: Cascade` on child relationships (messages, tokens, documents).
- `RefreshToken` model with `revokedAt` for token rotation and revocation -- good security pattern.
- pgvector extension enabled correctly with `Unsupported("vector(1536)")` on `ValueProfile.embedding`.
- Thoughtful composite indexes: `@@index([type, verification, sessionPrice])` on `SpecialistProfile` for catalog queries, `@@index([conversationId, createdAt])` on `AIMessage` for message history.
- `AnalyticsEvent` model for event tracking with proper indexes on `(event, createdAt)` and `(userId, createdAt)`.

**Concerns:**
- **Missing index on `ValueProfile.embedding`:** There is no pgvector index (IVFFlat or HNSW) on the embedding column. Without this, nearest-neighbor searches will do a full table scan. The matching service currently does not use pgvector similarity search at all (see Matching Algorithm section), but the embedding is stored, suggesting this was planned. An HNSW index should be added:
  ```sql
  CREATE INDEX ON value_profiles USING hnsw (embedding vector_cosine_ops);
  ```

- **`ScheduleSlot` dual-purpose design:** The model serves both recurring templates (`isRecurring=true`, `dayOfWeek`, `startTime`, `endTime`) and concrete one-off slots (`isRecurring=false`, `slotDate`, `slotStart`, `slotEnd`). This overloaded design leads to many nullable fields and makes queries complex. Splitting into `RecurringSchedule` and `ConcreteSlot` models would be cleaner.

- **Money stored as `Int`:** `sessionPrice`, `price`, `commission`, `specialistPayout`, `amount`, etc. are all `Int`. This works for ruble-denominated amounts but the schema does not document the unit (kopecks vs rubles). The `Payment` model uses `currency: String @default("RUB")` and `amount: Int`, suggesting amounts are in the smallest unit (kopecks), but `SpecialistProfile.sessionPrice` appears to be in rubles (DTO validation has `@Min(500) @Max(50000)`). This inconsistency risks calculation errors.

- **`ValueProfile.values` and `communicationStyle` as `Json`:** Storing structured numeric profiles as untyped JSON means the database cannot validate the schema of these fields. Any code that reads these fields must cast and handle potential shape mismatches. A more robust approach would be to use dedicated columns for each value dimension, enabling database-level constraints and direct SQL queries.

- **No soft-delete on sensitive data:** `User.isActive` is used for soft-delete, but `AIConversation`, `AIMessage`, and `ValueProfile` have no soft-delete mechanism. For GDPR/privacy compliance (the platform handles sensitive mental health data), there needs to be a way to anonymize or delete conversation data when a user requests account deletion.

- **`PromoCode.code` has a redundant index:** The `code` field is already `@unique`, which creates an index. The explicit `@@index([code])` is unnecessary.

### AI Integration Architecture

The AI subsystem is composed of four services:

1. **`LlmService`** (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/llm.service.ts`): Abstraction over Anthropic Claude (primary) with mock fallback. Provides `streamChat()` for streaming conversations and `structuredOutput()` for JSON extraction. Clean interface design with `LlmMessage` and `LlmResponse` types.

2. **`AiChatService`** (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.service.ts`): Core orchestrator managing conversation state, phase transitions, and the extraction pipeline. Phase transitions are exchange-count-based (min/max per phase).

3. **`ValueExtractionService`** (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/value-extraction.service.ts`): Extracts structured value profiles from conversation transcripts using LLM structured output. Includes normalization and fallback to default profiles on parse failure.

4. **`CrisisDetectorService`** (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/crisis-detector.service.ts`): Two-level crisis detection -- keyword matching (instant) and LLM-based (via system prompt instructions).

**Prompt Design** (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/prompts/system-prompts.ts`):

The prompts are well-structured with:
- Clear role definition ("You are NOT a psychologist")
- Phase-specific instructions with transition criteria
- Crisis marker awareness built into the base prompt
- Extraction prompts with explicit JSON schema and assessment rules
- Both client and specialist conversation flows with distinct phases

**Issues:**

- **Phase transition is purely exchange-count-based:** The system transitions phases based on `phaseExchangeCount >= max`, not based on whether the AI has actually gathered sufficient information. A user could send 8 "I don't know" messages and still progress through VALUE_ASSESSMENT. The LLM is not consulted about readiness to transition. This could produce low-quality profiles.

- **Confirmation detection is fragile:** The `isConfirmation()` method in `AiChatService` (line 593-602) considers any message under 20 characters as confirmation. A user typing "No" or "Wrong" (both under 20 chars) would trigger confirmation. Russian-language confirm phrases are transliterated ("da") rather than using Cyrillic, so actual Russian confirmations would not be detected.

- **Full message history sent to LLM on every exchange:** `processMessage()` builds `llmMessages` from all conversation messages and sends them with every request. For long conversations (15-26 exchanges), this means 30-52 messages in context. While Claude handles this, it is wasteful of tokens and costly. A sliding window or summarization approach would be more efficient.

- **No retry logic for LLM calls:** If the Anthropic API returns a transient error (rate limit, timeout), the service falls back to mock responses silently. In production, there should be retry with exponential backoff before falling back.

### Dependency Injection & Service Layer

The DI patterns are clean and idiomatic NestJS:

- Services are `@Injectable()` with constructor injection.
- Global guards (`JwtAuthGuard`, `RolesGuard`) are registered via `APP_GUARD` in `AuthModule`.
- The `@Public()` decorator + `IS_PUBLIC_KEY` metadata pattern correctly bypasses auth for public routes.
- `@CurrentUser()` parameter decorator extracts the JWT payload cleanly.

**Concern:** The `AuthService` uses `require('crypto')` inline (line 392 in `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`) instead of an ES import. This is a minor code smell but works correctly at runtime.

---

## Frontend Architecture

### Component Structure

The Next.js frontend (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/`) uses the App Router with the following page structure:

```
app/
  layout.tsx          -- Root layout with Header, MobileBottomNav, Providers
  page.tsx            -- Landing page
  providers.tsx       -- QueryClient + AuthInitializer
  consultation/
    page.tsx          -- AI consultation chat interface
  catalog/
    page.tsx          -- Specialist catalog with filters
```

Components are organized into:
- `components/ui/` -- Design system primitives (Button, Card, Badge, Avatar, Dialog, Progress, Input, Skeleton, StarRating, MatchPercentageRing, ValueRadarChart, ValueTags)
- `components/chat/` -- AI consultation components (ChatBubble, TypingIndicator, QuickReplies, ConsultationSummary, CrisisAlert, ChatProgress)
- `components/specialists/` -- Catalog components (SpecialistCard, SpecialistFilters)
- `components/layout/` -- Header, Footer, MobileBottomNav

**Observations:**

- The UI library is based on Radix UI primitives + Tailwind CSS + CVA (class-variance-authority), following the shadcn/ui pattern. This is a solid, accessible foundation.
- The `Button` component correctly separates `asChild` (using Radix `Slot`) from `loading` state, avoiding the `React.Children.only` error with `Slot` (the latest commit `20779c6` specifically fixes this).
- The `ValueRadarChart` uses Recharts for data visualization, which is appropriate for the radar chart use case.
- Components are appropriately split -- `ChatBubble` handles message rendering, `TypingIndicator` shows the AI thinking state, `QuickReplies` provides suggested responses.

**Issues:**

- **Many pages are missing:** The frontend only has 3 pages (landing, consultation, catalog). Critical user flows are absent: authentication pages (`/auth/login`, `/auth/register`), specialist detail page (`/catalog/:id`), booking flow, user dashboard, specialist dashboard, matching results page (`/consultation/results`). The header and bottom nav reference these routes but they do not exist yet.

- **Demo/hardcoded data in catalog:** The catalog page (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/app/catalog/page.tsx`) uses `DEMO_SPECIALISTS` array with 6 hardcoded entries. There is no actual API integration -- no `useQuery` hook, no `apiClient.get('/catalog/specialists')` call.

- **Consultation page has significant demo logic:** About half of `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/app/consultation/page.tsx` is the `simulateAiResponse()` function (lines 135-215) that provides hardcoded phase responses when the API call fails. While useful for development, this tight coupling of demo logic with real UI code makes it harder to reason about the actual production flow.

### State Management

Two Zustand stores handle global state:

1. **`useAuthStore`** (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/store/auth-store.ts`): Manages authentication state, token persistence in `localStorage`, and user data. Includes `initialize()` for hydration on app load.

2. **`useConsultationStore`** (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/store/consultation-store.ts`): Manages the AI conversation state including messages, streaming content, phase, quick replies, and results. Well-designed with actions for each state transition (`appendStreamToken`, `finalizeStream`, `setPhase`, etc.).

**Observations:**

- Zustand is a good choice -- lightweight, no boilerplate, works well with Next.js.
- The auth store correctly handles the token refresh flow at the API client level (`/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/lib/api-client.ts`), with a request queue that holds failed 401 requests until the refresh completes.
- The consultation store's `finalizeStream` action (line 73-105) has proper deduplication logic -- it checks if the message already exists before adding it.

**Issues:**

- **Access token in `localStorage`:** The access token is stored in `localStorage` (line 18-24 of `api-client.ts`). This is vulnerable to XSS attacks. Since the refresh token is properly stored in an `httpOnly` cookie (line 154 of `auth.controller.ts`), the access token should ideally be kept only in memory. The current implementation persists it for page refresh hydration, but a better pattern would be to silently refresh on page load using the cookie.

- **No WebSocket integration in the frontend:** The consultation page does not use Socket.IO at all -- there is no `import { io } from 'socket.io-client'` anywhere. The `socket.io-client` package is listed as a dependency but never used. The `consultation/page.tsx` attempts a REST POST fallback and then falls into demo mode. The entire WebSocket streaming infrastructure built on the backend is currently unused by the frontend.

### API Integration

**File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/lib/api-client.ts`

The API client is an Axios instance with:
- Base URL from environment variable
- Automatic Bearer token attachment via request interceptor
- Automatic 401 handling with silent token refresh via response interceptor
- Request queue to avoid multiple simultaneous refresh calls
- `withCredentials: true` for cookie-based refresh tokens

This is a well-implemented API client pattern. The queue-based refresh handling (lines 43-107) is particularly good -- it prevents race conditions when multiple requests fail simultaneously with 401.

**Issue:** The `data.data.accessToken` access pattern (line 89) assumes the response is wrapped in `{ data: { ... } }`. Since the `TransformInterceptor` wraps responses in `{ data: ... }`, and Axios itself wraps in `{ data: ... }`, the actual access path is `response.data.data.accessToken`. This works but is confusing. Using a response interceptor to unwrap the API envelope would improve readability.

### Routing

The app uses Next.js App Router. Only three routes are implemented:
- `/` -- Landing page (server component)
- `/consultation` -- AI chat (client component)
- `/catalog` -- Specialist catalog (client component)

The routing architecture is incomplete. Key missing routes include `/auth/*`, `/catalog/:id`, `/catalog/:id/book`, `/consultation/results`, `/dashboard/*`, `/specialist/*`, `/profile/*`.

---

## Data Flow Analysis

The core data flow for the primary user journey is:

```
1. Client Registration
   Frontend -> POST /auth/register/email -> AuthService -> Prisma (users) + Redis (verification token)

2. AI Consultation (designed flow, not fully connected)
   Frontend -> POST /ai/consultations -> AiChatService -> creates AIConversation + initial message via LLM
   Frontend -> WebSocket join_conversation -> AiChatGateway -> validates ownership
   Frontend -> WebSocket send_message -> AiChatGateway -> AiChatService.processMessage()
     -> CrisisDetectorService.detectKeywords() (Level 1)
     -> LlmService.streamChat() -> Anthropic Claude API
     -> onToken callback -> WebSocket ai_stream_token -> Frontend
     -> Phase transition evaluation
     -> If CONFIRMATION confirmed: ValueExtractionService -> LlmService.structuredOutput()
       -> ValueProfileService.upsertProfile() -> EmbeddingService -> OpenAI Embeddings API
       -> Prisma (value_profiles) + raw SQL for pgvector embedding

3. Matching
   Frontend -> POST /matching/recommendations -> MatchingService
     -> Prisma query: approved specialists with value profiles
     -> ScoringService.computeMatchScore() for each candidate
     -> Sort by score, take top N
     -> Save MatchingResult to Prisma
     -> Return ranked recommendations with explanations

4. Booking (not implemented)
   Schema ready with Booking, Payment, ScheduleSlot models
   BookingService and ScheduleService are scaffolded
```

**Key observation:** Steps 2 and 3 are disconnected from the frontend. The WebSocket flow is fully built on the backend but the frontend uses a non-existent REST endpoint and falls back to demo mode. The matching flow works on the backend but there is no frontend page to trigger or display it.

---

## Scalability Concerns

1. **WebSocket state in memory:** The `AiChatGateway` stores `connectedUsers` in a local `Map`. With multiple NestJS instances, this breaks. Solution: Use Socket.IO Redis adapter (`@socket.io/redis-adapter`).

2. **No pgvector ANN index:** The embedding column has no vector index. As the number of specialists grows beyond a few hundred, similarity search (if implemented) would degrade. An HNSW index should be created.

3. **Full conversation history in every LLM call:** Each message exchange sends the full conversation history to Claude. At 20+ exchanges, this is ~10,000+ input tokens per call. A sliding window or progressive summarization approach would reduce costs by 60-70%.

4. **Synchronous matching computation:** `generateRecommendations()` fetches all approved specialists, computes scores in a loop, and generates explanations sequentially. For 1000+ specialists, this could take several seconds. The pgvector embedding is not used for ANN pre-filtering -- the code does a full Prisma query and scores every candidate in JavaScript.

5. **No caching on catalog queries:** The `CatalogService.search()` method hits the database on every request, including an `aggregate()` call for price ranges. The `getSpecializations()` method fetches ALL specialist profiles and counts in memory. This should use Redis caching (the `RedisService` is injected but never called).

6. **Refresh token cleanup:** Old revoked refresh tokens are never cleaned up. The `RefreshToken` table will grow indefinitely. A scheduled job to delete expired/revoked tokens is needed.

7. **Analytics events unbounded:** `AnalyticsEvent` has no TTL or partitioning strategy. Over time, this table will grow very large. Consider table partitioning by `createdAt` or periodic archival.

---

## Design Pattern Issues

1. **Duplicated value label maps:** The mapping from value keys to human-readable labels is defined in at least four places:
   - `SpecialistsService.getTopValues()` (line 221-231 of specialists.service.ts)
   - `MatchingService.getTopValueLabels()` (line 324-335 of matching.service.ts)
   - `EmbeddingService.VALUE_LABELS` (line 5-16 of embedding.service.ts)
   - `ValueRadarChart.VALUE_LABELS` (frontend, line 12-23 of value-radar-chart.tsx)

   These should be extracted into a shared constant.

2. **`extractTopValues()` duplicated:** `CatalogService.extractTopValues()` and `SpecialistsService.getTopValues()` are near-identical functions filtering values > 0.7.

3. **Loose typing with `as any`:** Several locations use `as any` to bypass type safety:
   - `specialists.service.ts` line 35: `type: dto.type as any`
   - `ai-chat.service.ts` line 104: `phase: initialPhase as any`
   - `catalog.service.ts` line 29: `where.type = query.type as any`

   These should use proper Prisma enum types.

4. **No DTOs for response shapes:** While request DTOs are well-defined with `class-validator`, response shapes are constructed inline in services as plain objects. There are no response DTOs or serialization classes. This means the API contract is implicitly defined by service method return types, making it harder to maintain API compatibility.

5. **`TransformInterceptor` leaks implementation detail:** The interceptor checks `if (data && typeof data === 'object' && 'data' in data)` to avoid double-wrapping (line 28). This is brittle -- if any service returns an object with a `data` property, it bypasses the wrapper.

6. **Conversation state stored as JSON in database:** `AIConversation.stateJson` stores `{ exchangeCount, phaseExchangeCount, extractedData }`. This is read, modified, and written back on every message. With concurrent messages (unlikely in a single-user AI chat but possible with network retries), this could cause lost updates. An optimistic locking mechanism or atomic updates would be safer.

---

## Strengths

1. **Well-designed AI conversation pipeline:** The phased conversation design with configurable min/max exchanges per phase, role-specific prompts, and a structured extraction pipeline is architecturally sound. The separation of `LlmService` (LLM abstraction), `AiChatService` (orchestration), `ValueExtractionService` (extraction), and `CrisisDetectorService` (safety) follows single-responsibility well.

2. **Multi-dimensional matching algorithm:** The `ScoringService` uses a thoughtful weighted formula with five distinct components, each using appropriate distance metrics (cosine similarity for values, Euclidean distance for styles, keyword overlap for specializations). The approach match logic maps client preferences to specialist professional values in a meaningful way (e.g., past-oriented client -> depth-focused specialist).

3. **Comprehensive schema design:** The Prisma schema covers the entire business domain -- from user management and specialist profiles through AI conversations, matching, booking, payments, subscriptions, reviews, messaging, notifications, and analytics. Proper indexes are defined for common query patterns.

4. **Security considerations:** Refresh tokens are hashed with SHA-256 before storage, stored in `httpOnly` cookies with `secure` and `sameSite` flags. OTP rate limiting is implemented. Passwords use bcrypt with 12 rounds. User account banning is checked in the JWT strategy on every request.

5. **Crisis detection with escalation path:** The two-level crisis detection (keyword + LLM prompt) with immediate crisis alert creation, conversation status change to CRISIS, and a fixed crisis response with hotline numbers demonstrates responsible handling of sensitive content in a mental health context.

6. **Clean frontend state management:** The Zustand stores are well-designed with clear action methods. The API client's token refresh queue is a sophisticated pattern that handles edge cases correctly.

7. **Accessibility attention:** The frontend uses semantic HTML (`<nav>`, `<section>`, `<fieldset>`, `<legend>`), ARIA attributes (`aria-label`, `aria-current`, `aria-expanded`, `aria-modal`, `role="img"`), and proper labeling throughout.

8. **Mock/development fallbacks:** Both `LlmService` and `EmbeddingService` have mock implementations that activate when API keys are not configured. The frontend has demo mode fallbacks. This allows the system to be developed and tested without external API dependencies.

---

## Weaknesses

1. **Frontend-backend disconnect:** The most significant architectural issue is that the frontend and backend are not fully connected. The WebSocket chat infrastructure is unused. The consultation page falls back to demo mode because the REST endpoint it calls (`/ai/consultations/:id/messages`) does not exist. The catalog page uses hardcoded data. The matching results page does not exist. This means the system cannot be end-to-end tested.

2. **JWT secret not propagated to WebSocket gateway:** As detailed in the WebSocket section, `AiModule` registers `JwtModule` with `register({})` instead of using the same async factory as `AuthModule`. This means `jwtService.verify()` in the gateway will use a different (likely empty) secret, causing all WebSocket authentication to fail in production.

3. **No room-level authorization:** The WebSocket gateway allows any authenticated user to join any conversation room without verifying ownership. This is a security vulnerability.

4. **No test files exist:** There are zero test files in the codebase. No unit tests, no integration tests, no e2e tests. For a platform handling sensitive mental health data and financial transactions, this is a significant risk. The `jest` configuration is present in both `package.json` files, but no `.spec.ts` or `.test.ts` files exist.

5. **Booking module is a shell:** `BookingController` and `BookingService` are empty classes with no methods. The `ScheduleService` has implementation but `ScheduleController` has no routes. This means the core monetization flow (booking + payment) is not functional.

6. **pgvector embedding is stored but never used for matching:** The `EmbeddingService` generates embeddings and `ValueProfileService` stores them via raw SQL, but `MatchingService` never uses pgvector similarity search. It fetches all candidates and scores them in JavaScript. The embedding infrastructure is dead code.

7. **Hardcoded refresh token expiry:** In `AuthService.generateTokens()` (line 377), the refresh token expiry is hardcoded to 7 days (`expiresAt.setDate(expiresAt.getDate() + 7)`) despite reading a `JWT_REFRESH_EXPIRATION` config value that is never used.

8. **No input sanitization for AI messages:** User messages sent to the AI are passed directly to the LLM without sanitization. Prompt injection attacks could manipulate the AI's behavior, potentially bypassing crisis detection or extracting system prompts.

9. **`isConfirmation()` is too aggressive:** Any message under 20 characters is treated as confirmation, including "No", "Wrong", "Stop", or even an accidental keystroke.

---

## Recommendations

### Critical (must fix before production)

1. **Fix JWT module configuration in `AiModule`:** Replace `JwtModule.register({})` with:
   ```typescript
   JwtModule.registerAsync({
     imports: [ConfigModule],
     useFactory: (configService: ConfigService) => ({
       secret: configService.get<string>('JWT_SECRET'),
     }),
     inject: [ConfigService],
   })
   ```
   Or import `JwtModule` from `AuthModule`'s exports.

2. **Add conversation ownership check in WebSocket gateway:** In `handleJoinConversation` and `handleSendMessage`, verify that the user owns the conversation:
   ```typescript
   const conversation = await this.prisma.aIConversation.findFirst({
     where: { id: data.conversationId, userId },
   });
   if (!conversation) { client.emit('error', ...); return; }
   ```

3. **Implement the REST message endpoint** (or complete the WebSocket integration on the frontend). The consultation flow is completely broken for real API usage.

4. **Add basic test coverage:** At minimum, unit tests for `ScoringService`, `CrisisDetectorService`, `ValueExtractionService`, and integration tests for the auth flow.

### High Priority

5. **Complete the frontend WebSocket integration:** Connect `socket.io-client` in the consultation page, replacing the REST fallback. The backend infrastructure is ready.

6. **Add pgvector HNSW index** on `value_profiles.embedding` and implement ANN pre-filtering in `MatchingService.generateRecommendations()` to replace the full-table scan.

7. **Implement the booking flow:** The business model depends on booking and payment. The schema and DTOs are ready; the service and controller need implementation.

8. **Fix `isConfirmation()` logic:** Use a more robust approach -- either ask the LLM to classify the response as confirmation/correction, or use a proper NLP intent detection step.

9. **Restrict WebSocket CORS** to match the frontend origin instead of `'*'`.

### Medium Priority

10. **Extract shared constants:** Create a shared `constants/` directory for value labels, specialist types, and other maps duplicated across services.

11. **Add response DTOs:** Define explicit response classes with `class-transformer` decorators for API contract stability.

12. **Implement Redis caching** for catalog queries (specialist list, specializations, price aggregates) with appropriate TTL.

13. **Add conversation message sliding window:** Limit the number of messages sent to the LLM per request (e.g., last 10 messages + a summary of earlier ones).

14. **Move access token to memory-only:** Remove `localStorage` persistence. Use the refresh cookie to silently acquire a new access token on page load.

15. **Add prompt injection guards:** Sanitize user input before sending to the LLM, or implement an input validation layer that detects prompt injection patterns.

### Low Priority

16. **Split `ScheduleSlot` model** into `RecurringSchedule` and `ConcreteSlot` for cleaner data modeling.

17. **Standardize money handling:** Document whether amounts are in rubles or kopecks, and ensure consistency across `SpecialistProfile.sessionPrice`, `Booking.price`, and `Payment.amount`.

18. **Add refresh token cleanup job:** A CRON job (using `@nestjs/schedule`) to delete expired or revoked refresh tokens older than 30 days.

19. **Replace `require('crypto')` with `import`** in `AuthService.hashToken()`.

20. **Add LLM-based phase transition evaluation:** Instead of pure exchange counting, ask the LLM whether sufficient information has been gathered before transitioning phases. This would improve profile quality.

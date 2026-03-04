# Bug Report Template — SoulMate Platform

---

## Bug ID: BUG-XXX

**Title:** [Short, clear description — max 80 characters]

**Date:** YYYY-MM-DD
**Reporter:** [Name / QA automated test]
**Severity:** Critical / High / Medium / Low
**Priority:** P1 / P2 / P3 / P4
**Status:** New / In Progress / Fixed / Won't Fix / Duplicate

---

### Environment

| Field | Value |
|-------|-------|
| URL | http://138.124.61.221:8080 |
| Backend Version | commit SHA or build tag |
| Frontend Version | commit SHA or build tag |
| Browser (for FE bugs) | Chrome 121 / Firefox 122 / Safari 17 |
| OS | macOS 15 / Ubuntu 24.04 |
| Test Method | curl / Playwright / Manual |

---

### Description

[1–3 sentences describing what the bug is. Be specific about what is wrong vs. what is expected.]

---

### Steps to Reproduce

1. [First step]
2. [Second step]
3. [Continue...]

---

### Actual Result

[What actually happened. Include HTTP status code, response body, screenshot, or console output.]

```
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "prisma.specialistProfile.count() invocation..."
  }
}
```

---

### Expected Result

[What should have happened. Reference the API contract or PRD where applicable.]

```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error",
    "details": ["type must be one of: PSYCHOLOGIST, COACH, PSYCHOTHERAPIST"]
  }
}
```

---

### Root Cause (if known)

[File path, line number, and explanation of the underlying code issue if identifiable.]

Example:
> `backend/src/modules/specialists/catalog.service.ts` line 29: `where.type = query.type as any` — uses `as any` cast which bypasses TypeScript enum validation. The `CatalogQueryDto.type` field uses `@IsEnum()` but NestJS ValidationPipe transforms before enum validation, passing the raw string to Prisma which then throws a database-level error.

---

### Impact

[Who is affected and how severely.]

- Affects all unauthenticated catalog requests with `type` filter
- Exposes internal Prisma stack traces to end users (information disclosure)
- Any user can trigger this with a crafted URL

---

### Suggested Fix

[Optional. Code snippet or approach recommendation.]

```typescript
// In CatalogQueryDto, add proper enum validation:
@IsEnum(SpecialistType, { message: 'type must be one of: PSYCHOLOGIST, COACH, PSYCHOTHERAPIST' })
@IsOptional()
type?: SpecialistType;
```

---

### Attachments

- [ ] Screenshot
- [ ] Video recording
- [ ] curl command output
- [ ] Network HAR file
- [ ] Related test case ID: TC-XXX-XXX

---

---

# Active Bug Reports

---

## Bug ID: BUG-001

**Title:** Prisma internal error stack trace leaks on invalid `type` enum in catalog

**Date:** 2026-03-04
**Reporter:** QA Automated — curl live test
**Severity:** Critical
**Priority:** P1
**Status:** New

### Environment
| Field | Value |
|-------|-------|
| URL | http://138.124.61.221:8080/api/v1/catalog/specialists?type=INVALID |
| Test Method | curl |

### Steps to Reproduce
```bash
curl "http://138.124.61.221:8080/api/v1/catalog/specialists?type=INVALID"
```

### Actual Result
```
HTTP/1.1 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "\nInvalid `prisma.specialistProfile.count()` invocation:\n\n{ where: { type: \"INVALID\"  ~~~~~~~~~ } }\n\nInvalid value for argument `type`. Expected SpecialistType."
  }
}
```

### Expected Result
```
HTTP/1.1 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error",
    "details": ["type must be one of the following values: PSYCHOLOGIST, COACH, PSYCHOTHERAPIST"]
  }
}
```

### Root Cause
`backend/src/modules/specialists/catalog.service.ts` line 29 uses `where.type = query.type as any` which bypasses enum safety. The `CatalogQueryDto` does not include `@IsEnum()` validation for `type`, so invalid values pass validation and reach Prisma.

### Impact
- Information disclosure: exposes database schema internals and Prisma internals
- Allows any user to trivially trigger 500 errors (partial DoS via error log flooding)

---

## Bug ID: BUG-002

**Title:** `isConfirmation()` treats any message under 20 chars as confirmation — "no" ends consultation

**Date:** 2026-03-04
**Reporter:** Static code review (qa-review.md CRIT-03)
**Severity:** Critical
**Priority:** P1
**Status:** New

### Environment
| Field | Value |
|-------|-------|
| File | backend/src/modules/ai/ai-chat.service.ts lines 592-602 |
| Affected flow | AI consultation CONFIRMATION phase |

### Steps to Reproduce
1. Complete AI consultation through to the CONFIRMATION phase
2. AI presents a summary and asks "Is this correct?"
3. User types "no" (3 characters, under 20 char threshold)
4. System treats "no" as confirmation and completes the consultation

### Actual Result
Consultation is marked COMPLETED, value extraction runs on incorrect data. User is shown a "match" based on wrong profile.

### Expected Result
Negative responses ("no", "wrong", "incorrect", "не то", "нет") should trigger a correction flow, not finalize the consultation.

### Root Cause
```typescript
// ai-chat.service.ts line 600
normalized.length < 20 // ANY message under 20 chars treated as confirmation
```

---

## Bug ID: BUG-003

**Title:** 8 frontend pages return HTTP 404 on live server despite source files existing

**Date:** 2026-03-04
**Reporter:** QA Automated — curl live test
**Severity:** High
**Priority:** P1
**Status:** New

### Affected Pages
| Page | Source File | Live Status |
|------|------------|-------------|
| /how-it-works | frontend/src/app/how-it-works/page.tsx | 404 |
| /for-specialists | frontend/src/app/for-specialists/page.tsx | 404 |
| /about | frontend/src/app/about/page.tsx | 404 |
| /contacts | frontend/src/app/contacts/page.tsx | 404 |
| /privacy | frontend/src/app/privacy/page.tsx | 404 |
| /terms | frontend/src/app/terms/page.tsx | 404 |
| /pricing | Not in source | 404 |
| /premium | Not in source | 404 |

### Steps to Reproduce
```bash
curl -s -o /dev/null -w "%{http_code}" http://138.124.61.221:8080/how-it-works
# Returns: 404
```

### Actual Result
HTTP 404 with Next.js error page "This page could not be found."

### Expected Result
HTTP 200 with page content.

### Root Cause
The deployed Next.js build does not include these pages. Either:
1. The server is running an older build that predates these pages being added to source
2. The build failed silently for these pages
3. Pages were added to the git repo but the server was not redeployed

### Recommended Fix
Rebuild and redeploy the frontend: `cd ~/soulmate/frontend && npm run build && pm2 restart soulmate-frontend`

---

## Bug ID: BUG-004

**Title:** HTTP 404 returned for wrong-method requests instead of 405 Method Not Allowed

**Date:** 2026-03-04
**Reporter:** QA Automated
**Severity:** Medium
**Priority:** P3
**Status:** New

### Steps to Reproduce
```bash
curl -s -X DELETE http://138.124.61.221:8080/api/v1/catalog/specialists
curl -s -X POST http://138.124.61.221:8080/api/v1/catalog/specializations
```

### Actual Result
```json
{"error":{"code":"NOT_FOUND","message":"Cannot DELETE /v1/catalog/specialists"}}
HTTP 404
```

### Expected Result
```
HTTP 405 Method Not Allowed
Allow: GET, OPTIONS
```

### Root Cause
NestJS default behavior returns 404 for unmatched routes, including wrong-method requests. Requires a custom exception filter or `@HttpCode` adjustment.

---

## Bug ID: BUG-005

**Title:** Role enum validation error message shows empty allowed values list

**Date:** 2026-03-04
**Reporter:** QA Automated
**Severity:** Low
**Priority:** P4
**Status:** New

### Steps to Reproduce
```bash
curl -X POST http://138.124.61.221:8080/api/v1/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"x@test.com","password":"TestPass123!","firstName":"Test","role":"ADMIN","privacyAccepted":true,"termsAccepted":true}'
```

### Actual Result
```json
{"error":{"code":"VALIDATION_ERROR","message":"Validation error","details":["role must be one of the following values: "]}}
```

### Expected Result
```json
{"error":{"code":"VALIDATION_ERROR","message":"Validation error","details":["role must be one of the following values: CLIENT, SPECIALIST"]}}
```

---

## Bug ID: BUG-006

**Title:** Nginx server version disclosed in Server header

**Date:** 2026-03-04
**Reporter:** QA Security Scan
**Severity:** Low
**Priority:** P4
**Status:** New

### Evidence
```
Server: nginx/1.24.0 (Ubuntu)
```

### Expected Result
```
Server: nginx
```
or header removed entirely.

### Recommended Fix
Add `server_tokens off;` to nginx.conf.

---

## Bug ID: BUG-007

**Title:** API endpoint mismatch: task spec references `/consultation/start` but actual endpoint is `/ai/consultations`

**Date:** 2026-03-04
**Reporter:** QA Endpoint Mapping
**Severity:** High
**Priority:** P2
**Status:** New

### Details
The task specification documents `POST /api/v1/consultation/start` but the backend controller exposes `POST /api/v1/ai/consultations`. Requests to `/consultation/start` return 404.

### Evidence
```bash
curl -X POST http://138.124.61.221:8080/api/v1/consultation/start
# Returns: 404

curl -X POST http://138.124.61.221:8080/api/v1/ai/consultations
# Returns: 401 (route exists, requires auth)
```

### Also Note
The frontend (consultation/page.tsx) sends messages to `POST /ai/consultations/:id/messages` which also does not exist in the backend controller (messages are WebSocket-only). See qa-review.md ERR-08.

---

## Bug ID: BUG-008

**Title:** Booking and Schedule controllers are empty stubs — all booking endpoints return 401 (actually unreachable)

**Date:** 2026-03-04
**Reporter:** QA Static Review + Live Test
**Severity:** High
**Priority:** P1
**Status:** New

### Details
`BookingController`, `BookingService`, and `ScheduleController` are completely empty classes with no route handlers. The entire booking flow (create booking, view slots, reschedule, cancel) and schedule management are inaccessible via HTTP. Users cannot book sessions.

### Verification
```bash
# Returns 401 (auth guard on empty class) — no actual routes exist
curl http://138.124.61.221:8080/api/v1/bookings
```

---

## Bug ID: BUG-009

**Title:** PATCH /users/me overwrites unset fields with null — data loss on partial update

**Date:** 2026-03-04
**Reporter:** QA Static Review (qa-review.md CRIT-05)
**Severity:** Critical
**Priority:** P1
**Status:** New

### Steps to Reproduce
1. Register and verify a user with full profile: firstName, lastName, age, city, timezone all set
2. Send PATCH /users/me with only `{ "firstName": "NewName" }`
3. Retrieve the user profile with GET /users/me

### Actual Result
All other fields (lastName, age, gender, city, timezone) are set to null.

### Expected Result
Only firstName should be updated. All other fields should retain their existing values.

### Root Cause
```typescript
// users.service.ts lines 56-67
data: {
  firstName: dto.firstName,   // undefined if not sent → Prisma sets to null
  lastName: dto.lastName,     // undefined → null
  // ...
}
```

---

## Bug ID: BUG-010

**Title:** WebSocket CORS configured with wildcard origin and credentials=true

**Date:** 2026-03-04
**Reporter:** QA Static Review (qa-review.md CRIT-07)
**Severity:** Critical
**Priority:** P1
**Status:** New

### Details
The AI chat WebSocket gateway uses `cors: { origin: '*', credentials: true }` which is:
1. Invalid per the CORS specification (browsers reject `*` + credentials)
2. A security vulnerability (allows any origin to connect to authenticated WebSocket)

The REST API correctly uses configurable `CORS_ORIGINS` but the WebSocket bypasses this.

---

---

## Bug ID: BUG-011

**Title:** Backend local build fails — `@nestjs/cli/node_modules/typescript/lib/typescript.js` missing

**Date:** 2026-03-04
**Reporter:** QA Automated — `npm run build` in CI
**Severity:** Critical
**Priority:** P0
**Status:** New

### Environment
| Field | Value |
|-------|-------|
| Machine | Local dev (macOS Darwin 25.3.0) |
| Path | backend/node_modules/@nestjs/cli/node_modules/typescript |
| Installed version | typescript@5.7.2 (nested under @nestjs/cli) |

### Steps to Reproduce
```bash
cd /Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend
npm run build
```

### Actual Result
```
Error: Cannot find module
  '.../backend/node_modules/@nestjs/cli/node_modules/typescript/lib/typescript.js'
  Please verify that the package.json has a valid "main" entry
```

### Expected Result
```
Successfully compiled: 42 files with swc
```

### Root Cause
`@nestjs/cli@10.4.9` has a nested `typescript@5.7.2` package. That package's `package.json` declares `"main": "./lib/typescript.js"` but only `.d.ts` type declaration files exist in `lib/` — no compiled `.js` runtime file. This indicates an incomplete or corrupt `npm install`.

Verification:
```bash
ls backend/node_modules/@nestjs/cli/node_modules/typescript/lib/*.js
# Returns: "no matches found"
```

### Fix
```bash
cd backend
rm -rf node_modules/@nestjs/cli/node_modules/typescript
npm install
npm run build  # should now succeed
```

---

## Bug ID: BUG-012

**Title:** Live server deployment is stale — 8 frontend pages return 404 that compile locally

**Date:** 2026-03-04
**Reporter:** QA Automated — curl live test
**Severity:** High
**Priority:** P1
**Status:** New

### Pages Affected (live 404, local 200)
```
/about               frontend/src/app/about/page.tsx       -- exists locally
/how-it-works        frontend/src/app/how-it-works/page.tsx -- exists locally
/for-specialists     frontend/src/app/for-specialists/page.tsx -- exists locally
/contacts            frontend/src/app/contacts/page.tsx     -- exists locally
/privacy             frontend/src/app/privacy/page.tsx      -- exists locally
/terms               frontend/src/app/terms/page.tsx        -- exists locally
/pricing             frontend/src/app/pricing/page.tsx      -- exists locally (needs verification)
/premium             Not in local source                    -- 404 expected
```

### Steps to Reproduce
```bash
curl -o /dev/null -w "%{http_code}" http://138.124.61.221:8080/about        # 404
curl -o /dev/null -w "%{http_code}" http://138.124.61.221:8080/how-it-works  # 404
curl -o /dev/null -w "%{http_code}" http://138.124.61.221:8080/for-specialists # 404
```

### Local Build Verification (PASS)
```
npm run build output shows:
  ├ ○ /about               94.4 kB
  ├ ○ /for-specialists     94.4 kB
  ├ ○ /how-it-works        94.4 kB
  Total: 14 pages, 0 errors
```

### Fix
Rebuild and redeploy frontend to live server. Fix BUG-011 (backend build) first if deployment pipeline uses local build.

---

## Bug ID: BUG-013

**Title:** API route path mismatch — task spec documents `/auth/register` but implementation uses `/auth/register/email`

**Date:** 2026-03-04
**Reporter:** QA Automated — curl live test
**Severity:** High
**Priority:** P2
**Status:** New

### Evidence
```bash
# Task spec path:
curl -X POST http://138.124.61.221:8080/api/v1/auth/register \
  -H "Content-Type: application/json" -d '{...}'
# Returns: 404 {"error":{"code":"NOT_FOUND","message":"Cannot POST /v1/auth/register"}}

# Actual working path:
curl -X POST http://138.124.61.221:8080/api/v1/auth/register/email \
  -H "Content-Type: application/json" -d '{...valid payload...}'
# Returns: 201 {"data":{"userId":"...","emailVerified":false}}
```

### Fix
Update `docs/api-contracts.md` to document the correct paths. All auth endpoints use sub-paths:
- `POST /auth/register/email` (email registration)
- `POST /auth/login/email` (email login)
- `POST /auth/register/phone` (phone registration)
- `POST /auth/login/phone` (phone login)

---

## Bug ID: BUG-014

**Title:** Matching recommendations route is POST (not GET) — task spec HTTP method incorrect

**Date:** 2026-03-04
**Reporter:** QA Automated — curl live test
**Severity:** Medium
**Priority:** P2
**Status:** New

### Evidence
```bash
# Task spec says GET:
curl http://138.124.61.221:8080/api/v1/matching/recommendations
# Returns: 404 {"error":{"code":"NOT_FOUND",...}}

# Correct method is POST:
curl -X POST http://138.124.61.221:8080/api/v1/matching/recommendations \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"...","limit":5}'
# Returns: 401 (authenticated — route exists)
```

---

## Summary Statistics (Updated 2026-03-04)

### Pre-existing bugs (from static code review in docs/qa-review.md)
| ID | Severity | Title |
|----|----------|-------|
| BUG-001 | Critical | Prisma error stack trace leaks on invalid `type` enum |
| BUG-002 | Critical | `isConfirmation()` treats "no" as confirmation |
| BUG-004 | Medium | Wrong HTTP method returns 404 instead of 405 |
| BUG-005 | Low | Role enum validation error shows empty allowed values list |
| BUG-006 | Low | Nginx version disclosed in Server header |
| BUG-007 | High | Endpoint mismatch: `/consultation/start` vs `/ai/consultations` |
| BUG-008 | High | Booking and Schedule controllers are empty stubs |
| BUG-009 | Critical | PATCH /users/me overwrites unset fields with null |
| BUG-010 | Critical | WebSocket CORS uses wildcard `*` with credentials=true |

### Newly identified bugs (live testing 2026-03-04)
| ID | Severity | Title |
|----|----------|-------|
| BUG-011 | Critical | Backend local build fails: `typescript.js` missing in `@nestjs/cli` |
| BUG-012 | High | Live server stale deployment: 8 pages return 404 |
| BUG-013 | High | Auth route path mismatch: task spec vs implementation |
| BUG-014 | Medium | Matching recommendations: wrong HTTP method in task spec |

### Totals
| Severity | Count |
|----------|-------|
| Critical | 5 |
| High | 4 |
| Medium | 2 |
| Low | 3 |
| **Total** | **14** |

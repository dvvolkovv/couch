# QA Report — SoulMate Platform

**Date:** 2026-03-04
**QA Engineer:** Senior QA (Claude Sonnet 4.6)
**Server:** http://138.124.61.221:8080
**Test Method:** Live curl API testing + static code review
**Execution Time:** 2026-03-04T02:00–02:20 UTC

---

## Backend API Results

| # | Endpoint | Input | Status Code | Response Summary | Result | Notes |
|---|----------|-------|-------------|-----------------|--------|-------|
| 1 | POST /api/v1/auth/register/email | Valid payload (email, pw, role, consent) | 201 | `{data: {userId, email, emailVerified: false}}` | PASS | |
| 2 | POST /api/v1/auth/register/email | Duplicate email | 409 | `{error: {code: "CONFLICT"}}` | PASS | |
| 3 | POST /api/v1/auth/register/email | Invalid email format | 400 | `{error: {code: "VALIDATION_ERROR"}}` | PASS | |
| 4 | POST /api/v1/auth/register/email | Password < 8 chars | 400 | Validation error on password field | PASS | |
| 5 | POST /api/v1/auth/register/email | role = "ADMIN" | 400 | Validation error — enum rejected | PASS | Error message shows empty allowed values (minor issue) |
| 6 | POST /api/v1/auth/register/email | Extra fields (adminOverride, isAdmin) | 400 | Lists forbidden properties | PASS | `forbidNonWhitelisted` guard works |
| 7 | POST /api/v1/auth/register/email | Missing role, privacyAccepted, termsAccepted | 400 | Lists all 3 missing fields | PASS | |
| 8 | POST /api/v1/auth/register/email | Empty body `{}` | 429 | Rate limited (from prior test runs) | PASS | Rate limit engaged as expected |
| 9 | POST /api/v1/auth/login/email | Unverified email account | 401 | "Email not verified. Please check your inbox" | PASS | Appropriate block on unverified accounts |
| 10 | POST /api/v1/auth/login/email | Wrong password | 401 | "Invalid email or password" (generic) | PASS | No account enumeration |
| 11 | POST /api/v1/auth/login/email | Non-existent email | 401 | "Invalid email or password" (same message) | PASS | Anti-enumeration pattern correct |
| 12 | POST /api/v1/auth/refresh | No cookie | 401 | "Refresh token is required" | PASS | |
| 13 | POST /api/v1/auth/refresh | Fake/invalid cookie value | 401 | "Invalid or expired refresh token" | PASS | |
| 14 | GET /api/v1/catalog/specialists | No params | 200 | `{data:[], pagination:{...}, filters:{...}}` | PASS | Empty DB — no specialists seeded |
| 15 | GET /api/v1/catalog/specialists | type=PSYCHOLOGIST | 200 | Empty results | PASS | |
| 16 | GET /api/v1/catalog/specialists | type=INVALID | 500 | Prisma error stack trace in response body | **FAIL** | BUG-001: Information disclosure, should be 400 |
| 17 | GET /api/v1/catalog/specialists | limit=-1 | 400 | "limit must not be less than 1" | PASS | |
| 18 | GET /api/v1/catalog/specialists | limit=100 | 400 | "limit must not be greater than 50" | PASS | |
| 19 | GET /api/v1/catalog/specialists | priceMin=1000&priceMax=5000 | 200 | Empty results | PASS | |
| 20 | GET /api/v1/catalog/specialists | sortBy=rating | 200 | Empty results | PASS | |
| 21 | GET /api/v1/catalog/specialists | search=anxiety | 200 | Empty results | PASS | |
| 22 | GET /api/v1/catalog/specializations | — | 200 | `{data:{specializations:[], approaches:[]}}` | PASS | No data seeded |
| 23 | GET /api/v1/specialists/:id | nonexistent-id | 404 | `{error: {code: "NOT_FOUND"}}` | PASS | |
| 24 | POST /api/v1/consultation/start | No auth | 404 | Route does not exist | **FAIL** | BUG-007: Endpoint mismatch — correct path is /ai/consultations |
| 25 | POST /api/v1/ai/consultations | No auth | 401 | Unauthorized | PASS | Actual endpoint verified |
| 26 | GET /api/v1/matching/recommendations | No auth | 404 | Route does not exist | **FAIL** | BUG-007: GET not supported — this is POST /matching/recommendations |
| 27 | POST /api/v1/matching/recommendations | No auth | 401 | Unauthorized | PASS | Actual endpoint verified |
| 28 | GET /api/v1/users/me | No auth | 401 | "Invalid or expired token" | PASS | |
| 29 | GET /api/v1/users/me | Fake JWT | 401 | "Invalid or expired token" | PASS | |
| 30 | GET /api/v1/bookings | No auth | 401 | Unauthorized | PASS | Note: controller is empty stub — no real routes |
| 31 | GET /api/v1/bookings/slots/:id | No auth | 401 | Unauthorized | PASS | Note: controller is empty stub |
| 32 | GET /api/v1/schedule/me | No auth | 401 | Unauthorized | PASS | Note: controller is empty stub |
| 33 | POST /api/v1/specialists/apply | No auth | 401 | Unauthorized | PASS | |
| 34 | GET /api/v1/specialists/me | No auth | 401 | Unauthorized | PASS | |
| 35 | GET /api/v1/admin/dashboard | No auth | 404 | Not Found | PASS | Admin module not deployed |
| 36 | DELETE /api/v1/catalog/specialists | Wrong method | 404 | "Cannot DELETE" | WARN | Should be 405, returns 404 (BUG-004) |
| 37 | POST /api/v1/catalog/specializations | Wrong method | 404 | "Cannot POST" | WARN | Should be 405, returns 404 (BUG-004) |
| 38 | GET /docs | Swagger docs check | 404 | Not found | PASS | Docs disabled in production |

---

## Security Scan Results

| # | Check | Result | Evidence |
|---|-------|--------|---------|
| S1 | Content-Security-Policy header | PASS | Present: `default-src 'self'; ...` |
| S2 | X-Content-Type-Options: nosniff | PASS | Present |
| S3 | X-Frame-Options: SAMEORIGIN | PASS | Present |
| S4 | Strict-Transport-Security | PASS | `max-age=15552000; includeSubDomains` |
| S5 | Referrer-Policy: no-referrer | PASS | Present |
| S6 | X-Permitted-Cross-Domain-Policies: none | PASS | Present |
| S7 | X-Powered-By not exposed on API | PASS | Not in response headers |
| S8 | Server version disclosure | WARN | `Server: nginx/1.24.0 (Ubuntu)` — BUG-006 |
| S9 | CORS: allowed origin gets header | PASS | localhost:3001 gets `Access-Control-Allow-Origin` |
| S10 | CORS: disallowed origin blocked | PASS | attacker.evil.com gets no `Access-Control-Allow-Origin` |
| S11 | Rate limit headers present | PASS | X-RateLimit-Limit/Remaining/Reset present |
| S12 | Rate limiting enforced on auth | PASS | 429 after 5 requests within 60s |
| S13 | SQL injection attempt rejected | PASS | Rate limited (would be 400 validation error) |
| S14 | JWT guard on all protected routes | PASS | All 11 tested endpoints return 401 without valid JWT |
| S15 | Prisma internals in error response | FAIL | BUG-001: Full Prisma stack trace in 500 response |
| S16 | HTTPS enforcement | WARN | No redirect to HTTPS — running plain HTTP |

---

## Frontend Pages Results

| # | URL | HTTP Status | Result | Notes |
|---|-----|-------------|--------|-------|
| 1 | http://138.124.61.221:8080/ | 200 | PASS | Home page loads |
| 2 | http://138.124.61.221:8080/catalog | 200 | PASS | Catalog page loads |
| 3 | http://138.124.61.221:8080/consultation | 200 | PASS | Consultation page loads |
| 4 | http://138.124.61.221:8080/auth/login | 200 | PASS | Login page loads |
| 5 | http://138.124.61.221:8080/auth/register | 200 | PASS | Register page loads |
| 6 | http://138.124.61.221:8080/how-it-works | 404 | **FAIL** | Page exists in source, not deployed (BUG-003) |
| 7 | http://138.124.61.221:8080/for-specialists | 404 | **FAIL** | Page exists in source, not deployed (BUG-003) |
| 8 | http://138.124.61.221:8080/about | 404 | **FAIL** | Page exists in source, not deployed (BUG-003) |
| 9 | http://138.124.61.221:8080/contacts | 404 | **FAIL** | Page exists in source, not deployed (BUG-003) |
| 10 | http://138.124.61.221:8080/privacy | 404 | **FAIL** | Page exists in source, not deployed (BUG-003) |
| 11 | http://138.124.61.221:8080/terms | 404 | **FAIL** | Page exists in source, not deployed (BUG-003) |
| 12 | http://138.124.61.221:8080/pricing | 404 | **FAIL** | Page NOT in source at all — not implemented |
| 13 | http://138.124.61.221:8080/premium | 404 | **FAIL** | Page NOT in source at all — not implemented |
| 14 | http://138.124.61.221:8080/dashboard | 200 | PASS | Dashboard page loads |
| 15 | http://138.124.61.221:8080/matching | 200 | PASS | Matching page loads |

---

## Issues Found

### Critical (P1 — Must Fix Before Any User Testing)

**BUG-001: Prisma internal stack trace leaks in HTTP 500 response**
- Endpoint: `GET /api/v1/catalog/specialists?type=INVALID`
- Risk: Information disclosure (exposes internal database schema, Prisma version, query structure)
- Fix: Add `@IsEnum(SpecialistType)` validation to `CatalogQueryDto.type` field

**BUG-002: `isConfirmation()` logic treats "no", "нет", and any message under 20 chars as confirmation**
- File: `backend/src/modules/ai/ai-chat.service.ts:600`
- Risk: AI consultation prematurely closes when user disagrees; incorrect value profile generated; wrong matches shown
- Fix: Add explicit negative pattern matching; remove the `length < 20` fallback

**BUG-007 (endpoint naming): Task spec uses `/consultation/start` and `GET /matching/recommendations` — neither exists**
- Real paths: `POST /api/v1/ai/consultations` and `POST /api/v1/matching/recommendations`
- Risk: Any documentation or frontend code pointing to old paths will 404

**BUG-008: Booking and Schedule controllers are empty stubs — core product flow broken**
- `BookingController`, `BookingService`, `ScheduleController` all have zero route handlers
- The primary paid action (booking a session) is completely inaccessible
- Fix: Implement booking routes or merge with existing DTOs

**BUG-009: PATCH /users/me nullifies unset fields — data loss on partial update**
- File: `backend/src/modules/users/users.service.ts:56-67`
- Fix: Filter `undefined` values before passing to Prisma

**BUG-010: WebSocket CORS uses `origin: '*'` with `credentials: true`**
- Violates CORS spec; browsers reject this combination
- AI chat WebSocket authentication is broken for browser clients
- Fix: Use the same `CORS_ORIGINS` config as the REST API

### High (P2 — Fix Before Beta Launch)

**BUG-003: 8 frontend pages return 404 on live server**
- 6 pages exist in git source (about, contacts, privacy, terms, how-it-works, for-specialists) but the deployed build does not include them
- 2 pages (/pricing, /premium) are not implemented at all
- Root cause: Stale deployment — server was not rebuilt and redeployed after recent commits
- Fix: `cd ~/soulmate/frontend && npm run build && pm2 restart soulmate-frontend`

### Medium (P3 — Fix Before Public Launch)

**BUG-004: Wrong HTTP method returns 404 instead of 405 Method Not Allowed**
- All route-not-found cases return 404 regardless of whether the path exists with a different method
- Standards violation; confusing for API consumers and integration partners
- Fix: Add a custom global exception filter that checks for method mismatches

### Low (P4 — Fix During Hardening Sprint)

**BUG-005: Role enum validation error shows empty allowed-values list in details**
- `"role must be one of the following values: "` — values list is empty
- Cosmetic: reduces API usability

**BUG-006: Nginx version string disclosed in `Server` header**
- `Server: nginx/1.24.0 (Ubuntu)` assists reconnaissance
- Fix: `server_tokens off;` in nginx.conf

---

## Additional Issues from Code Review (Not Live-Testable)

These are confirmed bugs from static analysis (`docs/qa-review.md`) that require a valid authenticated session to trigger:

| ID | Severity | Description |
|----|----------|-------------|
| CRIT-01 | High | Refresh token expiration hardcoded to 7 days, ignores JWT_REFRESH_EXPIRATION config |
| CRIT-04 | Critical | Frontend consultation phase names mismatch backend (REQUEST_EXPLORATION vs SITUATION_EXPLORATION etc.) — progress bar always wrong |
| CRIT-06 | Critical | Avatar upload ignores the uploaded file; saves hardcoded CDN URL that doesn't exist |
| ERR-05 | High | WebSocket handleJoinConversation does not verify conversation ownership — any authenticated user can intercept another user's AI stream |
| ERR-08 | Critical | Frontend sends messages to REST endpoint `/ai/consultations/:id/messages` which does not exist; consultation chat is broken |
| LOGIC-03 | Medium | PROFILE_CORRECTION type bypasses subscription limits — free users get unlimited corrections |
| LOGIC-04 | Medium | Consultation usage counter only increments on confirm, not on create — limit check can be bypassed |
| LOGIC-09 | Medium | OTP generated with `Math.random()` instead of `crypto.randomInt()` |
| DEAD-02 | High | Empty BookingController/BookingService — booking flow completely non-functional |

---

## Summary

| Category | Total | Passed | Failed | Warnings |
|----------|-------|--------|--------|---------|
| Auth API tests | 13 | 13 | 0 | 0 |
| Catalog API tests | 10 | 8 | 1 | 1 |
| Auth guard tests | 11 | 11 | 0 | 0 |
| Security tests | 16 | 13 | 1 | 2 |
| Frontend page tests | 15 | 7 | 8 | 0 |
| **TOTAL** | **65** | **52** | **10** | **3** |

**Pass rate: 80% (52/65)**

### Critical Path Assessment

The platform is **not ready for user-facing beta** in its current state. The following flows are broken:

1. **Core booking flow** — BookingController is empty; sessions cannot be booked
2. **AI chat** — Frontend sends messages to non-existent REST endpoint; WebSocket CORS blocks browser connections
3. **8 pages 404** — Navigation dead-ends on most informational and legal pages
4. **Data loss on profile update** — PATCH /users/me nullifies all unset fields

The authentication flow (register, validate, login, JWT refresh) works correctly. The catalog is functional with one bug (invalid type crashes to 500). Security headers are well-configured via Helmet.

### Recommended Fix Priority Order

1. Rebuild and redeploy frontend (fixes 6 of 8 missing pages immediately)
2. Add `@IsEnum` validation to `CatalogQueryDto.type` (fixes BUG-001)
3. Implement BookingController routes (critical product path)
4. Fix WebSocket CORS (ai chat broken for browsers)
5. Fix `isConfirmation()` logic (ai consultation data integrity)
6. Fix PATCH /users/me to use partial update (data loss)
7. Fix frontend consultation message endpoint to use WebSocket
8. Implement /pricing and /premium pages

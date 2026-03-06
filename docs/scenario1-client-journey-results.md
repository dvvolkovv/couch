# Scenario 1: Full Client Journey -- API Test Results

**Executed:** 2026-03-06
**Tester:** QA Automation (API-level curl tests)
**Target Environment:**
- API: http://138.124.61.221:3200/v1
- Frontend: http://138.124.61.221:8080

---

## Step-by-step Results

| Step | Action | Status | HTTP Code | Notes |
|------|--------|--------|-----------|-------|
| 1 | API Health Check (`/v1/health`) | FAIL | 404 | No health endpoint exists. `/`, `/health`, `/v1/health`, `/v1/api-docs` all return 404. API is running but has no health/readiness probe. |
| 2 | Frontend Accessible | PASS | 200 | Root page loads successfully. |
| 3a | Client Login (`user@test.com`) | FAIL | 401 | Provided test credentials `user@test.com / TestPass123!` are invalid -- this email does not exist in the database. Seeded emails are `test@example.com`, `client1@example.com`, `client2@example.com`. |
| 3b | Client Login (`test@example.com`) | PASS | 200 | Returns `accessToken` and user object with `id`, `email`, `role`, `firstName`. Token expiry: 15 minutes. |
| 3c | Rate Limiting on Login | OBSERVED | 429 | After ~5 failed/successful login attempts, rate limiter kicks in with `ThrottlerException: Too Many Requests`. Cooldown is >30 seconds. Correct behavior but aggressive for testing. |
| 4 | Get User Profile (`/users/me`) | PASS | 200 | Returns full user profile: id, email, phone, role, name, city, timezone, avatarUrl, emailVerified, phoneVerified, hasValueProfile, subscription (plan, AI usage), createdAt. |
| 5 | Browse Specialist Catalog | PASS | 200 | Returns 5 specialists (16 total). Each has: id, firstName, lastName (abbreviated), type, verified, specializations, approaches, sessionPrice, workFormats, averageRating, totalReviews. Pagination uses cursor-based approach. |
| 5b | Catalog Filter by Type | PASS | 200 | `?type=COACH` returns 5 coaches. Filter works correctly. |
| 5c | Catalog Filter by Price | PASS | 200 | `?priceMin=5000&priceMax=8000` works. Note: `minPrice`/`maxPrice` params rejected with validation error -- parameter names must be `priceMin`/`priceMax`. |
| 5d | Catalog Filter by Specialization | PASS | 200 | `?specialization[]=...` (array format) works. Single value `?specialization=...` rejected -- must be array. |
| 6 | Get Specializations List | PASS | 200 | Returns 21 specializations and 14 approaches, each with label and count. Data is comprehensive. |
| 7 | Get Specific Specialist | PASS | 200 | Returns full profile: education, experienceYears, bio, sessionDuration, nearestAvailableSlot (null), valueProfile (null). |
| 7b | Non-existent Specialist | PASS | 404 | Properly returns `{"error":{"code":"NOT_FOUND","message":"Specialist not found"}}`. |
| 8 | Start AI Consultation | PASS | 201 | Returns conversationId, type, status=ACTIVE, phase=GREETING, wsUrl for WebSocket chat, and initialMessage in Russian. |
| 9 | Get Consultation History | PASS | 200 | Returns array of consultations with conversationId, type, status, startedAt, completedAt. |
| 10 | Check Booking Slots | PASS | 200 | Returns empty `slots: []`. Endpoint works but no specialist has configured availability schedule. |
| 11 | Create Booking | PASS | 201 | Booking created with status `PENDING_PAYMENT`. Returns bookingId, slotStart/End, duration=50, format, specialist info, price=7000. Allows booking even without available slots defined. |
| 12 | Get Bookings List | PASS | 200 | Returns array of bookings with status, specialist info, price, matchScore, canCancel, canReschedule, hasReview. |
| 12b | Get Single Booking | PASS | 200 | Returns detailed booking by ID. |
| 12c | Cancel Booking (PATCH) | PASS | 200 | Status changed to `CANCELLED_CLIENT`. `canCancel` becomes false after cancellation. |
| 13 | Payments History | PASS | 200 | Returns empty array `{data: [], total: 0}`. Endpoint works but no payment records exist (bookings are PENDING_PAYMENT). |
| 14 | Matching Recommendations | FAIL | 404 | Returns `"Value profile not found. Complete an AI consultation first."` Even seeded user with 30 completed bookings gets this error. Value profiles are not auto-generated. |
| 15 | Reviews List (`/reviews`) | PASS | 200 | Returns `{data: [], total: 0}` for both new and seeded users. Endpoint works but returns empty even though seeded user has reviews via bookings (hasReview=true). Reviews may only be accessible via specialist profile endpoint. |
| 15b | Specialist Reviews Route | FAIL | 404 | `/specialists/:id/reviews` does not exist as a route. No way to fetch reviews for a specific specialist via API. |
| 16 | Value Profile (`/value-profile/me`) | FAIL | 404 | `"Value profile not found. Complete an AI consultation first."` Not populated even for seeded users. Requires completing full AI consultation flow. |
| 17 | Notifications | PASS | 200 | Returns `{data: [], pagination: {page:1, limit:20, total:0, hasMore:false}}`. Empty but functional. |
| 17b | Notifications Unread Count | PASS | 200 | Returns `{data: {unreadCount: 0}}`. |
| 18 | New User Registration | PASS | 201 | Returns userId, email, emailVerified=false, message about verification email. |
| 18b | Duplicate Registration | PASS | 409 | Properly returns CONFLICT error `"Email is already registered"`. |
| 19 | Frontend Pages | PASS | 200 | All pages return 200: `/auth/login`, `/catalog`, `/dashboard`, `/consultation`, `/bookings`, `/matching`, `/pricing`. |

---

## Additional Endpoints Tested

| Endpoint | Method | Status | HTTP Code | Notes |
|----------|--------|--------|-----------|-------|
| `/auth/refresh` | POST | WORKS | 401 | Returns "Refresh token is required" (expected -- no refresh token sent). |
| `/auth/logout` | POST | PASS | 204 | Logout successful, no content returned. |
| `/auth/forgot-password` | POST | PASS | 200 | Returns safe message regardless of email existence. |
| `/auth/reset-password` | POST | WORKS | 400 | Returns "Invalid or expired reset token" (expected with fake token). |
| `/auth/verify/email` | POST | WORKS | 400 | Returns "Invalid or expired verification token" (expected with fake token). |
| `/auth/register/phone` | POST | PARTIAL | 400 | Validation error: "role must be one of the following values: " (empty enum -- role options not shown). |
| `/users/me` (PATCH) | PATCH | PASS | 200 | Profile update works. firstName change reflected immediately. |
| `/messages` | GET | MISSING | 404 | No messaging endpoint found. |
| `/conversations` | GET | MISSING | 404 | No conversations endpoint found. |
| `/subscriptions/plans` | GET | MISSING | 404 | No subscription plans listing endpoint. |

---

## Security Tests

| Test | Status | Notes |
|------|--------|-------|
| Invalid token | PASS | Returns 401 "Invalid or expired token". |
| No token (protected route) | PASS | Returns 401 "Invalid or expired token". |
| Empty login body | PASS | Returns 400 with specific validation messages. |
| SQL injection in email | PASS | Validated: "email must be an email". Not vulnerable. |
| **XSS in profile firstName** | **FAIL** | `<script>alert(1)</script>` accepted and stored as firstName. Returned verbatim in API responses. No input sanitization. |
| Rate limiting | PASS | Login endpoint rate-limited after multiple attempts (429). |
| Duplicate registration | PASS | Properly returns 409 CONFLICT. |

---

## What WORKS

- User registration (email) with proper validation
- User login (email) with JWT token response
- User profile retrieval and update (PATCH /users/me)
- Specialist catalog with cursor-based pagination
- Catalog filtering by type, price range, specialization (array format)
- Specializations and approaches listing with counts
- Individual specialist profile with full details
- AI consultation creation with WebSocket URL for real-time chat
- AI consultation history listing
- Booking slot lookup (endpoint works, returns empty when no schedule)
- Booking creation (even without available slots -- potential issue)
- Booking list with detailed info (matchScore, canCancel, canReschedule, hasReview)
- Single booking detail retrieval
- Booking cancellation (PATCH method)
- Payments endpoint (returns empty but functional)
- Notifications with pagination and unread count
- Auth logout (204 No Content)
- Auth forgot-password (safe response regardless of email existence)
- Auth verify/email and reset-password (proper validation of tokens)
- Auth rate limiting on login endpoint
- Duplicate registration prevention (409 CONFLICT)
- All frontend pages accessible (200)
- Proper error codes and messages throughout

---

## What DOES NOT WORK (Bugs)

### BUG-S1-001: No Health/Readiness Endpoint
- **Severity:** HIGH
- **Endpoint:** GET /v1/health, GET /health, GET /
- **HTTP Code:** 404
- **Details:** No health check endpoint exists. Required for load balancers, Kubernetes probes, and monitoring.

### BUG-S1-002: XSS Stored in User Profile
- **Severity:** CRITICAL
- **Endpoint:** PATCH /v1/users/me
- **Details:** `<script>alert(1)</script>` is accepted and stored as `firstName`. The API returns it verbatim. If rendered on the frontend without escaping, this enables stored XSS attacks. Input sanitization/validation for HTML content is missing on all text fields.

### BUG-S1-003: Booking Created Without Available Slots
- **Severity:** HIGH
- **Endpoint:** POST /v1/bookings
- **Details:** A booking was successfully created (201) for a specialist who has zero available slots in the requested time range. The system does not validate that the requested time falls within an available slot. This could lead to phantom bookings.

### BUG-S1-004: Matching/Value Profile Not Working
- **Severity:** HIGH
- **Endpoint:** POST /v1/matching/recommendations, GET /v1/value-profile/me
- **HTTP Code:** 404
- **Details:** Both endpoints return "Value profile not found" even for the seeded user (`test@example.com`) who has 30 completed bookings and reviews. Value profiles are never auto-populated by the seed process and require completing the full AI consultation flow manually.

### BUG-S1-005: Specialist Reviews Not Accessible
- **Severity:** MEDIUM
- **Endpoint:** GET /v1/specialists/:id/reviews
- **HTTP Code:** 404
- **Details:** No route exists to fetch reviews for a specific specialist. GET /v1/reviews returns empty even for users with `hasReview: true` on their bookings. Reviews exist in the database (seeded) but are not retrievable via any known API endpoint.

### BUG-S1-006: Login Rate Limit Too Aggressive
- **Severity:** MEDIUM
- **Endpoint:** POST /v1/auth/login/email
- **HTTP Code:** 429
- **Details:** Rate limiter triggers after approximately 5 requests and has a cooldown exceeding 60 seconds. While rate limiting is necessary, >60s lockout after just 5 attempts is excessive and impacts usability. Consider per-IP/per-email throttling with shorter cooldowns.

### BUG-S1-007: Phone Registration Validation Error Leaks Empty Enum
- **Severity:** LOW
- **Endpoint:** POST /v1/auth/register/phone
- **HTTP Code:** 400
- **Details:** Validation message says "role must be one of the following values: " with an empty string after the colon. The allowed role values are not displayed in the error, making debugging difficult.

### BUG-S1-008: Test Credentials in Documentation Are Wrong
- **Severity:** LOW
- **Details:** The provided test credentials `user@test.com / TestPass123!` do not exist. The actual seeded test users are `test@example.com`, `client1@example.com`, `client2@example.com` (all with password `TestPass123!`).

---

## What is MISSING for Production

### Missing API Endpoints
1. **Health/Readiness endpoint** -- Required for infrastructure monitoring and orchestration
2. **Specialist reviews endpoint** -- `/specialists/:id/reviews` is not implemented despite reviews existing in DB
3. **Messaging/Conversations** -- No `/messages` or `/conversations` endpoints (peer-to-peer messaging may be WebSocket-only)
4. **Subscription plans listing** -- No `/subscriptions/plans` endpoint (pricing page exists on frontend)
5. **API documentation** -- No Swagger/OpenAPI at `/api-docs`

### Missing Data/Configuration
1. **Specialist availability schedules** -- All specialists return empty slots (no working hours configured)
2. **Value profiles** -- Not seeded, not auto-generated. Blocks matching functionality entirely
3. **Payment processing** -- Bookings stay in `PENDING_PAYMENT` with no way to complete payment via API

### Missing Validation
1. **Input sanitization** -- HTML/script tags accepted in text fields (firstName, etc.)
2. **Slot availability validation** -- Bookings accepted for times outside available slots
3. **Catalog filter parameter documentation** -- `minPrice`/`maxPrice` vs `priceMin`/`priceMax` confusion; `specialization` must be array but error message is unclear

---

## Critical Issues Summary

| # | Severity | Description |
|---|----------|-------------|
| 1 | **CRITICAL** | Stored XSS vulnerability -- `<script>` tags accepted and stored in user profile fields without sanitization |
| 2 | **HIGH** | No health check endpoint for infrastructure monitoring |
| 3 | **HIGH** | Bookings can be created for unavailable time slots (no slot validation) |
| 4 | **HIGH** | Matching/recommendations completely non-functional -- value profiles never populated for any user |
| 5 | **MEDIUM** | Specialist reviews inaccessible via API (no endpoint to retrieve them) |
| 6 | **MEDIUM** | Login rate limiting too aggressive (>60s lockout after ~5 attempts) |
| 7 | **LOW** | Phone registration validation leaks empty enum in error message |
| 8 | **LOW** | Test credentials documentation incorrect |

---

## Test Environment Notes

- JWT tokens expire after 15 minutes (`exp` - `iat` = 900s)
- Registration auto-verifies email (`emailVerified: true` immediately after login)
- Free plan includes 1 AI consultation
- All specialists are marked `verified: true`
- WebSocket URL format: `wss://api.hearty.pro/ws/ai-chat?conversationId=...` (note: uses production domain, not IP)
- Catalog has 16 total specialists (5 coaches, 11 psychologists/psychotherapists)
- Price range: 3000-8000 RUB
- Session durations: 50 or 60 minutes

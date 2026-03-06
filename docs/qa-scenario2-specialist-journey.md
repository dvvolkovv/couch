# Scenario 2: Full Specialist Journey -- API Test Results

**Date:** 2026-03-06
**Tester:** QA Automation (Claude Opus 4.6)
**Environment:** Live (API: http://138.124.61.221:3200/v1, Frontend: http://138.124.61.221:8080)
**Specialist Account:** cityfarmer@yandex.ru (role: SPECIALIST, user: Dmitry Fermer)

---

## Step-by-step Results

| Step | Action | Status | HTTP Code | Notes |
|------|--------|--------|-----------|-------|
| 1 | Specialist Login (`POST /auth/login/email`) | PASS | 200 | Returns accessToken, user object with id/email/role/firstName. Note: `!` in password causes JSON parse error when sent via `curl -d` due to shell escaping -- works via programmatic HTTP client. Server error message is misleading ("Bad escaped character in JSON at position 55") |
| 2 | Get user profile (`GET /users/me`) | PASS | 200 | Returns full user profile: id, email, phone(null), role=SPECIALIST, name, age=38, gender=male, city, timezone, subscription (free plan, 0/1 AI consultations), hasValueProfile=true |
| 3 | Get specialist profile (`GET /specialists/me`) | PASS | 200 | Returns full specialist data: type=COACH, verification=APPROVED, education, 7 years exp, 5 approaches, 6 specializations, bio, aiBio, price=3500, duration=50, rating=4.7, 7 reviews, 8 sessions, commissionRate=0.2, subscriptionPlan=professional |
| 4 | Get schedule (`GET /schedule/me`) | PASS | 200 | Returns timezone=Europe/Moscow, 25 recurring slots (Mon-Fri, 10:00-19:50 in 2hr blocks), no custom slots, no blocked dates |
| 5 | Update schedule (`PUT /schedule/me`) | PASS | 200 | Successfully replaced all 25 slots with 4 new slots (Sun 09-10, Sun 10-11, Wed 14-15, Fri 16-17). Returns updated data with new slot IDs. Old slots properly deleted |
| 6 | Start AI specialist interview (`POST /ai/consultations`) | PASS | 201 | Creates new SPECIALIST_INTERVIEW with ACTIVE status, phase=GREETING, returns wsUrl for WebSocket, and initial assistant message with professional onboarding greeting |
| 7 | Get AI consultation history (`GET /ai/consultations`) | PASS | 200 | Returns array of 2 consultations (both SPECIALIST_INTERVIEW type, both ACTIVE status). No pagination metadata returned |
| 8 | Get value profile (`GET /value-profile/me`) | PASS | 200 | Returns full value profile: core values (5), avoided values (3), professional values (3), communicationStyle with pace/traits/primary/feedback, summaryText. ownerType=SPECIALIST |
| 9 | Get bookings (`GET /bookings`) | PASS | 200 | Returns 15 bookings with mixed statuses: COMPLETED(8), CONFIRMED(2), PENDING_PAYMENT(2), CANCELLED_CLIENT(3). Includes matchScore, canCancel, canReschedule, hasReview flags |
| 10 | Get notifications (`GET /notifications`) | PASS | 200 | Returns empty array with pagination (page=1, limit=20, total=0). Pagination works correctly |
| 11 | Get reviews (`GET /reviews`) | PASS | 200 | Returns empty array (data=[], total=0). Despite specialist having totalReviews=7 in profile and 6 bookings with hasReview=true, the /reviews endpoint returns nothing -- possible data inconsistency or endpoint only shows reviews authored by the user |
| 12 | Update specialist profile (`PATCH /specialists/me`) | PASS | 200 | Successfully updated bio field. Returns full specialist object with updated bio. Other fields unchanged |
| 13a | Get payouts (`GET /specialists/me/payouts`) | FAIL | 404 | Endpoint does not exist: "Cannot GET /v1/specialists/me/payouts" |
| 13b | Get payments (`GET /payments`) | PASS | 200 | Returns empty array (data=[], total=0). No payments recorded despite 8 completed sessions at 3500 RUB each |
| 14 | Get message threads (`GET /messages/threads`) | PASS | 200 | Returns empty array. No peer-to-peer message threads found |
| 15 | Get unread count (`GET /messages/unread-count`) | PASS | 200 | Returns {unreadCount: 0}. Works correctly |
| 16a | Register new user (`POST /auth/register/email`) | PASS | 201 | Successfully created user. Returns userId, email, emailVerified=false, "Verification email sent" message. NOTE: does NOT return an accessToken (must login separately) |
| 16b | Login with new user (`POST /auth/login/email`) | PASS (delayed) | 200 (after 429) | Login works but hit rate limit (429) after registration. Rate limit window is >30s, <62s. Login succeeds for unverified email (emailVerified=false) |
| 16c | Apply as specialist (`POST /specialists/apply`) | PASS | 201 | Application accepted. Returns specialistId, status=PENDING, guidance message with nextStep="ai_interview". CLIENT role user can apply as specialist |
| 17 | Frontend pages (all 8) | PASS | 200 | All specialist frontend routes return HTTP 200: /specialist/dashboard, /schedule, /profile, /messages, /interview, /clients, /finances, /register |

## Edge Case Results

| Test | Status | HTTP Code | Notes |
|------|--------|-----------|-------|
| GET /specialists/:id (public profile, no auth) | PASS | 200 | Public profile accessible without auth. Last name is anonymized ("F." instead of full). Includes valueProfile summary. nearestAvailableSlot=null |
| GET /users/me (no auth header) | PASS | 401 | Correctly rejects with "Invalid or expired token" |
| GET /users/me (invalid token) | PASS | 401 | Correctly rejects with "Invalid or expired token" |
| GET /specialists/me/reviews | FAIL | 404 | Endpoint does not exist |
| GET /specialists/:id/reviews | FAIL | 404 | Endpoint does not exist |
| GET /reviews?specialistId=... | N/A | 401 | Requires auth, could not test with expired token |

---

## What WORKS

- **Authentication:** Login/registration flow works. JWT tokens issued correctly with role, email, sub claims. Token expiry is set (900 seconds = 15 minutes)
- **Specialist profile (GET/PATCH):** Full CRUD on specialist profile works. All fields returned correctly including AI-generated bio, verification status, rating, session count
- **Schedule management:** Full schedule replacement via PUT works. Timezone preserved, old slots deleted, new slot IDs generated. Supports recurringSlots, customSlots, and blockedDates
- **AI specialist interview:** Creates new interview session, returns WebSocket URL and initial greeting message. Phase tracking (GREETING) works
- **AI consultation history:** Lists all consultations for the user with status and timestamps
- **Value profile:** Returns comprehensive psychological profile with core/avoided/professional values and communication style
- **Bookings:** Returns full booking history with appropriate status flags (canCancel, canReschedule, hasReview)
- **Notifications:** Pagination works (page, limit, total, hasMore)
- **Peer-to-peer messaging:** Threads and unread count endpoints work
- **New specialist registration flow:** Register as CLIENT -> login -> apply as specialist flow works end-to-end. Application returns status=PENDING with next steps
- **Public specialist profile:** Anonymized last name for privacy, includes value profile summary
- **Frontend routing:** All 8 specialist pages return 200 (SPA routing works)
- **Auth guards:** Unauthorized and invalid token requests correctly return 401

## What DOES NOT WORK (Bugs)

### BUG-S2-01: Payouts endpoint missing (404)
- **Endpoint:** `GET /specialists/me/payouts`
- **Expected:** Return list of specialist payouts/earnings
- **Actual:** 404 "Cannot GET /v1/specialists/me/payouts"
- **Impact:** Specialists cannot view their earnings or payout history

### BUG-S2-02: Reviews not accessible for specialist
- **Endpoint:** `GET /reviews` (as specialist), `GET /specialists/me/reviews`, `GET /specialists/:id/reviews`
- **Expected:** Specialist should be able to view reviews left about them (profile shows totalReviews=7 and bookings show hasReview=true for 6 sessions)
- **Actual:** `/reviews` returns empty array; `/specialists/me/reviews` and `/specialists/:id/reviews` return 404
- **Impact:** Specialists cannot see feedback from their clients

### BUG-S2-03: Payments data empty despite completed sessions
- **Endpoint:** `GET /payments`
- **Expected:** Should show payment records for 8 completed sessions at 3500 RUB
- **Actual:** Returns empty array (data=[], total=0)
- **Impact:** No financial transaction history visible

### BUG-S2-04: Multiple active AI interviews allowed
- **Observation:** Two SPECIALIST_INTERVIEW consultations are both in ACTIVE status simultaneously
- **Expected:** Either prevent creating a second interview while one is active, or auto-close the previous one
- **Actual:** Both remain ACTIVE indefinitely (first one from 2026-03-05, second from 2026-03-06)
- **Impact:** Stale/orphaned interview sessions, potential data inconsistency

### BUG-S2-05: Login allowed for unverified email
- **Observation:** Newly registered user (emailVerified=false) can login and perform all actions including applying as specialist
- **Expected:** Either require email verification before login, or explicitly document this as intentional
- **Actual:** Login succeeds, full access granted without email verification
- **Impact:** Potential for spam registrations, fake specialist applications

### BUG-S2-06: Aggressive rate limiting blocks legitimate test flows
- **Observation:** After ~4 login attempts, rate limiter blocks requests for 60+ seconds
- **Expected:** Rate limit should allow reasonable burst (e.g., 10 requests/minute for login)
- **Actual:** Blocks after very few requests, window is 60+ seconds
- **Impact:** Could block legitimate users who mistype password or have connectivity issues

### BUG-S2-07: Notifications empty for active specialist
- **Observation:** Specialist with 15 bookings (including recent confirmations, cancellations, pending payments) has 0 notifications
- **Expected:** Should have notifications for booking events (new booking, cancellation, payment received, etc.)
- **Actual:** Empty notifications array
- **Impact:** Specialist misses important booking updates

### BUG-S2-08: nearestAvailableSlot is null in public profile
- **Observation:** Public specialist profile shows nearestAvailableSlot=null despite having active recurring schedule
- **Expected:** Should compute and return the next available booking slot for client convenience
- **Actual:** null
- **Impact:** Clients cannot see when the specialist is next available without navigating to booking flow

### BUG-S2-09: Registration does not return access token
- **Observation:** `POST /auth/register/email` returns userId and message but no accessToken
- **Expected:** Either return token immediately (like login does) or document that separate login is required
- **Actual:** Must make a separate login call after registration
- **Impact:** Extra API call required, poor DX/UX

## What is MISSING for Production

1. **Payouts/Earnings system:** No endpoint for specialists to view their earnings, commission deductions, payout status, or bank account configuration
2. **Specialist reviews viewing:** No way for a specialist to see reviews left about them (despite reviews existing in the system)
3. **Payment history:** No transaction records despite completed bookings -- payment processing appears incomplete or not connected
4. **Notification generation:** No automatic notifications for booking lifecycle events
5. **Specialist application status tracking:** After applying, no endpoint to check application review status
6. **Document upload for verification:** Specialist profile has `documents: []` but no upload endpoint discovered
7. **Video provider configuration:** `videoProvider: null` -- no way to set up video call integration
8. **Session notes/records:** No endpoint for specialists to record session notes
9. **Client management:** No endpoint to view client details (beyond booking data)
10. **Analytics/statistics:** No endpoint for session stats, revenue trends, or client retention metrics
11. **Cancellation policy management:** No way to set cancellation policies
12. **Availability exceptions:** No way to block specific dates (blockedDates field exists but no dedicated endpoint)

## Critical Issues

| Severity | Issue | Description |
|----------|-------|-------------|
| CRITICAL | BUG-S2-01 | Payouts endpoint missing -- specialists cannot track their income |
| CRITICAL | BUG-S2-03 | Payment data empty -- no financial records for completed sessions |
| HIGH | BUG-S2-02 | Specialist cannot view reviews about them despite 7 reviews existing |
| HIGH | BUG-S2-07 | No notifications generated for booking events |
| HIGH | BUG-S2-04 | Multiple active AI interviews allowed without auto-cleanup |
| MEDIUM | BUG-S2-05 | Unverified email allows full access including specialist application |
| MEDIUM | BUG-S2-06 | Aggressive rate limiting (60s+ lockout after ~4 login attempts) |
| MEDIUM | BUG-S2-08 | nearestAvailableSlot not computed in public profile |
| LOW | BUG-S2-09 | Registration does not return access token, requires separate login |

---

## Summary

**Total steps executed:** 17 main steps + 5 edge cases = 22 tests
**Passed:** 18
**Failed:** 4 (payouts 404, specialist reviews 404, reviews data inconsistency, empty payments)
**Overall:** Core specialist CRUD operations (profile, schedule, AI interview) work well. Financial features (payments, payouts) are non-functional. Reviews have a data consistency issue. Notification system appears to not generate events for booking lifecycle. The specialist registration/application flow works end-to-end but lacks email verification enforcement.

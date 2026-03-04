# Review Summary — SoulMate

**Date:** 2026-03-03
**Reviewed by:** QA Engineer, Security Engineer, System Architect, DevOps Engineer
**Codebase:** 87 source files (54 backend, 33 frontend), 22 Prisma models
**Commit:** `20779c6` on `main`

---

## Readiness Score: 3 / 10

The backend architecture and AI pipeline are well-designed, but the system is **not production-ready**. Critical security vulnerabilities, a disconnected frontend-backend integration, zero test coverage, and incomplete core features (booking, payments, most frontend pages) block any production deployment.

---

## Critical Issues (Must Fix — Blocks Deployment)

| # | Issue | Source | Impact |
|---|-------|--------|--------|
| 1 | **JWT secret falls back to `.env.example` placeholder** — if `.env` is missing, the app uses `your-jwt-secret-change-in-production` as the signing key | Security CRIT-02 | Complete authentication bypass; any attacker can forge tokens |
| 2 | **OAuth stubs accept any token** — Google/VK OAuth endpoints create real sessions without verifying tokens | Security CRIT-04 | Unlimited fake account creation; authentication bypass |
| 3 | **WebSocket CORS set to `origin: '*'` with `credentials: true`** — invalid per CORS spec, browsers will reject or allow any origin | QA CRIT-07, Security CRIT-03 | Cross-origin WebSocket hijacking of psychological consultations |
| 4 | **WebSocket JWT module has no secret** — `JwtModule.register({})` in `AiModule` means `jwtService.verify()` fails or uses empty key | QA DEAD-09, Architect §2.3 | All WebSocket authentication broken; AI chat unusable |
| 5 | **OTP codes logged to stdout in plaintext** — `logger.log(\`OTP for ${phone}: ${code}\`)` | Security CRIT-05 | OTP harvesting from log aggregation systems |
| 6 | **ThrottlerModule configured but ThrottlerGuard never applied** — rate limiting is completely inert | Security AUTH-06 | No rate limiting on any endpoint; brute-force, credential stuffing, DoS |
| 7 | **`isConfirmation()` treats any message < 20 chars as "yes"** — including "no", "wrong", "stop" | QA CRIT-02, CRIT-03 | Premature consultation finalization with incorrect data; corrupted value profiles |
| 8 | **Frontend-backend disconnect** — consultation page calls non-existent REST endpoint; WebSocket never used by frontend; catalog uses hardcoded data | Architect §5 | Core user journey (AI consultation + matching) is non-functional end-to-end |
| 9 | **Frontend phase names don't match backend** — `REQUEST_EXPLORATION` vs `SITUATION_EXPLORATION`, `VALUE_INTERVIEW` vs `VALUE_ASSESSMENT`, etc. | QA CRIT-04 | Progress bar never correctly tracks conversation phases |
| 10 | **`UpdateUserDto` overwrites fields with null** — partial PATCH sends undefined fields, Prisma sets them to null | QA CRIT-05 | User data loss on any profile update |

---

## High-Priority Warnings

| # | Issue | Source | Impact |
|---|-------|--------|--------|
| 11 | OTP generated with `Math.random()` (not cryptographically secure) | Security AUTH-01 | Predictable OTP codes |
| 12 | 4-digit OTP (9000 values) with limited rate limiting | Security AUTH-02 | Feasible brute-force |
| 13 | No rate limiting on `loginPhone` OTP sends | Security AUTH-03 | SMS flooding attacks, financial damage |
| 14 | No brute-force protection on email login | Security AUTH-05 | Credential stuffing |
| 15 | Redis deployed without password, port exposed | Security DATA-05 | Direct access to OTP codes, session data |
| 16 | Hardcoded DB credentials in `docker-compose.yml` | Security CRIT-01 | Database compromise via repo access |
| 17 | No conversation ownership check in WebSocket `join_conversation` | QA ERR-05, Architect §2.3 | Users can eavesdrop on others' AI consultations |
| 18 | Zero test files in entire project | QA TEST-01 | No confidence in correctness; regression risk |
| 19 | Booking module is an empty shell (no endpoints) | Architect §5 | Core monetization flow non-functional |
| 20 | pgvector embeddings stored but never queried for matching | Architect §5 | Dead code; matching does full table scan in JS |
| 21 | AI message encryption planned (`contentEncrypted` field) but never implemented | Security CRYPTO-02 | Sensitive psychological data stored in plaintext |
| 22 | Access token stored in `localStorage` | Security DATA-04 | Vulnerable to XSS token theft |
| 23 | Swagger API docs exposed without authentication | Security DATA-02 | Full API surface disclosed in production |
| 24 | Avatar upload ignores actual file content | QA CRIT-06 | Feature broken; URL hardcoded regardless of upload |

---

## Medium-Priority Issues

| # | Issue | Source |
|---|-------|--------|
| 25 | Phone/email enumeration via distinct error messages | Security AUTH-04 |
| 26 | Self-role escalation (users choose SPECIALIST during registration) | Security AUTH-10 |
| 27 | `$executeRawUnsafe` used instead of `$executeRaw` for pgvector | Security INJ-01 |
| 28 | No input length limits on WebSocket chat messages | Security INJ-03 |
| 29 | No file upload validation (size, MIME type) | Security INJ-04 |
| 30 | Prisma query logging enabled (leaks PII in production) | Security DATA-03 |
| 31 | Refresh token expiry ignores `JWT_REFRESH_EXPIRATION` config | QA CRIT-01 |
| 32 | `deleteMe` claims 30-day deletion but never schedules it | QA LOGIC-05 |
| 33 | `loginEmail` doesn't check `emailVerified` | QA LOGIC-07 |
| 34 | Phase transition only at `max` exchanges, `min` unused | QA LOGIC-01 |
| 35 | Value label maps duplicated in 4+ locations | Architect §6 |
| 36 | WebSocket `connectedUsers` in-memory Map breaks horizontal scaling | Architect §5 |
| 37 | Full conversation history sent to LLM every exchange (cost) | Architect §5 |
| 38 | Cookie path hardcoded to `/v1/auth` instead of using config | QA LOGIC-12 |
| 39 | Only 3 of ~15 needed frontend pages exist | Architect §3.1 |

---

## What's Working Well

1. **AI conversation pipeline** — Well-architected phased conversation with crisis detection, structured value extraction, and streaming responses via WebSocket
2. **Matching algorithm** — Thoughtful weighted 5-component scoring (cosine similarity, style distance, approach match, worldview, specialization)
3. **Prisma schema** — Comprehensive 22-model design with proper indexes, CUID IDs, cascading deletes, snake_case mapping
4. **Auth foundations** — bcrypt (12 rounds), hashed refresh tokens in httpOnly cookies, token rotation, banned-user check in JWT strategy
5. **Frontend patterns** — Zustand stores, Radix UI + Tailwind, API client with token refresh queue, accessible HTML
6. **Crisis handling** — Two-level detection (keyword + LLM), immediate crisis alerts with hotline numbers, conversation status change

---

## Readiness Assessment by Area

| Area | Score | Notes |
|------|-------|-------|
| **Backend Architecture** | 6/10 | Solid module structure, good DI patterns. JWT propagation bug and empty booking module hold it back. |
| **Frontend Completeness** | 2/10 | Only 3 pages exist. No auth UI, no specialist detail, no booking, no dashboard. Catalog uses demo data. |
| **Frontend-Backend Integration** | 1/10 | WebSocket never connected. REST endpoint missing. Core flow falls through to demo simulation. |
| **Security** | 2/10 | 5 critical + 7 high vulnerabilities. JWT fallback, OAuth stubs, no rate limiting, plaintext OTP logging. |
| **Database & Schema** | 7/10 | Well-designed schema. Missing pgvector index and unencrypted sensitive data are concerns. |
| **AI Pipeline** | 7/10 | Good design. `isConfirmation()` bug and exchange-count-only transitions reduce quality. |
| **Matching Engine** | 6/10 | Good algorithm, but doesn't use pgvector and does full JS loop. Works but won't scale. |
| **Test Coverage** | 0/10 | Zero test files anywhere. |
| **DevOps Readiness** | 5/10 | PM2 + Nginx setup is standard. Missing SSL, monitoring, backup automation. |
| **Documentation** | 4/10 | Swagger is present. No README, no API docs, no architecture docs (until this review). |

---

## Recommended Action Plan

### Phase 0 — Security Hardening (before any user access)
1. Remove `.env.example` from `ConfigModule.envFilePath`; add startup validation for `JWT_SECRET`
2. Disable OAuth stub endpoints (or gate behind `NODE_ENV === 'development'`)
3. Fix WebSocket CORS to use `CORS_ORIGINS` from config
4. Fix `AiModule` `JwtModule` to use `registerAsync` with `JWT_SECRET`
5. Remove all OTP/token `logger.log` calls
6. Apply `ThrottlerGuard` as global `APP_GUARD`; add stricter limits on auth endpoints
7. Set Redis password; bind to localhost
8. Add conversation ownership check in WebSocket gateway

### Phase 1 — Critical Bug Fixes (1-2 days)
9. Fix `isConfirmation()` — remove the `< 20 chars` fallback; add rejection phrases
10. Fix `UpdateUserDto` — filter undefined values before Prisma update
11. Align frontend phase names with backend enum values
12. Use `crypto.randomInt()` for OTP; increase to 6 digits
13. Add rate limiting to `loginPhone`
14. Check `emailVerified` during `loginEmail`

### Phase 2 — Frontend-Backend Connection (1-2 weeks)
15. Implement WebSocket integration in consultation page (replace REST fallback)
16. Build auth pages (`/auth/login`, `/auth/register`)
17. Connect catalog page to real API
18. Build specialist detail page with real data
19. Build matching results page
20. Remove all demo/hardcoded data from frontend

### Phase 3 — Feature Completion (2-4 weeks)
21. Implement booking flow (controller + service + frontend)
22. Implement payment integration (YooKassa)
23. Implement schedule management endpoints
24. Build user and specialist dashboards
25. Add pgvector HNSW index and ANN pre-filtering in matching

### Phase 4 — Quality & Hardening (ongoing)
26. Add unit tests for all services (target 80% coverage)
27. Add e2e tests for auth, consultation, and matching flows
28. Implement AI message encryption
29. Add structured security event logging
30. Set up CI/CD pipeline with automated tests
31. Conduct penetration testing before public launch

---

## Individual Review Documents

| Review | File | Key Findings |
|--------|------|--------------|
| QA Review | [docs/qa-review.md](qa-review.md) | 7 critical bugs, 4 type issues, 8 error handling gaps, 12 logic issues, 10 dead code items, 0 tests |
| Security Review | [docs/security-review.md](security-review.md) | 5 critical, 7 high, 8 medium, 3 low vulnerabilities. Full OWASP Top 10 assessment |
| Architecture Review | [docs/architecture-review.md](architecture-review.md) | Strong AI pipeline and schema design. Frontend 80% incomplete. Frontend-backend integration broken |
| Deployment Guide | [docs/deployment-guide.md](deployment-guide.md) | 17-section comprehensive guide with Nginx config, PM2, SSL, monitoring, backups, health checks |

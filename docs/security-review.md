# Security Review -- SoulMate

**Reviewed by:** Security Engineer (automated audit)
**Date:** 2026-03-03
**Scope:** Full codebase review -- backend (NestJS), frontend (Next.js), Prisma schema, Docker configuration, authentication flow, WebSocket gateway, AI integrations
**Methodology:** Manual source code analysis against OWASP Top 10 (2021), OWASP API Security Top 10, CWE/SANS Top 25

---

## Critical Vulnerabilities

### CRIT-01: Hardcoded Database Credentials in Docker Compose

- **Severity:** CRITICAL
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/docker-compose.yml`, lines 9-11
- **Description:** Database credentials (`soulmate` / `soulmate_pass`) are hardcoded directly in the docker-compose file which is committed to version control. The task description also references production credentials (`taler` / `taler_secret_2026`) for the deployment at `138.124.61.221`, which indicates credentials are managed insecurely.
- **Code:**
  ```yaml
  environment:
    POSTGRES_USER: soulmate
    POSTGRES_PASSWORD: soulmate_pass
    POSTGRES_DB: soulmate
  ```
- **Impact:** Anyone with repository access gains full database access. If the production server uses similarly hardcoded credentials, the entire database (including PII, medical/psychological data, payment information) is compromised.
- **Recommended Fix:** Use Docker secrets or environment variable injection from a `.env` file excluded from version control. Use unique, strong, randomly generated passwords. For production, use a secrets management system (Vault, AWS Secrets Manager, etc.).

### CRIT-02: Weak JWT Secret Placeholder Fallback

- **Severity:** CRITICAL
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/.env.example`, line 15
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/app.module.ts`, lines 17-19
- **Description:** The `.env.example` contains the JWT secret value `your-jwt-secret-change-in-production`. The `ConfigModule` is configured with `envFilePath: ['.env', '.env.example']`, which means if a `.env` file is absent or does not define `JWT_SECRET`, the application will fall back to reading from `.env.example` and use this trivially guessable secret. An attacker can forge arbitrary JWT tokens, impersonate any user (including admins), and gain full system access.
- **Code:**
  ```typescript
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env', '.env.example'],
  }),
  ```
- **Impact:** Complete authentication bypass. Arbitrary user impersonation.
- **Recommended Fix:** (1) Remove `.env.example` from the `envFilePath` array -- it should only be used as documentation. (2) Add a startup validation check that `JWT_SECRET` is set and has sufficient entropy (minimum 32 bytes of randomness). (3) Fail hard on startup if the secret is the placeholder value.

### CRIT-03: WebSocket CORS Set to Wildcard Origin

- **Severity:** CRITICAL
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`, lines 36-40
- **Description:** The WebSocket gateway CORS is configured with `origin: '*'`, allowing connections from any origin. This completely undermines the CORS protection configured for the HTTP API. Any malicious website can open a WebSocket connection to the AI chat service if it can obtain or steal a JWT token.
- **Code:**
  ```typescript
  @WebSocketGateway({
    namespace: 'ai-chat',
    cors: {
      origin: '*',
      credentials: true,
    },
  })
  ```
- **Impact:** Cross-origin WebSocket hijacking. Sensitive psychological consultation data can be exfiltrated. Attackers can send messages on behalf of users.
- **Recommended Fix:** Replace `origin: '*'` with the same allowed origins list used by the HTTP CORS configuration, sourced from the `CORS_ORIGINS` environment variable.

### CRIT-04: OAuth Stubs Accept Any Token Without Verification

- **Severity:** CRITICAL
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 303-315
- **Description:** The Google OAuth and VK OAuth endpoints are stubbed and do not verify the incoming `idToken` or authorization `code`. They create authenticated sessions with fabricated email addresses. If these endpoints are accessible in production, any attacker can call them with any string and receive valid JWT tokens.
- **Code:**
  ```typescript
  async oauthGoogle(idToken: string) {
    this.logger.warn('Google OAuth stub: token verification skipped');
    const mockEmail = `google_user_${Date.now()}@gmail.com`;
    return this.oauthUpsert(mockEmail, 'GOOGLE', 'Google', 'User');
  }
  ```
- **Impact:** Complete authentication bypass. Unlimited account creation. An attacker can generate infinite authenticated sessions.
- **Recommended Fix:** Either (1) disable these endpoints entirely until real OAuth is implemented, or (2) add a feature flag that prevents stub execution in non-development environments. Add proper Google ID token verification and VK authorization code exchange.

### CRIT-05: OTP Logged to Console in Plaintext

- **Severity:** CRITICAL
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 111, 243
- **Description:** OTP codes are logged to the application console/stdout in plaintext. In production, log aggregation systems (CloudWatch, ELK, etc.) would store these codes, making them accessible to anyone with log access. The email verification token is also logged (line 72).
- **Code:**
  ```typescript
  this.logger.log(`OTP for ${dto.phone}: ${code}`);
  this.logger.log(`Login OTP for ${phone}: ${code}`);
  this.logger.log(`Email verification token for ${dto.email}: ${verificationToken}`);
  ```
- **Impact:** OTP codes and email verification tokens can be harvested from logs, enabling account takeover.
- **Recommended Fix:** Remove all secret/token logging. Use structured logging with explicit field exclusion. If debugging is needed, only log partial/hashed references in development mode.

---

## Authentication & Authorization

### AUTH-01: Weak OTP Generation Using Math.random()

- **Severity:** HIGH
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 98, 241
- **Description:** OTP codes are generated using `Math.random()`, which is not cryptographically secure. `Math.random()` uses a PRNG that can be predicted if the attacker can observe enough outputs or knows the seed state.
- **Code:**
  ```typescript
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  ```
- **Impact:** An attacker who can predict the PRNG state can guess OTP codes.
- **Recommended Fix:** Use `crypto.randomInt(1000, 10000)` from Node.js `crypto` module for cryptographically secure random OTP generation.

### AUTH-02: 4-Digit OTP is Too Short

- **Severity:** HIGH
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, line 98
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/dto/auth.dto.ts`, line 49
- **Description:** The OTP is 4 digits (1000-9999), giving only 9000 possible values. Combined with 3 allowed attempts per phone number per 5-minute window, the rate limiting is insufficient. An attacker can rotate phone numbers or wait out the TTL to brute-force. The 3-attempt limit per 5 minutes translates to a 0.033% chance per attempt cycle -- achievable with automation.
- **Impact:** Feasible brute-force of OTP codes, especially with multiple phone numbers or distributed attacks.
- **Recommended Fix:** Use 6-digit OTP codes. Implement exponential backoff on verification failures. Add IP-based rate limiting in addition to phone-based limiting. Add account lockout after repeated failures across different phones from the same IP.

### AUTH-03: No Rate Limiting on loginPhone OTP Sends

- **Severity:** HIGH
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 234-250
- **Description:** The `loginPhone` method generates and sends OTPs without any rate limiting check (unlike `registerPhone` which checks `otp_rate:{phone}`). An attacker can trigger unlimited SMS sends for any registered phone number, causing SMS billing abuse and user harassment.
- **Code:**
  ```typescript
  async loginPhone(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Phone number not registered');
    }
    // No rate limit check!
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await this.redis.set(`otp:${phone}`, code, this.OTP_TTL);
    ...
  }
  ```
- **Impact:** SMS flooding attacks, financial damage from SMS costs, user denial of service.
- **Recommended Fix:** Apply the same OTP rate limiting used in `registerPhone` to `loginPhone`. Share the same rate limit counter.

### AUTH-04: Phone Number Enumeration via Login Endpoint

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 235-238
- **Description:** The `loginPhone` method throws `'Phone number not registered'` when the phone does not exist, allowing attackers to enumerate which phone numbers are registered on the platform. The `registerPhone` method similarly reveals `'Phone number is already registered'`.
- **Impact:** User enumeration. Attackers can build a list of registered phone numbers, which is particularly sensitive given the psychological health context of this platform.
- **Recommended Fix:** Return the same response regardless of whether the phone number is registered. For example, always respond with "If this number is registered, a code has been sent."

### AUTH-05: No Brute-Force Protection on Email Login

- **Severity:** HIGH
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 194-232
- **Description:** The `loginEmail` method has no rate limiting or account lockout mechanism. While the `ThrottlerModule` is registered globally with 100 requests/60 seconds, it is not bound to any guard (no `ThrottlerGuard` is applied anywhere in the codebase). An attacker can attempt unlimited password guesses against any email address.
- **Impact:** Credential stuffing and brute-force attacks on email/password accounts.
- **Recommended Fix:** (1) Apply `ThrottlerGuard` to authentication endpoints (or globally via `APP_GUARD`). (2) Implement progressive delays or account lockout after N failed attempts. (3) Track failed login attempts per email in Redis.

### AUTH-06: ThrottlerModule Configured But Never Applied

- **Severity:** HIGH
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/app.module.ts`, lines 20-25
- **Description:** `ThrottlerModule.forRoot()` is imported and configured but `ThrottlerGuard` is never registered as a global guard or applied to any endpoint. The rate limiting is therefore completely inert.
- **Code:**
  ```typescript
  ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
  ```
  No corresponding `ThrottlerGuard` in `APP_GUARD` providers or any `@UseGuards(ThrottlerGuard)` decorators found anywhere in the codebase.
- **Impact:** No rate limiting on any API endpoint. All endpoints are vulnerable to brute-force, credential stuffing, and denial-of-service attacks.
- **Recommended Fix:** Add `ThrottlerGuard` as a global guard in `AuthModule` or `AppModule`:
  ```typescript
  { provide: APP_GUARD, useClass: ThrottlerGuard }
  ```
  Apply stricter limits on authentication endpoints using `@Throttle()` decorator.

### AUTH-07: WebSocket JWT Verification Uses Separate JwtModule Without Shared Secret

- **Severity:** HIGH
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai.module.ts`, line 12
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`, line 68
- **Description:** The AI module registers `JwtModule.register({})` with an empty options object (no secret). The `AiChatGateway` then uses this `JwtService` to verify WebSocket authentication tokens. Without a secret, `jwtService.verify(token)` may either fail for all tokens (breaking WebSocket auth) or use a default/empty secret (allowing forged tokens).
- **Code:**
  ```typescript
  // ai.module.ts
  imports: [ValueProfileModule, JwtModule.register({})],
  // ai-chat.gateway.ts
  const payload = this.jwtService.verify(token);
  ```
- **Impact:** Either all WebSocket connections fail (denial of service for AI chat) or tokens can be forged (authentication bypass on WebSocket).
- **Recommended Fix:** Use `JwtModule.registerAsync()` with the same configuration as in `AuthModule`, injecting the `JWT_SECRET` from config. Or import `AuthModule` and use the shared `JwtModule`.

### AUTH-08: WebSocket Token Passed in Query String

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`, lines 58-60
- **Description:** The WebSocket gateway accepts JWT tokens from `client.handshake.query.token`. Tokens in query strings are logged in server access logs, proxy logs, and browser history.
- **Code:**
  ```typescript
  const token =
    client.handshake.auth?.token ||
    client.handshake.query?.token as string;
  ```
- **Impact:** JWT token leakage through logs and URL history.
- **Recommended Fix:** Only accept tokens from `client.handshake.auth.token` (Socket.IO auth object). Remove the query string fallback.

### AUTH-09: No Conversation Ownership Check in WebSocket join_conversation

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`, lines 82-98
- **Description:** The `join_conversation` handler allows any authenticated user to join any conversation room by ID. There is no check that the `conversationId` belongs to the authenticated `userId`. An attacker can subscribe to another user's conversation and receive their AI chat messages in real time.
- **Code:**
  ```typescript
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) { ... }
    // No ownership check!
    await client.join(`conversation:${data.conversationId}`);
  }
  ```
- **Impact:** Unauthorized access to other users' AI consultation conversations containing sensitive psychological data.
- **Recommended Fix:** Query the database to verify that the conversation belongs to the requesting user before allowing them to join the room.

### AUTH-10: Self-Role Escalation via Registration

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/dto/auth.dto.ts`, lines 24-25
- **Description:** Users can choose their own role (`CLIENT` or `SPECIALIST`) during registration. While there is no `ADMIN` option in the DTO enum, this is still a concern because specialist status grants access to specialist-only endpoints and data.
- **Recommended Fix:** Default all new registrations to `CLIENT` role. Specialist role should only be granted after the application/verification process.

---

## Data Exposure & Secrets Management

### DATA-01: Sensitive Data in .env.example Committed to Git

- **Severity:** HIGH
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/.env.example`
- **Description:** While the `.env` file is properly gitignored, `.env.example` contains placeholder secrets that become actual defaults due to CRIT-02. The file structure reveals the full infrastructure topology (Redis, Postgres, S3, payment providers, SMS providers).
- **Impact:** Information disclosure about infrastructure, service dependencies, and API providers.
- **Recommended Fix:** Ensure `.env.example` values are clearly non-functional placeholders. Never use `.env.example` as a config fallback.

### DATA-02: Swagger API Documentation Exposed Without Authentication

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/main.ts`, lines 57-58
- **Description:** Swagger documentation is mounted at `/docs` without any authentication. In production, this exposes the complete API surface, request/response schemas, and endpoint descriptions to any visitor.
- **Code:**
  ```typescript
  SwaggerModule.setup('docs', app, document);
  ```
- **Impact:** Information disclosure. Aids attackers in mapping the API surface.
- **Recommended Fix:** Disable Swagger in production (`NODE_ENV === 'production'`), or protect it behind authentication.

### DATA-03: Prisma Query Logging Enabled

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/common/prisma/prisma.service.ts`, lines 12-17
- **Description:** Prisma is configured with `{ emit: 'event', level: 'query' }` which logs all SQL queries. In production, this can log sensitive data including user PII, psychological data, and authentication tokens.
- **Code:**
  ```typescript
  super({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'info' },
      ...
    ],
  });
  ```
- **Impact:** Sensitive data leakage through database query logs.
- **Recommended Fix:** Conditionally enable query logging only in development. In production, log only `warn` and `error` levels.

### DATA-04: JWT Access Token Stored in localStorage

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/frontend/src/lib/api-client.ts`, lines 18-24
- **Description:** The JWT access token is stored in `localStorage`, which is accessible to any JavaScript running on the same origin. If an XSS vulnerability is found (even in a third-party library), the token can be exfiltrated.
- **Code:**
  ```typescript
  export function setAccessToken(token: string | null) {
    accessToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("access_token", token);
      }
    }
  }
  ```
- **Impact:** Token theft via XSS. The refresh token is correctly stored in httpOnly cookies, but the access token in localStorage is vulnerable.
- **Recommended Fix:** Consider using a BFF (Backend For Frontend) pattern where tokens are only stored in httpOnly cookies. If localStorage must be used, keep the access token TTL very short (current 15m is reasonable) and ensure no XSS vectors exist.

### DATA-05: Redis Has No Password

- **Severity:** HIGH
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/docker-compose.yml`, lines 22-34
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/.env.example`, line 12
- **Description:** Redis is deployed without a password. The `REDIS_PASSWORD` is empty in `.env.example`. Redis port 6379 is published to the host. If the server is reachable on the network, Redis is accessible without authentication. Redis contains OTP codes, session data, and rate limit counters.
- **Impact:** Unauthenticated access to OTP codes (enabling account takeover), session hijacking, and rate limit bypass.
- **Recommended Fix:** Configure a strong Redis password. Bind Redis to localhost only (remove port mapping or use `127.0.0.1:6379:6379`). Use Redis ACL in production.

### DATA-06: PostgreSQL Port Exposed to Host

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/docker-compose.yml`, lines 12-13
- **Description:** PostgreSQL port 5432 is mapped to the host. Combined with weak credentials, this allows direct database access from outside the Docker network.
- **Impact:** Direct database access from any network-reachable host.
- **Recommended Fix:** Remove the port mapping or bind to localhost (`127.0.0.1:5432:5432`). Use Docker internal networking for backend-to-database communication.

### DATA-07: AI Conversation Messages Stored Unencrypted

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/prisma/schema.prisma`, lines 280-297
- **Description:** The `AIMessage` model has a `contentEncrypted` boolean field (default `false`) but the code never encrypts message content. AI consultation messages contain deeply sensitive psychological data (suicidal ideation markers, mental health issues, personal values, trauma descriptions).
- **Impact:** A database breach exposes all user psychological data in plaintext.
- **Recommended Fix:** Implement encryption for AI message content using the `ENCRYPTION_KEY` from environment variables. Encrypt at-rest using application-level encryption (AES-256-GCM). Set `contentEncrypted: true` when storing encrypted messages.

---

## Input Validation & Injection

### INJ-01: $executeRawUnsafe with String Interpolation Risk

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/value-profile/value-profile.service.ts`, lines 74-79
- **Description:** The code uses `$executeRawUnsafe` to store pgvector embeddings. While the current implementation uses parameterized values (`$1`, `$2`), the use of `$executeRawUnsafe` (instead of `$executeRaw` with tagged template literals) bypasses Prisma's built-in SQL injection protection. The `embeddingStr` is constructed from a `number[]` which is safe in this case, but the pattern is dangerous and could introduce injection if the data source changes.
- **Code:**
  ```typescript
  const embeddingStr = `[${embedding.join(',')}]`;
  await this.prisma.$executeRawUnsafe(
    `UPDATE value_profiles SET embedding = $1::vector WHERE id = $2`,
    embeddingStr,
    profile.id,
  );
  ```
- **Impact:** Currently safe due to numeric-only input, but the pattern is fragile. If the embedding source is ever compromised or the format changes, SQL injection becomes possible.
- **Recommended Fix:** Use `$executeRaw` with tagged template literals: `` await this.prisma.$executeRaw`UPDATE value_profiles SET embedding = ${embeddingStr}::vector WHERE id = ${profile.id}` ``.

### INJ-02: Unvalidated ConfirmConsultationDto.corrections Field

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/dto/ai.dto.ts`, lines 8-14
- **Description:** The `ConfirmConsultationDto` has an `@IsOptional()` `corrections` field that accepts arbitrary `Record<string, any>` without deep validation. This data is merged into stored `extractedValues` in the database.
- **Code:**
  ```typescript
  export class ConfirmConsultationDto {
    @IsOptional()
    corrections?: {
      requestSummary?: string;
      preferences?: Record<string, any>;
    };
  }
  ```
- **Impact:** A user can inject arbitrary JSON structures into their stored profile data, potentially causing unexpected behavior in matching algorithms or downstream processing.
- **Recommended Fix:** Add proper class-validator decorators to deeply validate the `corrections` object structure. Define explicit allowed keys and value types for `preferences`.

### INJ-03: No Input Length Limits on Chat Messages

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/ai/ai-chat.gateway.ts`, lines 100-118
- **Description:** The WebSocket `send_message` handler only checks that `content` is non-empty but imposes no maximum length. A user can send extremely large messages, which are stored in the database and sent to the LLM API, causing resource exhaustion and high API costs.
- **Impact:** Denial of service through resource exhaustion. Elevated LLM API costs.
- **Recommended Fix:** Add a maximum message length (e.g., 5000 characters). Validate in both the WebSocket handler and the REST endpoint.

### INJ-04: No File Upload Validation

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/users/users.controller.ts`, lines 39-50
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/specialists/specialists.controller.ts`, lines 59-75
- **Description:** File upload endpoints for avatar and video intro use `FileInterceptor` without any file size limits, MIME type restrictions, or file extension validation.
- **Impact:** Arbitrary file upload, potential storage abuse, and depending on deployment configuration, could lead to remote code execution.
- **Recommended Fix:** Configure `FileInterceptor` with `limits` (file size), `fileFilter` (MIME type validation), and validate file extensions server-side.

---

## CORS & Network Security

### NET-01: HTTP API CORS Properly Configured (Positive Finding)

- **Severity:** INFO
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/main.ts`, lines 26-34
- **Description:** The HTTP API CORS is properly configured with specific origins from environment variables, `credentials: true`, and limited methods/headers. This is correctly implemented.

### NET-02: Helmet Security Headers Applied (Positive Finding)

- **Severity:** INFO
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/main.ts`, line 24
- **Description:** Helmet middleware is applied, which sets security headers (X-Content-Type-Options, X-Frame-Options, etc.). This is a good practice.

### NET-03: Refresh Token Cookie Missing Secure Flag in Development

- **Severity:** LOW
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.controller.ts`, lines 153-161
- **Description:** The `secure` flag on the refresh token cookie is only set when `NODE_ENV === 'production'`. If `NODE_ENV` is not explicitly set to `production` in the deployment environment, the cookie will be sent over HTTP.
- **Code:**
  ```typescript
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    ...
  });
  ```
- **Impact:** Refresh token could be intercepted via MITM if `NODE_ENV` is misconfigured.
- **Recommended Fix:** Default `secure` to `true` and only set it to `false` when explicitly in development. Add a startup check that `NODE_ENV` is set in production.

---

## Cryptographic Issues

### CRYPTO-01: Refresh Token Hashing Uses SHA-256 Without Salt

- **Severity:** LOW
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, lines 390-393
- **Description:** Refresh tokens are hashed with SHA-256 without a salt before storage. While refresh tokens are UUIDs (128 bits of entropy) making rainbow table attacks impractical, salting is a defense-in-depth best practice.
- **Code:**
  ```typescript
  private hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  ```
- **Impact:** Low risk given UUID entropy, but not following best practices.
- **Recommended Fix:** Use HMAC-SHA256 with a server-side key instead of plain SHA-256, or use bcrypt for token hashing.

### CRYPTO-02: Encryption Key Defined But Never Used

- **Severity:** MEDIUM
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/.env.example`, line 52
- **Description:** The `ENCRYPTION_KEY` environment variable is defined but never referenced in the codebase. The `AIMessage.contentEncrypted` schema field exists but is never set to `true`. Sensitive psychological data is stored in plaintext.
- **Impact:** No encryption at the application level for highly sensitive data.
- **Recommended Fix:** Implement an encryption service using AES-256-GCM with the `ENCRYPTION_KEY`. Encrypt AI message content and crisis alert data before storage.

### CRYPTO-03: bcrypt Rounds Configuration is Adequate (Positive Finding)

- **Severity:** INFO
- **File:** `/Users/dmitry/dream-team/projects/soulmate-20260303-140621/backend/src/modules/auth/auth.service.ts`, line 25
- **Description:** bcrypt is used with 12 rounds for password hashing, which is a reasonable value providing good security-performance tradeoff.

---

## OWASP Top 10 Assessment

### A01:2021 -- Broken Access Control

| Finding | Severity | Status |
|---------|----------|--------|
| WebSocket conversation room join without ownership check (AUTH-09) | MEDIUM | VULNERABLE |
| OAuth stubs grant tokens without verification (CRIT-04) | CRITICAL | VULNERABLE |
| Self-role selection during registration (AUTH-10) | MEDIUM | VULNERABLE |
| Specialist-only endpoints protected by @Roles (positive) | -- | OK |
| User data scoped to current user via JWT (positive) | -- | OK |

### A02:2021 -- Cryptographic Failures

| Finding | Severity | Status |
|---------|----------|--------|
| AI message encryption planned but not implemented (CRYPTO-02) | MEDIUM | VULNERABLE |
| JWT secret may fall back to placeholder (CRIT-02) | CRITICAL | VULNERABLE |
| OTP generated with Math.random() (AUTH-01) | HIGH | VULNERABLE |
| Password hashing with bcrypt 12 rounds (positive) | -- | OK |
| Refresh tokens hashed before storage (positive) | -- | OK |

### A03:2021 -- Injection

| Finding | Severity | Status |
|---------|----------|--------|
| Prisma ORM prevents SQL injection in standard queries (positive) | -- | OK |
| $executeRawUnsafe used with parameterized query (INJ-01) | MEDIUM | REVIEW |
| No dangerouslySetInnerHTML usage in frontend (positive) | -- | OK |
| React auto-escaping prevents XSS (positive) | -- | OK |
| No raw string concatenation in SQL (positive) | -- | OK |

### A04:2021 -- Insecure Design

| Finding | Severity | Status |
|---------|----------|--------|
| 4-digit OTP with limited rate limiting (AUTH-02) | HIGH | VULNERABLE |
| No CAPTCHA on registration endpoints | MEDIUM | VULNERABLE |
| No conversation message count limits per user | LOW | REVIEW |

### A05:2021 -- Security Misconfiguration

| Finding | Severity | Status |
|---------|----------|--------|
| .env.example used as config fallback (CRIT-02) | CRITICAL | VULNERABLE |
| WebSocket CORS wildcard (CRIT-03) | CRITICAL | VULNERABLE |
| Swagger exposed without auth (DATA-02) | MEDIUM | VULNERABLE |
| Redis without password (DATA-05) | HIGH | VULNERABLE |
| PostgreSQL port exposed (DATA-06) | MEDIUM | VULNERABLE |
| ThrottlerModule configured but not applied (AUTH-06) | HIGH | VULNERABLE |
| Prisma query logging in production (DATA-03) | MEDIUM | VULNERABLE |

### A06:2021 -- Vulnerable and Outdated Components

| Finding | Severity | Status |
|---------|----------|--------|
| Dependencies appear reasonably up-to-date | -- | OK |
| No known critical CVEs in declared versions | -- | REVIEW |
| Recommend running `npm audit` regularly | LOW | RECOMMENDATION |

### A07:2021 -- Identification and Authentication Failures

| Finding | Severity | Status |
|---------|----------|--------|
| No rate limiting applied to any endpoint (AUTH-06) | HIGH | VULNERABLE |
| No brute-force protection on email login (AUTH-05) | HIGH | VULNERABLE |
| Missing rate limit on loginPhone OTP sends (AUTH-03) | HIGH | VULNERABLE |
| Phone/email enumeration possible (AUTH-04) | MEDIUM | VULNERABLE |
| OAuth stubs bypass authentication (CRIT-04) | CRITICAL | VULNERABLE |
| Refresh token rotation implemented (positive) | -- | OK |
| Token revocation on logout (positive) | -- | OK |
| Banned/inactive user check in JWT strategy (positive) | -- | OK |

### A08:2021 -- Software and Data Integrity Failures

| Finding | Severity | Status |
|---------|----------|--------|
| No webhook signature verification for payment callbacks | HIGH | REVIEW |
| No integrity checks on AI extraction pipeline output | LOW | REVIEW |

### A09:2021 -- Security Logging and Monitoring Failures

| Finding | Severity | Status |
|---------|----------|--------|
| Secrets logged to console (CRIT-05) | CRITICAL | VULNERABLE |
| No structured security event logging | MEDIUM | VULNERABLE |
| No failed login attempt tracking | MEDIUM | VULNERABLE |
| Basic request logging via LoggingInterceptor (positive) | -- | OK |

### A10:2021 -- Server-Side Request Forgery (SSRF)

| Finding | Severity | Status |
|---------|----------|--------|
| No user-controlled URLs passed to server-side fetches | -- | OK |
| External API calls (Anthropic, OpenAI) use SDK clients | -- | OK |
| `OAuthVkDto.redirectUri` is accepted from user input | LOW | REVIEW |

---

## Recommendations

### Immediate (P0 -- Do before any production deployment)

1. **Fix JWT secret fallback** (CRIT-02): Remove `.env.example` from `envFilePath`. Add startup validation for `JWT_SECRET` entropy.
2. **Disable OAuth stubs** (CRIT-04): Block `/auth/oauth/google` and `/auth/oauth/vk` endpoints until real implementations are ready.
3. **Fix WebSocket CORS** (CRIT-03): Replace `origin: '*'` with allowed origins from config.
4. **Fix WebSocket JWT verification** (AUTH-07): Use the same `JwtModule` configuration (with secret) for the AI module.
5. **Remove secret logging** (CRIT-05): Delete all `logger.log` calls that output OTP codes, verification tokens, or other secrets.
6. **Activate rate limiting** (AUTH-06): Add `ThrottlerGuard` as a global APP_GUARD. Apply stricter limits to auth endpoints.
7. **Secure Redis** (DATA-05): Add a password. Bind to localhost only.
8. **Secure PostgreSQL** (DATA-06): Use strong passwords. Remove host port mapping.
9. **Add conversation ownership check** (AUTH-09): Verify user owns the conversation before joining WebSocket rooms.

### Short-term (P1 -- Within first sprint)

10. **Use cryptographic OTP generation** (AUTH-01): Replace `Math.random()` with `crypto.randomInt()`.
11. **Increase OTP to 6 digits** (AUTH-02): Update DTO validation and generation logic.
12. **Add rate limiting to loginPhone** (AUTH-03): Apply OTP rate limiting consistently.
13. **Prevent user enumeration** (AUTH-04): Standardize error messages for phone/email lookups.
14. **Add brute-force protection on email login** (AUTH-05): Track failed attempts, implement progressive delays.
15. **Disable Swagger in production** (DATA-02): Conditionally mount based on `NODE_ENV`.
16. **Disable Prisma query logging in production** (DATA-03): Configure log levels based on environment.
17. **Validate file uploads** (INJ-04): Add size limits, MIME type checks, extension validation.
18. **Add message length limits** (INJ-03): Cap WebSocket and REST message content at a reasonable maximum.

### Medium-term (P2 -- Within first month)

19. **Implement message encryption** (CRYPTO-02, DATA-07): Use AES-256-GCM for AI conversation content.
20. **Replace $executeRawUnsafe** (INJ-01): Use tagged template literals with `$executeRaw`.
21. **Add deep validation for corrections DTO** (INJ-02): Define strict schemas.
22. **Implement CSRF protection** for any state-changing requests if cookie-based auth expands.
23. **Add security event logging**: Log authentication events, access control failures, rate limit hits to a dedicated security log.
24. **Remove WebSocket query string token fallback** (AUTH-08): Only accept tokens via Socket.IO auth object.
25. **Implement webhook signature verification** for payment callbacks (YooKassa).
26. **Add Content Security Policy (CSP) headers** via Helmet configuration.
27. **Run `npm audit`** and address any known vulnerabilities in dependencies.
28. **Set up automated dependency scanning** (Dependabot, Snyk).

### Long-term (P3 -- Architecture improvements)

29. **Adopt secrets management** (HashiCorp Vault, AWS Secrets Manager) instead of `.env` files.
30. **Implement BFF pattern** to remove JWT from client-side JavaScript entirely.
31. **Add field-level encryption** for all PII and psychological data columns.
32. **Implement audit logging** for data access (who accessed which user's psychological profile and when).
33. **Add two-factor authentication** support (TOTP field exists in schema but is not implemented).
34. **Conduct penetration testing** before production launch.
35. **Implement data retention policies** with automated purging of conversation data.
36. **Add IP allowlisting** for admin endpoints once admin functionality is built.

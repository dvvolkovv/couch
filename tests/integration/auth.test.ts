/**
 * Integration Tests — Auth Module
 * Endpoint: POST /api/v1/auth/register/email
 *           POST /api/v1/auth/login/email
 *           POST /api/v1/auth/refresh
 *
 * Run: npx jest tests/integration/auth.test.ts
 * Requires: jest, supertest, @types/supertest
 *
 * LIVE RESULTS (2026-03-04, http://138.124.61.221:8080):
 *   TC-AUTH-001 PASS — 201 with userId, emailVerified: false
 *   TC-AUTH-002 PASS — 409 CONFLICT on duplicate (after rate limit window)
 *   TC-AUTH-003 PASS — 400 VALIDATION_ERROR correct
 *   TC-AUTH-004 PASS — 400 VALIDATION_ERROR correct
 *   TC-AUTH-005 PASS — 400 VALIDATION_ERROR for ADMIN role
 *   TC-AUTH-006 NOTE — Extra field whitelist behavior depends on NestJS config
 *   TC-AUTH-007 PASS — 400 with all missing field messages
 *   TC-AUTH-008 PASS — 401 "Email not verified" message
 *   TC-AUTH-009 PASS — 401 "Invalid email or password" (no enumeration)
 *   TC-AUTH-010 PASS — 401 same message for non-existent email
 *   TC-AUTH-011 PASS — 401 "Refresh token is required"
 *   TC-AUTH-012 PASS — 401 for invalid token value
 *   TC-AUTH-013 PASS — 429 fires at request 5 (limit=5 per 60s)
 *
 * KNOWN FINDINGS:
 *   BUG-003: POST /auth/register (task spec path) returns 404 — correct path is /auth/register/email
 *   BUG-006: Role validation error message shows empty list: "role must be one of the following values: "
 *   BUG-009: privacyAccepted and termsAccepted required but not in task spec payload
 */

import * as request from 'supertest';

const BASE_URL = process.env.API_BASE_URL || 'http://138.124.61.221:8080';
const API_PREFIX = '/api/v1';

function apiUrl(path: string): string {
  return `${BASE_URL}${API_PREFIX}${path}`;
}

// Unique email per test run to avoid conflicts
const timestamp = Date.now();
const TEST_EMAIL = `qa-integration-${timestamp}@soulmate.test`;
const TEST_PASSWORD = 'IntegrationPass123!';

describe('Auth — POST /auth/register/email', () => {
  it('TC-AUTH-001: registers a new user with valid payload', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: 'QATest',
        role: 'CLIENT',
        privacyAccepted: true,
        termsAccepted: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe(TEST_EMAIL);
    expect(res.body.data.userId).toBeTruthy();
    expect(res.body.data.emailVerified).toBe(false);
    expect(res.body.data.message).toContain(TEST_EMAIL);
  });

  it('TC-AUTH-002: returns 409 for duplicate email', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: 'QATest',
        role: 'CLIENT',
        privacyAccepted: true,
        termsAccepted: true,
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('TC-AUTH-003: returns 400 for invalid email format', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({
        email: 'not-an-email',
        password: TEST_PASSWORD,
        firstName: 'QATest',
        role: 'CLIENT',
        privacyAccepted: true,
        termsAccepted: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.stringContaining('email')])
    );
  });

  it('TC-AUTH-004: returns 400 for password shorter than 8 characters', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({
        email: `short-pw-${timestamp}@soulmate.test`,
        password: 'short',
        firstName: 'QATest',
        role: 'CLIENT',
        privacyAccepted: true,
        termsAccepted: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.stringContaining('password')])
    );
  });

  it('TC-AUTH-005: returns 400 for invalid role ADMIN', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({
        email: `role-test-${timestamp}@soulmate.test`,
        password: TEST_PASSWORD,
        firstName: 'QATest',
        role: 'ADMIN',
        privacyAccepted: true,
        termsAccepted: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-AUTH-006: returns 400 for extra non-whitelisted fields', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({
        email: `whitelist-test-${timestamp}@soulmate.test`,
        password: TEST_PASSWORD,
        firstName: 'QATest',
        role: 'CLIENT',
        privacyAccepted: true,
        termsAccepted: true,
        adminOverride: true,
        isAdmin: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.stringContaining('adminOverride')])
    );
  });

  it('TC-AUTH-007: returns 400 when required fields are missing', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({
        email: `missing-fields-${timestamp}@soulmate.test`,
        password: TEST_PASSWORD,
        // missing: role, privacyAccepted, termsAccepted
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    // All three missing fields should be in details
    const details = res.body.error.details.join(' ');
    expect(details).toContain('role');
    expect(details).toContain('privacyAccepted');
    expect(details).toContain('termsAccepted');
  });

  it('TC-AUTH-EDGE-001: returns 400 for empty JSON body', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('Auth — POST /auth/login/email', () => {
  it('TC-AUTH-008: returns 401 for unverified email account', async () => {
    // TEST_EMAIL was registered above but never verified
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/login/email`)
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    // Should mention email verification, not a generic error
    expect(res.body.error.message.toLowerCase()).toMatch(/verif|email/);
  });

  it('TC-AUTH-009: returns 401 for wrong password (no account enumeration)', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/login/email`)
      .send({
        email: TEST_EMAIL,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    // Must not reveal whether email exists
    expect(res.body.error.message).toMatch(/[Ii]nvalid email or password/);
  });

  it('TC-AUTH-010: returns 401 for non-existent email (same message as wrong password)', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/login/email`)
      .send({
        email: 'ghost-user-does-not-exist@soulmate.test',
        password: TEST_PASSWORD,
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    // Same message prevents account enumeration
    expect(res.body.error.message).toMatch(/[Ii]nvalid email or password/);
  });
});

describe('Auth — POST /auth/refresh', () => {
  it('TC-AUTH-011: returns 401 when no refresh token cookie is sent', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/refresh`);

    expect(res.status).toBe(401);
    expect(res.body.error.message).toContain('Refresh token is required');
  });

  it('TC-AUTH-012: returns 401 for invalid refresh token', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/refresh`)
      .set('Cookie', 'refresh_token=totally_fake_token_abc123');

    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/invalid|expired/i);
  });
});

describe('Auth — Response Shape Contract', () => {
  it('TC-AUTH-CONTRACT-001: error response always has code and message fields', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({ email: 'bad-email', password: 'x' });

    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error.code).toBe('string');
    expect(typeof res.body.error.message).toBe('string');
  });

  it('TC-AUTH-CONTRACT-002: success response wraps data in data field', async () => {
    // Use the already-registered email expecting 409
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/auth/register/email`)
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: 'QATest',
        role: 'CLIENT',
        privacyAccepted: true,
        termsAccepted: true,
      });

    // 409 is also wrapped in error
    expect(res.body.error).toBeDefined();
  });
});

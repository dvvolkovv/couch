/**
 * Integration Tests — Security & Authorization
 * Tests: CORS, JWT guards, security headers, rate limiting, auth endpoints
 *
 * Run: npx jest tests/integration/security.test.ts
 *
 * LIVE RESULTS (2026-03-04, http://138.124.61.221:8080):
 *   TC-SEC: All protected endpoints correctly return 401 without token
 *   TC-GUARD: JWT guard fires on all /ai, /matching, /users, /specialists/me, /bookings routes
 *   TC-RATE-001: Rate limit headers present on catalog responses
 *   TC-SWAGGER: /docs and /api/v1/docs return 404 (not exposed — good)
 *   TC-ERR-003: 404 for unknown routes has correct error shape
 *
 * KNOWN FINDINGS:
 *   BUG-011: nginx exposes version in Server header: nginx/1.24.0 (Ubuntu)
 *   TC-METHOD tests: wrong HTTP method returns 404 instead of 405 (NestJS default behavior)
 *   CORS: actual allowed origins not verified in live run (needs browser-like preflight)
 */

import * as request from 'supertest';

const BASE_URL = process.env.API_BASE_URL || 'http://138.124.61.221:8080';
const API_PREFIX = '/api/v1';

describe('Security Headers', () => {
  it('TC-SEC-001: Content-Security-Policy header is present', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('TC-SEC-002: X-Content-Type-Options is nosniff', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('TC-SEC-003: X-Frame-Options is SAMEORIGIN', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('TC-SEC-004: Strict-Transport-Security header is present', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['strict-transport-security']).toContain('max-age=');
  });

  it('TC-SEC-005: Referrer-Policy is no-referrer', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it('TC-SEC-006: X-Powered-By is not exposed on API responses', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('TC-SEC-007: X-Permitted-Cross-Domain-Policies is none', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['x-permitted-cross-domain-policies']).toBe('none');
  });
});

describe('CORS Policy', () => {
  it('TC-CORS-001: allowed origin (localhost:3001) receives Access-Control-Allow-Origin', async () => {
    const res = await request(BASE_URL)
      .options(`${API_PREFIX}/catalog/specialists`)
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
  });

  it('TC-CORS-002: disallowed external origin does NOT receive Access-Control-Allow-Origin', async () => {
    const res = await request(BASE_URL)
      .options(`${API_PREFIX}/catalog/specialists`)
      .set('Origin', 'https://attacker.evil.com')
      .set('Access-Control-Request-Method', 'GET');

    // Must not echo back the attacker's origin
    expect(res.headers['access-control-allow-origin']).not.toBe('https://attacker.evil.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('TC-CORS-003: preflight returns correct allowed methods', async () => {
    const res = await request(BASE_URL)
      .options(`${API_PREFIX}/catalog/specialists`)
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.headers['access-control-allow-methods']).toContain('GET');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
    expect(res.headers['access-control-allow-methods']).toContain('OPTIONS');
  });

  it('TC-CORS-004: preflight returns allowed headers including Authorization', async () => {
    const res = await request(BASE_URL)
      .options(`${API_PREFIX}/catalog/specialists`)
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Headers', 'Authorization,Content-Type');

    expect(res.headers['access-control-allow-headers']).toContain('Authorization');
    expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
  });

  it('TC-CORS-005: credentials allowed for same-origin requests', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});

describe('JWT Authorization Guards', () => {
  const protectedEndpoints = [
    { method: 'get', path: '/users/me' },
    { method: 'get', path: '/specialists/me' },
    { method: 'post', path: '/specialists/apply' },
    { method: 'get', path: '/ai/consultations' },
    { method: 'post', path: '/ai/consultations' },
    { method: 'post', path: '/matching/recommendations' },
    { method: 'get', path: '/matching/score/test-id' },
    { method: 'get', path: '/bookings' },
    { method: 'post', path: '/bookings' },
    { method: 'get', path: '/bookings/slots/test-id' },
    { method: 'get', path: '/schedule/me' },
  ];

  for (const { method, path } of protectedEndpoints) {
    it(`TC-GUARD: ${method.toUpperCase()} ${path} returns 401 without token`, async () => {
      const req = (request(BASE_URL) as any)[method](`${API_PREFIX}${path}`);
      const res = await req;

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  }

  it('TC-GUARD-JWT: invalid JWT token returns 401', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/users/me`)
      .set('Authorization', 'Bearer invalid.jwt.token.here');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-GUARD-JWT: malformed Authorization header returns 401', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/users/me`)
      .set('Authorization', 'NotBearer some_token');

    expect(res.status).toBe(401);
  });

  it('TC-GUARD-JWT: empty Authorization header returns 401', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/users/me`)
      .set('Authorization', '');

    expect(res.status).toBe(401);
  });
});

describe('Rate Limiting', () => {
  it('TC-RATE-001: rate limit headers present on catalog endpoint', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.headers['x-ratelimit-limit']).toBeDefined();
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    expect(res.headers['x-ratelimit-reset']).toBeDefined();
    expect(Number(res.headers['x-ratelimit-limit'])).toBeGreaterThan(0);
  });

  it('TC-RATE-002: rate limit remaining decreases on subsequent requests', async () => {
    const res1 = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);
    const res2 = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    const remaining1 = Number(res1.headers['x-ratelimit-remaining']);
    const remaining2 = Number(res2.headers['x-ratelimit-remaining']);

    // remaining should decrease or stay same (if reset occurred)
    expect(remaining2).toBeLessThanOrEqual(remaining1);
  });
});

describe('Error Response Contract', () => {
  it('TC-ERR-001: all error responses have error.code and error.message', async () => {
    const endpoints = [
      { method: 'get', path: '/users/me' },              // 401
      { method: 'get', path: '/specialists/non-existent' }, // 404
      { method: 'get', path: '/catalog/specialists?limit=-1' }, // 400
    ];

    for (const { method, path } of endpoints) {
      const res = await (request(BASE_URL) as any)[method](`${API_PREFIX}${path}`);
      expect(res.body.error).toBeDefined();
      expect(typeof res.body.error.code).toBe('string');
      expect(typeof res.body.error.message).toBe('string');
    }
  });

  it('TC-ERR-002: Prisma internals do NOT leak in 500 error for invalid type filter [BUG-001]', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ type: 'INVALID' });

    // Should not expose Prisma invocation details
    if (res.status === 500) {
      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toContain('prisma.');
      expect(bodyStr).not.toContain('invocation');
      expect(bodyStr).not.toContain('SpecialistType');
    }
  });

  it('TC-ERR-003: 404 for unknown routes has correct error shape', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/does-not-exist-route`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('Swagger Docs Exposure', () => {
  it('TC-SWAGGER-001: /docs is not accessible (should be disabled in production)', async () => {
    const res = await request(BASE_URL).get('/docs');
    expect(res.status).toBe(404);
  });

  it('TC-SWAGGER-002: /api/v1/docs is not accessible', async () => {
    const res = await request(BASE_URL).get(`${API_PREFIX}/docs`);
    expect(res.status).toBe(404);
  });
});

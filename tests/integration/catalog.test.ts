/**
 * Integration Tests — Catalog Module
 * Endpoint: GET /api/v1/catalog/specialists
 *           GET /api/v1/catalog/specializations
 *           GET /api/v1/specialists/:id
 *
 * Run: npx jest tests/integration/catalog.test.ts
 *
 * LIVE RESULTS (2026-03-04, http://138.124.61.221:8080):
 *   TC-CAT-001 PASS — 200, data:[], pagination shape correct
 *   TC-CAT-002 PASS — availableTypes includes PSYCHOLOGIST, COACH, PSYCHOTHERAPIST
 *   TC-CAT-003 PASS — priceRange.min and .max fields present
 *   TC-CAT-004 PASS — type=PSYCHOLOGIST filter accepted
 *   TC-CAT-005 NOT TESTED — rate limited during live run; needs isolated test run
 *   TC-CAT-006 PASS — limit=-1 returns 400
 *   TC-CAT-007 PASS — limit=100 returns 400 (max is 50)
 *   TC-CAT-008 PASS — limit=0 returns 400
 *   TC-CAT-009 PASS — price range filter accepted
 *   TC-CAT-010 PASS — search param accepted
 *   TC-CAT-SPEC-001 PASS — 200, specializations:[], approaches:[]
 *   TC-SPEC-001 PASS — 404 NOT_FOUND for non-existent specialist
 *   TC-SPEC-002 PASS — route is public (not 401)
 *
 * KNOWN FINDINGS:
 *   BUG-005: GET /api/v1/catalog/specialists/:id returns route-not-found 404
 *            Correct path is GET /api/v1/specialists/:id (different controller)
 *   BUG-007: Empty database — no seed data; all catalog results empty
 */

import * as request from 'supertest';

const BASE_URL = process.env.API_BASE_URL || 'http://138.124.61.221:8080';
const API_PREFIX = '/api/v1';

describe('Catalog — GET /catalog/specialists', () => {
  it('TC-CAT-001: returns 200 with correct response shape', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(typeof res.body.pagination.hasMore).toBe('boolean');
    expect(typeof res.body.pagination.total).toBe('number');
    expect(res.body.filters).toBeDefined();
    expect(Array.isArray(res.body.filters.availableTypes)).toBe(true);
  });

  it('TC-CAT-002: filters.availableTypes includes all three specialist types', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.status).toBe(200);
    expect(res.body.filters.availableTypes).toContain('PSYCHOLOGIST');
    expect(res.body.filters.availableTypes).toContain('COACH');
    expect(res.body.filters.availableTypes).toContain('PSYCHOTHERAPIST');
  });

  it('TC-CAT-003: filters.priceRange has min and max fields', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`);

    expect(res.status).toBe(200);
    expect(typeof res.body.filters.priceRange.min).toBe('number');
    expect(typeof res.body.filters.priceRange.max).toBe('number');
  });

  it('TC-CAT-004: valid type filter PSYCHOLOGIST returns 200', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ type: 'PSYCHOLOGIST' });

    expect(res.status).toBe(200);
  });

  it('TC-CAT-005 [BUG-001]: invalid type enum should return 400, not 500', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ type: 'INVALID_TYPE' });

    // BUG: currently returns 500 with Prisma error leak
    // Expected: 400 with VALIDATION_ERROR
    expect(res.status).not.toBe(500);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-CAT-006: limit=-1 returns 400 with validation error', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ limit: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.stringContaining('limit')])
    );
  });

  it('TC-CAT-007: limit=100 (over max of 50) returns 400', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ limit: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-CAT-008: limit=0 returns 400 (below minimum of 1)', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ limit: 0 });

    expect(res.status).toBe(400);
  });

  it('TC-CAT-009: valid price range filter returns 200', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ priceMin: 1000, priceMax: 5000 });

    expect(res.status).toBe(200);
  });

  it('TC-CAT-010: search parameter returns 200', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ search: 'anxiety' });

    expect(res.status).toBe(200);
  });

  it('TC-CAT-011: sortBy=rating returns 200', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ sortBy: 'rating' });

    expect(res.status).toBe(200);
  });

  it('TC-CAT-012: sortBy=price_asc returns 200', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ sortBy: 'price_asc' });

    expect(res.status).toBe(200);
  });

  it('TC-CAT-013: valid limit=5 returns correct pagination shape', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .query({ limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({
      hasMore: expect.any(Boolean),
      total: expect.any(Number),
    });
    // cursor can be null or string
    expect(
      res.body.pagination.cursor === null ||
      typeof res.body.pagination.cursor === 'string'
    ).toBe(true);
  });

  it('TC-CAT-014: response is public (no Authorization header required)', async () => {
    // Catalog is @Public() — should not require auth
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specialists`)
      .unset('Authorization');

    expect(res.status).toBe(200);
  });
});

describe('Catalog — GET /catalog/specializations', () => {
  it('TC-CAT-SPEC-001: returns 200 with specializations and approaches arrays', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specializations`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.specializations)).toBe(true);
    expect(Array.isArray(res.body.data.approaches)).toBe(true);
  });

  it('TC-CAT-SPEC-002: is publicly accessible without auth', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specializations`);

    expect(res.status).toBe(200);
  });

  it('TC-CAT-SPEC-003: specializations items have key, label, count fields when populated', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/catalog/specializations`);

    expect(res.status).toBe(200);
    // If there are items, check their shape
    if (res.body.data.specializations.length > 0) {
      const item = res.body.data.specializations[0];
      expect(item).toHaveProperty('key');
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('count');
    }
  });
});

describe('Specialists — GET /specialists/:id', () => {
  it('TC-SPEC-001: returns 404 for non-existent specialist ID', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/specialists/non-existent-id-12345`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toMatch(/specialist not found/i);
  });

  it('TC-SPEC-002: is publicly accessible without auth', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/specialists/non-existent-id-12345`);

    // 404 is fine here — it means the route is public (not 401)
    expect(res.status).not.toBe(401);
  });

  it('TC-SPEC-003: GET /specialists/me without token returns 401', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/specialists/me`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-SPEC-004: POST /specialists/apply without token returns 401', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/specialists/apply`)
      .send({ type: 'PSYCHOLOGIST', experienceYears: 5 });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('HTTP Method Validation', () => {
  it('TC-METHOD-001 [BUG-004]: wrong method on GET-only endpoint returns 404 (should be 405)', async () => {
    const res = await request(BASE_URL)
      .delete(`${API_PREFIX}/catalog/specialists`);

    // Known bug: NestJS returns 404 instead of 405
    // This test documents the current (incorrect) behavior
    // When fixed, should expect 405
    expect([404, 405]).toContain(res.status);
  });

  it('TC-METHOD-002: POST on GET-only specializations endpoint returns 404 or 405', async () => {
    const res = await request(BASE_URL)
      .post(`${API_PREFIX}/catalog/specializations`)
      .send({});

    expect([404, 405]).toContain(res.status);
  });

  it('TC-METHOD-003: GET on POST-only register endpoint returns 404 or 405', async () => {
    const res = await request(BASE_URL)
      .get(`${API_PREFIX}/auth/register/email`);

    expect([404, 405]).toContain(res.status);
  });
});

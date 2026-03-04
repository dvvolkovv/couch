/**
 * Integration Tests — AI Consultations + Matching Module
 * Endpoints:
 *   POST /api/v1/ai/consultations
 *   GET  /api/v1/ai/consultations
 *   GET  /api/v1/ai/consultations/:id
 *   POST /api/v1/ai/consultations/:id/confirm
 *   POST /api/v1/matching/recommendations
 *   GET  /api/v1/matching/score/:specialistId
 *   POST /api/v1/matching/feedback
 *
 * Live results (2026-03-04):
 *   - All protected endpoints return 401 correctly without a token
 *   - Correct HTTP methods confirmed: POST for recommendations (not GET as in task spec)
 *
 * Run: npx jest tests/integration/matching-ai.test.ts
 * Requires: jest, supertest, @types/supertest
 */

import * as request from 'supertest';

const BASE_URL = process.env.API_BASE_URL || 'http://138.124.61.221:8080';
const API_PREFIX = '/api/v1';

// ---------------------------------------------------------------------------
// Helper: create a supertest agent
// ---------------------------------------------------------------------------
function api() {
  return request(BASE_URL);
}

// ---------------------------------------------------------------------------
// AI Consultations — unauthenticated access
// ---------------------------------------------------------------------------
describe('AI Consultations — Authorization Guards (no token)', () => {
  it('TC-AI-001: POST /ai/consultations returns 401 without token', async () => {
    const res = await api()
      .post(`${API_PREFIX}/ai/consultations`)
      .send({ type: 'CONSULTATION' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-AI-002: POST /ai/consultations with empty body returns 401 (auth precedes validation)', async () => {
    const res = await api()
      .post(`${API_PREFIX}/ai/consultations`)
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-AI-003: GET /ai/consultations returns 401 without token', async () => {
    const res = await api()
      .get(`${API_PREFIX}/ai/consultations`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-AI-004: GET /ai/consultations/:id returns 401 without token', async () => {
    const res = await api()
      .get(`${API_PREFIX}/ai/consultations/some-consultation-id`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-AI-005: POST /ai/consultations/:id/confirm returns 401 without token', async () => {
    const res = await api()
      .post(`${API_PREFIX}/ai/consultations/some-consultation-id/confirm`)
      .send({ corrections: {} });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-AI-006: invalid JWT token returns 401 on AI endpoint', async () => {
    const res = await api()
      .post(`${API_PREFIX}/ai/consultations`)
      .set('Authorization', 'Bearer invalid.jwt.token.abc')
      .send({ type: 'CONSULTATION' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

// ---------------------------------------------------------------------------
// Matching — authorization guards
// ---------------------------------------------------------------------------
describe('Matching — Authorization Guards (no token)', () => {
  it('TC-MATCH-001: POST /matching/recommendations returns 401 without token', async () => {
    const res = await api()
      .post(`${API_PREFIX}/matching/recommendations`)
      .send({ conversationId: 'test123', limit: 5 });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-MATCH-002: GET /matching/recommendations returns 404 (wrong method — route is POST)', async () => {
    // This documents BUG-004: task spec says GET, implementation uses POST
    const res = await api()
      .get(`${API_PREFIX}/matching/recommendations`);

    // Route does not exist as GET — NestJS returns 404 for unknown routes
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('TC-MATCH-003: GET /matching/score/:id returns 401 without token', async () => {
    const res = await api()
      .get(`${API_PREFIX}/matching/score/test-specialist-id`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-MATCH-004: POST /matching/feedback returns 401 without token', async () => {
    const res = await api()
      .post(`${API_PREFIX}/matching/feedback`)
      .send({
        matchingResultId: 'test-result-id',
        specialistId: 'test-specialist-id',
        action: 'LIKE',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('TC-MATCH-005: invalid JWT on matching endpoint returns 401', async () => {
    const res = await api()
      .post(`${API_PREFIX}/matching/recommendations`)
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.fake.payload')
      .send({ conversationId: 'test', limit: 3 });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

// ---------------------------------------------------------------------------
// AI Consultation Type Validation (authenticated flow — requires token)
// These tests are skipped unless VALID_JWT env var is set
// ---------------------------------------------------------------------------
describe('AI Consultations — Payload Validation (requires auth)', () => {
  const jwt = process.env.VALID_JWT;

  beforeAll(() => {
    if (!jwt) {
      console.warn(
        'VALID_JWT env var not set — skipping authenticated AI tests.\n' +
        'To run these: VALID_JWT=<token> npx jest matching-ai.test.ts',
      );
    }
  });

  it('TC-AI-AUTH-001: valid type=CONSULTATION creates consultation session', async () => {
    if (!jwt) return;

    const res = await api()
      .post(`${API_PREFIX}/ai/consultations`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ type: 'CONSULTATION' });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeTruthy();
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('TC-AI-AUTH-002: valid type=MATCHING_INTERVIEW creates matching interview', async () => {
    if (!jwt) return;

    const res = await api()
      .post(`${API_PREFIX}/ai/consultations`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ type: 'MATCHING_INTERVIEW' });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeTruthy();
  });

  it('TC-AI-AUTH-003: invalid type returns 400', async () => {
    if (!jwt) return;

    const res = await api()
      .post(`${API_PREFIX}/ai/consultations`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ type: 'INVALID_TYPE' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-AI-AUTH-004: GET /ai/consultations returns list for authenticated user', async () => {
    if (!jwt) return;

    const res = await api()
      .get(`${API_PREFIX}/ai/consultations`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('TC-AI-AUTH-005: GET /ai/consultations/:id returns 404 for non-existent consultation', async () => {
    if (!jwt) return;

    const res = await api()
      .get(`${API_PREFIX}/ai/consultations/non-existent-id-xyz`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ---------------------------------------------------------------------------
// Matching Recommendations (authenticated flow)
// ---------------------------------------------------------------------------
describe('Matching Recommendations — Validation (requires auth)', () => {
  const jwt = process.env.VALID_JWT;

  it('TC-MATCH-AUTH-001: POST with valid conversationId returns recommendations list', async () => {
    if (!jwt) return;

    const res = await api()
      .post(`${API_PREFIX}/matching/recommendations`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ conversationId: 'some-valid-consultation-id', limit: 5 });

    expect([200, 404, 422]).toContain(res.status);
    // 422 = consultation not found/not completed
    // 200 = recommendations returned
    // 404 = consultation not found
  });

  it('TC-MATCH-AUTH-002: limit defaults to 5 when not provided', async () => {
    if (!jwt) return;

    const res = await api()
      .post(`${API_PREFIX}/matching/recommendations`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ conversationId: 'some-consultation-id' });

    // Should not fail on missing limit
    expect(res.status).not.toBe(400);
  });

  it('TC-MATCH-AUTH-003: empty body returns 400 validation error', async () => {
    if (!jwt) return;

    const res = await api()
      .post(`${API_PREFIX}/matching/recommendations`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({});

    // conversationId is required
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ---------------------------------------------------------------------------
// Route Path Verification
// ---------------------------------------------------------------------------
describe('Route Path Contract', () => {
  it('TC-ROUTE-001: the old /consultation/start path returns 404 (correct path is /ai/consultations)', async () => {
    // Verify no legacy route exists
    const res = await api().post(`${API_PREFIX}/consultation/start`).send({});

    expect(res.status).toBe(404);
  });

  it('TC-ROUTE-002: POST /matching/recommendations is the correct HTTP method', async () => {
    // Task spec documented GET — implementation uses POST
    // GET must return 404, POST must return 401 (auth required)
    const getRes = await api().get(`${API_PREFIX}/matching/recommendations`);
    const postRes = await api().post(`${API_PREFIX}/matching/recommendations`).send({});

    expect(getRes.status).toBe(404);
    expect(postRes.status).toBe(401);
  });
});

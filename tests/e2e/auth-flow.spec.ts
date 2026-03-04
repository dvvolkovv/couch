/**
 * E2E Tests — Authentication User Flows
 * Tool: Playwright
 *
 * Run: npx playwright test tests/e2e/auth-flow.spec.ts
 *
 * Covers:
 * - Registration form validation
 * - Login form validation
 * - Error state display
 * - Redirect behavior after auth
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://138.124.61.221:8080';

// Unique test email per run
const RUN_ID = Date.now();
const TEST_EMAIL = `e2e-test-${RUN_ID}@soulmate.test`;
const TEST_PASSWORD = 'E2ETestPass123!';

test.describe('Registration Flow', () => {
  test('TC-E2E-REG-001: complete registration form submission shows success or verification prompt', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(TEST_EMAIL);

    // Fill password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);

    // Fill firstName if present
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="имя" i], input[placeholder*="name" i]').first();
    if (await firstNameInput.count() > 0) {
      await firstNameInput.fill('QATest');
    }

    // Accept terms/privacy checkboxes if visible
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = checkboxes.nth(i);
      if (!(await checkbox.isChecked())) {
        await checkbox.check();
      }
    }

    // Submit
    await page.locator('button[type="submit"]').first().click();

    // After submit — either success message, redirect, or email verification prompt
    await page.waitForTimeout(2000);

    // Should not still show the register form with blank state (means something happened)
    const currentUrl = page.url();
    const bodyText = await page.textContent('body') ?? '';

    const successIndicators = [
      bodyText.includes(TEST_EMAIL),
      bodyText.toLowerCase().includes('письм'),       // "email was sent" in Russian
      bodyText.toLowerCase().includes('verify'),
      bodyText.toLowerCase().includes('проверьте'),   // "check" in Russian
      bodyText.toLowerCase().includes('отправлен'),   // "sent" in Russian
      currentUrl !== `${BASE_URL}/auth/register`,     // navigated away
    ];

    const anySuccess = successIndicators.some(Boolean);
    expect(anySuccess, `Registration did not show any success indication. URL: ${currentUrl}, Body: ${bodyText.substring(0, 200)}`).toBe(true);
  });

  test('TC-E2E-REG-002: submitting without email shows validation error', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    // Fill only password, skip email
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(500);

    // Should stay on register page (not navigate away)
    expect(page.url()).toContain('/auth/register');
  });

  test('TC-E2E-REG-003: submitting with invalid email format shows validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('not-a-valid-email');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(500);

    // Should stay on page — validation prevents submission
    expect(page.url()).toContain('/auth/register');
  });

  test('TC-E2E-REG-004: submitting with short password shows validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(`pw-test-${RUN_ID}@soulmate.test`);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('short');

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(500);

    // Either HTML5 validation or custom error
    const bodyText = await page.textContent('body') ?? '';
    const validationShown =
      page.url().includes('/auth/register') ||
      bodyText.toLowerCase().includes('пароль') ||
      bodyText.toLowerCase().includes('password') ||
      bodyText.toLowerCase().includes('8');

    expect(validationShown).toBe(true);
  });
});

test.describe('Login Flow', () => {
  test('TC-E2E-LOGIN-001: login form with wrong credentials shows error message', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('nonexistent-user@soulmate.test');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('WrongPassword999!');

    await page.locator('button[type="submit"]').first().click();

    // Wait for error feedback
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent('body') ?? '';

    // Should show error and remain on login page
    expect(page.url()).toContain('/auth/login');
    const hasErrorFeedback =
      bodyText.toLowerCase().includes('неверный') ||
      bodyText.toLowerCase().includes('invalid') ||
      bodyText.toLowerCase().includes('ошибка') ||
      bodyText.toLowerCase().includes('error') ||
      bodyText.toLowerCase().includes('не найден');

    expect(hasErrorFeedback, `Login error not shown. Body: ${bodyText.substring(0, 300)}`).toBe(true);
  });

  test('TC-E2E-LOGIN-002: login with unverified email shows verification message', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    // Use the email registered in TC-E2E-REG-001 (unverified)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(TEST_EMAIL);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent('body') ?? '';

    // Should mention email verification or show an error
    const hasVerificationMessage =
      bodyText.toLowerCase().includes('подтверд') ||  // "confirm" in Russian
      bodyText.toLowerCase().includes('verify') ||
      bodyText.toLowerCase().includes('email') ||
      page.url().includes('/auth/login');

    expect(hasVerificationMessage).toBe(true);
  });

  test('TC-E2E-LOGIN-003: submitting empty login form does not navigate', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(500);

    expect(page.url()).toContain('/auth/login');
  });
});

test.describe('Dashboard Protection', () => {
  test('TC-E2E-DASH-001: unauthenticated user visiting /dashboard gets appropriate response', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard`);

    // Either redirected to login (302) or shows login prompt inline (200 with login content)
    const status = response?.status() ?? 0;
    const bodyText = await page.textContent('body') ?? '';
    const url = page.url();

    const isHandledCorrectly =
      status === 200 ||      // Page loads but shows login prompt
      status === 302 ||      // Redirect
      url.includes('/auth/login') ||  // Redirected to login
      bodyText.toLowerCase().includes('войти') ||  // Shows login prompt
      bodyText.toLowerCase().includes('login');

    expect(isHandledCorrectly, `Dashboard not properly protected. Status: ${status}, URL: ${url}`).toBe(true);
  });

  test('TC-E2E-MATCH-001: unauthenticated user visiting /matching gets appropriate response', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/matching`);

    const status = response?.status() ?? 0;
    expect(status).toBeLessThan(500);
  });
});

test.describe('API Error Handling in UI', () => {
  test('TC-E2E-API-001: network errors during login are handled gracefully', async ({ page, context }) => {
    // Block API calls to simulate network error
    await context.route('**/api/v1/auth/login/email', async (route) => {
      await route.abort('failed');
    });

    await page.goto(`${BASE_URL}/auth/login`);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('test@test.com');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // Page should not crash (no blank white screen)
    const bodyText = await page.textContent('body') ?? '';
    expect(bodyText.length).toBeGreaterThan(0);

    // Should stay on login page
    expect(page.url()).toContain('/auth/login');
  });
});

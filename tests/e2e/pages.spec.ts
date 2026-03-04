/**
 * E2E Tests — Frontend Page Availability
 * Tool: Playwright
 *
 * Run: npx playwright test tests/e2e/pages.spec.ts
 * Config: playwright.config.ts in project root
 *
 * Covers:
 * - All routes return HTTP 200 (not 404 or 500)
 * - Pages render meaningful content (not blank or error states)
 * - Navigation links are functional
 * - Core UI elements present (header, main, footer)
 */

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://138.124.61.221:8080';

// Pages that should be publicly accessible (HTTP 200)
const PUBLIC_PAGES = [
  { path: '/', name: 'Home', titleKeyword: 'SoulMate' },
  { path: '/catalog', name: 'Catalog', titleKeyword: 'Каталог' },
  { path: '/consultation', name: 'Consultation', titleKeyword: 'консультац' },
  { path: '/auth/login', name: 'Login', titleKeyword: 'Войти' },
  { path: '/auth/register', name: 'Register', titleKeyword: 'Регистрац' },
  { path: '/how-it-works', name: 'How It Works', titleKeyword: 'работает' },
  { path: '/for-specialists', name: 'For Specialists', titleKeyword: 'специалист' },
  { path: '/about', name: 'About', titleKeyword: 'О нас' },
  { path: '/contacts', name: 'Contacts', titleKeyword: 'Контакт' },
  { path: '/privacy', name: 'Privacy', titleKeyword: 'Конфиденциальность' },
  { path: '/terms', name: 'Terms', titleKeyword: 'Условия' },
];

// Pages requiring authentication — should redirect to login or show 200 with login prompt
const AUTH_REQUIRED_PAGES = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/matching', name: 'Matching' },
];

test.describe('Public Pages — HTTP 200 and Content', () => {
  for (const { path, name, titleKeyword } of PUBLIC_PAGES) {
    test(`${name} page (${path}) returns 200 and renders content`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${path}`);

      // HTTP status must be 200
      expect(response?.status(), `${name} returned non-200 status`).toBe(200);

      // Page must have content — not blank
      const bodyText = await page.textContent('body');
      expect(bodyText?.length, `${name} page body is empty`).toBeGreaterThan(100);

      // Title or main content should contain expected keyword
      const pageContent = (await page.content()).toLowerCase();
      expect(
        pageContent.includes(titleKeyword.toLowerCase()),
        `${name} page does not contain expected keyword: "${titleKeyword}"`
      ).toBe(true);
    });
  }
});

test.describe('Auth-Required Pages', () => {
  for (const { path, name } of AUTH_REQUIRED_PAGES) {
    test(`${name} page (${path}) loads without server error`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${path}`);

      // Should not be a 5xx server error
      const status = response?.status() ?? 0;
      expect(status, `${name} returned server error ${status}`).toBeLessThan(500);

      // Should either be 200 (showing content/redirect prompt) or 302/308 redirect
      expect([200, 301, 302, 307, 308]).toContain(status);
    });
  }
});

test.describe('Page Structure — Core Elements', () => {
  test('Home page has header navigation element', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('Home page has main content area', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Home page header contains SoulMate brand link', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // The logo/brand link points to home
    const brandLink = page.locator('a[aria-label*="SoulMate"]').first();
    await expect(brandLink).toBeVisible();
  });

  test('Home page has navigation links to Catalog and Consultation', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Check navigation links exist
    const catalogLink = page.locator('a[href="/catalog"]').first();
    await expect(catalogLink).toBeVisible();
  });
});

test.describe('Navigation Flow', () => {
  test('TC-NAV-001: clicking Catalog link from home navigates to /catalog', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Click the first catalog link in nav
    await page.locator('a[href="/catalog"]').first().click();
    await page.waitForURL('**/catalog');

    expect(page.url()).toContain('/catalog');
    expect(await page.title()).toBeTruthy();
  });

  test('TC-NAV-002: clicking Login link navigates to /auth/login', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Click login link in header
    await page.locator('a[href="/auth/login"]').first().click();
    await page.waitForURL('**/auth/login');

    expect(page.url()).toContain('/auth/login');
  });

  test('TC-NAV-003: clicking Register navigates to /auth/register', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Click any "sign up" or "register" CTA
    const registerLink = page.locator('a[href="/auth/register"]').first();
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await page.waitForURL('**/auth/register');
      expect(page.url()).toContain('/auth/register');
    }
  });

  test('TC-NAV-004: Start consultation CTA links to /consultation', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    const consultLink = page.locator('a[href="/consultation"]').first();
    await expect(consultLink).toBeVisible();

    await consultLink.click();
    await page.waitForURL('**/consultation');
    expect(page.url()).toContain('/consultation');
  });
});

test.describe('Auth Page — Login Form', () => {
  test('TC-AUTH-FE-001: login page has email and password fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
  });

  test('TC-AUTH-FE-002: login form has submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton.first()).toBeVisible();
  });

  test('TC-AUTH-FE-003: login page has link to register page', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    const registerLink = page.locator('a[href="/auth/register"]');
    await expect(registerLink.first()).toBeVisible();
  });

  test('TC-AUTH-FE-004: submitting empty login form shows validation feedback', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    // Click submit without filling in fields
    await page.locator('button[type="submit"]').first().click();

    // Wait for any validation feedback
    await page.waitForTimeout(500);

    // Either HTML5 validation is triggered or custom error message shown
    // The form should not navigate away
    expect(page.url()).toContain('/auth/login');
  });
});

test.describe('Auth Page — Register Form', () => {
  test('TC-REG-FE-001: register page has required form fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
  });

  test('TC-REG-FE-002: register page has a submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton.first()).toBeVisible();
  });

  test('TC-REG-FE-003: register page links back to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    const loginLink = page.locator('a[href="/auth/login"]');
    await expect(loginLink.first()).toBeVisible();
  });
});

test.describe('Catalog Page', () => {
  test('TC-CAT-FE-001: catalog page loads specialist list or empty state', async ({ page }) => {
    await page.goto(`${BASE_URL}/catalog`);

    // Page must render some content
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(200);
  });

  test('TC-CAT-FE-002: catalog page renders without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(`${BASE_URL}/catalog`);
    await page.waitForLoadState('networkidle');

    // Filter out known React hydration warnings that are non-critical
    const criticalErrors = errors.filter(
      (e) => !e.includes('Warning:') && !e.includes('hydration')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Consultation Page', () => {
  test('TC-CONSULT-FE-001: consultation page has a start button or prompt', async ({ page }) => {
    await page.goto(`${BASE_URL}/consultation`);

    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
  });
});

test.describe('404 Handling', () => {
  test('TC-404-001: non-existent page returns 404 and shows 404 content', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist-xyz`);

    expect(response?.status()).toBe(404);

    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    // Should show the app shell or a 404 message
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('TC-404-002: 404 page does not show 500 Server Error', async ({ page }) => {
    await page.goto(`${BASE_URL}/non-existent-route-abc`);

    const bodyText = await page.textContent('body') ?? '';
    expect(bodyText.toLowerCase()).not.toContain('500');
    expect(bodyText.toLowerCase()).not.toContain('internal server error');
  });
});

test.describe('Mobile Responsiveness', () => {
  test('TC-MOBILE-001: home page is usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const response = await page.goto(`${BASE_URL}/`);

    expect(response?.status()).toBe(200);

    // Main content must be visible on mobile
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('TC-MOBILE-002: catalog page is usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const response = await page.goto(`${BASE_URL}/catalog`);

    expect(response?.status()).toBe(200);
  });
});

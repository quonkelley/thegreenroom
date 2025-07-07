import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main landing page content', async ({ page }) => {
    await expect(page.locator('text=Your AI')).toBeVisible();
    await expect(page.locator('text=Booking Assistant')).toBeVisible();
    await expect(
      page.locator(
        'text=TheGreenRoom.ai helps independent artists and venues book smarter, faster'
      )
    ).toBeVisible();
  });

  test('should display email signup form', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(
      page.locator('button:has-text("Join Waitlist")')
    ).toBeVisible();
  });

  test('should display navigation elements', async ({ page }) => {
    // Check for common landing page elements
    await expect(
      page.locator('text=AI-Powered Booking Platform')
    ).toBeVisible();
  });
});

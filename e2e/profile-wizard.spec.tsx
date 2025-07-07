import { test, expect } from '@playwright/test';

test.describe('Profile Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/profile');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Should redirect to login if not authenticated
    await expect(page.locator('text=Welcome to TheGreenRoom.ai')).toBeVisible();
  });

  test('should show login form when accessing protected profile page', async ({
    page,
  }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

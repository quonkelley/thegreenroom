import { test, expect } from '@playwright/test';

test.describe('Pitch Generator', () => {
  test('should show loading or redirect when accessing protected route', async ({
    page,
  }) => {
    await page.goto('/app/pitch');

    // The page should either show loading or redirect to login
    // Let's check for common elements that might appear
    await expect(page.locator('body')).toBeVisible();

    // Check if we're on the login page or if there's a loading state
    const loginText = page.locator('text=Welcome to TheGreenRoom.ai');
    const loadingText = page.locator('text=Loading');

    // Either the login page should be visible or we should see loading
    await expect(loginText.or(loadingText)).toBeVisible();
  });
});

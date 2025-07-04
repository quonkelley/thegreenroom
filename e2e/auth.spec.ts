import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
  });

  test('should display signup form', async ({ page }) => {
    await page.click('text=Don\'t have an account? Sign up');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').nth(1)).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Create your account')).toBeVisible();
  });

  test('should switch between login and signup forms', async ({ page }) => {
    // Start on login form
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    
    // Switch to signup
    await page.click('text=Don\'t have an account? Sign up');
    await expect(page.locator('text=Create your account')).toBeVisible();
    
    // Switch back to login
    await page.click('text=Already have an account? Sign in');
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
  });

  test('should show welcome message', async ({ page }) => {
    await expect(page.locator('text=Welcome to TheGreenRoom.ai')).toBeVisible();
  });
});
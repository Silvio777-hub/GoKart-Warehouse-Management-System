import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should show login page by default', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/.*login/);
        await expect(page.locator('h1')).toContainText('Login');
    });

    test('should show error on invalid login', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'wronguser');
        await page.fill('input[name="password"]', 'wrongpass');
        await page.click('button[type="submit"]');

        // Check for toast or error message (based on typical app behavior)
        // Adjust selector based on actual implemented UI
        await expect(page.locator('.toast-error, .error-message, [role="alert"]')).toBeVisible();
    });
});

import { test, expect } from '@playwright/test';

test.describe('VolleyScore Pro Smoke Test', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for the app to be stable
        await expect(page.locator('#root')).toBeVisible();
    });

    test('should load application and display core elements', async ({ page }) => {
        // 1. Verify Application Title (Partial match)
        await expect(page).toHaveTitle(/VolleyScore/i);

        // 2. Verify Scoreboard Elements
        // Check for presence of score "0"
        const zeros = page.locator('text=0');
        await expect(zeros.first()).toBeVisible();

        // 3. Verify Controls
        // Check for Settings button
        const settingsBtn = page.getByTitle('Settings');
        await expect(settingsBtn).toBeVisible();

        // Check for Reset button
        const resetBtn = page.getByTitle('Reset');
        await expect(resetBtn).toBeVisible();

        // 4. Verify Undo button (might be disabled but visible)
        const undoBtn = page.getByTitle('Undo');
        await expect(undoBtn).toBeVisible();
    });
});

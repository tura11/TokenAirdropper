import { test, expect } from '@playwright/test';

// This test only checks that the main UI loads correctly
test('should load homepage and show connect wallet button', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/');

  await expect(page).toHaveTitle(/Token Airdropper/i);

  const connectButton = page.getByRole('button', { name: /connect wallet/i });
  await expect(connectButton).toBeVisible();

  await page.screenshot({ path: 'screenshots/homepage.png' });
});

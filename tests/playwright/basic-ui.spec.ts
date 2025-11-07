import { test, expect } from '@playwright/test';

// This test only checks that the main UI loads correctly
test('should load homepage and show connect wallet button', async ({ page }) => {
  // 1️⃣ Go to your local dev server
  await page.goto('http://127.0.0.1:3000/');

  // 2️⃣ Wait for the page title
  await expect(page).toHaveTitle(/Token Airdropper/i);

  // 3️⃣ Check if the "Connect Wallet" button is visible
  const connectButton = page.getByRole('button', { name: /connect wallet/i });
  await expect(connectButton).toBeVisible();

  // 4️⃣ Take a screenshot (for debugging)
  await page.screenshot({ path: 'screenshots/homepage.png' });
});

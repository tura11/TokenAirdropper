import { test, expect } from '@playwright/test';

test.describe('TokenAirdropper E2E', () => {
  test('should load the app and open wallet modal', async ({ page }) => {
    // 1️⃣ Load the app
    await page.goto('http://127.0.0.1:3000');
    await page.waitForLoadState('domcontentloaded');

    // 2️⃣ Check if the "Connect Wallet" button is visible
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();

    // 3️⃣ Click the "Connect Wallet" button
    await connectButton.click();

    // 4️⃣ Wait for the wallet modal to appear
    await expect(page.getByText('Connect a Wallet')).toBeVisible();
    await expect(page.getByText('Rainbow')).toBeVisible();
    await expect(page.getByText('MetaMask')).toBeVisible();

    // 5️⃣ Close the modal if visible
    const closeButton = page.locator('button[aria-label="Close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }

    // 6️⃣ Verify that the modal is closed
    await expect(page.getByText('Connect a Wallet')).not.toBeVisible();
  });
});

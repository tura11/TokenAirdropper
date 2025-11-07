import { test, expect } from '@playwright/test';

// This test only checks that the main UI loads correctly
test('checks connect button', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/');

  const connectWalletButton = page.getByRole('button', { name: /connect wallet/i });
  await expect(connectWalletButton).toBeVisible();


  await connectWalletButton.click();


  await expect(page.getByText('Connect a Wallet')).toBeVisible();

  await page.screenshot({ path: 'screenshots/homepage.png' });
  
});




import { test, expect } from '@playwright/test';

test('Product AR Viewer: loads and AR button works', async ({ page }) => {
  await page.goto('http://localhost:3000/products/1');
  await expect(page.getByText('View in AR')).toBeVisible();
  await expect(page.locator('model-viewer')).toBeVisible();
  await page.getByTestId('ar-button').click();
  // Simulate AR event (cannot launch AR in Playwright, but can check event)
  await expect(page.locator('model-viewer')).toBeVisible();
});
import { test, expect } from '@playwright/test';

// This E2E test assumes the dev server is running at http://localhost:3000
// It navigates to /products/1 and clicks the View in AR button and verifies the model-viewer element exists.

test('product AR viewer renders and AR button works', async ({ page }) => {
  await page.goto('http://localhost:3000/products/1');

  // Wait for model-viewer to be present
  const mv = await page.waitForSelector('model-viewer', { state: 'attached', timeout: 5000 });
  expect(mv).toBeTruthy();

  // If device supports AR, clicking may open native dialog; here we ensure the button exists and is clickable
  const btn = await page.getByRole('button', { name: /View in AR/i });
  await expect(btn).toBeVisible();
  await btn.click();

  // Verify that model-viewer still exists after click
  await expect(page.locator('model-viewer')).toHaveCount(1);
});

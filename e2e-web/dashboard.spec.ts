import { expect, test } from '@playwright/test';

test('adds a weight, shows it on the dashboard, and keeps it after a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Add your first weight').click();
  await page.getByLabel('Weight').fill('72,5'); // the French comma is accepted too
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('72.5 kg').first()).toBeVisible();

  await page.reload(); // the data lives in the browser's SQLite, not in memory
  await expect(page.getByText('72.5 kg').first()).toBeVisible();
});

test('switching to lb shows lb without changing the stored value', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Add your first weight').click();
  await page.getByLabel('Weight').fill('80');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('tab', { name: 'Settings' }).click();
  await page.getByText('lb', { exact: true }).click();
  await page.getByRole('tab', { name: 'Dashboard' }).click();
  await expect(page.getByText('176.4 lb').first()).toBeVisible();
});

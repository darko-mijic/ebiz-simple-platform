import { test, expect } from '@playwright/test';

test('home page has title and links', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  await expect(page).toHaveTitle(/EBIZ-Saas Platform/);
  
  // Check heading
  await expect(page.locator('h1')).toContainText('Welcome to EBIZ-Saas Platform');
  
  // Check navigation links
  await expect(page.getByRole('link', { name: /Dashboard/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Transactions/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Documents/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Chat/ })).toBeVisible();
}); 
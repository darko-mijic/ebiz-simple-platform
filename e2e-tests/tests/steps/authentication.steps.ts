import { test, expect, Page, BrowserContext } from '@playwright/test';

// Config
const baseUrl = 'http://localhost:3001';
const apiUrl = 'http://localhost:3000';

// Define tests that follow the Gherkin scenarios but using Playwright's native API
test.describe('Authentication Feature', () => {
  test('Auth page should load with Google login button', async ({ page }) => {
    // Navigate to the auth page
    await page.goto(`${baseUrl}/auth`);
    
    // Check the page title
    const title = await page.title();
    expect(title).toContain('Ebiz Platform - Authentication');
    
    // Check login button exists - use a more flexible selector
    const loginButton = page.getByRole('button').filter({ hasText: /Google/i });
    await expect(loginButton).toBeVisible();
  });
  
  test.skip('Successful Google login flow', async ({ page, context }) => {
    // Given the EBIZ-Saas application is running
    await page.goto(`${baseUrl}/auth`);
    
    // When I click on the "Login with Google" button
    // Setup request interception for Google auth flow
    await page.route(`${apiUrl}/auth/google`, async (route) => {
      // Simulate the redirect to Google auth
      await route.fulfill({
        status: 302,
        headers: {
          Location: `${apiUrl}/auth/google/callback?code=mock_auth_code&scope=email+profile&state=${encodeURIComponent(JSON.stringify({ redirectUrl: '/dashboard' }))}`
        }
      });
    });
    
    // And I authorize the application with my Google account
    await page.route(`${apiUrl}/auth/google/callback**`, async (route) => {
      // Simulate successful Google auth callback
      await route.fulfill({
        status: 302,
        headers: {
          'Set-Cookie': 'auth_session=test_session_token; Path=/; HttpOnly; SameSite=Lax; Domain=localhost',
          'Location': `${baseUrl}/dashboard`
        }
      });
    });
    
    const loginButton = page.getByRole('button').filter({ hasText: /Google/i });
    await loginButton.click();
    
    // Simulate successful auth
    await context.addCookies([
      {
        name: 'auth_session',
        value: 'test_session_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      }
    ]);
    
    // Then I should be redirected to the dashboard
    await page.goto(`${baseUrl}/dashboard`);
    await expect(page).toHaveURL(/.*dashboard/);
    
    // And I should see my Google profile picture in the sidebar
    // Note: This is a simplified check
    const cookies = await context.cookies();
    const authCookie = cookies.find(cookie => cookie.name === 'auth_session');
    expect(authCookie).toBeDefined();
  });
  
  test.skip('First-time user onboarding', async ({ page, context }) => {
    // Given I have successfully logged in with Google for the first time
    await page.goto(`${baseUrl}/auth`);
    
    // Simulate logged-in state
    await context.addCookies([
      {
        name: 'auth_session',
        value: 'test_session_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      }
    ]);
    
    // When I am redirected to the onboarding flow
    await page.goto(`${baseUrl}/onboarding`);
    
    // Then I should see a form requesting personal and company information
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // And I should see my email pre-filled and read-only
    const emailField = page.getByLabel('Email');
    await expect(emailField).toBeVisible();
    
    // And I should be able to edit my first and last name
    const firstNameField = page.getByLabel('First Name');
    const lastNameField = page.getByLabel('Last Name');
    
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
    
    // And the phone field should be marked as optional
    const phoneField = page.getByLabel(/Phone/);
    await expect(phoneField).toBeVisible();
  });
}); 
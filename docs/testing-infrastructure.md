# Testing Infrastructure Documentation

## Overview

The EbizSimple Platform implements a comprehensive testing strategy with two separate testing frameworks:

1. **Cypress**: For frontend integration and end-to-end testing
2. **Playwright**: For cross-browser end-to-end testing

This dual approach provides both flexibility and robustness in ensuring application quality across different browsers and use cases.

## Cypress Tests

### Directory Structure

```
frontend/cypress/
├── e2e/                    # End-to-end test specifications
│   ├── auth.cy.js          # Authentication flow tests
│   ├── onboarding.cy.js    # Onboarding process tests
│   └── onboarding-completion.cy.js # Onboarding completion tests
├── fixtures/               # Test data files
│   ├── user.json           # Mock user data
│   └── company.json        # Mock company data
├── support/                # Support files and utilities
│   ├── commands.js         # Custom Cypress commands
│   └── e2e.js              # E2E test configuration
└── cypress.config.js       # Cypress configuration
```

### Configuration

```javascript
// frontend/cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    apiUrl: 'http://localhost:3000',
  },
});
```

### Custom Commands

```javascript
// frontend/cypress/support/commands.js

// Mock Google OAuth login
Cypress.Commands.add('mockGoogleLogin', (userData = {}) => {
  // Default user data if none provided
  const defaultUserData = {
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    profilePictureUrl: 'https://placeholder.com/150',
    isOnboardingCompleted: false
  };
  
  const user = { ...defaultUserData, ...userData };
  
  // Intercept auth/check endpoint to mock authenticated user
  cy.intercept('GET', `${Cypress.env('apiUrl')}/auth/check`, {
    statusCode: 200,
    body: {
      isAuthenticated: true,
      user
    }
  }).as('checkAuth');
  
  // Visit home page to trigger auth check
  cy.visit('/');
  cy.wait('@checkAuth');
});

// Complete user onboarding form
Cypress.Commands.add('completeUserOnboarding', (userData = {}) => {
  // Fill out user form
  cy.get('input[name="firstName"]').clear().type(userData.firstName || 'Test');
  cy.get('input[name="lastName"]').clear().type(userData.lastName || 'User');
  cy.get('input[name="phone"]').clear().type(userData.phone || '+1234567890');
  
  // Submit form
  cy.contains('button', 'Next').click();
});

// Complete company onboarding form
Cypress.Commands.add('completeCompanyOnboarding', (companyData = {}) => {
  // Fill out company form
  cy.get('input[name="companyName"]').clear().type(companyData.name || 'Test Company');
  cy.get('select[name="country"]').select(companyData.country || 'HR');
  cy.get('input[name="address"]').clear().type(companyData.address || 'Test Street 123');
  cy.get('input[name="city"]').clear().type(companyData.city || 'Test City');
  cy.get('input[name="postalCode"]').clear().type(companyData.postalCode || '10000');
  cy.get('select[name="industry"]').select(companyData.industry || 'Technology');
  
  // Submit form
  cy.contains('button', 'Submit').click();
});
```

### Test Examples

#### Authentication Tests

```javascript
// frontend/cypress/e2e/auth.cy.js
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should load the auth page', () => {
    cy.visit('/auth');
    cy.contains('Get started').should('exist');
  });

  it.skip('should redirect to auth page when not authenticated', () => {
    // Mock auth check to return unauthenticated
    cy.intercept('GET', `${Cypress.env('apiUrl')}/auth/check`, {
      statusCode: 200,
      body: {
        isAuthenticated: false
      }
    }).as('checkAuth');
    
    // Visit dashboard which should redirect to login
    cy.visit('/dashboard');
    cy.wait('@checkAuth');
    
    // Should be redirected to auth page
    cy.url().should('include', '/auth');
  });

  // Additional tests...
});
```

#### Onboarding Tests

```javascript
// frontend/cypress/e2e/onboarding.cy.js
describe('Onboarding Flow', () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should load the onboarding page when authenticated', () => {
    // Mock login
    cy.mockGoogleLogin({
      isOnboardingCompleted: false
    });
    
    // Visit onboarding
    cy.visit('/onboarding');
    
    // Verify page loads
    cy.url().should('include', '/onboarding');
  });

  it.skip('should complete the full onboarding process', () => {
    // Mock Google login
    cy.mockGoogleLogin();
    
    // Should be on user onboarding step
    cy.url().should('include', '/onboarding');
    cy.contains('Personal Information').should('exist');
    
    // Complete user onboarding
    cy.completeUserOnboarding();
    
    // Should move to company onboarding step
    cy.contains('Company Information').should('exist');
    
    // Complete company onboarding
    cy.completeCompanyOnboarding();
    
    // Should redirect to dashboard after completion
    cy.url().should('include', '/dashboard');
  });
});
```

### Running Cypress Tests

```bash
# Navigate to frontend directory
cd frontend

# Start the application in development mode (in a separate terminal)
npm run dev

# Open Cypress Test Runner (interactive mode)
npm run cy:open

# Run tests headlessly
npm run cy:run

# Run specific test file headlessly
npm run cy:run -- --spec "cypress/e2e/auth.cy.js"
```

## Playwright Tests

### Directory Structure

```
e2e-tests/
├── tests/                  # Test specifications
│   ├── auth.spec.ts        # Authentication tests
│   └── home.spec.ts        # Home page tests
├── fixtures/               # Test data
├── playwright.config.ts    # Playwright configuration
└── package.json            # E2E test dependencies
```

### Configuration

```typescript
// e2e-tests/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'cd ../frontend && npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Examples

#### Authentication Test

```typescript
// e2e-tests/tests/auth.spec.ts
import { test, expect } from '@playwright/test';

// Config
const baseUrl = 'http://localhost:3001';
const apiUrl = 'http://localhost:3000';

test.describe('Authentication', () => {
  test('Auth page should load', async ({ page }) => {
    await page.goto(`${baseUrl}/auth`);
    
    // Check the page title
    const title = await page.title();
    expect(title).toContain('Ebiz');
    
    // Check login button exists
    const loginButton = page.getByRole('button', { name: /Continue with Google/i });
    await expect(loginButton).toBeVisible();
  });

  test.skip('Successful login with Google', async ({ page, context }) => {
    // 1. Navigate to the login page
    await page.goto(`${baseUrl}/auth`);
    
    // 2. Mock the Google OAuth redirect
    await page.route(`${apiUrl}/auth/google`, async (route) => {
      // Simulate the redirect to Google auth
      await route.fulfill({
        status: 302,
        headers: {
          Location: `${apiUrl}/auth/google/callback?code=mock_auth_code&scope=email+profile`
        }
      });
    });
    
    // 3. Mock the callback endpoint
    await page.route(`${apiUrl}/auth/google/callback**`, async (route) => {
      // Simulate successful authentication and set cookies
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
        headers: {
          'Set-Cookie': 'session=mock-session-token; Path=/; HttpOnly'
        }
      });
    });
    
    // 4. Click the Google login button
    await page.getByRole('button', { name: /Continue with Google/i }).click();
    
    // 5. Mock the auth check endpoint to return authenticated
    await page.route(`${apiUrl}/auth/check`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isAuthenticated: true,
          user: {
            id: 'test-user-id',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            isOnboardingCompleted: true
          }
        })
      });
    });
    
    // 6. Navigate directly to dashboard
    await page.goto(`${baseUrl}/dashboard`);
    
    // 7. Verify we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

#### Home Page Test

```typescript
// e2e-tests/tests/home.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  
  // Check that the page loads without errors
  await expect(page).toHaveTitle(/Ebiz/);
  
  // Verify some basic content exists
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
});

test.skip('home page has title and links', async ({ page }) => {
  await page.goto('http://localhost:3001/');

  // Check title
  await expect(page).toHaveTitle(/Ebiz/);
  
  // Check heading - Update the expected text to match the actual text
  await expect(page.locator('h1')).toContainText('Financial Management Platform for European SMBs');
  
  // Check navigation links
  await expect(page.getByRole('link', { name: /Dashboard/ })).toBeVisible();
});
```

### Running Playwright Tests

```bash
# From project root
npm run test:e2e

# Run specific test file
npx playwright test e2e-tests/tests/auth.spec.ts

# Run with UI
npx playwright test --ui
```

## Testing Strategy

### What We Test

1. **Authentication Flows**
   - Login with Google
   - Auth state persistence
   - Redirects based on authentication state
   - Logout functionality

2. **Onboarding Process**
   - User information form
   - Company information form
   - VAT ID validation
   - Completion and redirection

3. **Core Application Features**
   - Dashboard loading
   - Navigation
   - Key functionality

### API Mocking Strategy

We use different approaches to mock APIs:

1. **Cypress**: Uses `cy.intercept()` to mock API responses
   ```javascript
   cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
   ```

2. **Playwright**: Uses `page.route()` for request interception
   ```typescript
   await page.route('/api/users', async (route) => {
     await route.fulfill({ 
       contentType: 'application/json',
       body: JSON.stringify(users)
     });
   });
   ```

### Best Practices

1. **Independent Tests**: Each test should be capable of running independently
2. **Minimal Test Setup**: Keep setup as simple as possible
3. **Proper Teardown**: Clean up after tests to avoid state leakage
4. **Meaningful Assertions**: Focus on testing behavior, not implementation
5. **Resilient Selectors**: Use data-testid or roles instead of CSS classes
6. **Skip Flaky Tests**: Use `.skip()` to temporarily disable problematic tests

## Troubleshooting

### Common Issues

1. **Tests Not Running**
   - Ensure frontend and backend services are running
   - Check port configurations in Cypress and Playwright configs
   - Verify test files have correct extensions (.cy.js or .spec.ts)

2. **Authentication Failures**
   - Verify mock implementations match actual auth flow
   - Check if auth endpoints have changed
   - Ensure cookies are being properly set and read

3. **Selector Failures**
   - UI may have changed - update selectors
   - Add data-testid attributes to make tests more resilient
   - Use more specific selectors

4. **Timeouts**
   - Increase timeout values for async operations
   - Check if the application is loading slowly
   - Verify that expected UI elements appear

### Debugging Tools

1. **Cypress**
   - Time Travel: Use the test runner to see each step
   - Screenshots and Videos: Automatically captured on failures
   - Console Output: Check browser console for errors
   - Command Log: Review exact commands and their results

2. **Playwright**
   - Playwright Inspector: Visual debugging with `npx playwright test --debug`
   - Screenshots: `await page.screenshot({ path: 'screenshot.png' })`
   - Traces: Enable with `trace: 'on'` in config
   - Console: Access with `page.on('console', msg => console.log(msg.text()))`

## CI/CD Integration

To integrate these tests into a CI/CD pipeline:

1. **Install Dependencies**
   ```bash
   npm ci
   ```

2. **Run Frontend Tests**
   ```bash
   cd frontend && npm run cy:run
   ```

3. **Run E2E Tests**
   ```bash
   npm run test:e2e
   ```

4. **Generate Reports**
   - Cypress automatically generates reports in `frontend/cypress/reports`
   - Playwright generates HTML reports with `--reporter=html`

## Maintenance

### When to Update Tests

1. When UI components change
2. When API endpoints or responses change
3. When user flows are modified
4. When new features are added

### Test Audit

Regularly audit tests to ensure:

1. Tests are still relevant and necessary
2. Coverage is adequate for critical paths
3. Tests are performant and not causing bottlenecks
4. Flaky tests are fixed or disabled 
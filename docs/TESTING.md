# Testing Infrastructure in EBIZ Simple Platform

This document provides a comprehensive guide to the testing infrastructure implemented in the EBIZ Simple Platform.

## Overview

The platform implements a multi-layered testing strategy using Cypress for frontend integration tests and Playwright for end-to-end tests. This approach ensures both component-level quality and full system functionality.

## Testing Frameworks

### Cypress

Used for frontend integration testing, primarily focusing on component interactions and user flows within the frontend application.

- **Location**: `frontend/cypress/`
- **Configuration**: `frontend/cypress.config.js`
- **Command Definitions**: `frontend/cypress/support/commands.js`

### Playwright

Used for end-to-end testing, focusing on full application flows across both frontend and backend.

- **Location**: `e2e-tests/`
- **Configuration**: `e2e-tests/playwright.config.ts`
- **Global Setup**: `e2e-tests/global-setup.ts`

## Test Types

### 1. Unit Tests

Small, focused tests for individual functions and components.

- **Framework**: Jest
- **Location**: `src/**/__tests__/` (scattered throughout the codebase)
- **Naming Convention**: `*.test.ts` or `*.test.tsx`

### 2. Integration Tests (Cypress)

Testing how multiple components work together within the frontend.

- **Location**: `frontend/cypress/e2e/`
- **Examples**:
  - Authentication flow
  - Form submission and validation
  - UI component interactions

### 3. End-to-End Tests (Playwright)

Testing the entire application flow from user perspective.

- **Location**: `e2e-tests/tests/`
- **Examples**:
  - User registration and login
  - Dashboard functionality
  - Complete business processes

## Directory Structure

### Cypress Structure

```
frontend/cypress/
├── e2e/                 # Test specifications
│   ├── auth.cy.js       # Authentication tests
│   ├── onboarding.cy.js # Onboarding tests
│   └── ...
├── fixtures/            # Test data
│   ├── user.json        # Sample user data
│   └── ...
├── support/             # Helpers and utilities
│   ├── commands.js      # Custom Cypress commands
│   └── e2e.js           # E2E test configuration
└── ...
```

### Playwright Structure

```
e2e-tests/
├── tests/               # Test specifications
│   ├── auth.spec.ts     # Authentication tests
│   ├── home.spec.ts     # Home page tests
│   └── ...
├── fixtures/            # Test data
│   ├── users.ts         # User data
│   └── ...
├── utils/               # Helper utilities
│   ├── auth-helpers.ts  # Authentication helpers
│   └── ...
└── playwright.config.ts # Playwright configuration
```

## Running Tests

### Cypress Tests

```bash
# Navigate to frontend directory
cd frontend

# Start the application in development mode (in a separate terminal)
npm run dev

# Open Cypress Test Runner
npm run cy:open

# Run tests headlessly
npm run cy:run

# Run specific test file
npm run cy:run --spec "cypress/e2e/auth.cy.js"
```

### Playwright Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run tests with UI
npx playwright test --ui

# Run tests with specific browser
npx playwright test --project=chromium
```

## Writing Tests

### Cypress Test Example

```javascript
// auth.cy.js
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset any state or setup needed
    cy.visit('/');
  });

  it('should redirect unauthenticated user to login page', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/auth/login');
  });

  it('should allow login with Google', () => {
    cy.visit('/auth/login');
    cy.get('[data-testid="google-login-button"]').click();
    
    // This uses a custom command to mock Google OAuth
    cy.loginWithGoogle();
    
    // After successful login, expect redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-name"]').should('be.visible');
  });
});
```

### Playwright Test Example

```typescript
// auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login page for protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/auth\/login.*/);
  });

  test('should allow login with Google', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click the Google login button
    await page.click('[data-testid="google-login-button"]');
    
    // Mock the OAuth process (using custom fixture)
    await page.evaluate(() => {
      window.localStorage.setItem('mockGoogleAuth', JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
      }));
    });
    
    // Trigger the mock OAuth callback
    await page.goto('/auth/google/callback?mockAuth=true');
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL(/.*\/dashboard.*/);
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
  });
});
```

## Authentication Testing

One of the most critical aspects to test is authentication. There are special considerations for testing OAuth flows:

### Mocking Google OAuth

Since automated tests can't actually perform a Google login, we use mocks:

#### Cypress Approach

```javascript
// In cypress/support/commands.js
Cypress.Commands.add('loginWithGoogle', () => {
  // Intercept the OAuth callback
  cy.intercept('GET', '/auth/google/callback*', (req) => {
    // Call a test-only endpoint that generates a valid JWT without Google
    cy.request({
      url: 'http://localhost:3000/api/auth/test-login',
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'Test User',
      },
    }).then((response) => {
      // Store the token
      localStorage.setItem('token', response.body.accessToken);
      // Redirect to the expected page after login
      window.location.href = '/dashboard';
    });
  }).as('googleCallback');
  
  // Trigger the OAuth login flow
  cy.get('[data-testid="google-login-button"]').click();
  cy.wait('@googleCallback');
});
```

#### Playwright Approach

```typescript
// In e2e-tests/utils/auth-helpers.ts
export async function mockGoogleLogin(page) {
  // Create a direct API route for testing that bypasses OAuth
  await page.request.post('http://localhost:3000/api/auth/test-login', {
    data: {
      email: 'test@example.com',
      name: 'Test User',
    }
  }).then(async (response) => {
    const data = await response.json();
    // Set the token in localStorage
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, data.accessToken);
  });
  
  // Navigate to the authenticated page
  await page.goto('/dashboard');
}
```

## Test Data Management

### Fixtures

Test data is maintained in the fixtures directory:

```
# Cypress fixtures
frontend/cypress/fixtures/user.json
frontend/cypress/fixtures/company.json

# Playwright fixtures
e2e-tests/fixtures/users.ts
e2e-tests/fixtures/companies.ts
```

### Database Reset

For E2E tests, the database is reset before test runs:

```typescript
// In e2e-tests/global-setup.ts
async function globalSetup() {
  // Reset the test database
  const { execSync } = require('child_process');
  execSync('npm run db:reset:test', { stdio: 'inherit' });
}

export default globalSetup;
```

## Visual Testing

Playwright includes built-in visual testing capabilities:

```typescript
test('dashboard should match visual snapshot', async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto('/dashboard');
  
  // Wait for all content to load
  await page.waitForSelector('[data-testid="dashboard-loaded"]');
  
  // Take a screenshot and compare to baseline
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

## API Testing

Testing backend API endpoints:

```typescript
test('GET /api/users/profile should return user data', async ({ request }) => {
  // Get auth token
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: 'test@example.com',
      password: 'testPassword123',
    }
  });
  const { accessToken } = await loginResponse.json();
  
  // Test the API with authentication
  const response = await request.get('/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  expect(response.status()).toBe(200);
  const userData = await response.json();
  expect(userData).toHaveProperty('email', 'test@example.com');
});
```

## Continuous Integration

Tests are set up to run automatically in CI pipeline:

```yaml
# In .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test
      - name: Run Cypress tests
        run: npm run cy:run
      - name: Run Playwright tests
        run: npm run test:e2e
```

## Test Reports

Test reports are generated to help analyze test results:

```bash
# Generate and open Cypress report
npm run cy:report

# Generate and open Playwright report
npx playwright show-report
```

## Best Practices

1. **Independent Tests**: Each test should be independent and not rely on the state from previous tests.

2. **Use Data Attributes**: Use `data-testid` attributes for test selectors rather than CSS classes or IDs that may change.

3. **Mock External Services**: Always mock external services like Google OAuth or payment gateways.

4. **Use Page Objects**: Organize complex interactions using the Page Object pattern.

5. **Parallel Testing**: Configure tests to run in parallel when possible to save time.

6. **Keep Tests Focused**: Each test should verify a single piece of functionality.

7. **Clean Up After Tests**: Always reset state after tests to avoid affecting subsequent runs. 
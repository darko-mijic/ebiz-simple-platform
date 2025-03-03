# E2E Testing with Cypress

This directory contains end-to-end tests for the EbizSimple Platform frontend using Cypress.

## Test Structure

- `e2e/` - Contains all test files organized by feature
  - `auth.cy.js` - Tests for authentication flows (login, logout, redirects)
  - `onboarding.cy.js` - Tests for the complete onboarding process
  - `onboarding-completion.cy.js` - Tests specifically for the onboarding completion endpoint

- `fixtures/` - Contains mock data used by tests
  - `user.json` - Mock user data
  - `company.json` - Mock company data

- `support/` - Contains helper files and custom commands
  - `commands.js` - Custom Cypress commands for common testing operations
  - `e2e.js` - Configuration for e2e tests

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Open Cypress test runner in interactive mode
npm run test:dev

# Run all tests in headless mode
npm run test

# Run a specific test file
npm run cy:run -- --spec "cypress/e2e/auth.cy.js"
```

## Testing Strategy

These tests verify that the core user flows work correctly:

1. **Authentication**
   - Redirects based on authentication state
   - Login flow (mocked Google OAuth)
   - Logout flow

2. **Onboarding**
   - Complete personal information step
   - VAT validation
   - Complete company information step
   - Handle back navigation
   - Handle errors gracefully

3. **Specific Tests for Fixed Issues**
   - Onboarding completion endpoint (/onboarding/complete)
   - VAT validation with country selection
   - Error handling with toast notifications

## Mocking Strategies

Since we can't test Google OAuth directly, we use the following mocking strategies:

1. **Auth Checks**: Intercept `/auth/check` API calls to simulate different authentication states
2. **API Responses**: Mock backend API responses for predictable test results
3. **Google Login**: Skip the actual OAuth flow and directly inject authenticated user data

## Adding New Tests

When adding new tests:

1. Add test file in `e2e/` directory with the `.cy.js` extension
2. Group related tests within `describe` blocks
3. Use the custom commands in `support/commands.js` for common operations
4. Add new fixtures in `fixtures/` if needed
5. Add new custom commands in `support/commands.js` if operations are reused across tests

## Common Issues

- **Selector Changes**: If the UI changes, update selectors in the tests
- **Route Changes**: If routes change, update the URL assertions
- **API Changes**: If API endpoints change, update the interceptors

Remember to run the tests regularly as part of your development workflow to catch regressions early. 
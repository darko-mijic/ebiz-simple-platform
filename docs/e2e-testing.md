# E2E Testing Documentation

This document outlines the end-to-end testing strategy for the EbizSimplePlatform, including setup, configuration, and best practices.

## Overview

The E2E testing suite is built with:

- **Cucumber.js** - BDD framework for writing tests in Gherkin syntax
- **Playwright** - Browser automation for UI testing
- **Prisma** - Database access for test data management
- **Docker** - Container orchestration for isolated test environment

## Test Environment Setup

The E2E tests run in an isolated environment with separate infrastructure from development:

- Separate PostgreSQL database on port 5433
- Separate MinIO storage on ports 9002/9003
- Backend server running on port 3002
- Frontend server running on port 3003

### Starting the Test Environment

To start the test environment:

```bash
cd e2e-tests
npm run start:env
```

This script:
1. Starts Docker containers for test dependencies
2. Resets and seeds the test database
3. Starts backend and frontend servers in test mode
4. Waits for all services to be ready

### Stopping the Test Environment

To stop the test environment:

```bash
cd e2e-tests
npm run stop:env
```

## Running Tests

The following test commands are available:

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:auth` | Run authentication feature tests |
| `npm run test:bank` | Run bank accounts feature tests |
| `npm run test:dashboard` | Run dashboard feature tests |
| `npm run test:transactions` | Run transactions feature tests |
| `npm run test:statements` | Run bank statements feature tests |
| `npm run test:documents` | Run documents feature tests |
| `npm run test:chat` | Run chat interface feature tests |
| `npm run test:navigation` | Run navigation feature tests |
| `npm run test:settings` | Run settings feature tests |
| `npm run test:all` | Run all feature tests (alias for `npm test`) |
| `npm run test:debug` | Run tests with browser UI visible and extra logging |
| `npm run test:ui` | Run tests with browser UI visible |
| `npm run test:dry` | Validate Gherkin syntax without executing tests |
| `npm run test:ci` | Run tests optimized for CI environment |

## Test Structure

Tests follow the Cucumber BDD pattern:

```
e2e-tests/
├── tests/
│   ├── features/          # Feature files in Gherkin syntax
│   │   ├── authentication.feature
│   │   ├── bank-accounts.feature
│   │   └── ...
│   ├── step-definitions/  # Step implementations
│   │   ├── authentication.steps.js
│   │   ├── navigation.steps.js
│   │   └── ...
│   └── world.js           # Shared context for tests
├── scripts/               # Test environment management
│   ├── reset-test-db.sh   # Database reset script
│   ├── seed-test-db.js    # Database seeding script
│   ├── start-test-env.sh  # Start test environment
│   └── stop-test-env.sh   # Stop test environment
└── reports/               # Test reports and artifacts
    ├── screenshots/       # Failure screenshots
    ├── videos/            # Test run videos (CI only)
    └── cucumber-report.html # HTML test report
```

## Writing Tests

### Feature Files

Feature files use Gherkin syntax and should be placed in `tests/features/`. Example:

```gherkin
Feature: User Authentication
  As a user
  I want to log in to the application
  So that I can access my data

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be redirected to the dashboard
```

### Step Definitions

Step definitions implement the behavior described in feature files:

```javascript
// In tests/step-definitions/authentication.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the login page', async function() {
  await this.page.visit('/login');
});

When('I enter valid credentials', async function() {
  await this.page.fill('#email', this.testUser.email);
  await this.page.fill('#password', this.testUser.password);
});

When('I click the login button', async function() {
  await this.page.click('button[type="submit"]');
});

Then('I should be redirected to the dashboard', async function() {
  await this.page.waitForURL(/dashboard/);
  expect(this.page.url()).toContain('/dashboard');
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on state from other tests.
2. **Clean Data**: Use the database helpers to create and clean up test data.
3. **Readable Scenarios**: Write scenarios from the user's perspective.
4. **Reusable Steps**: Create generic steps that can be reused across features.
5. **Error Screenshots**: Screenshots are automatically taken on test failures.
6. **Performance**: Keep tests efficient by minimizing unnecessary actions.

## Troubleshooting

### Common Issues

- **Port Conflicts**: If the test environment fails to start, check if ports 5433, 9002, 3002, or 3003 are already in use.
- **Database Connection**: Verify database connection with `DATABASE_URL` in `.env.test`.
- **Test Failures**: Check screenshot reports in `reports/screenshots/` for visual evidence of failures.

### Debugging

For detailed debugging:

1. Use `npm run test:debug` to run tests with the browser visible and slow motion enabled.
2. Check logs in `logs/` directory for backend and frontend output.
3. Use the screenshot functionality in step definitions:
   ```javascript
   await this.takeScreenshot('custom-name');
   ```

## CI Integration

The tests are configured to run in CI environments with the `test:ci` profile, which:

- Runs tests in parallel
- Records videos of test execution
- Generates JUnit XML reports for CI integration
- Uses retry for flaky tests

## Maintenance

- Regularly update test data in `seed-test-db.js`
- Keep feature files and step definitions in sync
- Review and remove any obsolete tests
- Update dependencies for Playwright and Cucumber regularly
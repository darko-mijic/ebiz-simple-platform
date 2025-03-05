# EBIZ Platform E2E Tests with Cucumber

This directory contains end-to-end tests for the EBIZ Platform using Cucumber and Playwright.

## Quick Start

Run all tests:
```bash
npm test
```

Run specific feature tests:
```bash
npm run test:auth        # Authentication tests
npm run test:bank        # Bank account tests
npm run test:dashboard   # Dashboard tests
```

Run tests with UI visible:
```bash
npm run test:ui
```

Debug tests (slower, with DevTools):
```bash
npm run test:debug
```

Validate your tests without running them:
```bash
npm run test:dry
```

> **Note:** To run tests successfully, make sure the application is running with `npm run dev` in the project root.

## Project Structure

```
e2e-tests/
├── cucumber.js             # Cucumber configuration
├── package.json            # Dependencies and scripts
└── tests/
    ├── features/           # Gherkin feature files
    │   ├── authentication.feature
    │   ├── bank-accounts.feature
    │   └── ...
    └── step-definitions/   # Step implementations
        ├── authentication.steps.js
        ├── ...
        └── world.js        # Custom World setup
```

## Running from Root Directory

You can also run the tests from the root directory:

```bash
# Run all tests
npm run test:e2e

# Run specific features
npm run test:e2e:auth      # Authentication tests
npm run test:e2e:bank      # Bank accounts tests
npm run test:e2e:dashboard # Dashboard tests
```

## Writing Tests

### 1. Create a Feature File

Create a `.feature` file in the `tests/features/` directory using Gherkin syntax:

```gherkin
Feature: User Authentication
  As a user of EBIZ-Saas
  I want to log in with Google
  So that I can access my account

  Scenario: Successful login with Google
    Given the EBIZ-Saas application is running
    When I click on the "Login with Google" button
    And I authorize the application with my Google account
    Then I should be redirected to the dashboard
```

### 2. Implement Step Definitions

Create a `.steps.js` file in the `tests/step-definitions/` directory:

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('the EBIZ-Saas application is running', async function() {
  const { page } = this;
  await page.goto('http://localhost:3001');
});

When('I click on the {string} button', async function(buttonText) {
  const { page } = this;
  await page.click(`button:has-text("${buttonText}")`);
});
```

## Debug Options

You can customize test execution with these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `HEADLESS` | Run in headless mode | `true` |
| `DEBUG` | Run in debug mode | `false` |

Example usage:
```bash
HEADLESS=false DEBUG=true npm test
```

## Cleanup

To remove unnecessary files and clean up the project:

```bash
npm run clean
```
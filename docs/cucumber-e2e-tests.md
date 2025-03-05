# Cucumber E2E Testing Guide

This document describes how to use the Cucumber-based E2E testing setup for the EBIZ platform.

## Overview

Our E2E testing implementation uses Cucumber with Playwright to:

1. Define test scenarios in natural language (Gherkin)
2. Run tests with a visible browser for visual feedback
3. Provide consistent step definitions for common actions
4. Support data-driven testing for complex scenarios
5. Ensure tests follow the BDD approach

## Getting Started

To run Cucumber tests:

```bash
# Run all Cucumber feature tests
npm run test:e2e:cucumber

# Run just the authentication feature tests
npm run test:e2e:cucumber:auth

# Run tests with persistent browser (stays open between scenarios)
npm run test:e2e:cucumber:persistent
```

## Gherkin Features

Features are defined in `.feature` files using Gherkin syntax. These files are located in `e2e-tests/tests/features/`.

Example:
```gherkin
Feature: User Authentication
  As a user of the application
  I want to log in with Google
  So that I can access my account

  Scenario: Successful login with Google
    Given I am on the login page
    When I click on the "Login with Google" button
    And I authorize the application with my Google account
    Then I should be redirected to the dashboard
```

## Step Definitions

Step definitions connect the Gherkin steps to actual code. These are located in `e2e-tests/tests/step-definitions/`.

The step definitions follow this pattern:
```javascript
Given('I am on the login page', async function() {
  const { page } = this;
  await page.goto('http://localhost:3001/auth');
});

When('I click on the {string} button', async function(buttonText) {
  const { page } = this;
  await page.click(`button:has-text("${buttonText}")`);
});
```

## How It Works

1. The Gherkin feature files define what to test in business language
2. Step definitions map each step to automation code
3. The Cucumber runner executes each scenario
4. Visual feedback is provided in the browser
5. Test reports are generated

## Using Data Tables

For data-driven scenarios, Cucumber data tables can be used:

```gherkin
Scenario: Multiple users with different roles
  Given the following users exist in the database:
    | email        | role     |
    | user1@example.com | admin    |
    | user2@example.com | standard |
  When I log in as "user2@example.com"
  Then I should see standard user permissions
```

In step definitions:
```javascript
Given('the following users exist in the database:', async function(dataTable) {
  // Access the data with dataTable.hashes()
  const users = dataTable.hashes();
  for (const user of users) {
    // Create users in test database
  }
});
```

## Writing New Tests

To add a new test:

1. Create a new `.feature` file or add to an existing one
2. Define scenarios with Given/When/Then steps
3. Create step definitions if they don't exist
4. Run the test with `npm run test:e2e:cucumber`

## Visual Helpers

The tests include visual helpers:
- Steps are displayed in the browser
- Elements being interacted with are highlighted
- Test results appear on screen

## Persistent Browser Mode

In persistent browser mode:
- The browser stays open between scenarios
- DevTools is available for debugging
- Steps are logged to the console
- The test execution is slowed down for visibility

## Tips for Writing Good Cucumber Tests

1. **Keep scenarios focused** on a single piece of functionality
2. **Use clear, concise language** that non-technical stakeholders can understand
3. **Reuse step definitions** across features for consistency
4. **Add comments** with the "# " syntax for clarification
5. **Use backgrounds** for common setup steps
6. **Use scenario outlines** for data-driven tests
7. **Tag scenarios** with "@tags" for selective running

## Debugging Failed Tests

If a test fails:
1. Run in persistent mode: `npm run test:e2e:cucumber:persistent`
2. Use the browser DevTools to inspect the page
3. Check the step definitions for the failing step
4. Consider adding more logging or screenshots

## Integration with CI/CD

Tests can be run in headless mode for CI/CD by modifying the Cucumber configuration in `cucumber.js` to add a CI profile.

## Extending the Framework

The framework can be extended with:
- Custom step definitions for domain-specific actions
- Hooks for setup/teardown actions
- Page objects for complex pages
- Custom world properties for sharing state
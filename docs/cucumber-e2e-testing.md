# Cucumber E2E Testing Guide

This document explains how to write and run end-to-end tests using Cucumber and Gherkin for the EBIZ platform.

## Getting Started

1. First, run the cleanup script to ensure the project is set up correctly:
   ```bash
   cd e2e-tests
   ./cleanup.sh
   ```

2. You can validate your feature files without running the application:
   ```bash
   npm run test:e2e:dry
   ```

3. Run the tests with the application running:
   ```bash
   # Start the application in a separate terminal
   npm run dev
   
   # In another terminal, run the tests
   npm run test:e2e
   ```

## What is Cucumber and Gherkin?

Cucumber is a testing tool that supports Behavior-Driven Development (BDD). It allows you to write test cases in a natural language format called Gherkin. This makes tests readable by business stakeholders and non-technical team members.

Gherkin uses a set of special keywords to give structure and meaning to executable specifications:
- **Feature**: A description of the feature being tested
- **Scenario**: A specific test case
- **Given**: The precondition/setup
- **When**: The action taken
- **Then**: The expected outcome
- **And**, **But**: Additional conditions

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all Cucumber tests |
| `npm run test:e2e:auth` | Run authentication tests |
| `npm run test:e2e:bank` | Run bank account tests |
| `npm run test:e2e:dashboard` | Run dashboard tests |
| `npm run test:e2e:transactions` | Run transactions tests |
| `npm run test:e2e:documents` | Run documents tests |
| `npm run test:e2e:settings` | Run settings tests |
| `npm run test:e2e:ui` | Run tests with visible browser |
| `npm run test:e2e:debug` | Run tests with DevTools open |
| `npm run test:e2e:dry` | Validate Gherkin syntax without running tests |
| `npm run test:e2e:clean` | Run cleanup script |

## Test Location and Organization

- **Feature files**: Located in `e2e-tests/tests/features/`
- **Step definitions**: Located in `e2e-tests/tests/step-definitions/`

## Writing Tests

### 1. Create a Feature File

Create a `.feature` file in the `e2e-tests/tests/features/` directory. For example:

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
    And I should see my Google profile picture in the sidebar
```

### 2. Implement Step Definitions

For each step in your Gherkin scenarios, you need a corresponding JavaScript implementation. These go in `e2e-tests/tests/step-definitions/` files:

```javascript
// In authentication.steps.js
Given('the EBIZ-Saas application is running', async function() {
  const { page } = this;
  await page.goto('http://localhost:3001');
});

When('I click on the {string} button', async function(buttonText) {
  const { page } = this;
  await page.click(`button:has-text("${buttonText}")`);
});
```

## Visual Feedback

Our Cucumber setup includes visual helpers in the browser:
- Steps are displayed in a panel at the bottom-left of the screen
- Elements being interacted with are highlighted
- Test progress and results are shown

## Persistent Browser Mode

For easier debugging, we offer a "persistent browser" mode that:
- Keeps the browser open between scenarios
- Opens DevTools automatically
- Shows clear visual indicators for test boundaries
- Adds extra time between steps for better visibility

Run it with:
```bash
npm run test:e2e:persistent
```

## Using Data Tables

For data-driven testing, you can use tables in your Gherkin scenarios:

```gherkin
Scenario: Multiple users with different roles
  Given the following users exist in the database:
    | email              | role    |
    | admin@example.com  | admin   |
    | user@example.com   | standard |
  When I log in as "user@example.com"
  Then I should see standard user permissions
```

## Debugging Failed Tests

If a test fails:
1. Run in persistent mode: `npm run test:e2e:persistent`
2. Check the browser console for error messages
3. Look at the highlighted steps to see where it failed
4. Review the step implementation in the step definition file

## Best Practices

1. Write scenarios from a user's perspective
2. Keep scenarios focused on one piece of functionality
3. Make steps reusable across features
4. Use consistent language and terminology
5. Organize features by business domain
6. Add comments using `# comment text` in feature files when needed
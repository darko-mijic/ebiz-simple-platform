# E2E Testing Strategy: Executable Specification for EBIZ Platform

## Introduction

This document outlines our comprehensive strategy for end-to-end (E2E) testing within the EBIZ Simple Platform. The goal is to establish E2E tests as a form of executable specification - tests that not only verify functionality but also serve as living documentation of system requirements and expected behaviors.

## Testing Philosophy

Our testing approach follows these key principles:

1. **Tests as Specifications**: E2E tests should document expected behavior in business terms
2. **Full-Stack Coverage**: Tests should validate the entire system, from UI through backend to database
3. **Automation First**: All critical workflows must have automated test coverage
4. **Consistent Environments**: Tests must run consistently across development, CI/CD, and staging
5. **Maintainability**: Tests should be as easy to maintain as production code

## Test Infrastructure Architecture

### Overall Structure

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Gherkin Specs  │────▶│  Test Runners   │────▶│ Backend & UI    │
│  (.feature)     │     │  (Playwright)   │     │ (Full Stack)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Test Fixtures  │◀───▶│  Test Actions   │◀───▶│ Database State  │
│  (Test Data)    │     │  (Step Defs)    │     │ (Test DB)       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components

1. **Gherkin Feature Files**: Human-readable, business-focused specifications
2. **Playwright Test Runner**: Executes tests across multiple browsers
3. **Step Definitions**: Translates Gherkin statements into test actions
4. **Test Fixtures**: Predefined test data for consistent testing
5. **Database Seeding**: Scripts to prepare database state for tests
6. **Visual Testing**: Screenshot comparison for UI regression testing

## Implementation Details

### 1. Gherkin Feature Files

We use the Gherkin syntax for its readability and ability to express business requirements. Example:

```gherkin
Feature: User Authentication
  As a user of EBIZ platform
  I want to securely log in with my Google account
  So that I can access my financial data

  Background:
    Given the EBIZ application is running

  Scenario: Successful login with Google
    When I click on the "Login with Google" button
    And I authorize with my Google account
    Then I should be redirected to the dashboard
    And I should see my profile information in the header
```

### 2. Test Environment Setup

Each test run requires a consistent environment:

1. **Isolated Database**:
   - Each test run uses a clean database instance
   - Database schema is automatically updated to latest version
   - Base seed data is loaded (standard lookups, configurations)

2. **Service Dependencies**:
   - Local services run in Docker containers
   - External services are mocked (payment providers, email, etc.)

3. **Test Configuration**:
   - Environment-specific configuration via `.env.test`
   - Feature flags set to predictable values

### 3. Database Seeding Strategy

Database seeding follows a layered approach:

1. **Base Schema**: Database migrations create the base schema
2. **Reference Data**: Lookup tables, configurations, and static data
3. **Test-Specific Data**: Data needed for specific test scenarios

Seeding commands:

```bash
# Reset test database to clean state
npm run db:reset:test

# Apply all migrations
npx prisma migrate deploy

# Seed reference data
npx prisma db seed --preview-feature

# Seed test-specific data
npm run db:seed:test
```

### 4. Authentication Strategy for Tests

Testing authentication requires special handling:

1. **OAuth Mocking**:
   - For Google OAuth, we mock the external authentication provider
   - Test-specific routes bypass OAuth in the testing environment
   - JWT tokens are generated directly for authenticated test scenarios

2. **User Personas**:
   - Predefined user personas with different roles and permissions
   - Each persona has consistent test data across the system

```typescript
// Example authentication helper
async function loginAs(page, persona = 'standard-user') {
  // Load persona data
  const userData = testUsers[persona];
  
  // Call test-only endpoint to generate auth token
  const response = await page.request.post('/api/auth/test-login', {
    data: userData
  });
  
  // Set auth token in storage
  const authData = await response.json();
  await page.evaluate(token => {
    localStorage.setItem('auth_token', token);
  }, authData.accessToken);
  
  // Navigate to an authenticated route
  await page.goto('/dashboard');
}
```

### 5. Test Data Management

Test data is organized by domain and managed through fixtures:

```
e2e-tests/
├── fixtures/
│   ├── users/
│   │   ├── admin-user.json
│   │   ├── finance-user.json
│   │   └── standard-user.json
│   ├── companies/
│   │   ├── acme-corp.json
│   │   └── small-business.json
│   └── transactions/
│       ├── simple-invoice.json
│       └── monthly-expenses.json
```

### 6. Command Patterns for Step Definitions

We implement common test actions as reusable commands:

```typescript
// Navigate through multi-step forms
async function completeOnboardingSteps(page, userData, companyData) {
  // Personal information step
  await page.fill('[data-testid="first-name"]', userData.firstName);
  await page.fill('[data-testid="last-name"]', userData.lastName);
  await page.click('[data-testid="next-button"]');
  
  // Company information step
  await page.fill('[data-testid="company-name"]', companyData.name);
  await page.fill('[data-testid="vat-id"]', companyData.vatId);
  await page.click('[data-testid="complete-button"]');
  
  // Wait for completion
  await page.waitForURL('**/dashboard');
}
```

### 7. Visual Testing Strategy

For UI-heavy features, we implement visual regression testing:

1. **Baseline Screenshots**: Captured for key UI states
2. **Comparison Threshold**: Set to allow minor pixel differences
3. **Responsive Testing**: Multiple viewport sizes for each test

```typescript
// Example visual test
test('dashboard layout matches design', async ({ page }) => {
  await loginAs(page, 'standard-user');
  await page.goto('/dashboard');
  
  // Wait for all dynamic content to load
  await page.waitForSelector('[data-testid="dashboard-loaded"]');
  
  // Compare with baseline screenshot with 0.5% tolerance
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixelRatio: 0.005
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

Tests are integrated into our CI/CD pipeline via GitHub Actions:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: ebiz_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
          
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Setup test database
        run: |
          npm run db:reset:test
          npx prisma migrate deploy
          npx prisma db seed --preview-feature
          
      - name: Start frontend and backend
        run: |
          npm run start:test &
          sleep 10
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

### Parallelization Strategy

For faster test execution in CI/CD:

1. **Test Sharding**: Split test suite into parallel shards
2. **Browser Matrix**: Run subsets of tests on different browsers
3. **Smoke Tests**: Run critical tests on every PR, full suite on main branch

## Test Reporting

Comprehensive test reporting includes:

1. **HTML Reports**: Human-readable test results with screenshots
2. **JUnit XML**: Machine-readable test results for CI/CD integration
3. **Video Recordings**: Videos of failed tests for debugging
4. **Trace Files**: Detailed trace information for complex failures

## Database Isolation Techniques

To ensure test independence:

1. **Schema-Per-Test**: Each test gets a unique schema in shared database
2. **Transaction Rollback**: Tests run in transactions that are rolled back
3. **Container Approach**: Spin up dedicated database containers

Example implementation of schema-per-test:

```typescript
// in global setup
async function createTestSchema() {
  const schemaName = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  await prisma.$executeRaw`CREATE SCHEMA ${schemaName}`;
  process.env.TEST_SCHEMA = schemaName;
  
  // Configure Prisma to use this schema
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', schemaName);
  process.env.DATABASE_URL = url.toString();
  
  // Apply migrations to this schema
  await exec('npx prisma migrate deploy');
}

// in global teardown
async function dropTestSchema() {
  const schemaName = process.env.TEST_SCHEMA;
  await prisma.$executeRaw`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`;
}
```

## Mocking Strategy

External dependencies are mocked for reliability:

1. **API Mocking**: Intercept external API calls and return controlled responses
2. **Service Virtualization**: Mock entire services where needed
3. **Selective Mocking**: Only mock what's necessary for each test

Example API mocking:

```typescript
// Mock VAT validation API
await page.route('**/api/vat-validation', async route => {
  const request = route.request();
  const requestData = JSON.parse(await request.postData() || '{}');
  
  // Return predetermined responses based on input
  if (requestData.vatId === 'DE123456789') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        valid: true,
        companyName: 'Test GmbH',
        address: 'Teststrasse 123, Berlin',
      })
    });
  } else {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        valid: false,
        error: 'Invalid VAT ID format'
      })
    });
  }
});
```

## Performance Testing Integration

Beyond functional tests, we incorporate basic performance metrics:

1. **Timing Measurements**: Record timing for critical operations
2. **Resource Monitoring**: Track memory and CPU usage during tests
3. **Threshold Enforcement**: Fail tests that exceed performance budgets

```typescript
test('dashboard loads within performance budget', async ({ page }) => {
  const startTime = Date.now();
  
  await loginAs(page, 'standard-user');
  await page.goto('/dashboard');
  
  // Wait for dashboard to be fully interactive
  await page.waitForSelector('[data-testid="dashboard-loaded"]');
  
  const loadTime = Date.now() - startTime;
  
  // Assert against performance budget
  expect(loadTime).toBeLessThan(3000); // 3 seconds maximum
});
```

## Maintenance Strategy

To keep tests maintainable over time:

1. **Page Object Pattern**: Encapsulate UI elements and interactions
2. **Descriptive Selectors**: Use data-testid attributes for stability
3. **Regular Review**: Periodic review of test coverage and flakiness
4. **Test Ownership**: Assign team ownership to different test areas

Example Page Object:

```typescript
// AuthPage.ts
export class AuthPage {
  constructor(private page: Page) {}
  
  async navigate() {
    await this.page.goto('/auth');
  }
  
  async loginWithGoogle() {
    await this.page.click('[data-testid="google-login-button"]');
  }
  
  async fillSignupForm(userData) {
    await this.page.fill('[data-testid="first-name"]', userData.firstName);
    await this.page.fill('[data-testid="last-name"]', userData.lastName);
    await this.page.fill('[data-testid="email"]', userData.email);
    await this.page.click('[data-testid="signup-button"]');
  }
  
  async isLoggedIn() {
    return await this.page.isVisible('[data-testid="user-avatar"]');
  }
}
```

## Conclusion

This E2E testing strategy establishes a framework for tests that serve as executable specifications. By following these guidelines, our tests will not only verify system functionality but also document business requirements in a way that remains accurate as the system evolves.

## Next Steps

1. **Implement Base Infrastructure**: Set up the core testing framework
2. **Create Initial Feature Files**: Document key user journeys
3. **Build Reusable Components**: Develop page objects and helper utilities
4. **Integrate with CI/CD**: Set up automated test runs
5. **Establish Review Process**: Include test review in PR process 
/**
 * Cucumber.js configuration
 */

module.exports = {
  // Default profile
  default: {
    paths: ['tests/features/'],
    require: ['tests/step-definitions/'],
    format: [
      'summary',
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    parallel: 1,
    retry: 0,
    publishQuiet: true,
    worldParameters: {
      baseUrl: process.env.FRONTEND_URL || 'http://localhost:3003',
      apiUrl: process.env.BACKEND_URL || 'http://localhost:3002',
      testEnv: process.env.TEST_ENV || 'local'
    }
  },
  
  // Debug profile - shows browser UI and adds more output
  debug: {
    paths: ['tests/features/'],
    require: ['tests/step-definitions/'],
    format: [
      'summary',
      'progress-bar',
      'html:reports/cucumber-report.html'
    ],
    parallel: 1,
    worldParameters: {
      baseUrl: process.env.FRONTEND_URL || 'http://localhost:3003',
      apiUrl: process.env.BACKEND_URL || 'http://localhost:3002',
      debug: true,
      headless: false,
      testEnv: process.env.TEST_ENV || 'local'
    },
    retry: 0,
    publishQuiet: false
  },
  
  // CI profile for GitHub Actions
  ci: {
    paths: ['tests/features/'],
    require: ['tests/step-definitions/'],
    format: [
      'summary',
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'junit:reports/junit.xml'
    ],
    parallel: 2, // Run up to 2 features in parallel
    retry: 1, // Retry failed scenarios once
    worldParameters: {
      baseUrl: process.env.FRONTEND_URL || 'http://localhost:3003',
      apiUrl: process.env.BACKEND_URL || 'http://localhost:3002',
      testEnv: 'ci'
    },
    publishQuiet: true
  },
  
  // Dry run profile - validate feature files without execution
  dry: {
    paths: ['tests/features/'],
    require: ['tests/step-definitions/'],
    format: [
      'summary',
      'progress-bar'
    ],
    parallel: 1,
    dryRun: true,
    publishQuiet: true
  },
  
  // Profile for generating step definition templates
  "generate-missing-steps": {
    paths: ['tests/features/'],
    require: ['tests/step-definitions/'],
    format: ['snippets'],
    dryRun: true,
    publishQuiet: true
  }
};
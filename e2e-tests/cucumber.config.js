const { When, Then, Given, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

// Configuration
setDefaultTimeout(60 * 1000); // Timeout in milliseconds

// Global configuration
const baseUrl = 'http://localhost:3001';
const apiUrl = 'http://localhost:3000';

// Helper to manage browser state between steps
let browser;
let context;
let page;

// Cucumber hooks
Before(async function() {
  // Launch the browser (non-headless for visibility)
  browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000, // slow down execution
    devtools: true // open DevTools for debugging
  });
  
  // Create a new context
  context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  
  // Create a new page
  page = await context.newPage();
  
  // Add page to world object for sharing between steps
  this.browser = browser;
  this.context = context;
  this.page = page;
});

After(async function() {
  // Close browser after each scenario (unless in persistent mode)
  const isPersistentMode = process.env.PERSISTENT_BROWSER === 'true';
  
  if (!isPersistentMode) {
    if (browser) {
      await browser.close();
    }
  } else {
    // In persistent mode, just navigate to a clean state
    await page.goto(`${baseUrl}/auth`);
  }
});

// Export the Cucumber configuration
module.exports = {
  // The directory containing your feature files
  paths: ['tests/features/*.feature'],
  
  // The directory containing your step definitions
  require: ['tests/step-definitions/*.js'],
  
  // Format options for test output
  format: [
    'summary',
    'progress-bar',
    ['html', { outputDir: './cucumber-report' }]
  ],
  
  // Publish test results to Cucumber Reports service
  publish: false,
  
  // Parallel execution configuration
  parallel: 1, // Set to 1 to disable parallel execution
  
  // Retry configuration
  retry: 0, // No retries by default
  
  // Tags configuration
  tags: '',
  
  // Environment variables
  env: {
    BASE_URL: baseUrl,
    API_URL: apiUrl
  }
};
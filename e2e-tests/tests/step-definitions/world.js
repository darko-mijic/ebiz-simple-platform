const { setWorldConstructor, World, Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables for testing
const envPath = path.resolve(__dirname, '../../.env.test');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Create a test run ID
const TEST_RUN_ID = uuidv4();
let globalBrowserInstance = null;

// Define a custom world class for sharing data between steps
class CustomWorld extends World {
  constructor(options) {
    super(options);
    
    // Set up parameters from cucumber.js or environment variables
    this.parameters = options.parameters || {};
    this.baseUrl = this.parameters.baseUrl || process.env.FRONTEND_URL || 'http://localhost:3003';
    this.apiUrl = this.parameters.apiUrl || process.env.BACKEND_URL || 'http://localhost:3002';
    this.debug = options.parameters && options.parameters.debug;
    this.headless = !(options.parameters && options.parameters.headless === false);
    this.testEnv = this.parameters.testEnv || process.env.TEST_ENV || 'local';
    
    // Test data
    this.testUser = {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123',
      googleId: process.env.MOCK_GOOGLE_USER_ID || '123456789',
      googleEmail: process.env.MOCK_GOOGLE_EMAIL || 'test-google@example.com',
      firstName: process.env.MOCK_GOOGLE_FIRST_NAME || 'Test',
      lastName: process.env.MOCK_GOOGLE_LAST_NAME || 'User',
    };
    
    this.testCompany = {
      name: process.env.TEST_COMPANY_NAME || 'Test Company Ltd',
      vatId: process.env.TEST_COMPANY_VAT || 'HR12345678901',
      localVatId: process.env.TEST_COMPANY_LOCAL_VAT || '12345678901',
    };
    
    // Runtime state
    this.testRunId = TEST_RUN_ID;
    this.scenarioName = '';
    this.featureName = '';
    this.browser = null;
    this.context = null;
    this.page = null;
    this.screenshotIndex = 0;
    
    // Create Prisma client for database access if needed
    this.prisma = null;
  }

  /**
   * Initialize database connection
   */
  async initDatabase() {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
    }
    return this.prisma;
  }

  /**
   * Setup browser, context and page for the test
   */
  async setup() {
    // Create or reuse browser instance
    if (globalBrowserInstance) {
      this.browser = globalBrowserInstance;
    } else {
      this.browser = await chromium.launch({
        headless: this.headless,
        slowMo: this.debug ? 500 : 0,
        devtools: this.debug
      });
      globalBrowserInstance = this.browser;
    }

    // Create context and page
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: this.testEnv === 'ci' ? { dir: 'reports/videos/' } : undefined,
    });

    this.page = await this.context.newPage();
    
    // Add helper methods
    await this.extendPage();

    return this.page;
  }

  /**
   * Extends the page with additional methods
   */
  async extendPage() {
    // Add highlight method to the page (useful for debugging)
    this.page.highlight = async function(selector) {
      if (typeof selector === 'string') {
        await this.evaluate(selector => {
          const element = document.querySelector(selector);
          if (!element) return;
          
          // Save original styles
          const originalOutline = element.style.outline;
          const originalBoxShadow = element.style.boxShadow;
          
          // Apply highlight
          element.style.outline = '3px solid #ffbb00';
          element.style.boxShadow = '0 0 10px rgba(255, 187, 0, 0.7)';
          
          // Restore original styles after duration
          setTimeout(() => {
            element.style.outline = originalOutline;
            element.style.boxShadow = originalBoxShadow;
          }, 1000);
        }, selector);
      } else {
        // Handle locator object
        try {
          await this.locator(selector).evaluate(element => {
            const originalOutline = element.style.outline;
            const originalBoxShadow = element.style.boxShadow;
            
            element.style.outline = '3px solid #ffbb00';
            element.style.boxShadow = '0 0 10px rgba(255, 187, 0, 0.7)';
            
            setTimeout(() => {
              element.style.outline = originalOutline;
              element.style.boxShadow = originalBoxShadow;
            }, 1000);
          });
        } catch (error) {
          console.log('Could not highlight element:', error);
        }
      }
    };
    
    // Add wait for network idle helper
    this.page.waitForNetworkIdle = async (timeout = 5000) => {
      return this.page.waitForLoadState('networkidle', { timeout });
    };
    
    // Add visit method that handles base URL
    this.page.visit = async (path) => {
      const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
      return this.page.goto(url);
    };
  }

  /**
   * Take a screenshot and save it to the reports directory
   */
  async takeScreenshot(name) {
    if (!this.page) return;
    
    this.screenshotIndex++;
    const screenshotName = name || `screenshot-${this.screenshotIndex}`;
    const safeFeatureName = (this.featureName || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '-');
    const safeScenarioName = (this.scenarioName || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '-');
    
    const dirPath = path.join('reports/screenshots', safeFeatureName, safeScenarioName);
    const filePath = path.join(dirPath, `${screenshotName}.png`);
    
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  /**
   * Teardown after test
   */
  async teardown() {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    
    // We don't close the browser here as we reuse it between scenarios
    this.page = null;
    
    // Close database connection if it was opened
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }
  }
}

// Register the custom world
setWorldConstructor(CustomWorld);

// Global Before Each Scenario hook
Before(async function(scenario) {
  // Store scenario information
  this.scenarioName = scenario.pickle.name;
  this.featureName = scenario.gherkinDocument.feature.name;
  
  // Setup browser and page
  await this.setup();
  
  // Create logs directory if running in debug mode
  if (this.debug) {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }
    
    // Log scenario start
    const logFile = path.join('logs', 'test-run.log');
    fs.appendFileSync(
      logFile,
      `\n[${new Date().toISOString()}] Starting scenario: ${this.featureName} - ${this.scenarioName}\n`,
    );
  }
});

// Global After Each Scenario hook
After(async function(scenario) {
  // Take screenshot on failure
  if (scenario.result.status === 'FAILED') {
    await this.takeScreenshot('failure');
  }
  
  // Teardown resources
  await this.teardown();
});

// BeforeAll hook to prepare test environment
BeforeAll(async function() {
  // Create reports directories if they don't exist
  const dirs = ['reports', 'reports/screenshots', 'reports/videos'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log(`🚀 Starting test run with ID: ${TEST_RUN_ID}`);
});

// AfterAll hook to clean up resources
AfterAll(async function() {
  if (globalBrowserInstance) {
    await globalBrowserInstance.close();
    globalBrowserInstance = null;
  }
  
  console.log(`✅ Completed test run with ID: ${TEST_RUN_ID}`);
});

module.exports = { CustomWorld };
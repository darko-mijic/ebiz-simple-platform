import { Page } from '@playwright/test';

/**
 * API Mock Helper
 * Provides utilities for mocking external API responses in tests
 */
export class ApiMockHelper {
  private page: Page;
  private baseUrl: string;
  private apiUrl: string;
  
  /**
   * Create a new API Mock Helper
   * @param page Playwright Page instance
   * @param baseApiUrl Base URL for the API (defaults to http://localhost:3000)
   */
  constructor(page: Page, baseApiUrl: string = 'http://localhost:3000') {
    this.page = page;
    this.apiUrl = baseApiUrl;
    this.baseUrl = 'http://localhost:3001';
  }
  
  /**
   * Initialize API mocks
   * Sets up common mocks used across tests
   */
  async setupCommonMocks(): Promise<void> {
    console.log('[ApiMock] Setting up common API mocks');
    
    // Set up auth check mock for authenticated state
    await this.mockAuthCheck(true);
    
    console.log('[ApiMock] Common API mocks set up successfully');
  }
  
  /**
   * Mock the auth check endpoint
   * @param isAuthenticated Whether the user should appear authenticated
   * @param userData Optional user data to return
   */
  async mockAuthCheck(isAuthenticated: boolean, userData?: any): Promise<void> {
    console.log(`[ApiMock] Mocking auth check: authenticated=${isAuthenticated}`);
    
    const defaultUser = userData || {
      id: 'mock-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      isOnboardingCompleted: true,
      profilePictureUrl: 'https://example.com/avatar.jpg',
    };
    
    await this.page.route(`${this.apiUrl}/auth/check`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isAuthenticated,
          user: isAuthenticated ? defaultUser : null,
        }),
      });
    });
  }
  
  /**
   * Mock the VAT validation endpoint
   * @param validVatIds Array of VAT IDs that should be considered valid
   */
  async mockVatValidation(validVatIds: string[] = ['DE123456789']): Promise<void> {
    console.log('[ApiMock] Mocking VAT validation endpoint');
    
    await this.page.route(`${this.apiUrl}/vat/validate`, async (route) => {
      const request = route.request();
      let requestData;
      
      try {
        requestData = JSON.parse(await request.postData() || '{}');
      } catch (e) {
        requestData = { vatId: '' };
      }
      
      const isValid = validVatIds.includes(requestData.vatId);
      
      if (isValid) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            companyName: 'Test Company GmbH',
            address: 'Test Street 123, Berlin',
            vatId: requestData.vatId,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: false,
            error: 'Invalid VAT ID format or non-existent company',
          }),
        });
      }
    });
  }
  
  /**
   * Mock the bank accounts endpoints
   * @param accounts Array of bank accounts to return
   */
  async mockBankAccounts(accounts: any[] = []): Promise<void> {
    console.log('[ApiMock] Mocking bank accounts endpoints');
    
    // Default test accounts if none provided
    const defaultAccounts = accounts.length > 0 ? accounts : [
      {
        id: 'acc-1',
        name: 'Business Account',
        accountNumber: 'DE89370400440532013000',
        balance: 12500.50,
        currency: 'EUR',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'acc-2',
        name: 'Savings Account',
        accountNumber: 'DE89370400440532013001',
        balance: 45000.75,
        currency: 'EUR',
        lastUpdated: new Date().toISOString(),
      },
    ];
    
    // Mock GET /bank-accounts endpoint
    await this.page.route(`${this.apiUrl}/bank-accounts`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(defaultAccounts),
        });
      } else if (route.request().method() === 'POST') {
        // Simulate creating a new account
        try {
          const requestData = JSON.parse(await route.request().postData() || '{}');
          
          const newAccount = {
            id: `acc-${Date.now()}`,
            ...requestData,
            balance: 0,
            lastUpdated: new Date().toISOString(),
          };
          
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(newAccount),
          });
        } catch (e) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Invalid request data' }),
          });
        }
      }
    });
    
    // Mock GET /bank-accounts/:id endpoint
    await this.page.route(`${this.apiUrl}/bank-accounts/*`, async (route) => {
      const id = route.request().url().split('/').pop();
      const account = defaultAccounts.find(acc => acc.id === id);
      
      if (account) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(account),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Account not found' }),
        });
      }
    });
  }
  
  /**
   * Mock the transactions endpoints
   * @param transactions Array of transactions to return
   */
  async mockTransactions(transactions: any[] = []): Promise<void> {
    console.log('[ApiMock] Mocking transactions endpoints');
    
    // Default test transactions if none provided
    const defaultTransactions = transactions.length > 0 ? transactions : [
      {
        id: 'trx-1',
        date: new Date().toISOString(),
        amount: 1250.00,
        currency: 'EUR',
        description: 'Invoice payment from Client A',
        category: 'Income',
        bankAccountId: 'acc-1',
        status: 'completed',
      },
      {
        id: 'trx-2',
        date: new Date(Date.now() - 86400000).toISOString(), // yesterday
        amount: -350.25,
        currency: 'EUR',
        description: 'Office supplies',
        category: 'Expense',
        bankAccountId: 'acc-1',
        status: 'completed',
      },
      {
        id: 'trx-3',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        amount: -1800.00,
        currency: 'EUR',
        description: 'Monthly rent',
        category: 'Rent',
        bankAccountId: 'acc-1',
        status: 'completed',
      },
    ];
    
    // Mock GET /transactions endpoint
    await this.page.route(`${this.apiUrl}/transactions*`, async (route) => {
      if (route.request().method() === 'GET') {
        // Support for filtering and pagination could be added here
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: defaultTransactions,
            total: defaultTransactions.length,
            page: 1,
            pageSize: 20,
          }),
        });
      }
    });
    
    // Mock GET /transactions/:id endpoint
    await this.page.route(`${this.apiUrl}/transactions/*`, async (route) => {
      const id = route.request().url().split('/').pop();
      const transaction = defaultTransactions.find(trx => trx.id === id);
      
      if (transaction) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(transaction),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Transaction not found' }),
        });
      }
    });
  }
  
  /**
   * Mock document upload endpoint
   */
  async mockDocumentUpload(): Promise<void> {
    console.log('[ApiMock] Mocking document upload endpoint');
    
    await this.page.route(`${this.apiUrl}/documents/upload`, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `doc-${Date.now()}`,
          filename: 'uploaded-document.pdf',
          contentType: 'application/pdf',
          size: 1024 * 1024 * 2, // 2MB
          uploadedAt: new Date().toISOString(),
          url: 'https://example.com/documents/uploaded-document.pdf',
        }),
      });
    });
  }
  
  /**
   * Mock a specific API endpoint with custom response
   * @param urlPattern URL pattern to match (string or RegExp)
   * @param response Response to return
   * @param method HTTP method to match (default: GET)
   */
  async mockEndpoint(
    urlPattern: string | RegExp,
    response: {
      status?: number;
      contentType?: string;
      body?: any;
      headers?: Record<string, string>;
    },
    method: string = 'GET'
  ): Promise<void> {
    console.log(`[ApiMock] Mocking endpoint: ${urlPattern.toString()}`);
    
    await this.page.route(urlPattern, async (route) => {
      if (route.request().method() === method) {
        await route.fulfill({
          status: response.status || 200,
          contentType: response.contentType || 'application/json',
          body: typeof response.body === 'string' 
            ? response.body 
            : JSON.stringify(response.body || {}),
          headers: response.headers || {},
        });
      } else {
        // Pass through non-matching methods
        await route.continue();
      }
    });
  }
  
  /**
   * Clear all mocks
   */
  async clearAllMocks(): Promise<void> {
    console.log('[ApiMock] Clearing all API mocks');
    await this.page.unrouteAll();
  }
}
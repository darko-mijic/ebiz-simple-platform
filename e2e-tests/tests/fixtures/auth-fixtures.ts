import { DbHelper } from '../utils/db-helper';

/**
 * Test data fixtures for authentication tests
 */
export const authTestFixtures = {
  users: {
    standard: {
      googleId: 'google-test-id-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      profilePictureUrl: 'https://example.com/profile.jpg',
      isOnboardingCompleted: false,
    },
    completed: {
      googleId: 'google-test-id-456',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      profilePictureUrl: 'https://example.com/jane.jpg',
      isOnboardingCompleted: true,
    },
    withPhone: {
      googleId: 'google-test-id-789',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1 (555) 123-4567',
      profilePictureUrl: 'https://example.com/bob.jpg',
      isOnboardingCompleted: false,
    },
    owner: {
      googleId: 'google-test-id-owner',
      firstName: 'Alice',
      lastName: 'Owner',
      email: 'alice.owner@example.com',
      profilePictureUrl: 'https://example.com/alice.jpg',
      isOnboardingCompleted: true,
    },
    manager: {
      googleId: 'google-test-id-manager',
      firstName: 'Charlie',
      lastName: 'Manager',
      email: 'charlie.manager@example.com',
      profilePictureUrl: 'https://example.com/charlie.jpg',
      isOnboardingCompleted: true,
    },
  },
  companies: {
    acme: {
      name: 'Acme Corporation',
      vatId: '123456789',
      euVatId: 'DE123456789',
      localVatId: '123456789',
      address: '123 Business St',
      city: 'Berlin',
      postalCode: '10115',
      country: 'Germany',
      industry: 'Technology',
    },
    smallBusiness: {
      name: 'Small Business GmbH',
      vatId: '987654321',
      euVatId: 'DE987654321',
      localVatId: '987654321',
      address: '456 Main St',
      city: 'Munich',
      postalCode: '80331',
      country: 'Germany',
      industry: 'Consulting',
    },
  },
};

/**
 * Auth fixtures generator for different test scenarios
 * Creates database fixtures for authentication-related tests
 */
export class AuthFixturesGenerator {
  private dbHelper: DbHelper;
  private testId: string;
  
  constructor() {
    // Generate a unique ID for this test run to avoid conflicts
    this.testId = `auth_fixtures_${Date.now()}`;
    this.dbHelper = new DbHelper(this.testId);
  }
  
  /**
   * Initialize database schema for tests
   */
  async init(): Promise<void> {
    console.log('[AuthFixtures] Initializing test schema');
    await this.dbHelper.initTestSchema();
  }
  
  /**
   * Clean up the database after tests
   */
  async cleanup(): Promise<void> {
    console.log('[AuthFixtures] Cleaning up test schema');
    await this.dbHelper.cleanupTestSchema();
  }
  
  /**
   * Create fixtures for "Successful login with Google" scenario
   * Scenario: User has already completed onboarding and can log in
   * @returns The created user data
   */
  async createSuccessfulLoginFixtures(): Promise<any> {
    console.log('[AuthFixtures] Creating successful login fixtures');
    
    // Use the convenience method to create a complete user profile
    const { user, company } = await this.dbHelper.createCompleteUserProfile({
      ...authTestFixtures.users.completed,
      companyName: authTestFixtures.companies.acme.name,
      vatId: authTestFixtures.companies.acme.vatId,
      industry: authTestFixtures.companies.acme.industry,
      country: authTestFixtures.companies.acme.country,
    });
    
    return { user, company };
  }
  
  /**
   * Create fixtures for "Network error during Google authentication" scenario
   * (No database fixtures needed as this simulates a network error)
   */
  async createNetworkErrorFixtures(): Promise<void> {
    console.log('[AuthFixtures] No fixtures needed for network error scenario');
    // This scenario doesn't require database fixtures
    // as it's testing behavior when network errors occur
    return;
  }
  
  /**
   * Create fixtures for "First-time user onboarding" scenario
   * Scenario: User has authenticated but not completed onboarding
   * @returns The created user data
   */
  async createFirstTimeUserFixtures(): Promise<any> {
    console.log('[AuthFixtures] Creating first-time user fixtures');
    
    // Create a user who has not completed onboarding
    const user = await this.dbHelper.seedTestUser({
      ...authTestFixtures.users.standard,
    });
    
    return { user };
  }
  
  /**
   * Create fixtures for "Returning user with completed onboarding" scenario
   * Scenario: User has completed onboarding and should go directly to dashboard
   * @returns The created user and company data
   */
  async createReturningUserFixtures(): Promise<any> {
    console.log('[AuthFixtures] Creating returning user fixtures');
    
    // Use the convenience method to create a complete user profile
    const { user, company } = await this.dbHelper.createCompleteUserProfile({
      ...authTestFixtures.users.completed,
      companyName: authTestFixtures.companies.acme.name,
      vatId: authTestFixtures.companies.acme.vatId,
      industry: authTestFixtures.companies.acme.industry,
      country: authTestFixtures.companies.acme.country,
    });
    
    return { user, company };
  }
  
  /**
   * Create fixtures for "Completing user onboarding with valid information" scenario
   * Scenario: User has authenticated but not completed onboarding and now completes it
   * @returns The created user data
   */
  async createOnboardingCompletionFixtures(): Promise<any> {
    console.log('[AuthFixtures] Creating onboarding completion fixtures');
    
    // Create a user who has not completed onboarding
    const user = await this.dbHelper.seedTestUser({
      ...authTestFixtures.users.standard,
    });
    
    return { user };
  }
  
  /**
   * Create fixtures for "Completing user onboarding with optional phone number" scenario
   * Scenario: User has authenticated with phone number and completes onboarding
   * @returns The created user data
   */
  async createOnboardingWithPhoneFixtures(): Promise<any> {
    console.log('[AuthFixtures] Creating onboarding with phone fixtures');
    
    // Create a user with phone number who has not completed onboarding
    const user = await this.dbHelper.seedTestUser({
      ...authTestFixtures.users.withPhone,
    });
    
    return { user };
  }
  
  /**
   * Create fixtures for "Attempting onboarding with invalid VAT ID" scenario
   * (No special database fixtures needed beyond standard user)
   * @returns The created user data
   */
  async createInvalidVatIdFixtures(): Promise<any> {
    console.log('[AuthFixtures] Creating invalid VAT ID fixtures');
    
    // Create a standard user who has not completed onboarding
    const user = await this.dbHelper.seedTestUser({
      ...authTestFixtures.users.standard,
    });
    
    return { user };
  }
  
  /**
   * Create fixtures for "Logout functionality" scenario
   * Scenario: User is logged in and logs out
   * @returns The created user and company data
   */
  async createLogoutFixtures(): Promise<any> {
    console.log('[AuthFixtures] Creating logout fixtures');
    
    // Use the convenience method to create a complete user profile
    const { user, company } = await this.dbHelper.createCompleteUserProfile({
      ...authTestFixtures.users.completed,
      companyName: authTestFixtures.companies.acme.name,
      vatId: authTestFixtures.companies.acme.vatId,
      industry: authTestFixtures.companies.acme.industry,
      country: authTestFixtures.companies.acme.country,
    });
    
    return { user, company };
  }
  
  /**
   * Create fixtures for "Multiple users with different roles in the same company" scenario
   * Scenario: Different users with different roles in the same company
   * @returns The created users and company data
   */
  async createMultipleUsersFixtures(): Promise<any> {
    console.log('[AuthFixtures] Creating multiple users fixtures');
    
    // Create a company
    const company = await this.dbHelper.seedTestCompany({
      ...authTestFixtures.companies.acme,
    });
    
    // Create owner user
    const ownerUser = await this.dbHelper.seedTestUser({
      ...authTestFixtures.users.owner,
    });
    
    // Create manager user
    const managerUser = await this.dbHelper.seedTestUser({
      ...authTestFixtures.users.manager,
    });
    
    // Associate owner with company
    await this.dbHelper.associateUserWithCompany(
      ownerUser.id,
      company.id,
      'OWNER',
      true
    );
    
    // Associate manager with company
    await this.dbHelper.associateUserWithCompany(
      managerUser.id,
      company.id,
      'MANAGER',
      true
    );
    
    return { ownerUser, managerUser, company };
  }
  
  /**
   * Verify if a user exists in the database
   * @param email Email to check
   * @returns Boolean indicating if user exists
   */
  async verifyUserExists(email: string): Promise<boolean> {
    return await this.dbHelper.verifyUserExists({ email });
  }
  
  /**
   * Get detailed user information
   * @param email Email to look up
   * @returns User data or null
   */
  async getUserDetails(email: string): Promise<any> {
    return await this.dbHelper.getUserByEmail(email);
  }
} 
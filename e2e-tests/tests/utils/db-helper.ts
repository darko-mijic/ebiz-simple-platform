import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

/**
 * Database helper for E2E tests
 * Provides utilities for database operations during tests including:
 * - Schema creation and isolation using the schema-per-test approach
 * - Database seeding with proper fixtures
 * - Data verification for test assertions
 */
export class DbHelper {
  private prisma: PrismaClient;
  private schemaName: string;
  private originalUrl: string;
  private testUrl: string;
  
  /**
   * Creates a new DbHelper instance
   * @param testId Optional unique identifier for this test run
   */
  constructor(testId?: string) {
    // Generate a unique schema name to ensure test isolation
    this.schemaName = `test_${testId || uuidv4().replace(/-/g, '')}_${Date.now()}`;
    this.originalUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebiz';
    this.testUrl = this.originalUrl + `?schema=${this.schemaName}`;
    
    // Create initial Prisma client
    this.prisma = new PrismaClient();
  }
  
  /**
   * Initialize a fresh test schema
   * This provides test isolation by creating a unique schema per test
   */
  async initTestSchema(): Promise<void> {
    try {
      console.log(`[DbHelper] Creating test schema: ${this.schemaName}`);
      
      // Create a new schema for this test
      await this.prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${this.schemaName}"`);
      
      // Disconnect the current client
      await this.prisma.$disconnect();
      
      // Create a new client with the test schema
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.testUrl
          }
        }
      });
      
      // Set environment variable for Prisma to use this schema
      process.env.DATABASE_URL = this.testUrl;
      
      // Run migrations on this schema
      console.log('[DbHelper] Applying migrations to test schema');
      await this.applyMigrations();
      
      // Apply seed data
      await this.seedBaseData();
      
      console.log('[DbHelper] Test schema initialized successfully');
    } catch (error) {
      console.error('[DbHelper] Failed to initialize test schema:', error);
      throw error;
    }
  }
  
  /**
   * Apply database migrations to the test schema
   * This uses Prisma's migration engine to apply all migrations to our test schema
   */
  private async applyMigrations(): Promise<void> {
    try {
      // Determine the project root directory to run prisma commands
      const projectRoot = this.findBackendRoot();
      
      if (!projectRoot) {
        console.warn('[DbHelper] Could not find backend directory, falling back to manual schema creation');
        await this.createSchemaTables();
        return;
      }
      
      // Set a temporary .env file with our test schema URL for prisma migrate to use
      const envPath = path.join(projectRoot, '.env.test');
      fs.writeFileSync(envPath, `DATABASE_URL=${this.testUrl}\n`);
      
      try {
        // Run prisma migrate deploy to apply all migrations
        const { stdout, stderr } = await execAsync(
          `npx prisma migrate deploy --schema=${path.join(projectRoot, 'prisma', 'schema.prisma')}`,
          { 
            env: { ...process.env, DATABASE_URL: this.testUrl },
            cwd: projectRoot
          }
        );
        
        if (stdout) console.log('[DbHelper] Migration output:', stdout);
        if (stderr) console.error('[DbHelper] Migration errors:', stderr);
        
        console.log('[DbHelper] Migrations applied successfully');
      } catch (error) {
        console.error('[DbHelper] Error running prisma migrate:', error);
        console.log('[DbHelper] Falling back to manual schema creation');
        await this.createSchemaTables();
      } finally {
        // Clean up the temporary .env file
        if (fs.existsSync(envPath)) {
          fs.unlinkSync(envPath);
        }
      }
    } catch (error) {
      console.error('[DbHelper] Error applying migrations:', error);
      throw error;
    }
  }
  
  /**
   * Find the backend directory where Prisma schema is located
   */
  private findBackendRoot(): string | null {
    // Start from current directory and go up to find the backend directory
    const findBackend = (dir: string): string | null => {
      // Check if prisma/schema.prisma exists in this directory
      const prismaPath = path.join(dir, 'prisma', 'schema.prisma');
      if (fs.existsSync(prismaPath)) {
        return dir;
      }
      
      // Check for package.json to see if it's a backend directory
      const packagePath = path.join(dir, 'package.json');
      if (fs.existsSync(packagePath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          if (packageJson.name === '@ebiz/backend') {
            return dir;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Go up one directory
      const parentDir = path.dirname(dir);
      if (parentDir === dir) {
        // We've reached the root, stop searching
        return null;
      }
      
      return findBackend(parentDir);
    };
    
    return findBackend(process.cwd());
  }
  
  /**
   * Fallback method to create tables manually if Prisma migrations fail
   * This creates the essential tables needed for tests to run
   */
  private async createSchemaTables(): Promise<void> {
    try {
      console.log('[DbHelper] Creating schema tables manually');
      
      // Create users table
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${this.schemaName}"."User" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "googleId" TEXT UNIQUE,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "email" TEXT NOT NULL UNIQUE,
          "phone" TEXT,
          "profilePictureUrl" TEXT,
          "isOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create UserSettings table
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${this.schemaName}"."UserSettings" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID NOT NULL UNIQUE,
          "primaryCurrency" TEXT NOT NULL DEFAULT 'EUR',
          "language" TEXT NOT NULL DEFAULT 'en',
          "theme" TEXT NOT NULL DEFAULT 'light',
          "dashboardLayout" JSONB,
          "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "${this.schemaName}"."User"("id") ON DELETE CASCADE
        )
      `);
      
      // Create Company table
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${this.schemaName}"."Company" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" TEXT NOT NULL,
          "vatId" TEXT,
          "euVatId" TEXT,
          "localVatId" TEXT NOT NULL,
          "address" TEXT,
          "city" TEXT,
          "postalCode" TEXT,
          "country" TEXT,
          "industry" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Company_localVatId_key" UNIQUE ("localVatId")
        )
      `);
      
      // Create UserCompany join table
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${this.schemaName}"."UserCompany" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID NOT NULL,
          "companyId" UUID NOT NULL,
          "role" TEXT NOT NULL,
          "isDefault" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "${this.schemaName}"."User"("id") ON DELETE CASCADE,
          CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "${this.schemaName}"."Company"("id") ON DELETE CASCADE,
          CONSTRAINT "UserCompany_userId_companyId_key" UNIQUE ("userId", "companyId")
        )
      `);
      
      console.log('[DbHelper] Schema tables created successfully');
    } catch (error) {
      console.error('[DbHelper] Error creating schema tables:', error);
      throw error;
    }
  }
  
  /**
   * Seed the database with base data
   * This provides common lookup data needed for all tests
   */
  async seedBaseData(): Promise<void> {
    try {
      console.log('[DbHelper] Seeding base data for tests');
      
      // Add base reference data here as needed
      // For example, creating default roles, industries, etc.
      // This is test data that all tests can rely on being present
      
      console.log('[DbHelper] Base data seeding complete');
    } catch (error) {
      console.error('[DbHelper] Error seeding base data:', error);
      throw error;
    }
  }
  
  /**
   * Seed the database with a test user
   * @param userData User data to create
   * @returns The created user
   */
  async seedTestUser(userData: {
    googleId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePictureUrl?: string;
    isOnboardingCompleted?: boolean;
  }): Promise<any> {
    try {
      // Default values
      const userDataWithDefaults = {
        isOnboardingCompleted: false,
        ...userData,
      };
      
      console.log(`[DbHelper] Seeding test user: ${userData.email}`);
      
      // Create user
      const user = await this.prisma.User.create({
        data: {
          ...userDataWithDefaults,
          UserSettings: {
            create: {
              primaryCurrency: 'EUR',
              language: 'en',
              theme: 'light',
              notificationsEnabled: true,
            }
          }
        },
        include: {
          UserSettings: true,
        }
      });
      
      console.log(`[DbHelper] Test user created with ID: ${user.id}`);
      return user;
    } catch (error) {
      console.error('[DbHelper] Error seeding test user:', error);
      throw error;
    }
  }
  
  /**
   * Seed the database with a test company
   * @param companyData Company data to create
   * @returns The created company
   */
  async seedTestCompany(companyData: {
    name: string;
    vatId?: string;
    euVatId?: string;
    localVatId?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    industry?: string;
  }): Promise<any> {
    try {
      // Ensure localVatId is present
      const companyDataWithDefaults = {
        ...companyData,
        localVatId: companyData.localVatId || companyData.vatId || `test-vat-${Date.now()}`,
      };
      
      console.log(`[DbHelper] Seeding test company: ${companyDataWithDefaults.name}`);
      
      const company = await this.prisma.Company.create({
        data: companyDataWithDefaults
      });
      
      console.log(`[DbHelper] Test company created with ID: ${company.id}`);
      return company;
    } catch (error) {
      console.error('[DbHelper] Error seeding test company:', error);
      throw error;
    }
  }
  
  /**
   * Associate a user with a company
   * @param userId User ID
   * @param companyId Company ID
   * @param role User's role in the company
   * @param isDefault Whether this is the user's default company
   * @returns The created user-company association
   */
  async associateUserWithCompany(
    userId: string,
    companyId: string,
    role: string = 'OWNER',
    isDefault: boolean = true
  ): Promise<any> {
    try {
      console.log(`[DbHelper] Associating user ${userId} with company ${companyId}`);
      
      const userCompany = await this.prisma.UserCompany.create({
        data: {
          userId,
          companyId,
          role,
          isDefault,
        }
      });
      
      // If this is the default company and the user hasn't completed onboarding,
      // mark onboarding as completed
      if (isDefault) {
        await this.completeUserOnboarding(userId);
      }
      
      console.log(`[DbHelper] User-company association created with ID: ${userCompany.id}`);
      return userCompany;
    } catch (error) {
      console.error('[DbHelper] Error associating user with company:', error);
      throw error;
    }
  }
  
  /**
   * Complete a user's onboarding
   * @param userId User ID to mark as onboarded
   * @returns The updated user
   */
  async completeUserOnboarding(userId: string): Promise<any> {
    try {
      console.log(`[DbHelper] Completing onboarding for user: ${userId}`);
      
      const updatedUser = await this.prisma.User.update({
        where: { id: userId },
        data: {
          isOnboardingCompleted: true,
        }
      });
      
      console.log(`[DbHelper] User onboarding completed: ${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      console.error('[DbHelper] Error completing user onboarding:', error);
      throw error;
    }
  }
  
  /**
   * Create a complete user profile with company and settings
   * This is a convenience method to create everything needed for a fully onboarded user
   */
  async createCompleteUserProfile(userData: {
    googleId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePictureUrl?: string;
    role?: string;
    companyName: string;
    vatId?: string;
    industry?: string;
    country?: string;
  }): Promise<any> {
    try {
      console.log(`[DbHelper] Creating complete user profile for: ${userData.email}`);
      
      // Create the user
      const user = await this.seedTestUser({
        googleId: userData.googleId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        profilePictureUrl: userData.profilePictureUrl,
        isOnboardingCompleted: false, // Will be set to true after company association
      });
      
      // Create the company
      const company = await this.seedTestCompany({
        name: userData.companyName,
        vatId: userData.vatId,
        localVatId: userData.vatId,
        industry: userData.industry,
        country: userData.country,
      });
      
      // Associate user with company
      await this.associateUserWithCompany(
        user.id,
        company.id,
        userData.role || 'OWNER',
        true
      );
      
      // Get the complete user profile
      const completeProfile = await this.getUserByEmail(userData.email);
      
      console.log(`[DbHelper] Complete user profile created for: ${userData.email}`);
      return { user: completeProfile, company };
    } catch (error) {
      console.error('[DbHelper] Error creating complete user profile:', error);
      throw error;
    }
  }
  
  /**
   * Get a user by email
   * @param email User email to look up
   * @returns The user or null if not found
   */
  async getUserByEmail(email: string): Promise<any> {
    try {
      return await this.prisma.User.findUnique({
        where: { email },
        include: {
          UserSettings: true,
          companies: {
            include: {
              Company: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('[DbHelper] Error finding user by email:', error);
      throw error;
    }
  }
  
  /**
   * Get a user by Google ID
   * @param googleId Google ID to look up
   * @returns The user or null if not found
   */
  async getUserByGoogleId(googleId: string): Promise<any> {
    try {
      return await this.prisma.User.findUnique({
        where: { googleId },
        include: {
          UserSettings: true,
          companies: {
            include: {
              Company: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('[DbHelper] Error finding user by Google ID:', error);
      throw error;
    }
  }
  
  /**
   * Verify if a user exists with the given criteria
   * @param criteria Criteria to check
   * @returns Boolean indicating if user exists
   */
  async verifyUserExists(criteria: { email?: string; googleId?: string }): Promise<boolean> {
    try {
      const user = await this.prisma.User.findFirst({
        where: criteria
      });
      
      return !!user;
    } catch (error) {
      console.error('[DbHelper] Error verifying user existence:', error);
      throw error;
    }
  }
  
  /**
   * Clean up the test schema
   * This should be called after tests complete
   */
  async cleanupTestSchema(): Promise<void> {
    try {
      console.log(`[DbHelper] Cleaning up test schema: ${this.schemaName}`);
      
      // Disconnect from the database
      await this.prisma.$disconnect();
      
      // Create a new client to drop the schema
      const cleanupClient = new PrismaClient();
      
      // Drop the schema
      await cleanupClient.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${this.schemaName}" CASCADE`);
      
      // Disconnect the cleanup client
      await cleanupClient.$disconnect();
      
      // Restore original environment variable
      process.env.DATABASE_URL = this.originalUrl;
      
      console.log('[DbHelper] Test schema cleanup complete');
    } catch (error) {
      console.error('[DbHelper] Error cleaning up test schema:', error);
      // Don't throw the error here to avoid failing tests during cleanup
      console.error(error);
    }
  }
  
  /**
   * Run a query against the database to verify a condition
   * @param query The SQL query to run
   * @returns The query result
   */
  async verifyDatabaseState(query: string): Promise<any> {
    try {
      const result = await this.prisma.$queryRawUnsafe(query);
      return result;
    } catch (error) {
      console.error('[DbHelper] Error verifying database state:', error);
      throw error;
    }
  }
  
  /**
   * Create test data for multiple user scenarios
   * @param count Number of users to create
   * @returns Array of created users
   */
  async createMultipleTestUsers(count: number = 3): Promise<any[]> {
    const users = [];
    
    try {
      for (let i = 0; i < count; i++) {
        const userData = {
          googleId: `google-id-${Date.now()}-${i}`,
          firstName: `Test${i}`,
          lastName: `User${i}`,
          email: `testuser${i}@example.com`,
          profilePictureUrl: `https://example.com/profile${i}.jpg`,
          isOnboardingCompleted: true,
        };
        
        const user = await this.seedTestUser(userData);
        users.push(user);
      }
      
      return users;
    } catch (error) {
      console.error('[DbHelper] Error creating multiple test users:', error);
      throw error;
    }
  }
}

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
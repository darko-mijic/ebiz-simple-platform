/**
 * Seed script for the test database
 * This script creates basic test data for e2e tests
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load test environment variables
const envPath = path.resolve(__dirname, '../.env.test');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ Error: .env.test file not found');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding test database...');

    // Create test user
    const user = await prisma.user.create({
      data: {
        firstName: process.env.MOCK_GOOGLE_FIRST_NAME || 'Test',
        lastName: process.env.MOCK_GOOGLE_LAST_NAME || 'User',
        email: process.env.MOCK_GOOGLE_EMAIL || 'test@example.com',
        googleId: process.env.MOCK_GOOGLE_USER_ID || '123456789',
        isOnboardingCompleted: true,
        settings: {
          create: {
            language: 'en',
            theme: 'light',
            primaryCurrency: 'EUR',
          },
        },
      },
    });

    console.log(`✅ Created test user: ${user.email}`);

    // Create test company
    const company = await prisma.company.create({
      data: {
        name: process.env.TEST_COMPANY_NAME || 'Test Company Ltd',
        vatId: process.env.TEST_COMPANY_VAT || 'HR12345678901',
        localVatId: process.env.TEST_COMPANY_LOCAL_VAT || '12345678901',
        address: 'Test Street 123',
        city: 'Test City',
        postalCode: '10000',
        country: 'Croatia',
        industry: 'Technology',
      },
    });

    console.log(`✅ Created test company: ${company.name}`);

    // Link user to company
    await prisma.userCompany.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'OWNER',
        isDefault: true,
      },
    });

    console.log(`✅ Linked user to company with role: OWNER`);

    // Create test bank account
    const bankAccount = await prisma.bankAccount.create({
      data: {
        companyId: company.id,
        name: 'Test Bank Account',
        iban: 'HR1723600001101234567',
        currency: 'EUR',
        bankName: 'Test Bank',
        currentBalance: 10000.0,
        previousBalance: 9000.0,
      },
    });

    console.log(`✅ Created test bank account: ${bankAccount.name}`);

    // Create sample categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          companyId: company.id,
          name: 'Salary',
          type: 'INCOME',
          color: '#4CAF50',
        },
      }),
      prisma.category.create({
        data: {
          companyId: company.id,
          name: 'Office Expenses',
          type: 'EXPENSE',
          color: '#F44336',
        },
      }),
      prisma.category.create({
        data: {
          companyId: company.id,
          name: 'Transfer',
          type: 'TRANSFER',
          color: '#2196F3',
        },
      }),
    ]);

    console.log(`✅ Created ${categories.length} sample categories`);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
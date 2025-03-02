# EBIZ-Saas Backend

This is the backend service for EBIZ-Saas, a financial management platform for small to medium-sized businesses in the EU.

## Technology Stack

- **Framework**: NestJS with TypeScript
- **ORM**: Prisma with PostgreSQL
- **Authentication**: Google OAuth 2.0 with JWT
- **AI Integration**: LangChain.js
- **Vector Database**: Qdrant for AI features
- **Bank Statements**: ISO 20022 CAMT.053 parser
- **Storage**: MinIO S3-compatible object storage

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- OpenAI API key (for AI features)

### Installation

1. Clone the repository and navigate to the backend directory:

```bash
git clone <repository-url>
cd ebiz-saas/backend
```

2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

4. Start the database services with Docker:

```bash
cd ..  # Go to root directory
docker-compose up -d
```

5. Generate Prisma client and run migrations:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

6. Start the development server:

```bash
npm run start:dev
```

### Database Management

- **PostgreSQL**: Running on port 5432
- **pgAdmin 4**: Web interface available at http://localhost:5050
  - Login with admin@admin.com / admin
  - Connect to the PostgreSQL server with:
    - Host: postgres
    - Port: 5432
    - Username: postgres
    - Password: postgres
    - Database: ebiz_platform
- **MinIO**: S3-compatible storage for documents available at http://localhost:9001
  - Login with minioadmin / minioadmin

### Database Schema

The database schema is designed to support the following core features:

- User authentication and company management
- Bank account and statement management
- Transaction tracking and categorization
- Document uploads and parsing
- Chat interface for data queries
- Multi-language support
- Recurring transaction pattern detection

For detailed entity relationships, see the Prisma schema in `prisma/schema.prisma`.

### CAMT Parser Integration

The application includes support for ISO 20022 CAMT.053 bank statement files:

- **Parser Adapter**: Located in `src/utils/camt-parser-adapter.ts`
- **Features**:
  - Parses CAMT.053 XML files from banks
  - Extracts transactions, balances, and metadata
  - Maps standard ISO 20022 fields to database schema
  - Supports transaction reconciliation
  - Preserves original data while providing structured access

- **Type Safety Improvements**:
  - Comprehensive TypeScript interfaces for all CAMT structures
  - Safe property access utilities for deeply nested objects
  - Proper handling of optional and nullable fields
  - Type conversion between string and numeric values
  - Error handling for malformed data

To use the CAMT parser:

```typescript
import { processCamtFile } from './utils/camt-parser-adapter';

// Example: Process a CAMT file
const xmlContent = fs.readFileSync('bank-statement.xml', 'utf8');
const bankAccountId = 'your-bank-account-id';
const result = await processCamtFile(xmlContent, bankAccountId);

// Working with transactions
const transactions = result[0].transactions;
for (const tx of transactions) {
  console.log(`Amount: ${tx.amount} ${tx.currency}`);
  console.log(`Reference: ${tx.endToEndId}`);
  console.log(`Structured Ref: ${tx.structuredReference}`);
  
  // Type-safe access to complex nested properties
  const creditorName = tx.relatedParties.creditor?.name;
  const creditorIban = tx.relatedParties.creditorAccount?.iban;
}
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
http://localhost:3000/api-docs

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
``` 
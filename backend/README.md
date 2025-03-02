# EBIZ-Saas Backend

This is the backend service for EBIZ-Saas, a financial management platform for small to medium-sized businesses in the EU.

## Technology Stack

- **Framework**: NestJS with TypeScript
- **ORM**: Prisma with PostgreSQL
- **Authentication**: Google OAuth 2.0 with JWT
- **Logging**: Winston with Elasticsearch integration
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

4. Start the database and infrastructure services with Docker:

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

### Authentication System

The authentication system uses Google OAuth 2.0 for user authentication:

- **Google OAuth**: Used for securing user login
- **JWT Tokens**: Generated after successful authentication
- **Cookie-based Authentication**: Primary authentication method using HTTP-only cookies
- **Token Extraction**: Supports both cookie and bearer token authentication
- **Logout Endpoint**: Properly clears authentication cookies

Key authentication files:
- `src/auth/strategies/google.strategy.ts` - Google OAuth implementation
- `src/auth/strategies/jwt.strategy.ts` - JWT token validation
- `src/auth/auth.controller.ts` - Auth endpoints including logout
- `src/auth/auth.service.ts` - User lookup and token generation

For API endpoints that require authentication, use the `@UseGuards(AuthGuard('jwt'))` decorator.

### Logging Infrastructure

The backend includes a comprehensive logging system:

- **Winston Logger**: Customized logging service at `src/common/logger/logger.service.ts`
- **Elasticsearch Integration**: Logs are sent to Elasticsearch for centralized storage
- **Authentication Logging**: Special methods for tracking auth events
- **Log Levels**: Configurable via environment variables (`LOG_LEVEL`)
- **Client-side Log Collection**: API endpoint for collecting frontend logs

Usage example:
```typescript
// Inject the logger in your service/controller
constructor(private readonly logger: LoggerService) {}

// Regular logging
this.logger.log('This is an info message', 'YourServiceName');
this.logger.debug('This is a debug message', 'YourServiceName', { userId: '123' });
this.logger.error('Error occurred', error, 'YourServiceName');

// Auth-specific logging
this.logger.logAuth('User login attempt', userId, { method: 'google' });
this.logger.logAuthError('Login failed', error, userId);
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
- **Elasticsearch**: Log storage available at http://localhost:9200
- **Kibana**: Log visualization available at http://localhost:5601

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

## Viewing Logs

The application logs can be viewed in multiple ways:

1. **Console**: All logs are output to the console during development
2. **Files**: If file logging is enabled, logs are stored in the `logs` directory
3. **Kibana**: For a graphical interface to search and filter logs:
   - Open http://localhost:5601
   - Navigate to "Analytics" > "Discover"
   - Select the "ebiz-logs*" data view
   - Use the search bar to filter logs (e.g., `severity:error` or `message:*auth*`)

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
``` 
# EBIZ-Saas Backend

This is the backend service for EBIZ-Saas, a financial management platform for small to medium-sized businesses in the EU.

## Technology Stack

- **Framework**: NestJS with TypeScript
- **ORM**: Prisma with PostgreSQL
- **Authentication**: Google OAuth 2.0 with JWT
- **AI Integration**: LangChain.js
- **Vector Database**: Qdrant for AI features

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
  - Login with admin@ebiz.com / admin_secure_pwd
  - Connect to the PostgreSQL server with:
    - Host: postgres
    - Port: 5432
    - Username: ebizadmin
    - Password: ebiz_secure_pwd
    - Database: ebiz_saas

### Database Schema

The database schema is designed to support the following core features:

- User authentication and company management
- Bank account and statement management
- Transaction tracking and categorization
- Document uploads and parsing
- Chat interface for data queries

For detailed entity relationships, see the Prisma schema in `prisma/schema.prisma`.

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
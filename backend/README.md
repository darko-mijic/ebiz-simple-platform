# EBIZ-Saas Backend

This is the NestJS backend for the EBIZ-Saas platform.

## Features

- RESTful API for financial data management
- Google OAuth authentication
- SEPA CAMT ISO bank statement parsing
- Document processing with LangChain.js
- PostgreSQL database with Prisma ORM
- Vector search with Qdrant

## Getting Started

1. Copy `.env.example` to `.env` and update the values
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run start:dev`

## API Documentation

Once the server is running, you can access the Swagger API documentation at:

http://localhost:3000/api 
Below is the updated Software Requirements Specification (SRS) document for the EBIZ-Saas application, with Turborepo removed as requested. I’ve replaced references to Turborepo with npm workspaces for monorepo management, keeping everything else consistent with our previous conversation. The document remains a concise, structured blueprint for the application, designed to assist AI coding agents and align with the Product Requirements Document (PRD), User Interface Design Document (UIDD), and Software Architecture Document (SAD).

---

# EBIZ-Saas Software Specification

## System Design
* Client-server architecture with distinct frontend and backend services
* **Frontend:** Next.js web application for user interaction
* **Backend:** NestJS server for business logic and data processing
* **Databases:**
  * PostgreSQL for structured relational data
  * Qdrant for vector search supporting AI-driven features
* Communication between frontend and backend via RESTful APIs

## Architecture Pattern
* Modular monolith separating frontend and backend within a single deployable unit
* Monorepo managed using **npm workspaces** for code organization and dependency management

## State Management
* **Frontend:**
  * Local state managed using React’s `useState` and `useContext`
  * Remote data fetching and caching handled by SWR
* No global state management libraries (e.g., Redux) implemented

## Data Flow
* User interacts with the frontend, initiating API requests to the backend
* Backend processes requests, queries databases, and returns JSON responses
* AI features (e.g., chat interface) leverage LangChain.js on the backend to generate structured UI responses

## Technical Stack
* **Frontend:**
  * Next.js (React framework)
  * SWR (data fetching)
  * shadcn/ui (UI components)
  * TypeScript
* **Backend:**
  * NestJS (Node.js framework)
  * Prisma (ORM for PostgreSQL)
  * LangChain.js (AI integration)
  * TypeScript
* **Databases:**
  * PostgreSQL (relational data)
  * Qdrant (vector database)
* **Development Tools:**
  * Docker (local database containers)
  * Playwright (end-to-end testing)
* **Authentication:**
  * Google OAuth2 with JWT tokens

## Authentication Process
* Users authenticate via Google Single Sign-On (SSO)
* Backend verifies Google tokens and issues a JWT upon successful login
* Frontend stores the JWT and includes it in API request headers
* Backend validates the JWT for access to protected endpoints

## Route Design
* **Frontend Routes (Next.js):**
  * `/`: Dashboard (financial overview)
  * `/bank-accounts`: Manage bank accounts
  * `/transactions`: View and filter transactions
  * `/documents`: Upload and manage documents
  * `/chat`: Access chat interface
  * `/settings`: User and app settings
* **Backend API Routes (NestJS):**
  * `/auth/google`: Google SSO authentication
  * `/user`: Retrieve or update user profile
  * `/companies`: Manage company entities
  * `/bank-accounts`: Manage bank accounts
  * `/bank-statements`: Upload and list statements
  * `/transactions`: List and filter transactions
  * `/documents`: Upload and manage documents
  * `/chat/query`: Process chat queries

## API Design
* RESTful APIs with JSON request and response payloads
* **Key Endpoints:**
  * `POST /auth/google`: Authenticate with Google, returns JWT
  * `GET /bank-statements`: List statements with gap detection
  * `POST /bank-statements/upload`: Upload and parse SEPA CAMT ISO statement
  * `GET /transactions`: List transactions with filters (e.g., date, type, bank account)
  * `POST /documents/upload`: Upload and parse document, link to transaction
  * `POST /chat/query`: Submit natural language query, receive generative UI response

## Database Design ERD
* **Tables:**
  * `users` (id, google_id, first_name, last_name)
  * `companies` (id, name, address, local_vat_id, eu_vat_id)
  * `user_companies` (user_id, company_id, role) – Links users to companies with roles (e.g., owner)
  * `bank_accounts` (id, company_id, iban, currency, name)
  * `bank_statements` (id, bank_account_id, statement_id, sequence_number, creation_date, from_date, to_date, raw_data JSON)
  * `transactions` (id, bank_statement_id, bank_account_id, amount, currency, credit_debit, status, booking_date, value_date, references JSON, related_parties JSON, remittance_info JSON)
  * `documents` (id, company_id, file_path, upload_date, transaction_id, parsed_data JSON)
* **Relationships:**
  * User ↔ UserCompany ↔ Company (many-to-many via junction table)
  * Company → BankAccount (one-to-many)
  * BankAccount → BankStatement (one-to-many)
  * BankStatement → Transaction (one-to-many)
  * Transaction ↔ Document (one-to-one, optional)

---

This SRS outlines the technical foundation for EBIZ-Saas, aligning with the PRD’s focus on financial management, the UIDD’s modern UI design, and the SAD’s lean architecture. It supports core features like bank statement parsing, transaction filtering, document linking, and a chat interface, providing a clear blueprint for development and future scalability. Let me know if refinements are needed!


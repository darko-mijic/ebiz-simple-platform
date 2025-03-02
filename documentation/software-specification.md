Below is the updated Software Requirements Specification (SRS) document for the EBIZ-Saas application, with Turborepo removed as requested. I've replaced references to Turborepo with npm workspaces for monorepo management, keeping everything else consistent with our previous conversation. The document remains a concise, structured blueprint for the application, designed to assist AI coding agents and align with the Product Requirements Document (PRD), User Interface Design Document (UIDD), and Software Architecture Document (SAD).

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
  * Local state managed using React's `useState` and `useContext`
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
  * MinIO (S3-compatible document storage)
* **Development Tools:**
  * Docker (local database containers)
  * Playwright (end-to-end testing)
* **Authentication:**
  * Google OAuth2 with JWT tokens

## CAMT Parser Integration
* **Parser Module:** Located in `src/utils/camt-parser-adapter.ts`
* **Purpose:** Transforms ISO 20022 CAMT.053 bank statement data to match database schema
* **Key Features:**
  * Parses XML bank statements from EU financial institutions
  * Maps standardized fields to database models
  * Extracts balance information (opening, closing, intermediate)
  * Processes detailed transaction data with references and remittance information
  * Preserves original data while providing structured database records
  * Includes robust type handling with TypeScript interfaces
* **Type Safety:**
  * Dedicated interfaces for all CAMT data structures
  * Safe property access with deep object traversal
  * Proper handling of optional and nullable fields
  * Type conversion between string and numeric values
* **Integration Points:**
  * Used by bank statement upload endpoint
  * Feeds transaction and balance history tables
  * Enables reconciliation with document uploads

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
* **Core Tables:**
  * `users` (id, google_id, first_name, last_name, email)
  * `user_settings` (id, user_id, primary_currency, language, theme, dashboard_layout)
  * `companies` (id, name, address, local_vat_id, eu_vat_id)
  * `user_companies` (user_id, company_id, role) – Links users to companies with roles (e.g., owner, admin, user)

* **Financial Tables:**
  * `bank_accounts` (id, company_id, iban, currency, name, bank_name, current_balance, previous_balance)
  * `bank_statements` (id, bank_account_id, statement_id, sequence_number, from_date, to_date, opening_balance, closing_balance, raw_data, message_id, reporting_source, legal_sequence_number, total_credit_entries, total_credit_amount, total_debit_entries, total_debit_amount)
  * `transactions` (id, bank_statement_id, bank_account_id, amount, currency, credit_debit, status, booking_date, value_date, account_servicer_ref, end_to_end_id, references, related_parties, remittance_info, bank_transaction_code, bank_transaction_family, bank_transaction_sub_family, structured_reference, reference_type, additional_remittance_info, category_id, vendor_id, customer_id, tag_ids)
  * `recurring_transactions` (id, company_id, pattern_name, pattern_description, matching_criteria, recurrence_type, frequency, next_expected_date)
  * `transaction_tags` (transaction_id, tag_id)
  * `tags` (id, company_id, name, color)
  * `balance_history` (id, bank_account_id, date, balance, credited, debited, month, year, balance_type, credit_debit)

* **Document Management:**
  * `documents` (id, company_id, filename, file_path, object_key, bucket_name, upload_date, transaction_id, parsed_data, status, type, document_version, previous_version_id, size_bytes, mime_type)
  * `vendors` (id, company_id, name, vat_id, contact_info)
  * `customers` (id, company_id, name, vat_id, contact_info)

* **Categorization and Analytics:**
  * `categories` (id, company_id, name, description, type, color, is_system)
  * `currency_rates` (id, base_currency, target_currency, rate, effective_date)
  * `translations` (id, entity_type, entity_id, field, language, text)

* **User Experience:**
  * `alerts` (id, company_id, type, message, account_id, document_id, resolved)
  * `chat_messages` (id, user_id, message, response)

* **Key Relationships:**
  * User ↔ UserCompany ↔ Company (many-to-many via junction table)
  * Company → BankAccount (one-to-many)
  * BankAccount → BankStatement (one-to-many)
  * BankStatement → Transaction (one-to-many)
  * Transaction ↔ Document (one-to-one, optional)
  * Transaction → Category, Vendor, Customer (many-to-one)
  * Transaction ↔ Tags (many-to-many via transaction_tags)
  * Transaction → RecurringTransaction (many-to-one, optional)
  * Document → Document (self-reference for versioning)

* **Type Safety with Enums:**
  * `UserRole` (OWNER, ADMIN, USER)
  * `CreditDebit` (CREDIT, DEBIT)
  * `TransactionStatus` (COMPLETED, PENDING, FAILED, BOOKED, INFORMATION, REJECTED)
  * `DocumentStatus` (PROCESSED, NEEDS_ATTENTION, UNDER_REVIEW)
  * `DocumentType` (INVOICE, RECEIPT, CONTRACT, STATEMENT, OTHER)
  * `AlertType` (GAP, REVIEW, BALANCE, SYSTEM)
  * `CategoryType` (INCOME, EXPENSE, TRANSFER)
  * `BalanceType` (OPBD, CLBD, ITBD, PRCD, FWAV, CLAV)
  * `RecurrenceType` (DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL)

* **Performance Optimizations:**
  * Strategic indexes on frequently filtered fields (dates, names, foreign keys)
  * Database-enforced unique constraints (e.g., bank account IBAN, company VAT ID)
  * Cascade deletion for parent-child relationships
  * JSON storage for flexible data (parsed documents, configurations)

---

This SRS outlines the technical foundation for EBIZ-Saas, aligning with the PRD's focus on financial management, the UIDD's modern UI design, and the SAD's lean architecture. It supports core features like bank statement parsing, transaction filtering, document linking, and a chat interface, providing a clear blueprint for development and future scalability.


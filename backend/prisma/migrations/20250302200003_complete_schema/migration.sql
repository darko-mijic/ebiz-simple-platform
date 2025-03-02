-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('COMPLETED', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "RecurrencePattern" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'IRREGULAR');

-- CreateEnum
CREATE TYPE "CreditDebit" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PROCESSED', 'NEEDS_ATTENTION', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'RECEIPT', 'CONTRACT', 'STATEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'MINIO', 'S3', 'AZURE');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('GAP', 'REVIEW', 'BALANCE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "googleId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "dashboardLayout" JSONB,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "localVatId" TEXT NOT NULL,
    "euVatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_companies" (
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_companies_pkey" PRIMARY KEY ("userId","companyId")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bankName" TEXT,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "previousBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastStatementDate" TIMESTAMP(3),
    "totalStatements" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_history" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "credited" DOUBLE PRECISION NOT NULL,
    "debited" DOUBLE PRECISION NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_statements" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "rawData" JSONB NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "hasGap" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_transactions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "pattern" "RecurrencePattern" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastDetectedAt" TIMESTAMP(3),
    "nextExpectedAt" TIMESTAMP(3),
    "matchCriteria" JSONB NOT NULL,
    "categoryId" TEXT,
    "vendorId" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "bankStatementId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "creditDebit" "CreditDebit" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "valueDate" TIMESTAMP(3) NOT NULL,
    "references" JSONB NOT NULL,
    "relatedParties" JSONB NOT NULL,
    "remittanceInfo" JSONB NOT NULL,
    "categoryId" TEXT,
    "vendorId" TEXT,
    "customerId" TEXT,
    "recurringTransactionId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_tags" (
    "transactionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_tags_pkey" PRIMARY KEY ("transactionId","tagId")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "bucketName" TEXT,
    "objectKey" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL,
    "transactionId" TEXT,
    "parsedData" JSONB NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PROCESSED',
    "type" "DocumentType",
    "documentVersion" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "parsingError" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vatId" TEXT,
    "contactInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vatId" TEXT,
    "contactInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "accountId" TEXT,
    "documentId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_rates" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CategoryType" NOT NULL,
    "color" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_localVatId_key" ON "companies"("localVatId");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "companies"("name");

-- CreateIndex
CREATE INDEX "user_companies_userId_idx" ON "user_companies"("userId");

-- CreateIndex
CREATE INDEX "user_companies_companyId_idx" ON "user_companies"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_iban_key" ON "bank_accounts"("iban");

-- CreateIndex
CREATE INDEX "bank_accounts_companyId_idx" ON "bank_accounts"("companyId");

-- CreateIndex
CREATE INDEX "bank_accounts_currency_idx" ON "bank_accounts"("currency");

-- CreateIndex
CREATE INDEX "balance_history_bankAccountId_idx" ON "balance_history"("bankAccountId");

-- CreateIndex
CREATE INDEX "balance_history_year_month_idx" ON "balance_history"("year", "month");

-- CreateIndex
CREATE INDEX "balance_history_date_idx" ON "balance_history"("date");

-- CreateIndex
CREATE INDEX "bank_statements_bankAccountId_idx" ON "bank_statements"("bankAccountId");

-- CreateIndex
CREATE INDEX "bank_statements_fromDate_toDate_idx" ON "bank_statements"("fromDate", "toDate");

-- CreateIndex
CREATE UNIQUE INDEX "bank_statements_bankAccountId_statementId_key" ON "bank_statements"("bankAccountId", "statementId");

-- CreateIndex
CREATE INDEX "recurring_transactions_companyId_idx" ON "recurring_transactions"("companyId");

-- CreateIndex
CREATE INDEX "recurring_transactions_bankAccountId_idx" ON "recurring_transactions"("bankAccountId");

-- CreateIndex
CREATE INDEX "recurring_transactions_pattern_idx" ON "recurring_transactions"("pattern");

-- CreateIndex
CREATE INDEX "recurring_transactions_nextExpectedAt_idx" ON "recurring_transactions"("nextExpectedAt");

-- CreateIndex
CREATE INDEX "transactions_bankAccountId_idx" ON "transactions"("bankAccountId");

-- CreateIndex
CREATE INDEX "transactions_bankStatementId_idx" ON "transactions"("bankStatementId");

-- CreateIndex
CREATE INDEX "transactions_bookingDate_idx" ON "transactions"("bookingDate");

-- CreateIndex
CREATE INDEX "transactions_valueDate_idx" ON "transactions"("valueDate");

-- CreateIndex
CREATE INDEX "transactions_creditDebit_idx" ON "transactions"("creditDebit");

-- CreateIndex
CREATE INDEX "transactions_vendorId_idx" ON "transactions"("vendorId");

-- CreateIndex
CREATE INDEX "transactions_customerId_idx" ON "transactions"("customerId");

-- CreateIndex
CREATE INDEX "transactions_categoryId_idx" ON "transactions"("categoryId");

-- CreateIndex
CREATE INDEX "transactions_recurringTransactionId_idx" ON "transactions"("recurringTransactionId");

-- CreateIndex
CREATE INDEX "transaction_tags_transactionId_idx" ON "transaction_tags"("transactionId");

-- CreateIndex
CREATE INDEX "transaction_tags_tagId_idx" ON "transaction_tags"("tagId");

-- CreateIndex
CREATE INDEX "tags_companyId_idx" ON "tags"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_companyId_name_key" ON "tags"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "documents_transactionId_key" ON "documents"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "documents_previousVersionId_key" ON "documents"("previousVersionId");

-- CreateIndex
CREATE INDEX "documents_companyId_idx" ON "documents"("companyId");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE INDEX "documents_uploadDate_idx" ON "documents"("uploadDate");

-- CreateIndex
CREATE INDEX "vendors_companyId_idx" ON "vendors"("companyId");

-- CreateIndex
CREATE INDEX "vendors_name_idx" ON "vendors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_companyId_name_key" ON "vendors"("companyId", "name");

-- CreateIndex
CREATE INDEX "customers_companyId_idx" ON "customers"("companyId");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customers_companyId_name_key" ON "customers"("companyId", "name");

-- CreateIndex
CREATE INDEX "alerts_companyId_idx" ON "alerts"("companyId");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_resolved_idx" ON "alerts"("resolved");

-- CreateIndex
CREATE INDEX "currency_rates_baseCurrency_targetCurrency_idx" ON "currency_rates"("baseCurrency", "targetCurrency");

-- CreateIndex
CREATE INDEX "currency_rates_effectiveDate_idx" ON "currency_rates"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "currency_rates_baseCurrency_targetCurrency_effectiveDate_key" ON "currency_rates"("baseCurrency", "targetCurrency", "effectiveDate");

-- CreateIndex
CREATE INDEX "categories_companyId_idx" ON "categories"("companyId");

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "categories_companyId_name_key" ON "categories"("companyId", "name");

-- CreateIndex
CREATE INDEX "chat_messages_userId_idx" ON "chat_messages"("userId");

-- CreateIndex
CREATE INDEX "translations_companyId_idx" ON "translations"("companyId");

-- CreateIndex
CREATE INDEX "translations_entityType_entityId_idx" ON "translations"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "translations_language_idx" ON "translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "translations_entityType_entityId_field_language_key" ON "translations"("entityType", "entityId", "field", "language");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_companyId_idx" ON "activity_logs"("companyId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_statements" ADD CONSTRAINT "bank_statements_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bankStatementId_fkey" FOREIGN KEY ("bankStatementId") REFERENCES "bank_statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurringTransactionId_fkey" FOREIGN KEY ("recurringTransactionId") REFERENCES "recurring_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

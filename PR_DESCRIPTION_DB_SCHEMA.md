# Database Schema Enhancement PR

## Overview

This PR enhances the database schema to support all core business requirements of the EbizSimplePlatform. It introduces improved types, strategic indexes, and enhanced relationships between models, providing a solid foundation for building the application's features. Additionally, the schema has been optimized for SEPA CAMT (ISO 20022) bank statement parsing and storage.

## Key Changes

### 1. User Management & Authentication
- Enhanced `User` and `UserCompany` models for multi-company support
- Added user settings with preferences for currency, language, and UI preferences

### 2. Financial Data Management
- Structured bank account system with statements and transactions
- Strategic indexes on date fields for performant financial queries
- Balance history tracking for reporting
- CAMT-specific fields for accurate bank statement data representation

### 3. Document Management
- Comprehensive document model with support for versioning
- Integration with MinIO for scalable document storage
- Document status tracking and type classification

### 4. Business Entity Management
- Vendor and Customer models with contact information
- Category system for transaction classification
- Tag system for flexible transaction organization

### 5. Advanced Features
- Support for recurring transactions and patterns
- Multi-language support via translation tables
- Activity logging for audit trail
- Alert system for notifications
- Enhanced document storage with MinIO integration
- CAMT parser integration for bank statement processing

### 6. Technical Improvements
- Proper schema design with appropriate indexes
- Consistent naming conventions
- Comprehensive relationships between models
- Enum types for type safety
- Optimized for ISO 20022 CAMT.053 format

## Docker Configuration
- Added PostgreSQL and pgAdmin for database management
- Added MinIO for document storage (S3-compatible)

## Future Considerations
- Audit logging will be expanded to support event sourcing 
- Additional indexes may be added based on common query patterns
- Consider partitioning for large tables as data grows

## Testing
- Schema validated with Prisma
- Initial migration successful
- Core relations tested and working as expected

## Technical Details

### Database Schema Architecture
The schema follows a clear domain-driven design with these key areas:

1. **User Management Domain**:
   - User authentication and profile data
   - Company management and user-company relationships
   - User preferences and settings

2. **Financial Management Domain**:
   - Bank accounts and statements
   - Transactions with comprehensive metadata
   - Balance history tracking
   - Recurring transaction patterns detection
   - SEPA CAMT format support with standardized fields

3. **Document Management Domain**:
   - Document storage and versioning with MinIO integration
   - Parsing results and metadata
   - Transaction linking

4. **Business Intelligence Domain**:
   - Categorization system
   - Tagging system for flexible organization
   - Vendor and customer tracking
   - Currency conversion

5. **User Experience Domain**:
   - Alerts and notifications
   - Chat interface data
   - Multi-language support
   - Dashboard preferences

### CAMT Parser Integration

The schema has been enhanced to fully support the ISO 20022 CAMT.053 format:

1. **Bank Statement Model**:
   - Added fields for CAMT-specific identifiers (messageId, reportingSource)
   - Enhanced balance tracking with proper types from ISO 20022
   - Added transaction summary fields for reconciliation

2. **Transaction Model**:
   - Added standardized transaction codes from ISO 20022
   - Enhanced reference tracking (accountServicerRef, endToEndId)
   - Support for structured remittance information
   - Preserved all original CAMT data while providing human-readable fields

3. **Balance Model**:
   - Added balance type enum matching ISO 20022 standards
   - Support for credit/debit indication

4. **Indexing Strategy**:
   - Optimized for common CAMT-related queries
   - Support for transaction reconciliation by reference
   - Efficient searching by transaction codes

This approach allows the application to:
- Process CAMT files with high fidelity
- Maintain complete original data while providing structured access
- Support reconciliation workflows with structured reference information
- Enable categorization based on standardized transaction codes

### PostgreSQL Management
- Configured pgAdmin 4 in Docker for easy database management
- Updated connection settings in environment files
- Documented database access procedures

### Migration Strategy
- Implemented using Prisma's migration system
- Added proper indexes for performance optimization
- Ensured backward compatibility with existing data models

## Testing Instructions

1. Start the database containers:
```bash
docker-compose up -d
```

2. Access pgAdmin at http://localhost:5050:
   - Login: admin@admin.com / admin
   - Connect to the database using:
     - Host: postgres
     - Port: 5432
     - Username: postgres
     - Password: postgres

3. Access MinIO console at http://localhost:9001:
   - Login: minioadmin / minioadmin

4. Run Prisma migrations:
```bash
cd backend
npx prisma migrate dev --name initial
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Start the backend server:
```bash
npm run start:dev
```

## Documentation Updates
- Updated backend README with Docker setup instructions
- Updated Docker configuration for main and backend services
- Ensured environment configuration files reflect the new setup
- Added documentation for CAMT parser integration

## Related Issues
- Closes #XX: Database schema needs to support all business requirements
- Addresses #XX: Improve database performance with proper indexing
- Supports #XX: Enable multi-currency support in the platform

## Screenshots
[Include screenshots of pgAdmin interface showing the database structure] 
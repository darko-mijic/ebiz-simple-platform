# Changelog

All notable changes to the EBIZ-Saas Platform project will be documented in this file.

## [Unreleased]
### 2025-03-05

### Added
- Implemented enhanced OAuth authentication flow with both real and mock options
- Added a dedicated mock OAuth server for development and testing
- Created a "Continue with Mock Auth" button visible only in development
- Implemented user profile display in the sidebar with real user information
- Added logout functionality accessible from the user profile
- Protected routes to redirect unauthenticated users to login
- Added auth state handling to prevent showing login page to authenticated users
- Created a clean auth callback page to handle authentication tokens
- Implemented JWT token storage and management

### Changed
- Simplified Docker configuration to only include PostgreSQL for Prisma ORM
- Removed backend/docker-compose.yml to consolidate to a single Docker configuration
- Updated documentation to reflect Docker configuration changes
- Fixed backend startup issues by updating TypeScript configuration and using ts-node-dev
- Added prestart:dev script to ensure Prisma client is generated before starting the application

### Fixed
- Fixed PostgreSQL version compatibility issue by reverting to postgres:15
- Fixed backend startup issues with npm run start:dev
- Removed obsolete version attribute from docker-compose.yml
- Fixed Prisma client initialization issues by running migrations and ensuring proper generation
- Fixed authentication flow to properly handle tokens and redirects

## [Unreleased]
### 2025-03-02

### Added
- Comprehensive suite of Gherkin feature files for end-to-end testing, covering:
  - User authentication and onboarding
  - Bank statement management
  - Transaction management
  - Document management
  - Chat interface functionality
  - Dashboard overview
  - Bank account management
  - User and system settings
  - Navigation and UI elements
- Feature files written using BDD approach to serve as executable specifications
- Enhanced database integration scenarios with explicit database field validations
- Error handling scenarios for network issues and data validation failures
- Multi-currency support across financial features
- Accessibility testing scenarios including keyboard navigation and screen reader support
- Improved test data examples with realistic values matching database schema

### Changed
- Enhanced the e2e test framework with structured feature organization
- Improved test coverage with detailed scenarios for all core app features

## [Unreleased]
### 2025-03-02   

### Added
- Initial project setup with npm workspaces monorepo structure
- Shared libraries package (`libs/`) with common types and constants
- NestJS backend configuration
- Next.js frontend configuration
- End-to-end testing setup with Playwright
- Docker Compose configuration for PostgreSQL and Qdrant databases
- Basic READMEs and documentation for all parts of the application
- Placeholder module files for missing backend modules
- ESLint and Prettier configuration for code quality
- Husky setup for Git hooks
- Mock data directory for development and testing
- Test files for various testing scenarios

### Fixed
- Updated "docker-compose" command to "docker compose" in README for consistency with newer Docker CLI
- Fixed TypeScript configuration to ensure compatibility between workspaces
- Corrected module and moduleResolution settings in tsconfig.json files
- Excluded mock directory from TypeScript compilation
- Fixed missing module errors in the backend
- Added missing NestJS CLI configuration file
- Fixed backend build process to use webpack for proper compilation
- Updated build scripts to ensure proper dependency order
- Added Prisma client generation to the build process
- Temporarily removed theme provider from frontend to fix startup issues

### Changed
- Configured frontend to run on port 3001 to avoid conflicts with backend
- Set up backend to run on port 3000 
- Configured proper workspace dependencies in package.json files
- Improved dev scripts to run backend and frontend separately or together

### Technical Details
- Set up shared TypeScript configuration
- Configured ESLint and Prettier for code quality
- Added example environment files for both frontend and backend
- Configured Next.js to proxy API requests to the backend
- Set up Prisma schema for database modeling 
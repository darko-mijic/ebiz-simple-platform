# Changelog

All notable changes to the EBIZ-Saas Platform project will be documented in this file.

## [Unreleased]

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
# Changelog

All notable changes to the EBIZ-Saas Platform project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-03-03

### Added

- Google OAuth Authentication with secure profile handling
- Structured logging system using Winston for consistent log formats
- Enhanced JWT authentication with improved token validation
- Public route decorator to bypass authentication for specific routes
- E2E testing strategy document with comprehensive test scenarios
- Correlation ID middleware for request tracking across services
- Robust error handling with detailed error messages
- Type-safe implementations for Google profile and JWT payloads
- Last login tracking for user accounts
- Global JWT Auth Guard for consistent authentication across the application
- Correlation ID middleware for request tracking and debugging
- Improved HTTP exception filter with structured logging
- Authentication helper class for E2E tests
- E2E test improvements documentation

### Improved

- JWT auth guard with better error handling and public route support
- OAuth error handling with detailed error messages
- Logging consistency across all modules
- User profile synchronization during authentication
- Type safety throughout the authentication flow
- Test data management for more reliable tests
- HTTP exception filter with structured logging and correlation ID tracking
- E2E test reliability with better selectors and assertions
- E2E test structure with Gherkin-style comments
- Playwright configuration with screenshot capture on failure

### Security

- Added state parameter for CSRF protection in OAuth flow
- Proper token validation with expiration checks
- Enhanced JWT extraction with better error handling
- Validation of OAuth profile data before processing
- Secure error responses that don't leak sensitive information

## [1.0.0] - 2024-01-15

### Added

- Initial release of EBIZ-Saas Platform
- User authentication with email and password
- Company management
- Bank account integration
- Transaction categorization
- Document management
- Basic reporting
- Admin dashboard

### Technical

- NestJS backend with TypeScript
- React frontend with TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- RESTful API
- Swagger documentation 
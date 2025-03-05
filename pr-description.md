# Implement OAuth Mock Server for Development and Testing

## Overview
This PR adds a mock OAuth2 server to the backend for development and testing purposes. The mock server simulates Google's OAuth authentication flow, allowing developers to work on authentication features without needing to connect to the real Google OAuth service. In addition, it enhances the authentication flow with improved UI, user profile management, and logout functionality.

## Changes
- Added `oauth2-mock-server` package (version 7.2.0) to backend dependencies
- Created a mock OAuth server script at `backend/scripts/mock-oauth-server.js`
- Updated the OAuth configuration service to support switching between real and mock OAuth
- Modified the `start:dev` script to automatically start both the backend and the mock OAuth server
- Added environment variables for mock OAuth configuration
- Updated README.md with documentation on the mock OAuth server
- Added a separate "Continue with Mock Auth" button in the login page for development environments
- Implemented a dedicated `/auth/mock` endpoint for direct mock authentication
- Enhanced the sidebar with user profile information and logout functionality
- Added protection against showing login page to already authenticated users
- Implemented proper token storage and auth state management

## Features
- **Automatic startup**: The mock OAuth server starts automatically with the backend in development mode
- **Configurable**: Can be enabled/disabled via environment variables
- **Test user**: Provides a consistent test user for development
- **Complete OAuth flow**: Simulates the full OAuth flow including authorization, token, and userinfo endpoints
- **Dual authentication options**: Standard Google OAuth and streamlined Mock Auth for development
- **User profile display**: Shows authenticated user information in the sidebar
- **Logout functionality**: Allows users to securely log out of the application
- **Auth protection**: Prevents showing login page to already authenticated users

## How to Test
1. Ensure the `USE_MOCK_OAUTH=true` is set in the backend `.env` file
2. Run `npm run start:dev` in the backend directory
3. Verify that both the backend and the mock OAuth server start successfully
4. Test the OAuth login flow through the frontend with either Google or Mock Auth
5. Verify that you are authenticated with the test user credentials
6. Test the logout functionality through the user profile in the sidebar
7. After logging in, try navigating to the auth page again to confirm redirection to dashboard

## Test User Credentials
- **Email**: test@example.com
- **Name**: Test User
- **Google ID**: mock-google-id

## Mock OAuth Server Endpoints
- **Authorization URL**: http://localhost:8080/auth
- **Token URL**: http://localhost:8080/token
- **JWKS URL**: http://localhost:8080/jwks
- **Discovery URL**: http://localhost:8080/.well-known/openid-configuration

## Notes
- The mock server is intended for development and testing only, not for production use
- When `USE_MOCK_OAUTH=false` or not set, the application will use the real Google OAuth service
- The mock server runs on port 8080 by default, configurable via the `MOCK_OAUTH_PORT` environment variable
- The "Continue with Mock Auth" button only appears in development environments

# Error Handling Strategy for EbizSimple Platform

This document outlines our approach to error handling across the application to ensure a consistent and user-friendly experience.

## Frontend Error Handling

### API Error Handling

The frontend uses a centralized approach to handle API errors:

1. All API calls are wrapped in try/catch blocks
2. The `handleApiError()` utility in `src/lib/api-error.ts` processes all errors:
   - Sanitizes error messages to be user-friendly
   - Prevents exposure of implementation details or stack traces
   - Provides context-aware error messages based on HTTP status codes
   - Logs detailed error information for debugging purposes

Example usage:

```typescript
try {
  // API call
} catch (error) {
  const errorMessage = handleApiError(error);
  
  // Show user-friendly toast notification
  toast({
    title: "Error",
    description: errorMessage,
    type: "error",
  });
}
```

### Toast Notifications

Error messages are displayed to users through toast notifications:
- Brief and user-friendly
- Action-oriented when possible
- No technical jargon or stack traces

## Backend Error Handling

### Global Exception Filter

The backend uses NestJS's exception filter system:

1. The `HttpExceptionFilter` in `src/common/filters/http-exception.filter.ts` catches all exceptions
2. It provides structured error responses with:
   - HTTP status code
   - Error message
   - Error code (for client to identify error type)
   - Timestamp
   - Request path
3. Implementation details and stack traces are only included in development mode

### Structured Logging

Errors are logged with structured context:

```typescript
try {
  // Operation
} catch (error) {
  this.logger.error('Operation failed', error.stack, 'ServiceName', {
    userId: '123',
    resourceId: '456',
    // Additional context
  });
  
  throw new HttpException('User-friendly message', HttpStatus.BAD_REQUEST);
}
```

## Authentication Error Handling

### OAuth Authentication Errors

The platform handles OAuth authentication errors with specialized handling:

1. **Missing/Invalid Credentials**: When Google OAuth credentials are misconfigured:
   - Error is logged with detailed diagnostics
   - Generic message shown to users to avoid information leakage
   - Admin notification triggered for immediate resolution

2. **User Creation Failures**: When a new user account can't be created:
   - Transaction is rolled back to prevent partial user data
   - Detailed error logged with profile information for debugging
   - User shown a friendly message with support contact

3. **Token Validation Failures**: When JWT tokens are invalid or expired:
   - Automatic redirect to login page with a clear message
   - Silent token refresh attempted when possible
   - Session-related data cleared to prevent state inconsistencies

### Implementation

The auth service captures and processes specific authentication errors:

```typescript
async validateOAuthLogin(profile: any): Promise<User> {
  try {
    // OAuth validation logic
  } catch (error) {
    this.logger.logAuthError('OAuth validation failed', error, undefined, {
      provider: 'google',
      email: profile.emails?.[0]?.value,
      profileId: profile.id
    });
    
    if (error instanceof PrismaClientKnownRequestError) {
      // Handle database-specific errors (e.g., unique constraint violations)
      throw new HttpException('Account already exists with different credentials', HttpStatus.CONFLICT);
    }
    
    // Generic error with sanitized message
    throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
  }
}
```

### Frontend Auth Error Handling

The frontend handles authentication errors with specialized components:

1. **AuthErrorBoundary**: React error boundary that catches auth-related errors
2. **useAuthErrorHandler**: Custom hook that processes auth errors and triggers appropriate actions
3. **LoginErrorAlert**: Component that displays auth-specific error messages

Example:

```tsx
function LoginPage() {
  const { handleAuthError } = useAuthErrorHandler();
  
  const handleGoogleLogin = async () => {
    try {
      await initiateGoogleLogin();
    } catch (error) {
      handleAuthError(error, {
        onSessionExpired: () => navigate('/auth/login'),
        onCredentialsError: () => setShowCredentialsHelp(true),
        onUnknownError: (message) => setErrorMessage(message)
      });
    }
  };
  
  // Component JSX
}
```

## Best Practices

1. **Be specific**: Include contextual information in error messages
2. **Be consistent**: Use the same error handling pattern throughout the application
3. **Be secure**: Never expose sensitive information in user-facing error messages
4. **Be helpful**: Provide actionable guidance in error messages when possible
5. **Be observant**: Always log detailed information for debugging

## Error Types

We handle the following types of errors:

1. **Validation Errors** - User input issues (400)
2. **Authentication Errors** - Login/session issues (401/403)
3. **Not Found Errors** - Resource doesn't exist (404)
4. **Server Errors** - Internal application errors (500)
5. **External Service Errors** - Problems with third-party services

## Error Monitoring

Production errors are monitored through:
- Server logs
- Client-side error tracking
- Regular error report reviews

## Continuous Improvement

We regularly:
1. Review common errors to identify patterns
2. Improve error messages based on user feedback
3. Fix root causes of frequently occurring errors 
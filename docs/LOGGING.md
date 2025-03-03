# Structured Logging in EBIZ Simple Platform

This document provides an overview of the structured logging system implemented in the EBIZ Simple Platform.

## Overview

The platform utilizes a structured logging approach based on Winston to provide consistent, searchable, and actionable logs. This helps with monitoring, debugging, and maintaining the application in development and production environments.

## Log Structure

All logs follow a consistent JSON structure with the following common fields:

- `timestamp`: ISO timestamp of when the log was created
- `level`: Log level (error, warn, info, debug, verbose)
- `message`: Human-readable log message
- `service`: Service identifier (default: "ebiz-saas-api")
- `module`: Module or context that generated the log (e.g., "auth", "users")
- Additional context-specific fields

## Log Levels

The platform uses standard log levels in order of severity:

1. **ERROR**: Critical issues requiring immediate attention (always logged)
2. **WARN**: Potential problems that don't prevent operation (always logged)
3. **INFO**: Significant events and milestones (always logged)
4. **DEBUG**: Detailed information for troubleshooting (only in development/debug mode)
5. **VERBOSE**: Extremely detailed diagnostic information (only in development/debug mode)

## Logging Components

### 1. LoggerService

Located in `backend/src/common/logger/logger.service.ts`, this is the core service that implements the logging functionality:

```typescript
@Injectable()
export class LoggerService implements NestLoggerService {
  // Standard logging methods
  log(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void;
  error(message: string, trace?: string | any, context?: string, ...meta: any[]): void;
  warn(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void;
  debug(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void;
  verbose(message: string, contextOrMeta?: string | Record<string, any>, ...meta: any[]): void;
  
  // Domain-specific logging methods
  logAuth(action: string, userId?: string, details?: any): void;
  logAuthError(action: string, error: any, userId?: string, details?: any): void;
  // Additional domain methods...
}
```

### 2. LoggerModule

Located in `backend/src/common/logger/logger.module.ts`, this module makes the logger available throughout the application:

```typescript
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
```

### 3. Transport Options

The logger is configured with multiple transports:

- **Console Transport**: Colorized output in development
- **File Transport**: JSON-formatted logs stored in files:
  - `logs/combined.log`: All logs
  - `logs/error.log`: Error logs only
- **Elasticsearch Transport**: Optional for production environments

## Usage Examples

### Basic Logging

```typescript
// Inject the logger
constructor(private readonly logger: LoggerService) {}

// Log an informational message
this.logger.log('Operation successful', 'ModuleName');

// Log a warning
this.logger.warn('Resource running low', 'ModuleName', { resourceType: 'memory', current: '85%' });

// Log an error
try {
  // Operation that might fail
} catch (error) {
  this.logger.error('Operation failed', error.stack, 'ModuleName', { 
    operationType: 'database', 
    resourceId: '123'
  });
}
```

### Domain-Specific Logging

```typescript
// Authentication logging
this.logger.logAuth('User login successful', user.id, { 
  method: 'google', 
  ipAddress: req.ip 
});

// Authentication error logging
this.logger.logAuthError('Login attempt failed', error, undefined, { 
  email: 'user@example.com',
  reason: 'invalid_credentials'
});
```

## Log File Locations

Log files are stored in the following locations:

- **Development**: `backend/logs/`
  - `combined.log`: All logs
  - `error.log`: Error logs only
  
- **Production**: Typically configured to use external logging services

## Production Considerations

In production environments:

1. Consider using log aggregation services like Elasticsearch, Datadog, or CloudWatch
2. Implement log rotation to manage disk space
3. Set appropriate log levels to avoid excessive logging
4. Use correlation IDs to track requests across microservices
5. Configure alerting based on error logs

## Extending the Logger

To add domain-specific logging methods:

1. Add new methods to the `LoggerService` class
2. Maintain consistency with existing methods
3. Document the new methods and their parameters

Example:

```typescript
// In logger.service.ts
logUserActivity(action: string, userId: string, details?: any): void {
  this.log(action, 'UserActivity', {
    userId,
    ...details
  });
}
```

## Troubleshooting

Common issues and their solutions:

1. **Missing logs**: Verify log level configuration matches the log methods being used
2. **High volume of logs**: Adjust log levels in production to reduce noise
3. **Incomplete context**: Ensure all relevant information is included when logging
4. **Performance issues**: Use debug/verbose levels judiciously in production 
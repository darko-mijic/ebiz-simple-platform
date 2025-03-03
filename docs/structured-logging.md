# Structured Logging System

## Overview

The EbizSimple Platform implements a comprehensive structured logging system to facilitate debugging, monitoring, and auditing. Structured logging provides context-rich information in a standardized format, making it easier to search, filter, and analyze logs.

## Architecture

The logging system is built with a multi-tier approach:

1. **Client-side logging**: Captures frontend events and errors
2. **API logging**: Records HTTP requests, responses, and API errors
3. **Application logging**: Tracks business logic execution and domain events
4. **Infrastructure logging**: Monitors system-level events and performance metrics

## Backend Logging Implementation

### Logger Configuration

```javascript
// backend/src/utils/logger.js

const winston = require('winston');
const { format, createLogger, transports } = winston;

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  format.metadata(),
  format.json()
);

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'ebiz-api' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, metadata }) => {
          return `${timestamp} ${level}: ${message} ${JSON.stringify(metadata)}`;
        })
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Export the logger instance
module.exports = logger;
```

### Usage Examples

```javascript
const logger = require('../utils/logger');

// Log with context
logger.info('User authentication successful', { 
  userId: user.id, 
  email: user.email,
  provider: 'google'
});

// Log errors with stack traces
try {
  // operation
} catch (error) {
  logger.error('Database operation failed', {
    operation: 'createUser',
    parameters: { email },
    error: error.message,
    stack: error.stack
  });
}

// Log warnings
logger.warn('Rate limit approaching for API key', {
  apiKey: apiKey.id,
  currentUsage: currentCount,
  limit: maxCount
});

// Log debug information (only in development)
logger.debug('Processing request payload', {
  endpoint: '/api/users',
  method: 'POST',
  payload: req.body
});
```

## Frontend Logging Implementation

### Logger Configuration

```typescript
// frontend/src/utils/logger.ts

import axios from 'axios';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Logger interface
interface ILogger {
  error(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  info(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

// Logger implementation
class Logger implements ILogger {
  private readonly apiEndpoint = '/api/logs';
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  // Get user context if available
  private getUserContext() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id ? { userId: user.id, email: user.email } : {};
    } catch {
      return {};
    }
  }

  // Log to console and optionally send to server
  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const context = this.getUserContext();
    const logEntry = {
      level,
      message,
      timestamp,
      ...context,
      ...(data || {})
    };

    // Always log to console
    const consoleMethod = level === LogLevel.ERROR ? 'error' 
      : level === LogLevel.WARN ? 'warn'
      : level === LogLevel.INFO ? 'info'
      : 'debug';
    
    console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
    
    // Send errors to backend in production
    if (level === LogLevel.ERROR && !this.isDevelopment) {
      this.sendToServer(logEntry);
    }
    
    // Send all logs to backend in development if debug flag is set
    if (this.isDevelopment && localStorage.getItem('debug') === 'true') {
      this.sendToServer(logEntry);
    }
  }

  // Send log to server
  private sendToServer(logEntry: any) {
    try {
      axios.post(this.apiEndpoint, logEntry).catch(() => {
        // Silently fail if the log server is unavailable
      });
    } catch {
      // Ensure logging never throws
    }
  }

  // Public methods
  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
}

// Create and export logger instance
export const logger = new Logger();
```

### Usage Examples

```typescript
import { logger } from '../utils/logger';

// Log user actions
logger.info('User clicked signup button', { 
  referrer: document.referrer
});

// Log errors with context
try {
  // operation
} catch (error) {
  logger.error('API request failed', {
    endpoint: '/api/users',
    method: 'POST',
    statusCode: error.response?.status,
    error: error.message
  });
}

// Log form submissions
logger.info('Form submitted', {
  formId: 'onboarding',
  step: 'company',
  validationErrors: formErrors
});

// Log performance metrics
logger.debug('Component render time', {
  component: 'DataTable',
  renderTime: endTime - startTime,
  rowCount: data.length
});
```

## API Request Logging Middleware

```javascript
// backend/src/middleware/requestLogger.js

const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  // Generate request ID
  const requestId = req.headers['x-request-id'] || generateUUID();
  
  // Log request start
  const startTime = Date.now();
  
  logger.info('API Request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id // If authenticated
  });
  
  // Capture response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.info('API Response', {
      requestId,
      statusCode: res.statusCode,
      responseTime,
      contentLength: res.getHeader('content-length'),
    });
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

// Generate simple UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

module.exports = requestLogger;
```

## Log Storage and Analysis

Logs are stored in multiple locations depending on the environment:

1. **Development**: Console and local files
2. **Testing**: Console, local files, and memory buffer for test assertions
3. **Production**: Console, managed log service (e.g., CloudWatch, Datadog, or ELK stack)

## Best Practices

1. **Always use structured logging**: Avoid unstructured string messages
2. **Include contextual information**: Add relevant data to help with debugging
3. **Use appropriate log levels**: ERROR for exceptions, WARN for potential issues, INFO for normal operations, DEBUG for detailed information
4. **Sensitive data**: Never log passwords, tokens, or other sensitive information
5. **Performance impact**: Be mindful of the performance impact of extensive logging
6. **Correlation IDs**: Use request IDs to trace requests across services

## Monitoring and Alerting

The structured logs can be used to set up monitoring and alerting based on:

1. **Error rates**: Alert on sudden increases in error logs
2. **Performance metrics**: Monitor response times and identify slow operations
3. **Security events**: Detect suspicious authentication or authorization activities
4. **Business metrics**: Track key business events like user registrations or transactions 
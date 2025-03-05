# Implement Comprehensive Structured Logging System

## Overview

This PR adds a complete structured logging solution for both the backend and frontend of our application. The implementation provides a unified approach to logging across the entire platform, making it easier to debug issues during development and monitor application behavior.

## Features

### Backend Logging (NestJS with Winston)

- **Logger Service**: Structured logging with Winston, supporting multiple log levels
- **HTTP Logger Middleware**: Automatic logging of all HTTP requests and responses
- **Client Logs Controller**: Endpoint to receive logs from the frontend
- **Global Logger Module**: Easy access to logging throughout the application

### Frontend Logging

- **Logger Utility**: Structured logging in the browser console with server forwarding
- **API Utilities**: Fetch wrappers with automatic request/response logging
- **Logger Hook**: React hook for easy logging in components
- **Global Error Handling**: Automatic logging of uncaught errors and unhandled promise rejections

### Configuration

- Environment variables for log levels and server logging
- Consistent log format across backend and frontend
- Centralized log storage in the backend logs directory

## Implementation Details

- Added Winston logger configuration in the backend
- Created a custom logger for the frontend that can send logs to the backend
- Implemented HTTP middleware to log all requests and responses
- Added a React hook for easy logging in components
- Created API utilities with built-in logging
- Added global error handlers for uncaught exceptions
- Created an example page to demonstrate logging functionality

## How to Use

### Backend Services

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class YourService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('YourService');
  }

  someMethod() {
    this.logger.log('This is an info message');
    this.logger.debug('This is a debug message');
    this.logger.warn('This is a warning', 'CustomContext', { additionalData: 'value' });
    
    try {
      // Some code that might throw
    } catch (error) {
      this.logger.error('An error occurred', error.stack, 'ErrorContext', { additionalData: 'value' });
    }
  }
}
```

### Frontend Components

```typescript
import { useLogger } from '@/hooks/useLogger';
import api from '@/utils/api';

function YourComponent() {
  const logger = useLogger('YourComponent');
  
  const handleClick = () => {
    logger.info('Button clicked', 'UserAction', { buttonId: 'submit' });
  };
  
  const handleApiCall = async () => {
    try {
      // API utilities automatically log requests/responses
      const data = await api.fetchJson('/api/some-endpoint');
    } catch (error) {
      logger.error('API call failed', 'API', error);
    }
  };
  
  return <button onClick={handleClick}>Click Me</button>;
}
```

## Configuration

### Backend (.env)

```
LOG_LEVEL=info  # debug, info, warn, error
```

### Frontend (.env.local)

```
NEXT_PUBLIC_LOG_LEVEL=info  # debug, info, warn, error
NEXT_PUBLIC_SERVER_LOGGING=true  # Set to false to disable sending logs to backend
```

## Testing

- Added a logging example page at `/logging-example` to demonstrate the logging functionality
- Tested error handling and log forwarding from frontend to backend
- Verified structured log format in both console and log files

## Future Improvements

- Add log rotation for production environments
- Implement log filtering and searching capabilities
- Add integration with external logging services (e.g., ELK stack)
- Add more detailed context to logs (e.g., user ID, request ID)

## Screenshots

[Include screenshots of the logging example page and console output] 
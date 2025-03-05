# Logging Infrastructure & Authentication Improvements

This document provides details about the logging infrastructure and authentication improvements implemented in the EBIZ-SaaS platform.

## Table of Contents
- [Logging System Overview](#logging-system-overview)
- [Authentication Enhancements](#authentication-enhancements)
- [ELK Stack Integration](#elk-stack-integration)
- [Docker Infrastructure](#docker-infrastructure)
- [Usage Instructions](#usage-instructions)

## Logging System Overview

The EBIZ-SaaS platform implements a comprehensive logging system that captures events from both the frontend and backend applications. This allows for debugging, monitoring, and auditing of user activities.

### Backend Logging (NestJS)

The backend uses a custom `LoggerService` built on [Winston](https://github.com/winstonjs/winston), a versatile logging library for Node.js:

- **Location**: `backend/src/common/logger/logger.service.ts`
- **Key Features**:
  - Multiple logging levels (debug, info, warn, error)
  - Structured JSON logs with timestamps and metadata
  - Specialized auth logging methods for authentication events
  - Multiple transport options (console, file, Elasticsearch)
  - Request ID tracking for tracing requests across logs

```typescript
// Example specialized auth logging
this.logger.logAuth('User authenticated successfully', userId, { method: 'google' });
```

### Frontend Logging (Next.js)

The frontend includes utility functions for logging events and sending them to the backend:

- **Location**: `frontend/src/components/auth/AuthCheck.tsx` (auth logging)
- **Key Features**:
  - Structured logging with timestamps and metadata
  - Log sending to backend for centralized storage
  - Console output for development debugging
  - Error handling for failed log transmission

```typescript
// Example of frontend logging
logAuthCheck('Checking authentication status', { apiUrl });
```

### Log Storage Options

The platform supports several options for log storage:

1. **Console Output**: All logs are displayed in the terminal during development
2. **File Storage**: Logs can be written to files in the `backend/logs` directory
3. **Elasticsearch**: Logs are indexed in Elasticsearch for advanced searching and visualization

## Authentication Enhancements

The authentication system has been improved to ensure reliable session management:

### Cookie-Based Authentication

- JWT tokens are stored in HTTP-only cookies (`auth_session`)
- Cookie parsing middleware added to backend
- CORS configured to allow credentials

### Multi-Source Token Extraction

The JWT strategy has been enhanced to extract tokens from multiple sources:

- **Location**: `backend/src/auth/strategies/jwt.strategy.ts`
- **Features**:
  - Extracts JWT from cookies (primary method)
  - Falls back to Authorization header if cookie is missing
  - Detailed logging of token source and validation

### Logout Functionality

A dedicated logout endpoint has been added to properly clear authentication cookies:

- **Endpoint**: `POST /auth/logout`
- **Location**: `backend/src/auth/auth.controller.ts`
- **Features**:
  - Properly clears the `auth_session` cookie
  - Returns success message
  - Logs logout events

## ELK Stack Integration

The platform integrates with the ELK (Elasticsearch, Logstash, Kibana) stack for advanced log management:

### Elasticsearch

Elasticsearch is used as a centralized log storage solution:

- **Purpose**: Indexing, searching, and analyzing logs
- **Configuration**: 
  - Located at: `http://localhost:9200`
  - Index Pattern: `ebiz-logs*`
  - Mappings: Custom mapping for `@timestamp` field as date type

### Kibana

Kibana provides visualization and exploration of logs:

- **Purpose**: Log searching, filtering, and dashboards
- **Location**: `http://localhost:5601`
- **Key Features**:
  - Discover view for searching and filtering logs
  - Ability to create visualizations and dashboards
  - Time-based analysis of events

## Docker Infrastructure

The platform uses Docker to manage the ELK stack and other dependencies:

### ELK Stack Docker Setup

```yaml
# Relevant portion of docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:7.17.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

### Running Docker Infrastructure

To start the required infrastructure:

```bash
docker compose up -d
```

This command starts all the necessary containers in detached mode.

## Usage Instructions

### Viewing Logs in Kibana

1. Start the ELK stack: `docker compose up -d`
2. Navigate to Kibana: `http://localhost:5601`
3. Create a Data View:
   - Go to Stack Management > Data Views
   - Create a new data view with pattern `ebiz-logs*`
   - Set the Time field to `@timestamp`
   - Click "Save data view"
4. View logs in Discover:
   - Go to Analytics > Discover
   - Select the `ebiz-logs*` data view
   - Use the search bar and filters to find specific logs
   - Use the time picker to select a time range

### Generating Authentication Logs

To generate authentication-related logs:

1. Start the backend: `cd backend && npm run start:dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3001`
4. Try logging in with Google
5. Access protected routes
6. Log out

All of these actions will generate logs that can be viewed in Kibana.

### Log File Access

If file logging is enabled, logs can be found at:

- **Error Logs**: `backend/logs/error.log`
- **Combined Logs**: `backend/logs/combined.log`

### Debugging Authentication Issues

If authentication issues occur:

1. Check the logs in Kibana, filtering by the term "auth"
2. Look for error messages related to token validation
3. Check for CORS issues or cookie problems
4. Verify that the `auth_session` cookie is being set correctly

## Implementation References

The logging and authentication improvements have been implemented across multiple files:

- `backend/src/common/logger/logger.service.ts` - Winston logger configuration
- `backend/src/main.ts` - Cookie parser middleware and CORS setup
- `backend/src/auth/strategies/jwt.strategy.ts` - Multi-source token extraction
- `backend/src/auth/auth.controller.ts` - Authentication endpoints including logout
- `frontend/src/components/auth/AuthCheck.tsx` - Frontend authentication checks 
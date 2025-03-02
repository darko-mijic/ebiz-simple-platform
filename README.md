# EBIZ-Saas Platform

EBIZ-Saas is a modern financial management platform tailored for small to medium-sized businesses in the EU, designed to simplify handling bank statements, transactions, and financial documents.

## Features

- Google SSO Authentication
- Upload and parse SEPA CAMT ISO bank statements
- Transaction management and filtering
- Document management with invoice linking
- Chat interface with generative UI responses
- Comprehensive logging and monitoring infrastructure

## Tech Stack

- **Frontend**: Next.js with SWR and shadcn/ui
- **Backend**: NestJS with Prisma and LangChain.js
- **Databases**: PostgreSQL (relational data) and Qdrant (vector database)
- **Logging**: ELK Stack (Elasticsearch, Kibana) with Winston
- **Monorepo**: npm workspaces

## Project Structure

```
ebiz-simple-platform/
├── frontend/            # Next.js application
├── backend/             # NestJS application
├── libs/                # Shared utilities and types
├── e2e-tests/           # End-to-end testing with Playwright
├── documentation/       # Project documentation
├── docker-compose.yml   # Local database and infrastructure containers
└── package.json         # Workspace configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Docker and Docker Compose

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ebiz-simple-platform.git
   cd ebiz-simple-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the databases and infrastructure:
   ```
   docker compose up -d
   ```

4. Run the application:
   ```
   npm run dev
   ```

5. Open your browser and navigate to:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Kibana (for logs): http://localhost:5601

## Environment Variables

Create `.env` files in the backend and frontend directories:

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/ebiz
QDRANT_HOST=http://localhost:6333
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Development Workflow

- **Start both applications**: `npm run dev`
- **Run end-to-end tests**: `npm run test:e2e`

## Logging and Monitoring

The project includes a comprehensive logging infrastructure using the ELK Stack (Elasticsearch, Logstash, Kibana) for centralized log management. 

For detailed information on the logging system and authentication improvements, see:
- [Logging Infrastructure & Authentication Improvements](./documentation/logging-infrastructure.md)

Key features:
- Structured JSON logs with timestamps
- Authentication event tracking
- Frontend and backend log aggregation
- Visualizations with Kibana
- Log filtering and searching

## License

[MIT](LICENSE)

## Running the Application

To start the application:

1. **First, make sure to kill any processes using ports 3000 and 3001**:

```bash
# Navigate to the frontend directory
cd frontend

# Kill any processes using ports 3000 and 3001
npm run kill-ports

# Return to the root directory
cd ..
```

2. **Start the infrastructure**:

```bash
docker compose up -d
```

3. **Then start the application**:

```bash
npm run dev
```

4. **Access the application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Kibana Logs: http://localhost:5601

## shadcn/ui Components

This project uses [shadcn/ui](https://ui.shadcn.com) for UI components. We've added:

- Button component
- Card component
- Input component
- Toast notifications

To see a demonstration of these components, visit the UI Test page at: http://localhost:3001/ui-test

### Adding More shadcn/ui Components

To add additional components:

```bash
# Navigate to the frontend directory
cd frontend

# Add a component using the CLI (example: adding a dialog)
npx shadcn-ui@latest add dialog
```

Remember to check the [shadcn/ui documentation](https://ui.shadcn.com/docs) for more details on available components. 


## Bash commands

### Share the Diff via Copy-Paste
Run this in your terminal:

git diff --staged > changes.diff && git diff >> changes.diff
git ls-files --others --exclude-standard | xargs -I {} git diff --no-index /dev/null {} >> changes.diff
cat changes.diff | pbcopy

What it does:
	1.	git diff --staged → Adds staged changes.
	2.	git diff → Adds unstaged changes.
	3.	git ls-files --others --exclude-standard → Lists untracked files.
	4.	git diff --no-index /dev/null {} → Appends content of untracked files.
	5.	pbcopy → Copies the result to clipboard.

Now, just paste it wherever needed. 🚀

```bash
git diff --staged > changes.diff && git diff >> changes.diff
git ls-files --others --exclude-standard | xargs -I {} git diff --no-index /dev/null {} >> changes.diff
cat changes.diff | pbcopy
```

## Bash Script: Reset Git Working Directory

```bash
# Remove all untracked files and directories
git clean -df

# Restore all modified and deleted files to the last committed state
git restore .
```
What it does:
	•	git clean -df → Deletes all untracked files and directories.
	•	git restore . → Reverts all modified and deleted files to their last committed state.


## Bash One-Liner to Reset Git Working Directory

```bash
git clean -df && git restore .
```

What it does:
	•	git clean -df → Deletes all untracked files and directories.
	•	git restore . → Reverts all modified and deleted files to their last committed state.

This completely resets your working directory without affecting committed changes. 🚀

## Log Locations in the EBIZ-SaaS Platform

You're right, we still need to organize and clarify the logging system. Here's a breakdown of where all the logs are stored and how to access them:

## Backend Logs (NestJS)

### Current Location:
- **Console Output**: Currently, all backend logs are going to the console (terminal) where you ran `npm run dev:backend`
- These logs include detailed OAuth flow, database queries, authentication events, and JWT token generation

### Persistent Storage:
For production, we've configured Winston to write logs to files, but they're not active in development mode. To enable file logging:

1. Create a `logs` directory in the backend folder:
```bash
mkdir -p backend/logs
```

2. Edit the logger service to always use file logging by modifying `backend/src/common/logger/logger.service.ts`:
```typescript
// Remove the environment condition for file transports
transports: [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
],
```

## Frontend Logs (Next.js)

### Current Location:
- **Browser Console**: All frontend logs are currently only sent to the browser's developer console
- You can see these logs by opening browser DevTools (F12 or right-click → Inspect)

### Persistent Storage:
Frontend logs aren't automatically persisted. To store frontend logs, we need to:

1. Create a log API endpoint in the backend:
```typescript
// backend/src/common/logger/logger.controller.ts
@Controller('client-logs')
export class ClientLoggerController {
  constructor(private readonly logger: LoggerService) {}

  @Post()
  clientLog(@Body() logData: any) {
    this.logger.log(`[Client] ${logData.message}`, 'ClientLogger', logData.meta);
    return { received: true };
  }
}
```

2. Update the frontend logging functions to send logs to the backend:
```typescript
// Update logAuth and logAuthCheck functions to send logs to backend
const logAuth = async (action: string, details?: any) => {
  const logData = {
    timestamp: new Date().toISOString(),
    action,
    ...details,
  };
  
  console.log(`[Auth] ${action}`, logData);
  
  // Send to backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    await fetch(`${apiUrl}/client-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: action,
        meta: logData,
      }),
    });
  } catch (e) {
    // Silent fail for logging
    console.error('Failed to send log to server', e);
  }
};
```

## Combined Logs

For a complete view of both frontend and backend logs in one place, you have several options:

### Option 1: Log Aggregation
Use a tool like ELK Stack (Elasticsearch, Logstash, Kibana) or the MERN Stack (MongoDB, Express, React, Node) for log aggregation:

```bash
# Quick setup with Docker
docker run -d -p 5601:5601 -p 9200:9200 -p 5044:5044 -e "discovery.type=single-node" --name elk sebp/elk
```

### Option 2: Log Files
Store all logs (including the forwarded client logs) in the same backend log files. This is what we'll achieve by implementing the client-log API endpoint above.

### Option 3: Cloud Logging
For production, consider using a cloud logging service like:
- AWS CloudWatch
- Google Cloud Logging
- Azure Monitor
- Datadog
- New Relic

## Immediate Next Steps

1. Start by setting up the persistent file logging in the backend
2. Create the client-log API endpoint
3. Update frontend logging to send logs to backend
4. Add middleware to log HTTP requests and responses (for API debugging)

Would you like me to implement any of these specific improvements first?
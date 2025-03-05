# EBIZ-Saas Platform

EBIZ-Saas is a modern financial management platform tailored for small to medium-sized businesses in the EU, designed to simplify handling bank statements, transactions, and financial documents.

## Features

- Google SSO Authentication
- Upload and parse SEPA CAMT ISO bank statements
- Transaction management and filtering
- Document management with invoice linking
- Chat interface with generative UI responses
- Comprehensive structured logging system

## Tech Stack

- **Frontend**: Next.js with SWR and shadcn/ui
- **Backend**: NestJS with Prisma and LangChain.js
- **Database**: PostgreSQL (relational data)
- **Monorepo**: npm workspaces
- **Logging**: Winston for backend, custom logger for frontend

## Project Structure

```
ebiz-simple-platform/
├── frontend/           # Next.js application
├── backend/            # NestJS application
├── libs/               # Shared utilities and types
├── e2e-tests/          # End-to-end testing with Playwright
├── docker-compose.yml  # Local database containers
└── package.json        # Workspace configuration
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

3. Start the database:
   ```
   docker compose up -d
   ```
   Note: The Docker setup has been simplified to only include PostgreSQL configured for Prisma ORM.

4. Run the application:
   ```
   npm run dev
   ```

5. Open your browser and navigate to:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

## Environment Variables

Create `.env` files in the backend and frontend directories:

### Backend (.env)
```
DATABASE_URL=postgresql://ebizadmin:ebiz_secure_pwd@localhost:5432/ebiz_saas
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
LOG_LEVEL=info  # debug, info, warn, error
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_LOG_LEVEL=info  # debug, info, warn, error
NEXT_PUBLIC_SERVER_LOGGING=true  # Set to false to disable sending logs to backend
```

## Development Workflow

- **Start both applications**: `npm run dev`
- **Run end-to-end tests**: `npm run test:e2e`

## Logging System

The platform includes a comprehensive structured logging system for both backend and frontend:

### Backend Logging

- Uses Winston for structured logging
- Logs to console (with colors) and files
- Stores logs in `backend/logs/` directory with multiple formats:
  - `combined.log` and `error.log`: JSON format for machine processing
  - `readable.log` and `readable-error.log`: Human-readable format for easier debugging
- HTTP request/response logging middleware
- Configurable log levels via environment variables

### Frontend Logging

- Structured logging in browser console
- Sends logs to backend for centralized storage
- Automatically logs uncaught errors and unhandled promise rejections
- React hook for easy logging in components
- API utilities with built-in logging

### Using the Logger

#### In Backend Services:

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

#### In Frontend Components:

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

### Log Formats

The backend logging system provides logs in two formats:

#### JSON Format (for machine processing)
```json
{"timestamp":"2025-03-05T11:50:07.080Z","level":"info","message":"LoggerModule dependencies initialized","context":"InstanceLoader","service":"backend"}
```

#### Human-Readable Format (for easier debugging)
```
2025-03-05 11:50:07.080 [InstanceLoader] INFO: LoggerModule dependencies initialized
```

### Logging Example Page

Visit http://localhost:3001/logging-example to see a demonstration of the logging system.

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

2. **Then start the application**:

```bash
npm run dev
```

3. **Access the application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

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
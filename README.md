# EBIZ-Saas Platform

EBIZ-Saas is a modern financial management platform tailored for small to medium-sized businesses in the EU, designed to simplify handling bank statements, transactions, and financial documents.

## Features

- Google SSO Authentication
- Upload and parse SEPA CAMT ISO bank statements
- Transaction management and filtering
- Document management with invoice linking
- Chat interface with generative UI responses

## Tech Stack

- **Frontend**: Next.js with SWR and shadcn/ui
- **Backend**: NestJS with Prisma and LangChain.js
- **Database**: PostgreSQL (relational data)
- **Monorepo**: npm workspaces

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
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Development Workflow

- **Start both applications**: `npm run dev`
- **Run end-to-end tests**: `npm run test:e2e`

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
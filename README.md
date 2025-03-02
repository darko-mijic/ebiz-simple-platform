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
- **Databases**: PostgreSQL (relational data) and Qdrant (vector database)
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

3. Start the databases:
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

## Environment Variables

Create `.env` files in the backend and frontend directories:

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/ebiz
QDRANT_HOST=http://localhost:6333
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
Based on your request to simplify the architecture by removing the monorepo setup with Turborepo, I've redesigned the software architecture to eliminate Turborepo while keeping the rest of the structure intact and manageable. Below is the updated, self-contained minimal software architecture tailored to your needs, replacing Turborepo with a simpler monorepo approach using npm workspaces.

---

## Proposed Minimal Software Architecture

This architecture streamlines development, improves compatibility with AI coding agents like Cursor, and enables fast iteration while maintaining scalability for your SaaS application. It uses a monorepo with npm workspaces instead of Turborepo, separates frontend and backend concerns, and limits Docker usage to databases during local development.

### 1. Monorepo with npm Workspaces

- **Purpose**: Centralizes code management, reduces duplication, and simplifies dependency handling across frontend and backend without the complexity of Turborepo's build caching and task orchestration.
- **Structure**:
  - `frontend/`: Hosts the Next.js frontend application.
  - `backend/`: Hosts the NestJS backend application.
  - `libs/`: Shared utilities or types (e.g., TypeScript interfaces).
  - `e2e-tests/`: End-to-end testing suite.
- **Configuration**:
  - Uses npm workspaces to manage dependencies, defined in the root `package.json`:
    ```json
    {
      "workspaces": ["frontend", "backend", "libs", "e2e-tests"]
    }
    ```
  - Each directory has its own `package.json` with specific dependencies and scripts.
  - Shared configurations like ESLint and Prettier are defined at the root and extended in each workspace.
  - TypeScript is configured with a shared `tsconfig.json` at the root, extended by each workspace.
- **Why This Works**: npm workspaces provide a lightweight way to manage a monorepo without Turborepo's overhead, maintaining the benefits of centralized code management while simplifying the setup.

---

### 2. Frontend: Next.js with SWR and shadcn/ui

- **Tools**:
  - **Next.js**: Replaces React + Vite for a simpler, integrated framework well-supported by AI coding agents. It includes built-in routing and a robust build system, eliminating the need for TanStack Router and Vite.
  - **SWR**: A lightweight data-fetching library from Vercel, used instead of TanStack Query to avoid issues with Cursor AI agents. It offers caching and revalidation with a simple API.
  - **shadcn/ui**: Retains your existing pre-styled UI components, as no issues were noted.
- **Key Features**:
  - **Routing**: Handled by Next.js's file-based routing (e.g., `pages/` or App Router), removing the need for TanStack Router.
  - **Data Fetching**: Uses SWR for client-side fetching and Next.js server components or API routes for server-side data retrieval, avoiding TanStack Query's complexity.
  - **Development**: Next.js's hot reloading provides fast feedback loops.
- **Configuration**:
  - Located in `frontend/`.
  - Runs on port `3001` (to avoid conflict with the backend) with the script:
    ```json
    "scripts": {
      "dev": "next dev -p 3001"
    }
    ```
  - Proxies API requests to the backend (`http://localhost:3000`) via `next.config.js` rewrites to eliminate CORS issues:
    ```javascript
    module.exports = {
      async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'http://localhost:3000/:path*',
          },
        ];
      },
    };
    ```
- **Why This Works**: Next.js'sPopularity with AI agents ensures better support, while SWR simplifies data handling without the problems you faced with TanStack Query.

---

### 3. Backend: NestJS with HTTP/JSON and Prisma

- **Tools**:
  - **NestJS**: Retained from your current architecture as a scalable, structured backend framework. No issues were noted, so it stays.
  - **HTTP/JSON**: Simple RESTful APIs for communication with the frontend.
  - **Prisma**: Type-safe ORM for PostgreSQL interactions, already working well in your setup.
- **Features**:
  - **Authentication**: Implements JWT-based authentication (e.g., using `@nestjs/jwt`).
  - **AI Integration**: LangChain.js for document processing and AI workflows, integrated into NestJS services (no issues reported, so it’s retained).
  - **Hot Reloading**: Enabled with `npm run start:dev` in `backend/`.
- **Configuration**:
  - Located in `backend/`.
  - Runs on port `3000`.
  - Connects to PostgreSQL (`localhost:5432`) and Qdrant (`localhost:6333`) in local development.
- **Why Keep It?**: NestJS is well-suited for complex backend logic (e.g., AI tasks), and separating it from the frontend allows independent scaling, ideal for a SaaS app.

---

### 4. Databases: PostgreSQL and Qdrant (Dockerized for Local Development)

- **Purpose**: Limits Docker usage to databases only, addressing your pain point of containerizing everything in local development.
- **Setup**:
  - **PostgreSQL**: Relational database for structured data (e.g., users, metadata).
  - **Qdrant**: Vector database for embeddings and search, used with LangChain.js.
- **Configuration**:
  - Managed via `docker-compose.yml` in the root:
    ```yaml
    version: '3.8'
    services:
      postgres:
        image: postgres:15
        ports:
          - "5432:5432"
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: saas
        volumes:
          - pgdata:/var/lib/postgresql/data
      qdrant:
        image: qdrant/qdrant:latest
        ports:
          - "6333:6333"
        volumes:
          - qdrantdata:/qdrant/storage
    volumes:
      pgdata:
      qdrantdata:
    ```
  - Backend connects via `DATABASE_URL=postgresql://user:password@localhost:5432/saas` and `QDRANT_HOST=http://localhost:6333`.
- **Why This Works**: Running only databases in Docker simplifies setup, reduces overhead, and preserves hot reloading for application code on the host machine.

---

### 5. Testing: Gherkin with Playwright

- **Approach**: Retains your existing end-to-end testing strategy using Gherkin syntax (human-readable) and Playwright for execution.
- **Configuration**:
  - Located in `e2e-tests/`.
  - Run with `npm run test` in `e2e-tests/` or from the root with:
    ```json
    "scripts": {
      "test:e2e": "npm run test --workspace=e2e-tests"
    }
    ```
- **Why Keep It?**: No issues were mentioned, and it ensures critical workflows are validated.

---

### 6. Minimal Monitoring

- **Tools**:
  - **Logging**: Structured logging with Winston in NestJS.
  - **Health Checks**: `/health` endpoint returning `{ status: 'ok' }`.
- **Configuration**:
  - Added to NestJS in `main.ts` and a dedicated controller.
- **Why This Works**: Provides basic observability without added complexity.

---

## Local Development Workflow

To ensure a fast and frictionless development experience:

1. **Start Databases**:
   ```bash
   docker-compose up
   ```

2. **Run Backend and Frontend**:
   - **Option 1: Single Command from Root**:
     - In the root `package.json`:
       ```json
       "scripts": {
         "dev": "concurrently \"npm run start:dev --workspace=backend\" \"npm run dev --workspace=frontend\""
       }
       ```
     - Run:
       ```bash
       npm run dev
       ```
     - This uses `concurrently` to start both apps simultaneously (`backend` on port `3000`, `frontend` on port `3001`).
   - **Option 2: Run Separately**:
     - In `backend/`:
       ```bash
       npm run start:dev
       ```
       - Runs on `http://localhost:3000`.
     - In `frontend/`:
       ```bash
       npm run dev
       ```
       - Runs on `http://localhost:3001`, proxying `/api/*` to the backend.

3. **Environment Variables**:
   - Use `.env` files in each workspace:
     - **Backend**: `DATABASE_URL`, `QDRANT_HOST`, etc.
     - **Frontend**: Optional, as the API proxy handles backend communication.

This setup avoids Dockerizing the application code, enabling hot reloading and faster iteration.

---

## Summary

This minimal architecture provides:
- A **monorepo with npm workspaces** for efficient code management without Turborepo's complexity.
- A **Next.js frontend** with SWR and shadcn/ui for simplicity and AI compatibility.
- A **NestJS backend** with Prisma and LangChain.js for robust server-side logic.
- **Dockerized PostgreSQL and Qdrant** for local database consistency, with application code running on the host.
- Retained **Gherkin + Playwright testing** and **basic monitoring** for quality and observability.

By removing Turborepo and replacing it with npm workspaces, this setup simplifies the monorepo management while preserving its benefits, delivering a leaner, easier-to-iterate, and AI-agent-optimized foundation for your SaaS application.


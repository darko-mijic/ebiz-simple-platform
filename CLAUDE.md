# EBIZ Platform Development Guide

## Build & Test Commands
- **Start development**: `npm run dev` (backend + frontend)
- **Backend development**: `npm run dev:backend`
- **Frontend development**: `npm run dev:frontend`
- **Build**: `npm run build`
- **Backend tests**: `cd backend && npm run test`
- **Single backend test**: `cd backend && npm run test -- src/path/to/file.spec.ts`
- **Backend E2E tests**: `cd backend && npm run test:e2e`
- **Frontend Cypress tests**: `cd frontend && npm run cy:open`
- **E2E Playwright tests**: `npm run test:e2e`
- **Specific Playwright test**: `cd e2e-tests && npm run test:auth`
- **Lint**: `npm run lint` (workspace specific)

## Code Style Guidelines
- **Formatting**: Prettier with singleQuote, 100 char width, 2 spaces
- **TypeScript**: Strict mode enabled, explicit return types on functions
- **Imports**: Group by external, internal, relative; sort alphabetically
- **Error handling**: Use try/catch with structured logging (see ERROR_HANDLING.md)
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces/types
- **Components**: One component per file, descriptive names
- **Tests**: Descriptive names, arrange-act-assert pattern
- **Logging**: Use structured logging with context

## Architecture
- Backend: NestJS with modules, controllers, services
- Frontend: Next.js with app router, shadcn/ui components
- Authentication: Google OAuth with JWT
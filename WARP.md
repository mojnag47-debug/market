# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

NextGen Marketplace is a production-grade monorepo built with **pnpm + Nx**, designed for TypeScript applications with comprehensive tooling for linting, testing, and building.

## Essential Development Commands

### Setup and Installation
```bash
# Install dependencies (enforces pnpm usage)
make install
# or
pnpm install
```

### Development
```bash
# Start all development servers
make dev
# or
pnpm dev

# Start specific applications
make dev:web    # Web application
make dev:api    # API server
pnpm nx serve <app-name>    # Serve specific app
```

### Building
```bash
# Build all projects
make build
# or 
pnpm build

# Build for production
make build:prod

# Build only affected projects (based on git changes)
make build:affected
# or
pnpm nx affected:build
```

### Testing
```bash
# Run all tests
make test
# or
pnpm test

# Run tests in watch mode
make test:watch

# Run tests with coverage
make test:coverage

# Run tests for affected projects only
make test:affected

# Run E2E tests
make test:e2e
```

### Code Quality
```bash
# Run linting
make lint
# or
pnpm lint

# Run linting with auto-fix
make lint:fix
# or
pnpm lint:fix

# Format code with Prettier
make format
# or
pnpm format

# Check code formatting
make format:check
# or
pnpm format:check
```

### Workspace Management
```bash
# Generate dependency graph
make graph
# or
pnpm nx graph

# Show affected projects
make affected
# or
pnpm nx affected

# Create new app
pnpm nx generate @nx/node:app my-app

# Create new library  
pnpm nx generate @nx/js:lib my-lib

# Install package to specific workspace
pnpm add <package> --filter <workspace-name>
```

### Docker Operations
```bash
# Start services with Docker
make docker:up

# Stop Docker services
make docker:down

# View Docker logs
make docker:logs

# Build Docker images
make docker:build
```

### CI/CD
```bash
# Run full CI pipeline
make ci

# Run CI for affected projects only
make ci:affected
```

## Architecture Overview

### Monorepo Structure
- **`apps/`** - Independent applications (web, mobile, admin dashboards)
- **`libs/`** - Shared libraries and utilities organized by domain
- **`tools/`** - Development tools, build scripts, and configurations  
- **`docker/`** - Container configurations for different environments
- **`scripts/`** - Build and deployment automation scripts
- **`.github/`** - CI/CD workflows and GitHub-specific configurations

### Technology Stack
- **Package Manager**: pnpm with workspace support (requires pnpm >= 8.0.0)
- **Build System**: Nx for monorepo management with advanced caching
- **Language**: TypeScript with strict configuration
- **Compilation**: SWC for fast builds and Jest transformations
- **Linting**: ESLint with TypeScript rules and import ordering
- **Formatting**: Prettier with comprehensive file type support
- **Testing**: Jest with SWC transforms for fast test execution

### Shared Library Architecture
Based on the TypeScript paths configuration, the project expects these shared libraries:
- **`@nextgen-marketplace/shared-ui`** - Reusable UI components
- **`@nextgen-marketplace/shared-utils`** - Common utilities and helpers  
- **`@nextgen-marketplace/shared-types`** - TypeScript type definitions
- **`@nextgen-marketplace/shared-data`** - Data access and API clients

### Build Configuration
- **Nx Target Dependencies**: Build tasks automatically run dependent builds first
- **Caching**: Enabled for build, test, lint, and e2e operations for faster execution
- **SWC Compilation**: Fast TypeScript compilation with decorator support
- **Parallel Execution**: Up to 3 tasks run in parallel by default

### Code Quality Standards
- **Import Organization**: Enforced alphabetical ordering with grouped import types
- **TypeScript Strict Mode**: Enabled with additional safety checks
- **Unused Variables**: Must be prefixed with `_` if intentionally unused
- **ESLint Rules**: Comprehensive rules for code consistency and best practices
- **Prettier**: Standardized formatting with 100-character line limit

## Development Guidelines

### Package Management
- Always use `pnpm` for package operations (enforced by preinstall script)
- Use `--filter` flag to target specific workspaces for package installation
- Leverage pnpm workspaces for efficient dependency management

### Testing Strategy  
- Jest with SWC for fast test compilation
- Test files use `.spec.ts` or `.test.ts` extensions
- Coverage reporting includes HTML output
- Test setup files located in `tools/config/jest/`

### Nx Usage Patterns
- Use `nx affected` commands to optimize CI/CD by only testing/building changed code
- Leverage Nx dependency graph (`nx graph`) to understand project relationships
- Use Nx generators for consistent project scaffolding
- Take advantage of computation caching for faster builds and tests

### Docker Development
- Development and production Docker configurations separated
- Docker Compose files located in `docker/` directory
- Use Makefile targets for consistent Docker operations

### Environment Configuration
- Environment-specific variables should use `.env.local` files
- Copy from `.env.example` templates for consistency
- Production configuration in `.env.production`

## Project Initialization Notes

This appears to be a fresh monorepo setup. When creating new applications or libraries:

1. **Generate Apps**: `pnpm nx generate @nx/node:app <app-name>` for Node.js apps
2. **Generate Libs**: `pnpm nx generate @nx/js:lib <lib-name>` for shared libraries  
3. **Update Paths**: Add new library paths to `tsconfig.base.json`
4. **Configure Dependencies**: Update Nx dependency constraints in `.eslintrc.js`

The project is configured for React applications with Vite bundling and Next.js support based on the Nx generator defaults.
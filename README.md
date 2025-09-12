# NextGen Marketplace

A production-grade marketplace monorepo built with **pnpm + Nx**.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

### Installation

```bash
# Install dependencies
make install

# Or use pnpm directly
pnpm install
```

### Development

```bash
# Start all development servers
make dev

# Or start specific apps
make dev:web    # Web application
make dev:api    # API server
```

## 📁 Project Structure

```
nextgen-marketplace/
├── apps/              # Applications
├── libs/              # Shared libraries
├── tools/             # Development tools and scripts
├── docs/              # Documentation
├── scripts/           # Build and deployment scripts
├── docker/            # Docker configurations
├── .github/           # GitHub workflows
├── package.json       # Root package configuration
├── nx.json           # Nx workspace configuration
├── tsconfig.base.json # TypeScript base configuration
├── Makefile          # Project automation
└── README.md         # This file
```

## 🛠 Available Commands

### Core Commands

| Command       | Description                    |
|---------------|--------------------------------|
| `make install`| Install all dependencies       |
| `make dev`    | Start development servers      |
| `make build`  | Build all projects             |
| `make test`   | Run all tests                  |
| `make lint`   | Run linting                    |
| `make format` | Format code with Prettier     |

### Docker Commands

| Command           | Description                |
|-------------------|----------------------------|
| `make docker:up`  | Start services with Docker|
| `make docker:down`| Stop Docker services       |
| `make docker:logs`| View Docker logs           |

### Advanced Commands

| Command              | Description                    |
|----------------------|--------------------------------|
| `make build:affected`| Build only affected projects  |
| `make test:affected` | Test only affected projects   |
| `make ci`            | Run full CI pipeline          |
| `make clean`         | Clean build artifacts         |

Run `make help` to see all available commands.

## 🏗 Architecture

### Monorepo Structure

- **Apps**: Independent applications (web, mobile, admin)
- **Libs**: Shared libraries and utilities
- **Tools**: Development and build tools
- **Docker**: Container configurations

### Technology Stack

- **Package Manager**: pnpm with workspaces
- **Build System**: Nx for monorepo management
- **Language**: TypeScript
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Testing**: Jest
- **Compilation**: SWC for fast builds

## 🔧 Development Guidelines

### Code Style

- **Indentation**: 2 spaces
- **Line Endings**: LF
- **Encoding**: UTF-8
- **Max Line Length**: 100 characters

### Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run `make ci` before pushing
4. Create pull request
5. Code review and merge

### Adding New Packages

```bash
# Create new app
nx generate @nx/node:app my-app

# Create new library
nx generate @nx/js:lib my-lib

# Install package to specific workspace
pnpm add <package> --filter <workspace-name>
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run tests in watch mode
make test:watch

# Run tests with coverage
make test:coverage

# Run E2E tests
make test:e2e
```

## 🏃‍♂️ Building

```bash
# Development build
make build

# Production build
make build:prod

# Build only changed projects
make build:affected
```

## 🐳 Docker

The project supports Docker for local development and production deployment.

```bash
# Start development environment
make docker:up

# View logs
make docker:logs

# Stop services
make docker:down
```

## 📊 Project Dependencies

View project dependency graph:

```bash
make graph
```

Show affected projects (after changes):

```bash
make affected
```

## 🚀 Deployment

### CI/CD Pipeline

The project includes GitHub Actions workflows for:

- **Continuous Integration**: Lint, test, build
- **Dependency Updates**: Automated dependency management
- **Security Scanning**: Vulnerability detection

### Production Build

```bash
# Build for production
make build:prod

# Run CI checks
make ci
```

## 📋 Scripts

All scripts are centralized in the root `package.json` and `Makefile`:

- **Development**: Hot reloading and dev servers
- **Building**: Production-ready builds
- **Testing**: Unit, integration, and E2E tests
- **Code Quality**: Linting and formatting
- **Deployment**: Docker and CI/CD automation

## 🔐 Environment Variables

Create `.env.local` files for environment-specific configuration:

```bash
# Development
cp .env.example .env.local

# Production
cp .env.example .env.production
```

## 📚 Documentation

- [Architecture Decisions](docs/architecture/)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment/)
- [Contributing Guidelines](docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/nextgen-marketplace/issues)
- **Documentation**: [Project Wiki](https://github.com/your-org/nextgen-marketplace/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/nextgen-marketplace/discussions)

---

**NextGen Marketplace** - Built with ❤️ for production-grade applications.
# NextGen Marketplace Makefile
# Production-grade monorepo automation

.PHONY: help install dev build test clean lint format docker:up docker:down docker:build docker:logs

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# Project configuration
PROJECT_NAME := nextgen-marketplace
DOCKER_COMPOSE_FILE := docker/docker-compose.yml
DOCKER_COMPOSE_DEV_FILE := docker/docker-compose.dev.yml

## Help target
help: ## Show this help message
	@echo "$(BLUE)$(PROJECT_NAME) - Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

## Installation targets
install: ## Install all dependencies
	@echo "$(BLUE)Installing dependencies...$(RESET)"
	@if ! command -v pnpm >/dev/null 2>&1; then \
		echo "$(RED)Error: pnpm is not installed. Please install pnpm first.$(RESET)"; \
		exit 1; \
	fi
	pnpm install
	@echo "$(GREEN)Dependencies installed successfully!$(RESET)"

install:frozen ## Install dependencies from lockfile (CI)
	@echo "$(BLUE)Installing dependencies from lockfile...$(RESET)"
	pnpm install --frozen-lockfile
	@echo "$(GREEN)Dependencies installed from lockfile!$(RESET)"

## Development targets
dev: ## Start development servers for all apps
	@echo "$(BLUE)Starting development servers...$(RESET)"
	pnpm dev

dev:web ## Start development server for web app only
	@echo "$(BLUE)Starting web app development server...$(RESET)"
	pnpm nx serve web

dev:api ## Start development server for API only
	@echo "$(BLUE)Starting API development server...$(RESET)"
	pnpm nx serve api

## Build targets
build: ## Build all applications and libraries
	@echo "$(BLUE)Building all projects...$(RESET)"
	pnpm build
	@echo "$(GREEN)Build completed successfully!$(RESET)"

build:prod ## Build for production
	@echo "$(BLUE)Building for production...$(RESET)"
	NODE_ENV=production pnpm build
	@echo "$(GREEN)Production build completed!$(RESET)"

build:affected ## Build only affected projects
	@echo "$(BLUE)Building affected projects...$(RESET)"
	pnpm nx affected:build
	@echo "$(GREEN)Affected projects built successfully!$(RESET)"

## Test targets
test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(RESET)"
	pnpm test

test:watch ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(RESET)"
	pnpm test:watch

test:coverage ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(RESET)"
	pnpm nx run-many --target=test --all --coverage

test:affected ## Run tests for affected projects only
	@echo "$(BLUE)Running tests for affected projects...$(RESET)"
	pnpm nx affected:test

test:e2e ## Run end-to-end tests
	@echo "$(BLUE)Running E2E tests...$(RESET)"
	pnpm nx run-many --target=e2e --all

## Code quality targets
lint: ## Run linting on all projects
	@echo "$(BLUE)Linting all projects...$(RESET)"
	pnpm lint

lint:fix ## Run linting with auto-fix
	@echo "$(BLUE)Linting and fixing all projects...$(RESET)"
	pnpm lint:fix

format: ## Format all code with Prettier
	@echo "$(BLUE)Formatting code...$(RESET)"
	pnpm format

format:check ## Check code formatting
	@echo "$(BLUE)Checking code formatting...$(RESET)"
	pnpm format:check

## Utility targets
clean: ## Clean all build artifacts and dependencies
	@echo "$(YELLOW)Cleaning build artifacts and dependencies...$(RESET)"
	pnpm clean
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf libs/*/node_modules
	rm -rf tools/*/node_modules
	@echo "$(GREEN)Cleanup completed!$(RESET)"

graph: ## Generate project dependency graph
	@echo "$(BLUE)Generating dependency graph...$(RESET)"
	pnpm graph

affected ## Show affected projects
	@echo "$(BLUE)Showing affected projects...$(RESET)"
	pnpm affected

## Docker targets
docker:build ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(RESET)"
	@if [ -f $(DOCKER_COMPOSE_FILE) ]; then \
		docker-compose -f $(DOCKER_COMPOSE_FILE) build; \
	else \
		echo "$(YELLOW)Docker compose file not found at $(DOCKER_COMPOSE_FILE)$(RESET)"; \
	fi
	@echo "$(GREEN)Docker images built successfully!$(RESET)"

docker:up ## Start all services with Docker Compose
	@echo "$(BLUE)Starting services with Docker Compose...$(RESET)"
	@if [ -f $(DOCKER_COMPOSE_FILE) ]; then \
		docker-compose -f $(DOCKER_COMPOSE_FILE) up -d; \
		echo "$(GREEN)Services started successfully!$(RESET)"; \
		echo "$(YELLOW)Use 'make docker:logs' to view logs$(RESET)"; \
	else \
		echo "$(RED)Docker compose file not found at $(DOCKER_COMPOSE_FILE)$(RESET)"; \
		echo "$(YELLOW)Creating basic docker-compose.yml structure...$(RESET)"; \
		mkdir -p docker; \
		echo "version: '3.8'" > $(DOCKER_COMPOSE_FILE); \
		echo "services:" >> $(DOCKER_COMPOSE_FILE); \
		echo "  # Add your services here" >> $(DOCKER_COMPOSE_FILE); \
		echo "$(GREEN)Created basic $(DOCKER_COMPOSE_FILE)$(RESET)"; \
	fi

docker:down ## Stop all services
	@echo "$(BLUE)Stopping Docker services...$(RESET)"
	@if [ -f $(DOCKER_COMPOSE_FILE) ]; then \
		docker-compose -f $(DOCKER_COMPOSE_FILE) down; \
	else \
		echo "$(YELLOW)Docker compose file not found$(RESET)"; \
	fi
	@echo "$(GREEN)Services stopped!$(RESET)"

docker:logs ## Show logs from all services
	@echo "$(BLUE)Showing Docker logs...$(RESET)"
	@if [ -f $(DOCKER_COMPOSE_FILE) ]; then \
		docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f; \
	else \
		echo "$(YELLOW)Docker compose file not found$(RESET)"; \
	fi

docker:dev ## Start development environment with Docker
	@echo "$(BLUE)Starting development environment...$(RESET)"
	@if [ -f $(DOCKER_COMPOSE_DEV_FILE) ]; then \
		docker-compose -f $(DOCKER_COMPOSE_DEV_FILE) up -d; \
	else \
		echo "$(YELLOW)Development compose file not found, using main compose file$(RESET)"; \
		make docker:up; \
	fi

## CI/CD targets
ci: ## Run full CI pipeline (install, lint, test, build)
	@echo "$(BLUE)Running CI pipeline...$(RESET)"
	make install:frozen
	make lint
	make test
	make build
	@echo "$(GREEN)CI pipeline completed successfully!$(RESET)"

ci:affected ## Run CI for affected projects only
	@echo "$(BLUE)Running CI for affected projects...$(RESET)"
	make install:frozen
	pnpm nx affected:lint
	pnpm nx affected:test
	pnpm nx affected:build
	@echo "$(GREEN)Affected CI pipeline completed!$(RESET)"

## Release targets
version:patch ## Bump patch version
	@echo "$(BLUE)Bumping patch version...$(RESET)"
	pnpm version patch

version:minor ## Bump minor version
	@echo "$(BLUE)Bumping minor version...$(RESET)"
	pnpm version minor

version:major ## Bump major version
	@echo "$(BLUE)Bumping major version...$(RESET)"
	pnpm version major
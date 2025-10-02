# 🛠️ Developer Onboarding Checklist

## 💻 Workstation Setup

### Core Dependencies
- [ ] Node.js 18+ (`nvm use`)
- [ ] Python 3.11+ (`pyenv install`)
- [ ] Rust 1.75+ (`rustup install`)
- [ ] Docker Desktop 4.25+

```bash
# Verify installations
node -v && npm -v
python --version
rustc --version
docker version
```

## 📦 Project Setup

1. Clone repository:
   ```bash
   git clone https://github.com/nextgen-marketplace/platform.git
   cd platform
   ```

2. Install core tools:
   ```bash
   pnpm install -g @nx/cli
   brew install postgresql redis
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Update values for:
   - POSTGRES_URL
   - REDIS_URL
   - BLOCKCHAIN_RPC_URL
   ```

## 🚀 First-Time Setup

```bash
# Start core services
docker-compose up -d postgres redis

# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed
```

## ✅ Verification

```bash
# Run smoke tests
make ci

# Start development servers
pnpm dev
```

⚠️ **Troubleshooting**
- If Docker issues occur, run `docker system prune`
- For Python dependency conflicts, use `pipenv install`
- Blockchain node errors? Try `npx hardhat node --reset`

[//]: # (File path: docs/onboarding/checklist.md)
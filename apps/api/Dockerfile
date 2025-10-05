FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Install deps
COPY . .
RUN pnpm install --frozen-lockfile --offline || pnpm install --frozen-lockfile

# Build (if TypeScript compile step needed)
RUN pnpm -w build || true

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]

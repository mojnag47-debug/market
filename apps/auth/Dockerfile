FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy auth service files
COPY apps/auth/package.json ./apps/auth/
COPY apps/auth/src ./apps/auth/src
COPY apps/auth/nest-cli.json ./apps/auth/
COPY apps/auth/tsconfig*.json ./apps/auth/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build the application
WORKDIR /app/apps/auth
RUN pnpm build

FROM node:18-alpine AS runtime

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/auth/dist ./dist
COPY --from=builder /app/apps/auth/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

USER node

CMD ["node", "dist/main.js"]
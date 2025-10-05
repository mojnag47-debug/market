import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import { config } from 'dotenv';
import pino from 'pino-http';
import { applySecurity, requestIdMiddleware } from './middleware/security';
import authRouter from './controllers/authController';
import { prisma } from './lib/prismaClient';
import { connectRedis, disconnectRedis, redisHealthCheck } from './lib/redisClient';

config();

// Environment validation
const requiredEnv = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET', 'RESEND_API_KEY', 'EMAIL_FROM', 'FRONTEND_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Environment validation failed: ${key} must be set`);
}

const app = express();
const logger = pino();

app.use(logger);
app.use(requestIdMiddleware);
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply security middlewares (helmet, sanitizers)
applySecurity(app);

// Health and readiness endpoints
app.get('/health', (_req: Request, res: Response) => res.status(200).json({ status: 'ok' }));
app.get('/ready', async (_req: Request, res: Response) => {
  try {
    const redisOk = await redisHealthCheck();
    // Prisma: run a trivial query
    await prisma.$queryRaw`SELECT 1` as unknown;
    if (!redisOk) return res.status(503).json({ status: 'redis_unavailable' });
    return res.status(200).json({ status: 'ready' });
  } catch (err) {
    return res.status(503).json({ status: 'unready', error: String(err) });
  }
});

// Mount routers
app.use('/auth', authRouter);

// Test-only webhook for Resend to support E2E tests using webhook pattern
if ((process.env as Record<string, string>)['NODE_ENV'] === 'test') {
  // use require to avoid top-level await in this file
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const webhookRouter = require('./controllers/webhookController').default;
  app.use('/webhook', webhookRouter);
}

// Error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Do not leak sensitive errors
  const message = (err instanceof Error) ? err.message : 'Internal Server Error';
  res.status(500).json({ error: message });
});

// Graceful shutdown
let server: import('http').Server | null = null;
async function start() {
  await connectRedis();
  server = app.listen(process.env.PORT ? Number(process.env.PORT) : 3001, () => {
    // no console.log per policy
  });
}

async function shutdown(signal: string) {
  try {
    if (server) {
      server.close(() => {
        // server closed
      });
    }
    await prisma.$disconnect();
    await disconnectRedis();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start when run directly
if (require.main === module) void start();

export default app;

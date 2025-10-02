import { PrismaClient } from '@prisma/client';

// Global database client instance
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['warn', 'error'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

export { prisma };
export * from '@prisma/client';

// Database health check
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  } catch (error) {
    return { status: 'error', database: 'disconnected', error: error?.toString() };
  }
}

// Graceful shutdown
export async function disconnect() {
  await prisma.$disconnect();
}
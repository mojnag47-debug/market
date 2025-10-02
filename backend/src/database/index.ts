import { PrismaClient } from '@prisma/client';

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
    errorFormat: 'colored',
  });
};

// Use global instance in development to prevent multiple connections
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Database health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Database statistics
export const getDatabaseStats = async () => {
  try {
    const [
      userCount,
      productCount,
      orderCount,
      categoryCount,
      paymentCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count(),
      prisma.payment.count(),
    ]);

    return {
      users: userCount,
      products: productCount,
      orders: orderCount,
      categories: categoryCount,
      payments: paymentCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    throw error;
  }
};

export default prisma;
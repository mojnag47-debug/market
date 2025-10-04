import { PrismaClient } from '@prisma/client';
import { AppError } from './types';

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'minimal',
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.__prisma;
}

// Prisma middleware for soft deletes (if needed)
prisma.$use(async (params: any, next: (params: any) => Promise<any>) => {
  // Handle soft delete for User model
  if (params.model === 'User') {
    if (params.action === 'delete') {
      // Convert delete to update with isActive = false
      params.action = 'update';
      params.args['data'] = { isActive: false };
    }
    
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data['isActive'] = false;
      } else {
        params.args['data'] = { isActive: false };
      }
    }
  }

  return next(params);
});

// Prisma middleware for automatic timestamps
prisma.$use(async (params: any, next: (params: any) => Promise<any>) => {
  if (params.action === 'create') {
    if (params.args.data) {
      params.args.data.createdAt = new Date();
      params.args.data.updatedAt = new Date();
    }
  }

  if (params.action === 'update' || params.action === 'upsert') {
    if (params.args.data) {
      params.args.data.updatedAt = new Date();
    }
  }

  return next(params);
});

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database health check failed:', error);
    return false;
  }
};

// Database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log('✅ Database connected successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Database connection failed:', error);
    throw new AppError('Database connection failed', 500);
  }
};

// Database disconnection
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Database disconnection failed:', error);
  }
};

// Transaction wrapper
export const withTransaction = async <T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> => {
  return prisma.$transaction(callback);
};

// Pagination helper
export const paginate = (page = 1, limit = 10): { skip: number; take: number } => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

// Build pagination response
export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export { prisma };
export default prisma;
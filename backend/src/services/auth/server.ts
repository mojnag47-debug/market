import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { connectDatabase } from '../../shared/database';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { setupSwagger } from '../../shared/swagger';
import authRoutes from './authRoutes';

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [\"'self'\"],
      styleSrc: [\"'self'\", \"'unsafe-inline'\"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.LOG_FORMAT || 'combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    service: 'auth',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Setup Swagger documentation
setupSwagger(app, 'Auth Service', PORT);

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Auth service running on port ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      // eslint-disable-next-line no-console
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start Auth service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer().catch(error => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
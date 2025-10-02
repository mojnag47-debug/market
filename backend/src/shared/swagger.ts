import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'NextGen Marketplace API',
    version: '1.0.0',
    description: 'A comprehensive Persian e-commerce marketplace API with AI recommendations and Zarinpal integration',
    contact: {
      name: 'NextGen Team',
      email: 'support@nextgen-marketplace.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Auth Service Development Server',
    },
    {
      url: 'http://localhost:3002', 
      description: 'Users Service Development Server',
    },
    {
      url: 'http://localhost:3003',
      description: 'Products Service Development Server',
    },
    {
      url: 'http://localhost:3004',
      description: 'Orders Service Development Server',
    },
    {
      url: 'https://api.nextgen-marketplace.com',
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'cuid',
            example: 'clp123abc456def789',
            description: 'Unique user identifier',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
            description: 'User email address',
          },
          firstName: {
            type: 'string',
            example: 'احمد',
            description: 'User first name in Persian',
          },
          lastName: {
            type: 'string',
            example: 'محمدی',
            description: 'User last name in Persian',
          },
          username: {
            type: 'string',
            example: 'ahmad_m',
            description: 'Unique username',
          },
          phoneNumber: {
            type: 'string',
            pattern: '^(\\+98|0)?9\\d{9}$',
            example: '09123456789',
            description: 'Persian mobile number format',
          },
          role: {
            type: 'string',
            enum: ['CUSTOMER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'],
            example: 'CUSTOMER',
            description: 'User role',
          },
          isActive: {
            type: 'boolean',
            example: true,
            description: 'Whether user account is active',
          },
          emailVerified: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-01-15T10:30:00Z',
            description: 'Email verification timestamp',
          },
          phoneVerified: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-01-15T10:30:00Z',
            description: 'Phone verification timestamp',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T10:00:00Z',
            description: 'Account creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T15:45:00Z',
            description: 'Last update timestamp',
          },
        },
        required: ['id', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
      },
      TokenPair: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT access token',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT refresh token',
          },
        },
        required: ['accessToken', 'refreshToken'],
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'cuid',
            example: 'clp456def789ghi012',
            description: 'Unique product identifier',
          },
          name: {
            type: 'string',
            example: 'گوشی هوشمند سامسونگ',
            description: 'Product name in Persian',
          },
          slug: {
            type: 'string',
            example: 'samsung-galaxy-a54',
            description: 'URL-friendly product identifier',
          },
          description: {
            type: 'string',
            example: 'گوشی هوشمند با قابلیت‌های پیشرفته',
            description: 'Product description in Persian',
          },
          price: {
            type: 'number',
            format: 'float',
            example: 15000000,
            description: 'Product price in Iranian Rials',
          },
          comparePrice: {
            type: 'number',
            format: 'float',
            example: 18000000,
            description: 'Original price for comparison',
          },
          stock: {
            type: 'integer',
            minimum: 0,
            example: 25,
            description: 'Available stock quantity',
          },
          sku: {
            type: 'string',
            example: 'SAM-GAL-A54-128GB',
            description: 'Stock keeping unit',
          },
          imageUrls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
            },
            example: ['https://cdn.example.com/product1.jpg'],
            description: 'Product image URLs',
          },
          isActive: {
            type: 'boolean',
            example: true,
            description: 'Whether product is active',
          },
          isFeatured: {
            type: 'boolean',
            example: false,
            description: 'Whether product is featured',
          },
          categoryId: {
            type: 'string',
            format: 'cuid',
            example: 'clp789ghi012jkl345',
            description: 'Category identifier',
          },
          sellerId: {
            type: 'string',
            format: 'cuid',
            example: 'clp012jkl345mno678',
            description: 'Seller identifier',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T15:45:00Z',
          },
        },
        required: ['id', 'name', 'slug', 'description', 'price', 'stock', 'imageUrls', 'isActive', 'categoryId', 'createdAt', 'updatedAt'],
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'cuid',
            example: 'clp789ghi012jkl345',
          },
          name: {
            type: 'string',
            example: 'موبایل و تبلت',
            description: 'Category name in Persian',
          },
          slug: {
            type: 'string',
            example: 'mobile-tablet',
          },
          description: {
            type: 'string',
            example: 'گوشی‌های هوشمند و تبلت',
            description: 'Category description in Persian',
          },
          imageUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://cdn.example.com/category1.jpg',
          },
          parentId: {
            type: 'string',
            format: 'cuid',
            nullable: true,
            example: 'clp345mno678pqr901',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T15:45:00Z',
          },
        },
        required: ['id', 'name', 'slug', 'createdAt', 'updatedAt'],
      },
      Order: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'cuid',
            example: 'clp901pqr234stu567',
          },
          orderNumber: {
            type: 'string',
            example: 'ORD-2024-001234',
            description: 'Human-readable order number',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
            example: 'PENDING',
          },
          totalAmount: {
            type: 'number',
            format: 'float',
            example: 15000000,
            description: 'Total order amount in Iranian Rials',
          },
          shippingCost: {
            type: 'number',
            format: 'float',
            example: 50000,
            description: 'Shipping cost in Iranian Rials',
          },
          taxAmount: {
            type: 'number',
            format: 'float',
            example: 1350000,
            description: 'Tax amount in Iranian Rials',
          },
          paymentMethod: {
            type: 'string',
            enum: ['CREDIT_CARD', 'ZARINPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'],
            example: 'ZARINPAL',
          },
          paymentStatus: {
            type: 'string',
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
            example: 'PENDING',
          },
          userId: {
            type: 'string',
            format: 'cuid',
            example: 'clp123abc456def789',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T15:45:00Z',
          },
        },
        required: ['id', 'orderNumber', 'status', 'totalAmount', 'paymentMethod', 'paymentStatus', 'userId', 'createdAt', 'updatedAt'],
      },
      Address: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'cuid',
            example: 'clp567stu890vwx123',
          },
          firstName: {
            type: 'string',
            example: 'احمد',
          },
          lastName: {
            type: 'string',
            example: 'محمدی',
          },
          company: {
            type: 'string',
            example: 'شرکت نمونه',
          },
          address1: {
            type: 'string',
            example: 'خیابان ولیعصر، کوچه ۱۵، پلاک ۲۳',
          },
          address2: {
            type: 'string',
            example: 'طبقه دوم، واحد ۴',
          },
          city: {
            type: 'string',
            example: 'تهران',
          },
          state: {
            type: 'string',
            example: 'تهران',
          },
          postalCode: {
            type: 'string',
            pattern: '^\\d{10}$',
            example: '1234567890',
          },
          country: {
            type: 'string',
            example: 'IR',
            default: 'IR',
          },
          phoneNumber: {
            type: 'string',
            pattern: '^(\\+98|0)?9\\d{9}$',
            example: '09123456789',
          },
          isDefault: {
            type: 'boolean',
            example: false,
          },
          userId: {
            type: 'string',
            format: 'cuid',
            example: 'clp123abc456def789',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T15:45:00Z',
          },
        },
        required: ['id', 'firstName', 'lastName', 'address1', 'city', 'state', 'postalCode', 'country', 'userId', 'createdAt', 'updatedAt'],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            example: 1,
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 10,
          },
          total: {
            type: 'integer',
            minimum: 0,
            example: 150,
          },
          totalPages: {
            type: 'integer',
            minimum: 0,
            example: 15,
          },
          hasNext: {
            type: 'boolean',
            example: true,
          },
          hasPrev: {
            type: 'boolean',
            example: false,
          },
        },
        required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev'],
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T15:45:00Z',
          },
          path: {
            type: 'string',
            example: '/api/auth/login',
          },
        },
        required: ['success', 'message', 'timestamp'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'An error occurred',
          },
          error: {
            type: 'string',
            example: 'Detailed error message',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T15:45:00Z',
          },
          path: {
            type: 'string',
            example: '/api/auth/login',
          },
        },
        required: ['success', 'message', 'timestamp'],
      },
    },
    responses: {
      ValidationError: {
        description: 'Validation Error',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ErrorResponse' },
                {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        errors: {
                          type: 'object',
                          additionalProperties: {
                            type: 'string',
                          },
                          example: {
                            email: 'Invalid email format',
                            password: 'Password must be at least 8 characters',
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      UnauthorizedError: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Access token is required',
              timestamp: '2024-01-15T15:45:00Z',
              path: '/api/auth/profile',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Insufficient permissions',
              timestamp: '2024-01-15T15:45:00Z',
              path: '/api/admin/users',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Resource not found',
              timestamp: '2024-01-15T15:45:00Z',
              path: '/api/products/non-existent-id',
            },
          },
        },
      },
      ConflictError: {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'User with this email already exists',
              timestamp: '2024-01-15T15:45:00Z',
              path: '/api/auth/register',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Internal server error',
              timestamp: '2024-01-15T15:45:00Z',
              path: '/api/products',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and profile management',
    },
    {
      name: 'Users',
      description: 'User management operations (admin)',
    },
    {
      name: 'Products',
      description: 'Product catalog management',
    },
    {
      name: 'Categories',
      description: 'Product category management',
    },
    {
      name: 'Orders',
      description: 'Order management and processing',
    },
    {
      name: 'Cart',
      description: 'Shopping cart operations',
    },
    {
      name: 'Reviews',
      description: 'Product reviews and ratings',
    },
    {
      name: 'Addresses',
      description: 'User address management',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/services/**/*.ts', './src/services/**/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express, serviceName: string, port: number): void => {
  // Swagger UI setup
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `NextGen Marketplace API - ${serviceName}`,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  }));

  // JSON endpoint for swagger spec
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // eslint-disable-next-line no-console
  console.log(`📖 API Documentation available at: http://localhost:${port}/docs`);
};

export { swaggerSpec };
export default { setupSwagger, swaggerSpec };
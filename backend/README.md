# NextGen Marketplace Backend

A production-ready Node.js/TypeScript backend for the NextGen Marketplace - A comprehensive Persian e-commerce platform with microservices architecture, JWT authentication, and comprehensive API documentation.

## 🚀 Features

- **Microservices Architecture**: Separate services for Auth, Users, Products, and Orders
- **JWT Authentication**: Secure token-based authentication with role-based authorization
- **Persian Localization**: Full Persian language support with RTL validation
- **Input Validation**: Comprehensive validation using Zod schemas
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **API Documentation**: Complete Swagger/OpenAPI 3.0 documentation
- **Database**: PostgreSQL with Prisma ORM and soft deletes
- **Testing**: Jest unit tests with >50% coverage
- **Code Quality**: ESLint + Prettier with strict TypeScript rules
- **Security**: Rate limiting, CORS, Helmet, input sanitization
- **Persian Features**: National ID validation, Persian mobile numbers, postal codes

## 📁 Project Structure

```
backend/
├── src/
│   ├── shared/           # Shared utilities and configurations
│   │   ├── types.ts      # TypeScript interfaces and types
│   │   ├── database.ts   # Prisma client and database utilities
│   │   └── swagger.ts    # API documentation configuration
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT authentication middleware
│   │   ├── validation.ts # Zod validation schemas
│   │   └── errorHandler.ts # Error handling middleware
│   └── services/         # Microservices
│       ├── auth/         # Authentication service
│       │   ├── authService.ts
│       │   ├── authController.ts
│       │   ├── authRoutes.ts
│       │   ├── server.ts
│       │   └── auth.test.ts
│       ├── users/        # User management service
│       ├── products/     # Product catalog service
│       │   └── productService.ts
│       └── orders/       # Order management service
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── .env.example         # Environment variables template
└── README.md            # This file
```

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier
- **Security**: Helmet, CORS, bcryptjs, express-rate-limit

## 🚦 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 13
- Redis (optional, for caching)

### Installation

1. **Clone and install dependencies:**

```bash
cd backend
pnpm install
```

2. **Environment setup:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup:**

```bash
# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Run migrations (optional)
pnpm db:migrate
```

4. **Start development servers:**

```bash
# Start all services
pnpm dev

# Or start individual services
pnpm dev:auth     # Auth service on port 3001
pnpm dev:users    # Users service on port 3002  
pnpm dev:products # Products service on port 3003
pnpm dev:orders   # Orders service on port 3004
```

## 📚 API Documentation

After starting the services, access the Swagger documentation:

- **Auth Service**: http://localhost:3001/docs
- **Users Service**: http://localhost:3002/docs
- **Products Service**: http://localhost:3003/docs
- **Orders Service**: http://localhost:3004/docs

## 🔐 Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **CUSTOMER**: Regular customers
- **SELLER**: Product sellers
- **ADMIN**: Platform administrators
- **SUPER_ADMIN**: Full system access

### Example API Calls

**Register a new user:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "احمد",
    "lastName": "محمدی",
    "phoneNumber": "09123456789"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Get user profile:**

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test auth.test.ts
```

### Test Coverage

Current test coverage includes:

- **Auth Service**: User registration, login, password management, profile operations
- **Validation**: Input validation with Zod schemas
- **Error Handling**: Custom error classes and middleware
- **Persian Validation**: National ID, mobile numbers, postal codes

## 🔧 Development

### Code Quality

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm build
```

### Database Operations

```bash
# Generate Prisma client
pnpm db:generate

# Apply schema changes
pnpm db:push

# Create migration
pnpm db:migrate

# View database in browser
pnpm db:studio

# Seed database
pnpm db:seed
```

## 🌐 Persian Features

### Validation Utilities

The backend includes comprehensive Persian validation:

```typescript
// Persian mobile number validation
const mobile = "09123456789"; // ✅ Valid

// Persian national ID validation  
const nationalId = "0123456789"; // ✅ Valid with checksum

// Persian postal code validation
const postalCode = "1234567890"; // ✅ Valid 10-digit format
```

### Persian Text Support

- **RTL Support**: Proper text direction handling
- **Persian Numbers**: Conversion between Persian and English digits
- **Address Fields**: Persian address format validation
- **User Names**: Full Persian character support

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Fine-grained permission control
- **Password Hashing**: bcrypt with configurable salt rounds
- **Token Expiration**: Configurable access/refresh token expiry

### Input Validation

- **Zod Schemas**: Type-safe input validation
- **Persian Validation**: National ID, mobile, postal code validation
- **File Upload**: Secure file handling with type/size validation
- **SQL Injection**: Protected via Prisma ORM

### Security Headers

- **Helmet**: Security headers middleware
- **CORS**: Cross-origin request control
- **Rate Limiting**: Request rate limiting per IP/user
- **Input Sanitization**: XSS protection

## 🚀 Production Deployment

### Environment Variables

Key production environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Security
JWT_SECRET="your-256-bit-secret-key"
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="https://yourdomain.com"
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Health check endpoints
curl http://localhost:3001/health
```

### Docker Support

The project includes Docker configurations for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 Performance

### Database Optimization

- **Indexes**: Proper indexing on frequently queried fields
- **Pagination**: Efficient pagination for large datasets
- **Soft Deletes**: Preserve data integrity with soft deletes
- **Connection Pooling**: Optimized database connections

### Caching Strategy

- **Redis Integration**: Ready for Redis caching layer
- **Query Optimization**: Efficient Prisma queries with includes
- **Response Caching**: Cacheable API responses

## 🤝 Contributing

1. **Code Style**: Follow ESLint and Prettier configurations
2. **Testing**: Write tests for new features (aim for >50% coverage)
3. **Documentation**: Update Swagger documentation for API changes
4. **Types**: Use strict TypeScript typing
5. **Persian Support**: Ensure Persian/RTL compatibility

### Development Workflow

1. Create feature branch
2. Implement feature with tests
3. Run quality checks: `pnpm lint && pnpm test`
4. Update documentation
5. Submit pull request

## 📈 Monitoring & Logging

### Health Checks

Each service provides health check endpoints:

```bash
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Auth service is healthy",
  "service": "auth",
  "timestamp": "2024-01-15T15:45:00Z",
  "uptime": 3600
}
```

### Error Logging

- **Structured Logging**: JSON formatted logs
- **Error Tracking**: Detailed error information
- **Request Logging**: Morgan HTTP request logging
- **Performance Monitoring**: Response time tracking

## 📞 Support

- **Documentation**: Complete API documentation at `/docs`
- **Issues**: GitHub Issues for bug reports
- **Email**: support@nextgen-marketplace.com

## 📄 License

This project is licensed under the MIT License.

---

**NextGen Marketplace Backend** - Production-ready Persian e-commerce platform 🚀
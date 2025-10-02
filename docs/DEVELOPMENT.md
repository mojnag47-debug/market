# NextGen Marketplace - Development Guide

## Persian Intelligent Marketplace Platform

Welcome to the development guide for NextGen Marketplace - the most advanced Persian e-commerce platform with AI-powered recommendations and Zarinpal integration.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (enforced)
- **Docker** and **Docker Compose** (for services)
- **Git**

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd nextgen-marketplace
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Services**
   ```bash
   # Start database and services
   make docker:dev
   
   # Start all development servers
   make dev
   ```

## 🏗️ Architecture Overview

### Applications Structure

```
apps/
├── marketplace-web/     # Main customer-facing Next.js app
├── admin-dashboard/     # Admin management interface
├── seller-portal/       # Seller management dashboard
├── api/                # Main backend API (Express.js)
└── api-e2e/            # End-to-end API tests
```

### Shared Libraries

```
libs/
├── shared-types/        # TypeScript definitions for entire platform
├── shared-ui/          # Reusable UI components
├── shared-utils/       # Common utility functions
├── shared-data/        # Data access layer and API clients
├── payment-zarinpal/   # Zarinpal payment integration
├── ai-recommendations/ # AI recommendation engine
└── persian-utils/      # Persian/RTL utilities and helpers
```

## 🧠 AI Recommendation System

The platform includes a sophisticated AI recommendation engine with multiple strategies:

### Recommendation Strategies

1. **Collaborative Filtering** (30% weight)
   - Find users with similar purchase patterns
   - Recommend products liked by similar users

2. **Content-Based Filtering** (40% weight)
   - Analyze product features and user preferences
   - Match products based on categories, brands, features

3. **Trending Products** (20% weight)
   - Surface popular and trending items
   - Based on views, sales, and ratings

4. **Recently Viewed** (10% weight)
   - Show similar products to recently viewed items

### Usage Example

```typescript
import { AIRecommendationEngine } from '@nextgen-marketplace/ai-recommendations';

const engine = new AIRecommendationEngine();

// Get personalized recommendations
const recommendations = await engine.getPersonalizedRecommendations(userId, 10);

// Get similar products
const similar = await engine.getSimilarProducts(productId, 6);

// Track user behavior
engine.trackEvent({
  type: AnalyticsEventType.PRODUCT_VIEW,
  userId,
  productId,
  timestamp: new Date()
});
```

## 💳 Zarinpal Integration

Complete payment integration with Zarinpal gateway:

### Features

- **Secure Payment Processing**
- **Iranian Rial Support**
- **Sandbox/Production Modes**
- **Transaction Verification**
- **Persian Error Messages**
- **Mobile Number & National ID Validation**

### Usage Example

```typescript
import { ZarinpalClient } from '@nextgen-marketplace/payment-zarinpal';

const zarinpal = new ZarinpalClient({
  merchantId: process.env.ZARINPAL_MERCHANT_ID,
  sandbox: process.env.NODE_ENV === 'development'
});

// Request payment
const payment = await zarinpal.requestPayment({
  amount: 100000, // 10,000 Toman in Rials
  description: 'خرید محصول از بازارچه نکست‌جن',
  callbackUrl: 'http://localhost:3000/payment/callback',
  mobile: '09123456789',
  email: 'user@example.com'
});

// Verify payment
const verification = await zarinpal.verifyPayment({
  amount: 100000,
  authority: payment.authority
});
```

## 🌐 Persian & RTL Support

Comprehensive Persian language and RTL support:

### Persian Utilities

```typescript
import { Persian } from '@nextgen-marketplace/persian-utils';

// Number conversion
Persian.Numbers.toPersian('1234');        // '۱۲۳۴'
Persian.Numbers.toEnglish('۱۲۳۴');        // '1234'
Persian.Numbers.formatToman(1000000);     // '۱۰۰٪۰۰۰ تومان'

// Date formatting
Persian.Date.toPersian(new Date());       // '۱ دی ۱۴۰۳'
Persian.Date.getRelativeTime(date);       // '۲ ساعت پیش'

// Validation
Persian.Validation.validateNationalId('0123456789');  // true
Persian.Validation.validateMobileNumber('09123456789'); // true

// Text processing
Persian.Text.fixPersianText('متن فارسی');
Persian.RTL.getTextDirection('سلام');     // 'rtl'
```

## 🛠️ Development Commands

### Core Development

```bash
# Start all development servers
make dev
pnpm dev

# Start specific apps
make dev:web      # Customer web app
make dev:api      # Backend API
pnpm nx serve marketplace-web
pnpm nx serve api

# Build applications
make build
pnpm nx run-many --target=build --all

# Build specific app
pnpm nx build marketplace-web
```

### Testing

```bash
# Run all tests
make test
pnpm test

# Test specific library
pnpm nx test shared-types
pnpm nx test payment-zarinpal

# Run E2E tests
make test:e2e
pnpm nx e2e api-e2e
```

### Code Quality

```bash
# Lint and fix
make lint:fix
pnpm lint:fix

# Format code
make format
pnpm format

# Type checking
pnpm nx run-many --target=typecheck --all
```

### Database & Services

```bash
# Start development services
make docker:dev

# View service logs
make docker:logs

# Stop services
make docker:down

# Database management
# Access Adminer at http://localhost:8080
# PostgreSQL: localhost:5432 (postgres/postgres)
```

## 🏢 Application Features

### Customer Web App (marketplace-web)
- Persian RTL interface
- AI-powered product recommendations
- Advanced search with Persian support
- Zarinpal payment integration
- User account management
- Order tracking
- Product reviews and ratings

### Admin Dashboard
- Complete platform management
- User and seller management
- Product catalog administration
- Order processing
- Analytics and reporting
- Payment transaction monitoring

### Seller Portal
- Product listing and management
- Inventory tracking
- Order fulfillment
- Sales analytics
- Performance insights
- Communication tools

### Backend API
- RESTful API design
- JWT authentication
- Role-based authorization
- Database integration
- File upload handling
- Email and SMS notifications

## 🔧 Development Tips

### Working with Nx

```bash
# Generate new library
pnpm nx generate @nx/js:lib new-feature

# Generate new component
pnpm nx generate @nx/react:component button --project=shared-ui

# View project graph
pnpm nx graph

# Run affected tests only
pnpm nx affected:test

# Show project details
pnpm nx show project marketplace-web
```

### Environment Variables

Key environment variables to configure:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nextgen_marketplace"

# Zarinpal
ZARINPAL_MERCHANT_ID="your-merchant-id"
ZARINPAL_SANDBOX="true"

# Application
PORT="3000"
API_PORT="3001"
JWT_SECRET="your-jwt-secret"
```

## 📊 Project Status

✅ **Completed Features:**
- Monorepo setup with pnpm + Nx
- Persian TypeScript type definitions
- Zarinpal payment integration
- AI recommendation engine
- Persian utilities and RTL support
- Basic application structure
- Development environment configuration

🚧 **In Progress:**
- Database schema design
- API implementation
- UI component library
- Authentication system

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and test: `make test`
3. Commit with clear messages
4. Push and create Pull Request

## 📝 Additional Resources

- [Nx Documentation](https://nx.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zarinpal API Documentation](https://www.zarinpal.com/lab/documentation/)
- [Persian Calendar Information](https://github.com/persian-calendar)

---

**NextGen Marketplace** - Building the future of Persian e-commerce with AI 🚀
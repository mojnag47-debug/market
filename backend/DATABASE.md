# NextGen Marketplace Database Layer

## Overview
This document describes the complete database layer for the NextGen Marketplace, built with PostgreSQL and Prisma ORM.

## 🏗️ Database Schema

### Core Models

#### Users (`users`)
- **Primary Key**: `id` (CUID)
- **Unique Fields**: `email`, `username`
- **Roles**: ADMIN, SELLER, BUYER
- **Status**: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- **Features**:
  - Password hashing with bcrypt
  - Email verification system
  - Password reset functionality
  - JSON address storage
  - Profile management

#### Seller Profiles (`seller_profiles`)
- **Purpose**: Extended seller information
- **Features**:
  - Business details and verification
  - Rating and review system
  - Sales metrics tracking
  - Business address and contact info

#### Products (`products`)
- **Primary Key**: `id` (CUID)
- **Unique Fields**: `slug`, `sku`
- **Status**: ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED
- **Features**:
  - Inventory management
  - SEO-friendly URLs
  - Image galleries
  - Tag system
  - Pricing with compare-at pricing
  - View and sales tracking

#### Categories (`categories`)
- **Hierarchical Structure**: Self-referencing parent-child relationships
- **Unique Fields**: `name`, `slug`
- **Features**: Nested category support

#### Orders (`orders`)
- **Primary Key**: `id` (CUID)
- **Unique Fields**: `orderNumber`
- **Status**: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
- **Features**:
  - Comprehensive order tracking
  - Address storage (JSON)
  - Tax and shipping calculations
  - Status history with timestamps

#### Cart Items (`cart_items`)
- **Composite Unique Key**: `userId` + `productId`
- **Features**: Persistent cart across sessions

#### Payments (`payments`)
- **Multiple Payment Methods**: CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER, CRYPTOCURRENCY, WALLET
- **Status**: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED
- **Features**:
  - Payment gateway integration support
  - Transaction tracking
  - Refund management

### System Models

#### Roles (`roles`)
- **Purpose**: Permission-based access control
- **Features**: JSON-based permission storage

#### Audit Logs (`audit_logs`)
- **Purpose**: System activity tracking
- **Features**: Complete audit trail for all entities

#### System Settings (`system_settings`)
- **Purpose**: Configuration management
- **Features**: Type-safe setting storage (string, number, boolean, json)

## 📊 Database Indexes

### Performance Optimization
The schema includes comprehensive indexing for optimal query performance:

#### User Indexes
- `email`, `username` (unique)
- `role`, `status`, `createdAt`

#### Product Indexes
- `sellerId`, `categoryId`, `status`, `featured`
- `slug`, `sku`, `price`, `createdAt`

#### Order Indexes
- `userId`, `status`, `orderNumber`, `createdAt`

#### Payment Indexes
- `orderId`, `userId`, `status`, `method`, `transactionId`, `createdAt`

## 🔧 Setup Instructions

### 1. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nextgen_marketplace"
```

### 2. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema to database (development)
npm run db:push
```

### 3. Seed Database
```bash
# Run seed script
npm run db:seed
```

### 4. Default Accounts
After seeding, you can use these accounts:

**Admin Account:**
- Email: `admin@nextgen-marketplace.com`
- Password: `Admin123!@#`

**Sample Seller Accounts:**
- Email: `seller1@example.com`, Password: `Seller123!`
- Email: `seller2@example.com`, Password: `Seller456!`

**Sample Buyer Account:**
- Email: `buyer1@example.com`, Password: `Buyer123!`

## 🔍 Common Queries

### User Management

```typescript
import { findUserByEmail, createUser, updateUserProfile } from './database/queries';

// Find user by email
const user = await findUserByEmail('user@example.com');

// Create new user
const newUser = await createUser({
  email: 'new@example.com',
  username: 'newuser',
  firstName: 'John',
  lastName: 'Doe',
  password: 'securepassword',
  role: 'BUYER'
});

// Update user profile
const updatedUser = await updateUserProfile(userId, {
  firstName: 'Jane',
  phoneNumber: '+1-555-0123'
});
```

### Product Management

```typescript
import { createProduct, findProducts, findProductBySlug } from './database/queries';

// Create product
const product = await createProduct(sellerId, {
  name: 'Amazing Product',
  description: 'Product description',
  price: 99.99,
  sku: 'PROD-001',
  categoryId: categoryId,
  quantity: 100,
  images: ['image1.jpg', 'image2.jpg']
});

// Search products with filters
const results = await findProducts({
  search: 'laptop',
  categoryId: electronicsCategory.id,
  minPrice: 500,
  maxPrice: 2000,
  page: 1,
  limit: 20,
  sortBy: 'price',
  sortOrder: 'asc'
});

// Find product by slug
const product = await findProductBySlug('macbook-pro-14-m3');
```

### Cart Operations

```typescript
import { addToCart, getUserCart, updateCartItemQuantity } from './database/queries';

// Add item to cart
await addToCart(userId, productId, 2);

// Get user's cart
const { cartItems, total } = await getUserCart(userId);

// Update quantity
await updateCartItemQuantity(userId, productId, 3);
```

### Order Management

```typescript
import { createOrderFromCart, findOrderById, updateOrderStatus } from './database/queries';

// Create order from cart
const { order, orderItems } = await createOrderFromCart(userId, {
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  taxAmount: 8.99,
  shippingAmount: 9.99
});

// Find order with details
const orderDetails = await findOrderById(orderId);

// Update order status
await updateOrderStatus(orderId, 'SHIPPED', {
  trackingNumber: 'TRACK123456'
});
```

### Analytics

```typescript
import { getSellerDashboardStats, getAdminDashboardStats } from './database/queries';

// Seller dashboard stats
const sellerStats = await getSellerDashboardStats(sellerId);

// Admin dashboard stats
const adminStats = await getAdminDashboardStats();
```

## 🔒 Security Features

### Data Protection
- **Password Hashing**: bcrypt with salt rounds 12
- **Email Verification**: Token-based verification system
- **Password Reset**: Secure token-based reset flow
- **Audit Logging**: Complete activity tracking
- **Input Validation**: Prisma schema validation
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

### Access Control
- **Role-Based Permissions**: Granular permission system
- **User Status Management**: Account suspension/activation
- **Seller Verification**: Business verification process

## 🚀 Performance Optimizations

### Database Level
- **Strategic Indexing**: Optimized for common query patterns
- **Query Optimization**: Efficient joins and relationships
- **Connection Pooling**: Built-in Prisma connection management

### Application Level
- **Transaction Support**: Atomic operations for data consistency
- **Batch Operations**: Efficient bulk data operations
- **Pagination**: Built-in pagination support
- **Selective Fields**: Optimized data fetching

## 🔄 Backup and Recovery

### Migration Management
- **Version Control**: All schema changes are tracked
- **Rollback Support**: Prisma migration rollback capabilities
- **Environment Sync**: Consistent schema across environments

### Data Backup
```bash
# Database backup
pg_dump nextgen_marketplace > backup.sql

# Database restore
psql nextgen_marketplace < backup.sql
```

## 🧪 Testing

### Seed Data
The seed script creates:
- 4+ sample users (admin, sellers, buyers)
- Product categories hierarchy
- Sample products with inventory
- System settings
- Roles and permissions

### Test Queries
Run test queries to verify setup:
```bash
# Connect to database
psql nextgen_marketplace

# Test queries
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;
```

## 📝 Maintenance

### Regular Tasks
1. **Monitor Query Performance**: Use database monitoring tools
2. **Update Statistics**: Keep database statistics current
3. **Clean Audit Logs**: Regularly archive old audit data
4. **Backup Database**: Implement regular backup schedule
5. **Update Dependencies**: Keep Prisma and dependencies updated

### Troubleshooting
- Check database connections in `.env`
- Verify migration status: `npx prisma migrate status`
- Reset database: `npx prisma migrate reset`
- View schema: `npx prisma studio`

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)

---

This database layer provides a robust foundation for the NextGen Marketplace with comprehensive features for e-commerce operations, user management, and system administration.
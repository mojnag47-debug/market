import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../shared/types';

// Persian validation helpers
const persianMobileRegex = /^(\+98|0)?9\d{9}$/;
const persianPostalCodeRegex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Custom validation functions
const validateNationalId = (id: string): boolean => {
  if (!id || id.length !== 10 || !/^\d{10}$/.test(id)) {
    return false;
  }

  const digits = id.split('').map(Number);
  const checksum = digits[9];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }

  const remainder = sum % 11;
  return (remainder < 2 && checksum === remainder) || (remainder >= 2 && checksum === 11 - remainder);
};

// Common validation schemas
export const commonSchemas = {
  id: z.string().cuid('Invalid ID format'),
  email: z.string().regex(emailRegex, 'Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  mobile: z.string().regex(persianMobileRegex, 'Invalid Persian mobile number format'),
  postalCode: z.string().regex(persianPostalCodeRegex, 'Invalid Persian postal code format'),
  nationalId: z.string().refine(validateNationalId, 'Invalid Persian national ID'),
  
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  search: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  }),
};

// Auth validation schemas
export const authSchemas = {
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    phoneNumber: commonSchemas.mobile.optional(),
    role: z.enum(['CUSTOMER', 'SELLER']).optional().default('CUSTOMER'),
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  forgotPassword: z.object({
    email: commonSchemas.email,
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: commonSchemas.password,
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
};

// User validation schemas
export const userSchemas = {
  updateProfile: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phoneNumber: commonSchemas.mobile.optional(),
    username: z.string().min(3).max(30).optional(),
  }),

  createUser: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    phoneNumber: commonSchemas.mobile.optional(),
    role: z.enum(['CUSTOMER', 'SELLER', 'ADMIN']),
  }),

  updateUser: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phoneNumber: commonSchemas.mobile.optional(),
    role: z.enum(['CUSTOMER', 'SELLER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
  }),
};

// Address validation schemas
export const addressSchemas = {
  createAddress: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    company: z.string().max(100).optional(),
    address1: z.string().min(5).max(200),
    address2: z.string().max(200).optional(),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    postalCode: commonSchemas.postalCode,
    country: z.string().default('IR'),
    phoneNumber: commonSchemas.mobile.optional(),
    isDefault: z.boolean().optional().default(false),
  }),

  updateAddress: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    company: z.string().max(100).optional(),
    address1: z.string().min(5).max(200).optional(),
    address2: z.string().max(200).optional(),
    city: z.string().min(2).max(50).optional(),
    state: z.string().min(2).max(50).optional(),
    postalCode: commonSchemas.postalCode.optional(),
    country: z.string().optional(),
    phoneNumber: commonSchemas.mobile.optional(),
    isDefault: z.boolean().optional(),
  }),
};

// Product validation schemas
export const productSchemas = {
  createProduct: z.object({
    name: z.string().min(2).max(200),
    slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
    description: z.string().min(10).max(5000),
    price: z.number().positive('Price must be positive'),
    comparePrice: z.number().positive().optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    sku: z.string().max(100).optional(),
    barcode: z.string().max(100).optional(),
    imageUrls: z.array(z.string().url()).max(10, 'Maximum 10 images allowed'),
    categoryId: commonSchemas.id,
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
  }),

  updateProduct: z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.number().positive().optional(),
    comparePrice: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    sku: z.string().max(100).optional(),
    barcode: z.string().max(100).optional(),
    imageUrls: z.array(z.string().url()).max(10).optional(),
    categoryId: commonSchemas.id.optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
};

// Category validation schemas
export const categorySchemas = {
  createCategory: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
    description: z.string().max(500).optional(),
    imageUrl: z.string().url().optional(),
    parentId: commonSchemas.id.optional(),
  }),

  updateCategory: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    imageUrl: z.string().url().optional(),
    parentId: commonSchemas.id.optional(),
  }),
};

// Order validation schemas
export const orderSchemas = {
  createOrder: z.object({
    items: z.array(z.object({
      productId: commonSchemas.id,
      quantity: z.number().int().positive(),
    })).min(1, 'Order must have at least one item'),
    shippingAddressId: commonSchemas.id,
    paymentMethod: z.enum(['CREDIT_CARD', 'ZARINPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY']),
  }),

  updateOrderStatus: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  }),
};

// Cart validation schemas
export const cartSchemas = {
  addToCart: z.object({
    productId: commonSchemas.id,
    quantity: z.number().int().positive().max(100, 'Quantity cannot exceed 100'),
  }),

  updateCartItem: z.object({
    quantity: z.number().int().positive().max(100),
  }),
};

// Review validation schemas
export const reviewSchemas = {
  createReview: z.object({
    productId: commonSchemas.id,
    rating: z.number().int().min(1).max(5),
    title: z.string().max(200).optional(),
    comment: z.string().max(1000).optional(),
  }),

  updateReview: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(200).optional(),
    comment: z.string().max(1000).optional(),
  }),
};

// Validation middleware factory
export const validate = (schema: ZodSchema, location: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = location === 'body' ? req.body : 
                   location === 'params' ? req.params : 
                   req.query;

      const result = schema.safeParse(data);

      if (!result.success) {
        const errors: Record<string, string> = {};
        
        result.error.errors.forEach(error => {
          const path = error.path.join('.');
          errors[path] = error.message;
        });

        throw new ValidationError('Validation failed', errors);
      }

      // Replace the original data with parsed/transformed data
      if (location === 'body') {
        req.body = result.data;
      } else if (location === 'params') {
        req.params = result.data as Record<string, string>;
      } else {
        req.query = result.data as Record<string, string>;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  commonSchemas,
  authSchemas,
  userSchemas,
  addressSchemas,
  productSchemas,
  categorySchemas,
  orderSchemas,
  cartSchemas,
  reviewSchemas,
  validate,
};
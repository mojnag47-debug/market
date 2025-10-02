// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'seller' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: Category;
  seller: Seller;
  stock: number;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  image?: string;
  isActive: boolean;
}

export interface Seller {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: Address;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

// Cart & Order Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariations?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: User;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariations?: Record<string, string>;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export type PaymentMethod = 
  | 'zarinpal' 
  | 'mellat' 
  | 'saman' 
  | 'parsian' 
  | 'wallet' 
  | 'cod';

// Address Types
export interface Address {
  id?: string;
  title?: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  district?: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  isDefault?: boolean;
}

// Review Types
export interface Review {
  id: string;
  product: Product;
  customer: User;
  rating: number;
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  isRecommended: boolean;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// Search Types
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  rating?: number;
  hasDiscount?: boolean;
  inStock?: boolean;
  tags?: string[];
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  filters: SearchFilters;
  facets: SearchFacets;
}

export interface SearchFacets {
  categories: { id: string; name: string; count: number }[];
  priceRanges: { min: number; max: number; count: number }[];
  sellers: { id: string; name: string; count: number }[];
  ratings: { rating: number; count: number }[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Analytics Types
export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    product: Product;
    sales: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// File Upload Types
export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { 
  Product, 
  User, 
  Order, 
  Cart, 
  Category,
  SearchResult,
  SearchFilters,
  LoginCredentials,
  RegisterData,
  AuthSession,
  PaginatedResponse,
  AnalyticsData,
  Review,
  Address,
  AppError,
} from '@nextgen-marketplace/types';
import { apiClient } from './client';

// Query Keys
export const QueryKeys = {
  // Products
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productsByCategory: (categoryId: string) => ['products', 'category', categoryId] as const,
  productReviews: (id: string) => ['products', id, 'reviews'] as const,
  
  // Categories
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,
  
  // Search
  search: (filters: SearchFilters) => ['search', filters] as const,
  
  // Cart
  cart: ['cart'] as const,
  
  // Orders
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  
  // User
  user: ['user'] as const,
  userAddresses: ['user', 'addresses'] as const,
  
  // Seller
  sellerProducts: ['seller', 'products'] as const,
  sellerOrders: ['seller', 'orders'] as const,
  sellerAnalytics: ['seller', 'analytics'] as const,
  
  // Admin
  adminAnalytics: ['admin', 'analytics'] as const,
  adminUsers: ['admin', 'users'] as const,
  adminOrders: ['admin', 'orders'] as const,
};

// Auth Hooks
export const useLogin = (options?: UseMutationOptions<AuthSession, AppError, LoginCredentials>) => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthSession>('/auth/login', credentials);
      apiClient.setToken(response.data.accessToken, response.data.refreshToken);
      return response.data;
    },
    ...options,
  });
};

export const useRegister = (options?: UseMutationOptions<AuthSession, AppError, RegisterData>) => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post<AuthSession>('/auth/register', data);
      apiClient.setToken(response.data.accessToken, response.data.refreshToken);
      return response.data;
    },
    ...options,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    },
  });
};

// User Hooks
export const useUser = (options?: UseQueryOptions<User, AppError>) => {
  return useQuery({
    queryKey: QueryKeys.user,
    queryFn: async () => {
      const response = await apiClient.get<User>('/user/profile');
      return response.data;
    },
    ...options,
  });
};

export const useUserAddresses = () => {
  return useQuery({
    queryKey: QueryKeys.userAddresses,
    queryFn: async () => {
      const response = await apiClient.get<Address[]>('/user/addresses');
      return response.data;
    },
  });
};

// Product Hooks
export const useProducts = (page = 1, limit = 20, filters?: SearchFilters) => {
  return useQuery({
    queryKey: [...QueryKeys.products, page, limit, filters],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
        page,
        limit,
        ...filters,
      });
      return response.data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.product(id),
    queryFn: async () => {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useProductReviews = (productId: string, page = 1) => {
  return useQuery({
    queryKey: [...QueryKeys.productReviews(productId), page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Review>>(`/products/${productId}/reviews`, { page });
      return response.data;
    },
    enabled: !!productId,
  });
};

// Category Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: QueryKeys.categories,
    queryFn: async () => {
      const response = await apiClient.get<Category[]>('/categories');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search Hooks
export const useSearch = (filters: SearchFilters, enabled = true) => {
  return useQuery({
    queryKey: QueryKeys.search(filters),
    queryFn: async () => {
      const response = await apiClient.get<SearchResult>('/search', filters);
      return response.data;
    },
    enabled: enabled && (!!filters.query || !!filters.categoryId),
  });
};

// Cart Hooks
export const useCart = () => {
  return useQuery({
    queryKey: QueryKeys.cart,
    queryFn: async () => {
      const response = await apiClient.get<Cart>('/cart');
      return response.data;
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const response = await apiClient.post<Cart>('/cart/items', { productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.cart });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiClient.patch<Cart>(`/cart/items/${itemId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.cart });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      await apiClient.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.cart });
    },
  });
};

// Order Hooks
export const useOrders = (page = 1) => {
  return useQuery({
    queryKey: [...QueryKeys.orders, page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Order>>('/orders', { page });
      return response.data;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.order(id),
    queryFn: async () => {
      const response = await apiClient.get<Order>(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: { shippingAddressId: string; paymentMethod: string }) => {
      const response = await apiClient.post<Order>('/orders', orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders });
      queryClient.invalidateQueries({ queryKey: QueryKeys.cart });
    },
  });
};

// Seller Hooks
export const useSellerProducts = (page = 1) => {
  return useQuery({
    queryKey: [...QueryKeys.sellerProducts, page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>('/seller/products', { page });
      return response.data;
    },
  });
};

export const useSellerOrders = (page = 1) => {
  return useQuery({
    queryKey: [...QueryKeys.sellerOrders, page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Order>>('/seller/orders', { page });
      return response.data;
    },
  });
};

export const useSellerAnalytics = (dateRange?: { from: string; to: string }) => {
  return useQuery({
    queryKey: [...QueryKeys.sellerAnalytics, dateRange],
    queryFn: async () => {
      const response = await apiClient.get<AnalyticsData>('/seller/analytics', dateRange);
      return response.data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'seller' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.post<Product>('/seller/products', productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.sellerProducts });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
      const response = await apiClient.patch<Product>(`/seller/products/${id}`, productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.sellerProducts });
    },
  });
};

// Admin Hooks
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: QueryKeys.adminAnalytics,
    queryFn: async () => {
      const response = await apiClient.get<AnalyticsData>('/admin/analytics');
      return response.data;
    },
  });
};

export const useAdminUsers = (page = 1, filters?: { role?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: [...QueryKeys.adminUsers, page, filters],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', { page, ...filters });
      return response.data;
    },
  });
};

export const useAdminOrders = (page = 1, filters?: { status?: string; dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: [...QueryKeys.adminOrders, page, filters],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Order>>('/admin/orders', { page, ...filters });
      return response.data;
    },
  });
};
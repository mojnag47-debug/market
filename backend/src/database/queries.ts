import { PrismaClient, Prisma, UserRole, UserStatus, ProductStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// =============================================================================
// USER QUERIES
// =============================================================================

/**
 * Create a new user
 */
export const createUser = async (userData: {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
  phoneNumber?: string;
}) => {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  
  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      role: userData.role || 'BUYER',
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      createdAt: true,
    }
  });
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      sellerProfile: true,
    }
  });
};

/**
 * Find user by username
 */
export const findUserByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: { username },
    include: {
      sellerProfile: true,
    }
  });
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  profileImageUrl?: string;
  address?: any;
}) => {
  return prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      bio: true,
      profileImageUrl: true,
      address: true,
      updatedAt: true,
    }
  });
};

/**
 * Get user with order history
 */
export const getUserWithOrderHistory = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                }
              }
            }
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
};

// =============================================================================
// PRODUCT QUERIES
// =============================================================================

/**
 * Create a new product
 */
export const createProduct = async (sellerId: string, productData: {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  sku: string;
  categoryId: string;
  quantity: number;
  images?: string[];
  tags?: string[];
  weight?: number;
  dimensions?: any;
}) => {
  // Generate slug from name
  const slug = productData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return prisma.product.create({
    data: {
      ...productData,
      slug,
      sellerId,
      status: 'INACTIVE', // Default to inactive until reviewed
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });
};

/**
 * Find products with pagination and filters
 */
export const findProducts = async (filters: {
  categoryId?: string;
  sellerId?: string;
  status?: ProductStatus;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'name' | 'salesCount';
  sortOrder?: 'asc' | 'desc';
}) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    ...filterOptions
  } = filters;

  const skip = (page - 1) * limit;
  
  const where: Prisma.ProductWhereInput = {};

  // Apply filters
  if (filterOptions.categoryId) where.categoryId = filterOptions.categoryId;
  if (filterOptions.sellerId) where.sellerId = filterOptions.sellerId;
  if (filterOptions.status) where.status = filterOptions.status;
  if (filterOptions.featured !== undefined) where.featured = filterOptions.featured;
  
  if (filterOptions.search) {
    where.OR = [
      { name: { contains: filterOptions.search, mode: 'insensitive' } },
      { description: { contains: filterOptions.search, mode: 'insensitive' } },
      { tags: { hasSome: [filterOptions.search] } }
    ];
  }

  if (filterOptions.minPrice || filterOptions.maxPrice) {
    where.price = {};
    if (filterOptions.minPrice) where.price.gte = filterOptions.minPrice;
    if (filterOptions.maxPrice) where.price.lte = filterOptions.maxPrice;
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            sellerProfile: {
              select: {
                businessName: true,
                rating: true,
                verified: true,
              }
            }
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    }
  };
};

/**
 * Find product by slug with related data
 */
export const findProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        include: {
          parent: true,
        }
      },
      seller: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          sellerProfile: {
            select: {
              businessName: true,
              rating: true,
              totalReviews: true,
              verified: true,
            }
          }
        }
      }
    }
  });

  // Increment view count
  if (product) {
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } }
    });
  }

  return product;
};

/**
 * Update product inventory
 */
export const updateProductInventory = async (productId: string, quantityChange: number) => {
  return prisma.product.update({
    where: { id: productId },
    data: {
      quantity: { increment: quantityChange }
    }
  });
};

/**
 * Get low stock products for a seller
 */
export const getLowStockProducts = async (sellerId: string) => {
  return prisma.product.findMany({
    where: {
      sellerId,
      status: 'ACTIVE',
      quantity: {
        lte: prisma.product.fields.lowStockThreshold
      }
    },
    select: {
      id: true,
      name: true,
      sku: true,
      quantity: true,
      lowStockThreshold: true,
    }
  });
};

// =============================================================================
// CART QUERIES
// =============================================================================

/**
 * Add item to cart
 */
export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  return prisma.cartItem.upsert({
    where: {
      userId_productId: { userId, productId }
    },
    update: {
      quantity: { increment: quantity }
    },
    create: {
      userId,
      productId,
      quantity
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          status: true,
          quantity: true,
        }
      }
    }
  });
};

/**
 * Get user's cart
 */
export const getUserCart = async (userId: string) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          status: true,
          quantity: true,
          seller: {
            select: {
              id: true,
              username: true,
            }
          }
        }
      }
    }
  });

  const total = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product.price.toString()) * item.quantity), 0
  );

  return { cartItems, total };
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (userId: string, productId: string, quantity: number) => {
  if (quantity <= 0) {
    return prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } }
    });
  }

  return prisma.cartItem.update({
    where: { userId_productId: { userId, productId } },
    data: { quantity }
  });
};

/**
 * Clear user's cart
 */
export const clearUserCart = async (userId: string) => {
  return prisma.cartItem.deleteMany({
    where: { userId }
  });
};

// =============================================================================
// ORDER QUERIES
// =============================================================================

/**
 * Create order from cart
 */
export const createOrderFromCart = async (userId: string, orderData: {
  shippingAddress: any;
  billingAddress?: any;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
}) => {
  return prisma.$transaction(async (tx) => {
    // Get cart items
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (parseFloat(item.product.price.toString()) * item.quantity), 0
    );

    const taxAmount = orderData.taxAmount || 0;
    const shippingAmount = orderData.shippingAmount || 0;
    const discountAmount = orderData.discountAmount || 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        status: 'PENDING',
      }
    });

    // Create order items and update inventory
    const orderItems = await Promise.all(
      cartItems.map(async (cartItem) => {
        // Check stock availability
        if (cartItem.product.quantity < cartItem.quantity) {
          throw new Error(`Insufficient stock for ${cartItem.product.name}`);
        }

        // Update product inventory
        await tx.product.update({
          where: { id: cartItem.product.id },
          data: {
            quantity: { decrement: cartItem.quantity },
            salesCount: { increment: cartItem.quantity }
          }
        });

        // Create order item
        return tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: cartItem.product.id,
            quantity: cartItem.quantity,
            unitPrice: cartItem.product.price,
            totalPrice: parseFloat(cartItem.product.price.toString()) * cartItem.quantity,
            productName: cartItem.product.name,
            productSku: cartItem.product.sku,
            productImage: cartItem.product.images[0] || null,
          }
        });
      })
    );

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return { order, orderItems };
  });
};

/**
 * Find order by ID with details
 */
export const findOrderById = async (orderId: string, userId?: string) => {
  const where: Prisma.OrderWhereInput = { id: orderId };
  if (userId) where.userId = userId;

  return prisma.order.findUnique({
    where,
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            }
          }
        }
      },
      payments: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus, updates?: {
  trackingNumber?: string;
  notes?: string;
}) => {
  const updateData: Prisma.OrderUpdateInput = { status, ...updates };

  // Set timestamps based on status
  switch (status) {
    case 'SHIPPED':
      updateData.shippedAt = new Date();
      break;
    case 'DELIVERED':
      updateData.deliveredAt = new Date();
      break;
    case 'CANCELLED':
      updateData.cancelledAt = new Date();
      break;
  }

  return prisma.order.update({
    where: { id: orderId },
    data: updateData
  });
};

/**
 * Get orders for a user with pagination
 */
export const getUserOrders = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } })
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    }
  };
};

// =============================================================================
// PAYMENT QUERIES
// =============================================================================

/**
 * Create payment record
 */
export const createPayment = async (paymentData: {
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  currency?: string;
  gatewayProvider?: string;
  gatewayPaymentId?: string;
}) => {
  return prisma.payment.create({
    data: {
      ...paymentData,
      currency: paymentData.currency || 'USD',
      status: 'PENDING',
    }
  });
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (paymentId: string, updates: {
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: any;
  failureReason?: string;
  processedAt?: Date;
}) => {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...updates,
      processedAt: updates.processedAt || (updates.status === 'COMPLETED' ? new Date() : undefined)
    }
  });
};

// =============================================================================
// CATEGORY QUERIES
// =============================================================================

/**
 * Get category hierarchy
 */
export const getCategoryHierarchy = async () => {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
          _count: {
            select: { products: true }
          }
        }
      },
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });
};

/**
 * Find category by slug with products
 */
export const findCategoryBySlug = async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: true,
      products: {
        where: { status: 'ACTIVE' },
        take: 20,
        include: {
          seller: {
            select: {
              username: true,
              sellerProfile: {
                select: {
                  businessName: true,
                  rating: true,
                }
              }
            }
          }
        }
      }
    }
  });
};

// =============================================================================
// ANALYTICS QUERIES
// =============================================================================

/**
 * Get dashboard stats for seller
 */
export const getSellerDashboardStats = async (sellerId: string) => {
  const [
    totalProducts,
    activeProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    lowStockProducts
  ] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),
    prisma.product.count({ where: { sellerId, status: 'ACTIVE' } }),
    prisma.order.count({
      where: {
        orderItems: {
          some: {
            product: { sellerId }
          }
        }
      }
    }),
    prisma.orderItem.aggregate({
      where: {
        product: { sellerId }
      },
      _sum: { totalPrice: true }
    }),
    prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            product: { sellerId }
          }
        }
      },
      include: {
        orderItems: {
          where: { product: { sellerId } },
          include: { product: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    getLowStockProducts(sellerId)
  ]);

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    recentOrders,
    lowStockProducts
  };
};

/**
 * Get admin dashboard stats
 */
export const getAdminDashboardStats = async () => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentUsers,
    recentOrders
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      }
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        _count: {
          select: { orderItems: true }
        }
      }
    })
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentUsers,
    recentOrders
  };
};

export default prisma;
import { prisma, paginate, buildPaginatedResponse } from '../../shared/database';
import {
  AppError,
  NotFoundError,
  ServiceResponse,
  PaginatedResponse,
  PaginationQuery,
} from '../../shared/types';

export interface ProductData {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  imageUrls: string[];
  categoryId: string;
  sellerId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string | null;
  barcode: string | null;
  imageUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  sellerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  seller?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  _count?: {
    reviews: number;
  };
}

export interface ProductSearchParams extends PaginationQuery {
  q?: string;
  categoryId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
}

class ProductService {
  async createProduct(data: ProductData): Promise<ServiceResponse<ProductWithRelations>> {
    try {
      // Check if slug already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (existingProduct) {
        throw new AppError('Product with this slug already exists', 409);
      }

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      // Check if seller exists (if provided)
      if (data.sellerId) {
        const seller = await prisma.user.findUnique({
          where: { id: data.sellerId, role: { in: ['SELLER', 'ADMIN'] } },
        });

        if (!seller) {
          throw new NotFoundError('Seller not found');
        }
      }

      const product = await prisma.product.create({
        data,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      return {
        success: true,
        data: product as ProductWithRelations,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create product', 500);
    }
  }

  async getProducts(
    params: ProductSearchParams = {}
  ): Promise<ServiceResponse<PaginatedResponse<ProductWithRelations>>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        q,
        categoryId,
        sellerId,
        minPrice,
        maxPrice,
        inStock,
        isActive = true,
        isFeatured,
      } = params;

      const { skip, take } = paginate(page, limit);

      // Build where clause
      const where: any = {
        isActive,
      };

      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (sellerId) {
        where.sellerId = sellerId;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) {
          where.price.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.price.lte = maxPrice;
        }
      }

      if (inStock) {
        where.stock = { gt: 0 };
      }

      if (isFeatured !== undefined) {
        where.isFeatured = isFeatured;
      }

      // Build order by
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      const paginatedResponse = buildPaginatedResponse(
        products as ProductWithRelations[],
        total,
        page,
        limit
      );

      return {
        success: true,
        data: paginatedResponse,
      };
    } catch (error) {
      throw new AppError('Failed to get products', 500);
    }
  }

  async getProductById(id: string): Promise<ServiceResponse<ProductWithRelations>> {
    try {
      const product = await prisma.product.findUnique({
        where: { id, isActive: true },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      return {
        success: true,
        data: product as ProductWithRelations,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get product', 500);
    }
  }

  async getProductBySlug(slug: string): Promise<ServiceResponse<ProductWithRelations>> {
    try {
      const product = await prisma.product.findUnique({
        where: { slug, isActive: true },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      return {
        success: true,
        data: product as ProductWithRelations,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get product', 500);
    }
  }

  async updateProduct(
    id: string,
    data: Partial<ProductData>
  ): Promise<ServiceResponse<ProductWithRelations>> {
    try {
      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundError('Product not found');
      }

      // Check slug uniqueness if updating slug
      if (data.slug && data.slug !== existingProduct.slug) {
        const slugExists = await prisma.product.findUnique({
          where: { slug: data.slug },
        });

        if (slugExists) {
          throw new AppError('Product with this slug already exists', 409);
        }
      }

      // Check if category exists if updating category
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw new NotFoundError('Category not found');
        }
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      return {
        success: true,
        data: updatedProduct as ProductWithRelations,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update product', 500);
    }
  }

  async deleteProduct(id: string): Promise<ServiceResponse<{ message: string }>> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      // Soft delete by setting isActive to false
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        data: { message: 'Product deleted successfully' },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete product', 500);
    }
  }

  async updateStock(id: string, quantity: number): Promise<ServiceResponse<ProductWithRelations>> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const newStock = product.stock + quantity;

      if (newStock < 0) {
        throw new AppError('Insufficient stock', 400);
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: { stock: newStock },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      return {
        success: true,
        data: updatedProduct as ProductWithRelations,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update product stock', 500);
    }
  }

  async getFeaturedProducts(limit = 10): Promise<ServiceResponse<ProductWithRelations[]>> {
    try {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isFeatured: true,
          stock: { gt: 0 },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      return {
        success: true,
        data: products as ProductWithRelations[],
      };
    } catch (error) {
      throw new AppError('Failed to get featured products', 500);
    }
  }
}

export const productService = new ProductService();
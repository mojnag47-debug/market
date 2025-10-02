import { PrismaClient } from '@prisma/client';
import { cache } from '../shared/redis';
import { logger } from '../shared/logger';
import { ProductNotFoundError } from '../shared/errors';

const getPrismaInstance = () => {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  return global.prisma;
};

const prisma = getPrismaInstance();

const PRODUCT_CACHE_TTL = 3600; // 1 hour

async function getProductById(id: string) {
  const cacheKey = `product:${id}`;
  const cachedProduct = await cache.get(cacheKey);
  
  if (cachedProduct) {
    logger.debug('Cache hit for product', { productId: id });
    return cachedProduct;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      category: true,
      reviews: {
        take: 50,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) throw new ProductNotFoundError();

  await cache.set(cacheKey, product, PRODUCT_CACHE_TTL);
  return product;
}

async function getFeaturedProducts() {
  const cacheKey = 'products:featured';
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    logger.debug('Cache hit for featured products');
    return cached;
  }

  const products = await prisma.product.findMany({
    where: { 
      isFeatured: true,
      status: 'AVAILABLE'
    },
    take: 20,
    orderBy: { featuredOrder: 'asc' },
    include: {
      variants: {
        where: { stock: { gt: 0 } }
      }
    }
  });

  await cache.set(cacheKey, products, PRODUCT_CACHE_TTL);
  return products;
}

async function updateProductStock(productId: string, variantId: string, quantity: number) {
  const updatedVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: { decrement: quantity } }
  });

  await cache.invalidate(`product:${productId}`);
  await cache.invalidate('products:featured');
  
  return updatedVariant;
}

export const productService = {
  getProductById,
  getFeaturedProducts,
  updateProductStock
};
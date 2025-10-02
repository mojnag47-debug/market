#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AR assets (CJS wrapper)...');

  // Sample products by slug; will create if missing
  const sampleAssets = [
    {
      productSlug: 'laptop-pro-15',
      displayName: 'Laptop Pro 15 (GLB)',
      url: 'https://cdn.example.com/ar/laptop-pro-15.glb',
      thumbnailUrl: 'https://cdn.example.com/ar/thumbs/laptop-pro-15.png',
      fileType: 'GLB',
    },
    {
      productSlug: 'smartphone-x',
      displayName: 'Smartphone X (USDZ)',
      url: 'https://cdn.example.com/ar/smartphone-x.usdz',
      thumbnailUrl: 'https://cdn.example.com/ar/thumbs/smartphone-x.png',
      fileType: 'USDZ',
    },
    {
      productSlug: 'shirt-cotton',
      displayName: 'Cotton Shirt (GLB)',
      url: 'https://cdn.example.com/ar/shirt-cotton.glb',
      thumbnailUrl: 'https://cdn.example.com/ar/thumbs/shirt-cotton.png',
      fileType: 'GLB',
    },
  ];

  for (const asset of sampleAssets) {
    let product = await prisma.product.findUnique({ where: { slug: asset.productSlug } });
    if (!product) {
      const category = (await prisma.category.findFirst()) || (await prisma.category.create({ data: { name: 'Uncategorized', slug: 'uncategorized' } }));
      product = await prisma.product.create({
        data: {
          name: asset.displayName.split(' (')[0],
          slug: asset.productSlug,
          description: 'Sample product created by AR seed',
          price: 0.0,
          imageUrls: [],
          categoryId: category.id,
        },
      });
    }

    await prisma.arAsset.upsert({
      where: { id: `${product.id}-${asset.fileType}` },
      update: {
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
      },
      create: {
        id: `${product.id}-${asset.fileType}`,
        productId: product.id,
        displayName: asset.displayName,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        fileType: asset.fileType,
      },
    });
  }

  console.log('AR assets seeded (CJS).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

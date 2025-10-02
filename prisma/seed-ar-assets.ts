import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AR assets...');

  // Example: Seed AR assets for products, create products if missing
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
      product = await prisma.product.create({
        data: {
          name: asset.displayName.split(' (')[0],
          slug: asset.productSlug,
          description: 'Sample product created by AR seed',
          price: 0.0,
          imageUrls: [],
          categoryId: (await prisma.category.findFirst())?.id ?? (await prisma.category.create({ data: { name: 'Uncategorized', slug: 'uncategorized' } })).id,
        },
      });
    }

    await prisma.arAsset.upsert({
      where: { id: `${product.id}-${asset.fileType}` },
      update: {},
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

  console.log('AR assets seeded. Creating AR session and events...');

  // Ensure there is at least one user to associate with AR session/events
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: `seed-user@example.com`,
        password: 'seed-password',
        isActive: true,
      },
    });
  }

  // Use the first seeded asset's product to create a demo AR session
  const firstAsset = await prisma.arAsset.findFirst({ orderBy: { createdAt: 'asc' } });
  const session = await prisma.aRSession.create({
    data: {
      userId: user.id,
      productId: firstAsset?.productId ?? null,
      deviceInfo: 'Seeded Device (WebXR)',
      mode: 'WEBXR' as any,
    },
  });

  // Create 5 AR events
  const eventsData = [
    { type: 'SESSION_START', payload: { note: 'Session started' } },
    { type: 'MODEL_VIEW', payload: { assetId: firstAsset?.id, durationMs: 1200 } },
    { type: 'MODEL_INTERACTION', payload: { action: 'rotate', degrees: 45 } },
    { type: 'MODEL_VIEW', payload: { assetId: firstAsset?.id, durationMs: 800 } },
    { type: 'SESSION_END', payload: { reason: 'user_exit' } },
  ] as const;

  for (const e of eventsData) {
    await prisma.aREvent.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        type: e.type as any,
        payload: e.payload as any,
      },
    });
  }

  console.log('AR session and 5 events seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Prisma seeding compliant with https://pris.ly/d/seeding
// Debug tips:
// - If you see ERR_UNKNOWN_FILE_EXTENSION, ensure package.json uses: "ts-node --transpile-only prisma/seed.ts"
// - If migrate fails, ensure DATABASE_URL is set in .env/.env.local

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Runtime-safe Prisma shim for Decimal when generated client/runtime isn't available
// This allows us to use `new Prisma.Decimal(0)` as requested while remaining compilable in CI/dev environments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Prisma: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    return require('@prisma/client').Prisma;
  } catch {
    // Minimal fallback Decimal implementation for seeding contexts without the client/runtime available
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Decimal {
      constructor(_v: any) {}
      toString() {
        return '0';
      }
    }
    return { Decimal };
  }
})();

const prisma = new PrismaClient();

async function ensureCategory(name: string, slug: string) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.category.create({ data: { name, slug } });
}

async function ensureProduct(slug: string, data: { name: string; description: string }) {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return existing;
  const cat = await prisma.category.findFirst().then((c) => c ?? ensureCategory('Uncategorized', 'uncategorized'));
  return prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      // Use Prisma.Decimal as requested to avoid the previous `0.0 as any` anti-pattern
      price: new Prisma.Decimal(0),
      imageUrls: [],
      categoryId: (await cat).id,
    },
  });
}

async function seedARAssets() {
  const assets = [
    {
      productSlug: 'laptop-pro-15',
      displayName: 'Laptop Pro 15 (GLB)',
      url: 'https://cdn.example.com/ar/laptop-pro-15.glb',
      thumbnailUrl: 'https://cdn.example.com/ar/thumbs/laptop-pro-15.png',
      // use string literals for enum values to avoid depending on generated types during static analysis
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

  for (const a of assets) {
    const product = await ensureProduct(a.productSlug, {
      name: a.displayName.split(' (')[0],
      description: 'Sample product created by AR seed',
    });

    // Deterministic upsert id for idempotency
    await prisma.aRAsset.upsert({
      where: { id: `${product.id}-${a.fileType}` },
      update: {},
      create: {
        id: `${product.id}-${a.fileType}`,
        productId: product.id,
        displayName: a.displayName,
        url: a.url,
        thumbnailUrl: a.thumbnailUrl,
        fileType: a.fileType as any,
      },
    });
  }
}

async function seedARSessionAndEvents() {
  // Ensure a user exists with hashed password
  const existingUser = await prisma.user.findFirst();
  const user = existingUser
    ? existingUser
    : await prisma.user.create({
        data: {
          email: 'seed-user@example.com',
          password: await bcrypt.hash('seed-password', 10),
          isActive: true,
        },
      });

  const firstAsset = await prisma.aRAsset.findFirst({ orderBy: { createdAt: 'asc' } });
  const session = await prisma.aRSession.create({
    data: {
      userId: user.id,
      productId: firstAsset?.productId ?? null,
      deviceInfo: 'Seeded Device (WebXR)',
      // use string literal for ARMode
      mode: 'WEBXR' as any,
    },
  });

  const eventsData: Array<{ type: string; payload: any }> = [
    { type: 'SESSION_START', payload: { note: 'Session started' } },
    { type: 'MODEL_VIEW', payload: { assetId: firstAsset?.id, durationMs: 1200 } },
    { type: 'MODEL_INTERACTION', payload: { action: 'rotate', degrees: 45 } },
    { type: 'MODEL_VIEW', payload: { assetId: firstAsset?.id, durationMs: 800 } },
    { type: 'SESSION_END', payload: { reason: 'user_exit' } },
  ];

  for (const e of eventsData) {
    await prisma.aREvent.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        type: e.type as any,
        payload: e.payload,
      },
    });
  }
}

export async function runSeed() {
  await seedARAssets();
  await seedARSessionAndEvents();
}

async function main() {
  await runSeed();
}

main()
  .catch(async (e) => {
    console.error('Seed error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

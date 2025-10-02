import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePresignedPutUrl, buildCdnUrl } from '../../../../lib/s3/presigned-upload';
import { rateLimit } from '../../../../lib/rate-limit/upstash-rate-limit';
import { prisma } from '../../../../../libs/db/src';
import { randomUUID } from 'crypto';

/**
 * POST /api/ar/upload
 * OpenAPI: Generates a presigned S3 URL for uploading 3D assets.
 * Request body: { productId: string, fileType: 'glb'|'gltf'|'usdz', fileSize: number }
 */
const BodySchema = z.object({
  productId: z.string().min(1),
  fileType: z.enum(['glb', 'gltf', 'usdz']),
  fileSize: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown') as string;

    // rate limit
    const rl = await rateLimit(ip, 5, 60);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { productId, fileType, fileSize } = parsed.data;

    // file size limit 50MB
    const MAX = 50 * 1024 * 1024;
    if (fileSize > MAX) return NextResponse.json({ error: 'fileSize exceeds 50MB' }, { status: 400 });

    // ensure product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'product not found' }, { status: 404 });

    const bucket = process.env['S3_BUCKET'] || '';
    if (!bucket) return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });

    const assetId = typeof randomUUID === 'function' ? randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    const key = `ar-assets/${productId}/${assetId}.${fileType}`;
    const contentType = fileType === 'usdz' ? 'model/vnd.usdz+zip' : fileType === 'glb' ? 'model/gltf-binary' : 'model/gltf+json';

    const uploadUrl = await generatePresignedPutUrl(bucket, key, 60 * 15, contentType);
    const cdnUrl = buildCdnUrl(bucket, key);

    // Log upload request to AREvent (best-effort; do not fail request if this fails)
    try {
      await prisma.aREvent.create({
        data: {
          sessionId: '', // session may be unknown at this step
          userId: null,
          type: 'UPLOAD_REQUESTED',
          payload: { productId, assetId, fileType, fileSize, ip },
        },
      });
    } catch (e) {
      console.warn('AREvent logging failed', e);
    }

    return NextResponse.json({ uploadUrl, assetId, cdnUrl });
  } catch (err: any) {
    console.error('ar/upload error', err);
    return NextResponse.json({ error: err?.message || 'internal error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';

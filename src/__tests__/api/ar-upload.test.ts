/**
 * Unit tests for /api/ar/upload route (validation & rate limit)
 */

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, opts?: { status?: number }) => ({ body, status: opts?.status ?? 200 }),
  },
}));

import { POST } from '../app/api/ar/upload/route';
import { RateLimiter } from '../lib/rate-limit/upstash';

describe('POST /api/ar/upload (validation & rate-limit)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns 400 for invalid body (bad fileType)', async () => {
    const req = new Request('http://localhost/api/ar/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fileType: 'exe' }),
    });

    const res: any = await POST(req as any);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid input');
  });

  it('returns 400 when fileSize exceeds limit', async () => {
    const req = new Request('http://localhost/api/ar/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: 'prod_1', fileType: 'glb', fileSize: 60 * 1024 * 1024 }),
    });

    const res: any = await POST(req as any);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'fileSize exceeds 50MB');
  });

  it('returns 429 when rate limiter blocks', async () => {
    // Spy on the RateLimiter prototype check method to simulate a block
    const spy = jest.spyOn(RateLimiter.prototype, 'check' as any).mockResolvedValue(false as any);

    const req = new Request('http://localhost/api/ar/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: 'prod_1', fileType: 'glb', fileSize: 1024 }),
    });

    const res: any = await POST(req as any);
    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty('error', 'Rate limit exceeded');

    spy.mockRestore();
  });
});

// Mocks must be registered before requiring the route to prevent real clients/init
const s3Path = require.resolve('../lib/s3/presigned-upload');
jest.mock(s3Path, () => ({
  generatePresignedPutUrl: jest.fn().mockResolvedValue('https://example.com/upload'),
  buildCdnUrl: jest.fn().mockReturnValue('https://cdn.example.com/key.glb'),
}));

const rlPath = require.resolve('../lib/rate-limit/upstash-rate-limit');
jest.mock(rlPath, () => ({ rateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 4, resetIn: 60 }) }));

// Mock prisma
const mockPrisma = {
  product: { findUnique: jest.fn().mockResolvedValue({ id: 'prod-1' }) },
  aREvent: { create: jest.fn().mockResolvedValue({ id: 'evt-1' }) },
};
const prismaPath = require.resolve('../../libs/db/src');
jest.mock(prismaPath, () => ({ prisma: mockPrisma }));

// Require the route after mocks so the actual PrismaClient is never initialized
const { POST } = require('../app/api/ar/upload/route');

describe('POST /api/ar/upload', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns 400 for invalid body', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}), headers: { 'content-type': 'application/json' } });
    const res = await POST(req as any);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('returns presigned url on success', async () => {
    const body = { productId: 'prod-1', fileType: 'glb', fileSize: 1024 };
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
    const res = await POST(req as any);
    const json = await res.json();
    expect(json.uploadUrl).toBe('https://example.com/upload');
    expect(json.cdnUrl).toBe('https://cdn.example.com/key.glb');
    expect(mockPrisma.aREvent.create).toHaveBeenCalled();
  });
});

// We reset modules and register mocks before each test to avoid module cache leaking
const s3Path = require.resolve('../lib/s3/presigned-upload');
const rlPath = require.resolve('../lib/rate-limit/upstash-rate-limit');
const prismaPath = require.resolve('../../libs/db/src');

let POST: any;
const mockPrisma = {
  product: { findUnique: jest.fn().mockResolvedValue({ id: 'prod-1' }) },
  aREvent: { create: jest.fn().mockResolvedValue({ id: 'evt-1' }) },
};

beforeEach(() => {
  jest.resetModules();
  process.env['S3_BUCKET'] = 'test-bucket';
  jest.doMock(s3Path, () => ({
    generatePresignedPutUrl: jest.fn().mockResolvedValue('https://example.com/upload'),
    buildCdnUrl: jest.fn().mockReturnValue('https://cdn.example.com/key.glb'),
  }));
  jest.doMock(rlPath, () => ({ rateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 4, resetIn: 60 }) }));
  jest.doMock(prismaPath, () => ({ prisma: mockPrisma }));
  // require route after mocks
  POST = require('../app/api/ar/upload/route').POST;
});

afterEach(() => {
  delete process.env['S3_BUCKET'];
});

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

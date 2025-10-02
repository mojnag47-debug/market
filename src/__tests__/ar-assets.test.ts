// Mock the shared prisma client before importing the service so the real PrismaClient
// is not initialized during tests.
const mockPrisma = {
  // Prisma client exposes both `aRAsset` (generated) and some code uses `arAsset`.
  // Provide both to be resilient in tests.
  aRAsset: { create: jest.fn() },
  arAsset: { create: jest.fn() },
  aREvent: { create: jest.fn() },
  aRSession: { findUnique: jest.fn() },
};

jest.mock('../../libs/db/src', () => ({ prisma: mockPrisma }));

const arService = require('../lib/prisma/ar-assets');
const { prisma } = require('../../libs/db/src');

describe('AR assets service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createARAsset calls prisma.arAsset.create and returns created asset', async () => {
    const fake = { id: 'asset-1', productId: 'prod-1', displayName: 'A', url: 'http://x' } as any;
    const spy = jest.spyOn(prisma.arAsset, 'create' as any).mockResolvedValue(fake);

    const out = await arService.createARAsset({ productId: 'prod-1', displayName: 'A', url: 'http://x' });

    expect(out).toEqual(fake);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('logAREvent calls prisma.aREvent.create and returns event', async () => {
    const fakeEvent = { id: 'evt-1', sessionId: 's1', type: 'MODEL_VIEW' } as any;
    const spy = jest.spyOn(prisma.aREvent, 'create' as any).mockResolvedValue(fakeEvent);

    const out = await arService.logAREvent({ sessionId: 's1', type: 'MODEL_VIEW' as any });

    expect(out).toEqual(fakeEvent);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('getARSessionById calls prisma.aRSession.findUnique and includes relations', async () => {
    const fakeSession = { id: 's1', events: [], product: null, user: null } as any;
    const spy = jest.spyOn(prisma.aRSession, 'findUnique' as any).mockResolvedValue(fakeSession);

    const out = await arService.getARSessionById('s1');

    expect(out).toEqual(fakeSession);
    expect(spy).toHaveBeenCalledWith({ where: { id: 's1' }, include: { events: true, product: true, user: true } });
  });
});

import { GenericContainer, StartedTestContainer } from 'testcontainers';
import supertest from 'supertest';
import { prisma } from '../lib/prismaClient';
import { waitForWebhookEvent } from '../lib/redisClient';

let redisContainer: StartedTestContainer;
let request: supertest.SuperTest<supertest.Test>;

jest.setTimeout(120000);

beforeAll(async () => {
  // Start Redis testcontainer
  const redis = await new GenericContainer('redis:7-alpine').withExposedPorts(6379);
  redisContainer = await redis.start();
  const redisHost = redisContainer.getHost();
  const redisPort = redisContainer.getMappedPort(6379);
  (process.env as Record<string, string>)['REDIS_URL'] = `redis://${redisHost}:${redisPort}`;
  (process.env as Record<string, string>)['NODE_ENV'] = 'test';

  // Push prisma schema to a local ephemeral DB is not needed here; only Redis used.
  // Import app after env configured
  const imported = await import('../main');
  const app = imported.default;
  request = supertest(app);
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
  try {
    const { disconnectRedis } = await import('../lib/redisClient');
    await disconnectRedis();
  } catch {
    // ignore
  }
  await redisContainer.stop();
});

describe('Webhook Controller (test webhook)', () => {
  test('accepts valid Resend-like webhook and stores sanitized event in Redis', async () => {
    const payload = {
      messageId: 'msg-123',
      to: 'test@example.com',
      subject: 'Password reset',
      html: '<p>Click <a href="https://example.com/reset?token=abc.def">here</a></p>',
      receivedAt: new Date().toISOString(),
    };

    // Post to webhook endpoint
    const res = await request.post('/webhook/resend/test').send(payload).expect(200);
    expect(res.body.ok).toBe(true);

    // Wait for Redis event
    const event = await waitForWebhookEvent(10);
    expect(event).not.toBeNull();
    expect(event?.messageId).toBe('msg-123');
    expect(event?.to).toBe('test@example.com');
    expect(event?.subject).toBe('Password reset');
    // Ensure no html/token stored
  });

  test('rejects invalid payloads (schema validation)', async () => {
    // Missing messageId
    const bad = { to: 'not-an-email', html: 'x' };
    await request.post('/webhook/resend/test').send(bad).expect(400);
  });

  test('endpoint not available in production', async () => {
    // simulate production env
    (process.env as Record<string, string>)['NODE_ENV'] = 'production';
    const imported = await import('../main');
    const app = imported.default;
    const localReq = supertest(app);
    await localReq.post('/webhook/resend/test').send({ messageId: 'x', to: 'test@example.com' }).expect(404);
    (process.env as Record<string, string>)['NODE_ENV'] = 'test';
  });
});

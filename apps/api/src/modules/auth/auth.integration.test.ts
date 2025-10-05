import { GenericContainer, StartedTestContainer, PostgreSqlContainer } from 'testcontainers';
import { execSync } from 'child_process';
import supertest from 'supertest';
import { prisma } from '../../lib/prismaClient';
import { redis } from '../../lib/redisClient';

let pgContainer: StartedTestContainer;
let redisContainer: StartedTestContainer;
let request: supertest.SuperTest<supertest.Test>;

jest.setTimeout(180_000);

beforeAll(async () => {
  const pg = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('testdb')
    .withUsername('test')
    .withPassword('test');
  pgContainer = await pg.start();

  const redis = await new GenericContainer('redis:7-alpine').withExposedPorts(6379);
  redisContainer = await redis.start();

  const pgHost = pgContainer.getHost();
  const pgPort = pgContainer.getMappedPort(5432);
  process.env.DATABASE_URL = `postgresql://test:test@${pgHost}:${pgPort}/testdb`;

  const redisHost = redisContainer.getHost();
  const redisPort = redisContainer.getMappedPort(6379);
  process.env.REDIS_URL = `redis://${redisHost}:${redisPort}`;
  (process.env as Record<string, string>)['NODE_ENV'] = 'test';
  // RESEND_API_KEY must be provided in environment to run end-to-end email validation
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY must be set to run integration tests that validate real email delivery');
  }
  process.env.EMAIL_FROM = process.env.EMAIL_FROM ?? 'test@example.com';
  process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';

  // Ensure prisma schema pushed
  execSync('pnpm prisma db push', { stdio: 'inherit', env: process.env });

  // initialize redis connection used by app
  await redisContainer.stop();
  // re-start and let app connect via lib on imported app
  const redis2 = await new GenericContainer('redis:7-alpine').withExposedPorts(6379).start();
  const redisHost2 = redis2.getHost();
  const redisPort2 = redis2.getMappedPort(6379);
  process.env.REDIS_URL = `redis://${redisHost2}:${redisPort2}`;

  // Start app should import lib clients using updated env, so import app now
  const imported = await import('../../main');
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
    const { disconnectRedis } = await import('../../lib/redisClient');
    await disconnectRedis();
  } catch {
    // ignore
  }
  await pgContainer.stop();
  await redisContainer.stop();
});

function isResendMessage(x: unknown): x is { to?: Array<{ email?: string }>; html?: string } {
  if (typeof x !== 'object' || x === null) return false;
  const m = x as Record<string, unknown>;
  if (!Array.isArray(m.to)) return false;
  const first = m.to[0];
  if (typeof first !== 'object' || first === null) return false;
  return typeof (first as Record<string, unknown>).email === 'string';
}

describe('Auth Integration Flow', () => {
  test('register -> login -> refresh -> logout -> forgot -> reset -> login', async () => {
    const email = 'test-user@example.com';
    const password = 'Password123!';

    // Register
    const reg = await request.post('/auth/register').send({ email, password }).expect(201);
    expect(reg.body.id).toBeDefined();

    // Login
    const loginRes = await request.post('/auth/login').send({ email, password, deviceId: 'device-1' }).expect(200);
    expect(loginRes.body.accessToken).toBeDefined();
    const cookieHeader = loginRes.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();

    // Get refresh raw from cookie
    const rawRefresh = cookieHeader[0].split('refreshToken=')[1].split(';')[0];

    // Refresh
    const refreshRes = await request.post('/auth/refresh').send({ refreshToken: rawRefresh, deviceId: 'device-1' }).expect(200);
    expect(refreshRes.body.accessToken).toBeDefined();

    // Replay attempt: reuse old refresh should fail
    await request.post('/auth/refresh').send({ refreshToken: rawRefresh, deviceId: 'device-1' }).expect(500);

    // Logout
    const auth = refreshRes.body.accessToken;
    await request.post('/auth/logout').set('Authorization', `Bearer ${auth}`).set('x-device-id', 'device-1').expect(200);

    // After logout, redis key should be absent
    const redisKey = `rt:${reg.body.id}:device-1`;
    const cached = await redis.get(redisKey);
    expect(cached).toBeNull();

    // Audit: ensure revocation log recorded
    const revocations = await prisma.tokenRevocationLog.findMany({ where: { userId: reg.body.id } });
    expect(revocations.length).toBeGreaterThan(0);

    // Brute-force login attempts -> should hit rate limiter on 6th
    for (let i = 0; i < 5; i++) {
      await request.post('/auth/login').send({ email, password: 'wrong' }).expect(401);
    }
    await request.post('/auth/login').send({ email, password: 'wrong' }).expect(429);

    // Forgot password -> send email
    const forgotRes = await request.post('/auth/forgot-password').send({ email }).expect(200);
    expect(forgotRes.body.ok).toBe(true);

    // Fetch message from Resend mailbox (single GET)
    const Resend = (await import('resend')).default;
    const resendClient = new Resend(process.env.RESEND_API_KEY as string);

    const msgsUnknown = await (resendClient.emails as unknown as { list: (opts: unknown) => Promise<unknown> }).list({ to: email, limit: 10 });
    const msgsArr = Array.isArray(msgsUnknown) ? (msgsUnknown as Array<unknown>) : [];
    const msg = msgsArr.find(isResendMessage);
    if (!msg) throw new Error('No email found in Resend mailbox');

    // Extract raw token locally (do NOT store or log the token anywhere)
    const rawHtml = msg.html as string;
    const tokenMatch = rawHtml.match(/token=([A-Za-z0-9\.-]+)/);
    if (!tokenMatch) throw new Error('No token found in email');
    const resetTokenLocal = tokenMatch[1];

    // Simulate webhook delivery to local test webhook endpoint (Resend would normally POST)
    const msgRec = msg as { id?: string; subject?: string };
    const webhookPayload = { messageId: msgRec.id ?? '', to: email, subject: msgRec.subject ?? '', html: '[REDACTED]' };
    await request.post('/webhook/resend/test').send(webhookPayload).expect(200);

    // Wait for webhook event stored in Redis by the webhook handler
    const { waitForWebhookEvent } = await import('../../lib/redisClient');
    const event = await waitForWebhookEvent(30);
    expect(event).not.toBeNull();
    expect(event?.to).toBe(email);

    // Reset password using the locally-extracted token (never stored)
    await request.post('/auth/reset-password').send({ token: resetTokenLocal, newPassword: 'NewPass123!' }).expect(200);

    // Reuse of same token should fail
    await request.post('/auth/reset-password').send({ token: resetTokenLocal, newPassword: 'Another123!' }).expect(500);

    // Login with new password
    await request.post('/auth/login').send({ email, password: 'NewPass123!', deviceId: 'device-2' }).expect(200);

    // Device mismatch: attempt to refresh with wrong device id should fail
    const loginRes2 = await request.post('/auth/login').send({ email, password: 'NewPass123!', deviceId: 'device-3' }).expect(200);
    const cookieHeader2 = loginRes2.headers['set-cookie'];
    const rawRefresh2 = cookieHeader2[0].split('refreshToken=')[1].split(';')[0];
    await request.post('/auth/refresh').send({ refreshToken: rawRefresh2, deviceId: 'device-999' }).expect(500);
  });
});

import { prisma } from '../../lib/prismaClient';
import { redis, connectRedis, redisHealthCheck } from '../../lib/redisClient';
import { makeRandomToken, hashToken, compareToken } from './tokenUtils';
import { signAccessToken } from './jwt';
import Resend from 'resend';
import { renderToStaticMarkup } from 'react-dom/server';
import PasswordResetEmail from '../../email/PasswordResetEmail';
import pino from 'pino';
import { executeWithPolicies } from '@nextgen-marketplace/shared-utils';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY in environment');
const resend = new Resend(RESEND_API_KEY);

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user with email/password. Throws on existing user.
 */
export async function register(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('User already exists');
  }
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
  const bcrypt = await import('bcryptjs');
  const hashed = await bcrypt.hash(password, saltRounds);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  logger.info({ userId: user.id, email: user.email }, 'auth:registered');
  return { id: user.id, email: user.email };
}

/**
 * Login: validate password, create refresh token row, cache in redis and return tokens.
 */
export async function login(email: string, password: string, deviceId?: string, ip?: string): Promise<AuthResult> {
  await connectRedis();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn({ email }, 'auth:login_failed');
    throw new Error('Invalid credentials');
  }
  const bcrypt = await import('bcryptjs');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    logger.warn({ userId: user.id }, 'auth:login_wrong_password');
    throw new Error('Invalid credentials');
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  // Create new refresh token entry (rotation-safe)
  const tokenId = makeRandomToken(12);
  const secret = makeRandomToken(48);
  const hashedSecret = await hashToken(secret);
  const device = deviceId ?? 'unknown';
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId: user.id,
      hashedToken: hashedSecret,
      deviceId: device,
      ip: ip ?? null,
      expiresAt,
    },
  });

  // Cache in Redis: key -> { id, hashed } to allow quick validation
  const redisKey = `rt:${user.id}:${device}`;
  await redis.set(redisKey, JSON.stringify({ id: tokenId, hashed: hashedSecret }), { EX: REFRESH_TTL_SECONDS });

  logger.info({ userId: user.id, deviceId: device }, 'auth:login_success');
  return { accessToken, refreshToken: `${tokenId}.${secret}` };
}

/**
 * Refresh: validate provided token, rotate, revoke old token and create new one.
 */
export async function refresh(refreshToken: string, deviceId?: string): Promise<AuthResult> {
  await connectRedis();
  const parts = refreshToken.split('.');
  if (parts.length !== 2) throw new Error('Invalid refresh token format');
  const [tokenId, secret] = parts;

  const dbToken = await prisma.refreshToken.findUnique({ where: { id: tokenId } });
  if (!dbToken) {
    logger.warn({ tokenId }, 'auth:refresh_missing_db');
    throw new Error('Invalid refresh token');
  }
  if (dbToken.revoked) throw new Error('Refresh token revoked');
  if (dbToken.expiresAt < new Date()) throw new Error('Refresh token expired');

  // Device binding enforcement
  const device = deviceId ?? dbToken.deviceId;
  if (device && dbToken.deviceId !== device) {
    logger.warn({ tokenId, expected: dbToken.deviceId, actual: device }, 'auth:refresh_device_mismatch');
    throw new Error('Device mismatch');
  }

  const redisKey = `rt:${dbToken.userId}:${dbToken.deviceId}`;
  const cached = await redis.get(redisKey);
  let matched = false;
  if (cached) {
    const parsed = JSON.parse(cached) as { id: string; hashed: string };
    if (parsed.id !== dbToken.id) {
      // cache inconsistency: fallback to DB
      logger.warn({ tokenId: dbToken.id }, 'auth:refresh_cache_mismatch');
    } else {
      matched = await compareToken(secret, parsed.hashed);
      if (!matched) logger.warn({ tokenId: dbToken.id }, 'auth:refresh_cache_bad_secret');
    }
  }

  if (!matched) {
    // Fallback to DB hashed token
    matched = await compareToken(secret, dbToken.hashedToken);
    if (!matched) {
      logger.warn({ tokenId: dbToken.id }, 'auth:refresh_invalid_secret');
      // Security: on invalid secret, revoke token row to prevent replay
      await prisma.refreshToken.update({ where: { id: dbToken.id }, data: { revoked: true } });
      await logRevocation(dbToken.id, dbToken.userId, dbToken.deviceId, 'invalid_secret');
      await redis.del(redisKey);
      throw new Error('Invalid refresh token');
    }
  }

  // Rotate: create a new refresh token and revoke old one
  const newId = makeRandomToken(12);
  const newSecret = makeRandomToken(48);
  const newHashed = await hashToken(newSecret);
  const newExpires = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);

  await prisma.$transaction(async (tx: typeof prisma) => {
    await tx.refreshToken.update({ where: { id: dbToken.id }, data: { revoked: true } });
    await tx.refreshToken.create({ data: { id: newId, userId: dbToken.userId, hashedToken: newHashed, deviceId: dbToken.deviceId, ip: dbToken.ip, expiresAt: newExpires } });
    await tx.tokenRevocationLog.create({ data: { tokenId: dbToken.id, userId: dbToken.userId, deviceId: dbToken.deviceId ?? undefined, reason: 'rotation' } });
  });

  // Update cache
  await redis.set(redisKey, JSON.stringify({ id: newId, hashed: newHashed } as { id: string; hashed: string }), { EX: REFRESH_TTL_SECONDS });

  const accessToken = signAccessToken({ sub: dbToken.userId });
  logger.info({ userId: dbToken.userId, oldTokenId: dbToken.id, newTokenId: newId }, 'auth:refresh_rotated');

  return { accessToken, refreshToken: `${newId}.${newSecret}` };
}

/**
 * Logout: revoke refresh token(s) for a device and remove cache entry.
 */
export async function logout(userId: string, deviceId: string): Promise<void> {
  await connectRedis();
  const device = deviceId ?? 'unknown';
  const redisKey = `rt:${userId}:${device}`;
  const cached = await redis.get(redisKey);
  if (cached) {
    const parsed = JSON.parse(cached) as { id: string };
    await prisma.refreshToken.updateMany({ where: { id: parsed.id }, data: { revoked: true } });
    await logRevocation(parsed.id, userId, device, 'logout');
  }
  await redis.del(redisKey);
  logger.info({ userId, deviceId: device }, 'auth:logout');
}

/**
 * Forgot password: create single-use token, send via Resend email, idempotent if called multiple times.
 */
export async function forgotPassword(email: string): Promise<{ ok: true; resendId?: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true };

  // Create a single active token per user: revoke previous unused tokens
  await prisma.passwordResetToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } });

  const tokenId = makeRandomToken(12);
  const secret = makeRandomToken(48);
  const hashed = await hashToken(secret);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({ data: { id: tokenId, userId: user.id, hashedToken: hashed, expiresAt } });

  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${tokenId}.${secret}`;
  const html = renderToStaticMarkup(PasswordResetEmail({ resetUrl, name: user.firstName ?? user.email }));

  // Send email with resilience policies
  const resp = (await executeWithPolicies(() => resend.emails.send({ from: process.env.EMAIL_FROM as string, to: email, subject: 'Reset your password', html }))) as { id: string };
  const out: { ok: true; resendId?: string } = { ok: true, resendId: resp.id };
  logger.info({ userId: user.id, resendId: resp.id }, 'auth:forgot_sent');
  return out;
}

/**
 * Reset password: one-time-use, idempotent. Marks token as used and updates password.
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ ok: true }> {
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Invalid token format');
  const [tokenId, secret] = parts;

  const dbToken = await prisma.passwordResetToken.findUnique({ where: { id: tokenId } });
  if (!dbToken) throw new Error('Invalid or expired token');
  if (dbToken.used) throw new Error('Token already used');
  if (dbToken.expiresAt < new Date()) throw new Error('Token expired');

  const ok = await compareToken(secret, dbToken.hashedToken);
  if (!ok) throw new Error('Invalid token');

  const bcrypt = await import('bcryptjs');
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
  const hashed = await bcrypt.hash(newPassword, saltRounds);

  await prisma.$transaction(async (tx: typeof prisma) => {
    await tx.user.update({ where: { id: dbToken.userId }, data: { password: hashed } });
    await tx.passwordResetToken.update({ where: { id: tokenId }, data: { used: true } });
  });

  logger.info({ userId: dbToken.userId }, 'auth:reset_success');
  return { ok: true };
}

async function logRevocation(tokenId: string, userId: string, deviceId: string | null, reason: string) {
  await prisma.tokenRevocationLog.create({ data: { tokenId, userId, deviceId: deviceId ?? undefined, reason } });
}

import express, { Request, Response, NextFunction } from 'express';
import { register, login, refresh, logout, forgotPassword, resetPassword } from '../modules/auth/authService';
import { loginSchema, registerSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from '../modules/auth/schemas';
import { loginLimiter, refreshLimiter } from '../middleware/security';
import { RequestHandler } from 'express';
import type { Prisma } from '@prisma/client';

// Role middleware
const requireRole = (role: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth = req.headers.authorization?.split(' ')[1];
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { verifyAccessToken } = await import('../modules/auth/jwt');
      const decoded = verifyAccessToken(auth) as { sub: string; role?: string } | null;
      if (!decoded || decoded.role !== role) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      (req as unknown as { user?: { id: string; role?: string } }).user = { id: decoded.sub, role: decoded.role };
      next();
    } catch (err) {
      next(err);
    }
  };
};

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       '200':
 *         description: Registered
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const out = await register(parsed.email, parsed.password);
    res.status(201).json(out);
  } catch (err) {
    next(err);
  }
});

router.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const ip = req.ip;
    const deviceId = parsed.deviceId ?? req.header('x-device-id') ?? 'unknown';
    const result = await login(parsed.email, parsed.password, deviceId, ip);

    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', refreshLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = refreshSchema.parse(req.body);
    const deviceId = parsed.deviceId ?? req.header('x-device-id') ?? 'unknown';
    const result = await refresh(parsed.refreshToken, deviceId);
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization?.split(' ')[1];
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // verify token to extract user id
    const { verifyAccessToken } = await import('../modules/auth/jwt');
    const decoded = verifyAccessToken(auth) as { sub: string };
    const deviceId = req.header('x-device-id') ?? 'unknown';
    await logout(decoded.sub, deviceId);
    res.clearCookie('refreshToken');
    res.status(200).json({ ok: true });
    return;
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = forgotPasswordSchema.parse(req.body);
    const out = await forgotPassword(parsed.email);
    res.status(200).json(out);
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = resetPasswordSchema.parse(req.body);
    const out = await resetPassword(parsed.token, parsed.newPassword);
    res.status(200).json(out);
  } catch (err) {
    next(err);
  }
});

// New endpoint: get revocation logs (admin only)
router.get('/revocations', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prisma } = await import('../lib/prismaClient');
    const userId = req.query.userId as string | undefined;
    let logs: TokenRevocationLogPayload[];
    if (userId) {
      logs = (await prisma.tokenRevocationLog.findMany({ where: { userId } })) as TokenRevocationLogPayload[];
    } else {
      logs = (await prisma.tokenRevocationLog.findMany()) as TokenRevocationLogPayload[];
    }
    type TokenRevocationLogPayload = { tokenId: string; userId: string; deviceId?: string | null; reason: string; createdAt: Date };
    const mapped = logs.map((l) => ({ tokenId: l.tokenId, userId: l.userId, deviceId: l.deviceId ?? null, reason: l.reason, createdAt: l.createdAt }));
    res.status(200).json(mapped);
  } catch (err) {
    next(err);
  }
});

export default router;

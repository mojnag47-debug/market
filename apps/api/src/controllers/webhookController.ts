import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pino from 'pino';
import { pushWebhookEvent } from '../lib/redisClient';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const router = express.Router();

const resendWebhookSchema = z.object({
  messageId: z.string(),
  to: z.string().email(),
  subject: z.string().optional(),
  html: z.string().optional(),
  receivedAt: z.string().optional(),
});

// Test-only endpoint: receives an event resembling Resend webhook and stores sanitized event in Redis.
router.post('/resend/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const parsed = resendWebhookSchema.parse(req.body);

    // Sanitize: remove tokens from html if present
    const sanitizedHtml = parsed.html ? parsed.html.replace(/token=([A-Za-z0-9\.-]+)/g, 'token=[REDACTED]') : undefined;

    const event = {
      messageId: parsed.messageId,
      to: parsed.to,
      subject: parsed.subject,
      receivedAt: parsed.receivedAt ?? new Date().toISOString(),
    };

    // push to redis list for tests to consume; never include html/token in stored event
    await pushWebhookEvent(event);

    logger.info({ messageId: event.messageId, to: event.to, subject: event.subject }, 'webhook:resend_received_test');

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

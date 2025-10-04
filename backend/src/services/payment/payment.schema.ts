import { z } from 'zod';

export const paymentRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().optional(),
  userId: z.string(),
  orderId: z.string().optional(),
  description: z.string().optional(),
});

export const paymentVerificationSchema = z.object({
  transactionId: z.string(),
  amount: z.number().optional(),
});

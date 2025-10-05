import { z } from 'zod';

export const emailSchema = z.string().email().max(254);
export const passwordSchema = z.string().min(8).max(128).regex(/[\p{Ll}\p{Lu}\p{N}\p{P}]/u, 'Password complexity not met');
export const deviceIdSchema = z.string().min(2).max(128);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  deviceId: deviceIdSchema.optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
  deviceId: deviceIdSchema.optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: passwordSchema,
});

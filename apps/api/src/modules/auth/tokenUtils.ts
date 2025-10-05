import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function makeRandomToken(size = 48) {
  return crypto.randomBytes(size).toString('hex');
}

export async function hashToken(token: string) {
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  return bcrypt.hash(token, rounds);
}

export async function compareToken(token: string, hashed: string) {
  return bcrypt.compare(token, hashed);
}

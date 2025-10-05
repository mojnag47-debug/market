import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const ACCESS_EXPIRES = process.env.JWT_EXPIRE_TIME || '15m';

export function signAccessToken(payload: object) {
  return jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn: ACCESS_EXPIRES });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, SECRET);
}

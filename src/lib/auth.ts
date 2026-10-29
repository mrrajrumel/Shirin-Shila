import crypto from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@shirinshila.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shirinshila2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'shirin_shila_secret_session_token_2026_secured';

export const SESSION_COOKIE_NAME = 'shirin_shila_admin_session';

export function verifyAdminCredentials(email?: string, password?: string): boolean {
  if (!email || !password) return false;
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

export function createSessionToken(): string {
  const payload = JSON.stringify({
    role: 'admin',
    email: ADMIN_EMAIL,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSignature) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

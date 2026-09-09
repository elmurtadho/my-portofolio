import { cookies } from 'next/headers';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'mintfolio_admin_token';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'mintfolio2026';
const SESSION_SECRET = process.env.ADMIN_SECRET || 'mintfolio-secure-admin-secret-key-32chars';

/**
 * Creates a deterministic or timed session token.
 */
export function generateSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Verifies if a session token is valid and not expired (24 hours validity).
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // 24 hours expiry
  const now = Date.now();
  if (now - timestamp > 24 * 60 * 60 * 1000) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestampStr)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Checks if the provided password matches the configured admin password.
 */
export function verifyPassword(password: string): boolean {
  if (!password) return false;
  return password === DEFAULT_PASSWORD;
}

/**
 * Verifies if the incoming request has valid admin credentials
 * (checks cookie or Authorization: Bearer <token>).
 */
export async function isAuthenticatedAdmin(request?: Request): Promise<boolean> {
  // 1. Check Bearer token in request header
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (verifySessionToken(token)) return true;
    }
  }

  // 2. Check HTTP cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token && verifySessionToken(token)) {
      return true;
    }
  } catch {
    // fallback if outside Next request scope
  }

  return false;
}

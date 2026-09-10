import { cookies } from 'next/headers';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'mintfolio_admin_token';
export const DEFAULT_ADMIN_EMAIL = 'almurtadha221103@gmail.com';
export const ALLOWED_USERNAMES = [
  'admin',
  'elmurtadho',
  'almurtadha221103@gmail.com',
];

const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'mintfolio2026';
const SESSION_SECRET = process.env.ADMIN_SECRET || 'mintfolio-secure-admin-secret-key-32chars';

/**
 * Validates if the username or email matches allowed admin identifiers.
 */
export function isValidAdminUsername(username?: string | null): boolean {
  if (!username) return false;
  const clean = username.trim().toLowerCase();
  if (ALLOWED_USERNAMES.includes(clean)) return true;
  if (process.env.ADMIN_EMAIL && clean === process.env.ADMIN_EMAIL.trim().toLowerCase()) return true;
  return false;
}

/**
 * Checks if the provided password matches the configured admin password or db setting.
 */
export async function verifyPasswordAsync(password: string): Promise<boolean> {
  if (!password) return false;
  try {
    const { getDatabase } = await import('./db');
    const db = await getDatabase();
    if (db.settings && (db.settings as any).adminPassword) {
      if (password === (db.settings as any).adminPassword) return true;
    }
  } catch {
    // fallback
  }
  return password === DEFAULT_PASSWORD;
}

/**
 * Synchronous fallback password check.
 */
export function verifyPassword(password: string): boolean {
  if (!password) return false;
  return password === DEFAULT_PASSWORD;
}

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

  // 7 days expiry for seamless admin management without abrupt session drops
  const now = Date.now();
  if (now - timestamp > 7 * 24 * 60 * 60 * 1000) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(timestampStr)
      .digest('hex');

    const pBuf = Buffer.from(providedSignature);
    const eBuf = Buffer.from(expectedSignature);
    if (pBuf.length !== eBuf.length) return false;

    return crypto.timingSafeEqual(pBuf, eBuf);
  } catch {
    return false;
  }
}


/**
 * Verifies if the incoming request has valid admin credentials
 * (checks Bearer token header, standard cookie, or Cookie header).
 */
export async function isAuthenticatedAdmin(request?: Request): Promise<boolean> {
  // 1. Check Bearer token in request header
  if (request) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (verifySessionToken(token)) return true;
    }

    // Check raw Cookie header in request
    const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${ADMIN_COOKIE_NAME}=([^;]*)`));
      if (match && match[1]) {
        const decodedToken = decodeURIComponent(match[1]).trim();
        if (verifySessionToken(decodedToken)) return true;
      }
    }
  }

  // 2. Check Next.js HTTP cookie store
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

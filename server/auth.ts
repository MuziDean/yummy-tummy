import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const SESSION_COOKIE_NAME = 'yt_admin_session';

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  role: 'super_admin' | 'store_manager';
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export function signSessionToken(payload: Omit<SessionPayload, 'exp'>, secret: string, ttlMs = 24 * 60 * 60 * 1000): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + ttlMs,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

export interface AuthenticatedRequest extends Request {
  adminUser?: SessionPayload;
}

export function createRequireAdmin(getSecret: () => string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const payload = verifySessionToken(token, getSecret());
    if (!payload) {
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }
    req.adminUser = payload;
    next();
  };
}

export function requireRole(allowedRoles: Array<'super_admin' | 'store_manager'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser || !allowedRoles.includes(req.adminUser.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

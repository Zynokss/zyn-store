import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const ADMIN_SESSION_KEY = 'zyn_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSessionSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error('BETTER_AUTH_SECRET is not configured');
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(`admin-session:${payload}`).digest('hex');
}

// Session tokens are HMAC-signed and carry their own expiry so a request can be
// authenticated without a server-side session store, but they can't be forged or
// tampered with without the server secret (unlike the previous unsigned base64 token,
// which any client could mint just by knowing an admin's id).
export function createAdminSessionToken(adminId: string): string {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${adminId}:${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export async function verifyAdminSession(req: NextRequest): Promise<{ id: string; email: string; role: string } | null> {
  const cookie = req.cookies.get(ADMIN_SESSION_KEY);
  if (!cookie?.value) return null;

  try {
    const decoded = Buffer.from(cookie.value, 'base64url').toString('utf-8');
    const [adminId, expiresAtStr, signature] = decoded.split(':');
    if (!adminId || !expiresAtStr || !signature) return null;

    const expectedSignature = sign(`${adminId}:${expiresAtStr}`);
    const signatureBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (signatureBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
      return null;
    }

    if (Date.now() > Number(expiresAtStr)) return null;

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, role: true },
    });
    return admin;
  } catch {
    return null;
  }
}

export async function verifyUserSession(): Promise<{ id: string; email: string; role: string } | null> {
  try {
    const { auth } = await import('@/lib/auth');
    const { headers } = await import('next/headers');
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
      select: { id: true, email: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}

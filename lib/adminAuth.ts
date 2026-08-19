import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const ADMIN_SESSION_KEY = 'zyn_admin_session';

export async function verifyAdminSession(req: NextRequest): Promise<{ id: string; email: string; role: string } | null> {
  const cookie = req.cookies.get(ADMIN_SESSION_KEY);
  if (!cookie?.value) return null;

  try {
    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
    const [adminId] = decoded.split(':');
    if (!adminId) return null;

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
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ADMIN_SESSION_KEY, createAdminSessionToken, ADMIN_SESSION_MAX_AGE_SECONDS } from '@/lib/adminAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    if (!checkRateLimit(`admin-login:${clientIp}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Try again later.' },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const formattedEmail = String(email).toLowerCase().trim();

    const admin = await prisma.adminUser.findFirst({
      where: {
        email: formattedEmail,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, admin.password);

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const sessionToken = createAdminSessionToken(admin.id);

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role || 'ADMIN',
      },
    });

    // 'none' is required for the cookie to be sent on cross-site requests from the
    // external admin dashboard; browsers require 'secure' whenever sameSite is 'none'.
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set(ADMIN_SESSION_KEY, sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

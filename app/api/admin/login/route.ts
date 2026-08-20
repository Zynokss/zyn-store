import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const ADMIN_SESSION_KEY = 'zyn_admin_session';

export async function POST(req: Request) {
  try {
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

    const isBcryptHash = /^\$2[aby]\$/.test(admin.password);

    let passwordValid = false;
    if (isBcryptHash) {
      passwordValid = await bcrypt.compare(password, admin.password);
    } else if (admin.password === password) {
      passwordValid = true;
      const hashed = await bcrypt.hash(password, 10);
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { password: hashed },
      });
    }

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const sessionToken = Buffer.from(
      `${admin.id}:${Date.now()}:${crypto.randomUUID()}`
    ).toString('base64');

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role || 'ADMIN',
      },
      sessionToken,
    });

    // 'none' is required for the cookie to be sent on cross-site requests from the
    // external admin dashboard; browsers require 'secure' whenever sameSite is 'none'.
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set(ADMIN_SESSION_KEY, sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
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
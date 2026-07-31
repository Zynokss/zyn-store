import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user (schema will auto-assign role="CUSTOMER", createdAt, updatedAt, and cuid id)
    const newUser = await prisma.user.create({
      data: {
        name: name?.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: hashedPassword,
        role: 'CUSTOMER', // Matches your schema comment ("CUSTOMER" or "ADMIN")
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
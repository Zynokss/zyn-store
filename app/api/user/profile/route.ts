import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) return null;
  return { email: session.user.email.toLowerCase().trim() };
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address1: true,
        address2: true,
        city: true,
        postalCode: true,
      },
    });

    return NextResponse.json({ success: true, user: profile });
  } catch (error: unknown) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, address1, address2, city, postalCode } = body;

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: {
        name,
        phone,
        address1,
        address2: address2 || null,
        city,
        postalCode: postalCode || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address1: true,
        address2: true,
        city: true,
        postalCode: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

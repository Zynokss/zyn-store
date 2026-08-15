import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSessionUser() {
  const { data: session } = (await auth.getSession()) as {
    data?: { user?: { id?: string; email?: string; name?: string } } | null;
  };
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
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
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

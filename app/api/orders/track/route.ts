import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();

  if (!query) {
    return NextResponse.json({ success: false, error: 'Missing order search query' }, { status: 400 });
  }

  try {
    const cleanQuery = query.toLowerCase();

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { id: query },
          { email: cleanQuery },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error: unknown) {
    console.error('Order tracking server exception:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}
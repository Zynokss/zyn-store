import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId')?.trim();
  const email = searchParams.get('email')?.trim();
  const query = searchParams.get('query')?.trim();

  const user = await verifyUserSession();

  try {
    if (user && !orderId && !email) {
      const myOrders = await prisma.order.findMany({
        where: { OR: [{ userId: user.id }, { email: { equals: user.email, mode: 'insensitive' } }] },
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      });
      return NextResponse.json({ success: true, orders: myOrders || [] });
    }

    let whereClause: Record<string, unknown> = {};

    if (orderId && email) {
      whereClause = {
        id: { equals: orderId, mode: 'insensitive' },
        email: { equals: email.toLowerCase(), mode: 'insensitive' },
      };
    } else if (orderId) {
      whereClause = { id: { equals: orderId, mode: 'insensitive' } };
    } else if (email && user && email.toLowerCase() === user.email.toLowerCase()) {
      whereClause = { email: { equals: email.toLowerCase(), mode: 'insensitive' } };
    } else if (query) {
      whereClause = {
        OR: [
          { id: { equals: query, mode: 'insensitive' } },
        ],
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Order ID required, or sign in with matching email' },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });

    const sanitizedOrders = orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      city: o.city,
      items: o.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
        price: i.price,
        product: {
          name: i.product?.name,
          images: i.product?.images,
        },
      })),
    }));

    return NextResponse.json({ success: true, orders: sanitizedOrders });
  } catch (error: unknown) {
    console.error('Order tracking server exception:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}
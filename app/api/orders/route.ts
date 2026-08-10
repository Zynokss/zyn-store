import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface OrderItemInput {
  productId?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
  price?: number;
  product?: {
    id?: string;
    price?: number;
  };
}

interface OrderRecord {
  total?: number | string;
}

// OPTIONS: Preflight handling
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

// GET: Fetch all orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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

    const orderList = orders || [];
    const totalRevenue = orderList.reduce((sum: number, order: OrderRecord) => sum + (Number(order.total) || 0), 0);
    const totalOrders = orderList.length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
      },
      orders: orderList,
    });
  } catch (error: unknown) {
    console.error('Failed to fetch orders exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order metrics' },
      { status: 500 }
    );
  }
}

// POST: Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, address, city, state, zipCode, total, items } = body;
    const orderId = `ord_${Date.now()}`;

    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        email: email?.toLowerCase().trim(),
        firstName,
        lastName,
        address,
        city,
        state,
        zipCode,
        total: total || 0,
        status: 'PENDING_PAYMENT',
        items: {
          create: (items || []).map((item: OrderItemInput) => ({
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            productId: item.product?.id || item.productId || '',
            selectedSize: item.selectedSize || 'DEFAULT',
            selectedColor: item.selectedColor || null,
            quantity: item.quantity || 1,
            price: item.product?.price || item.price || 0,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created and persisted successfully',
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Failed to create order exception:', error);
    return NextResponse.json(
      { success: false, error: 'Database order creation failed' },
      { status: 400 }
    );
  }
}

// PATCH: Update order status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const targetId = body.orderId || body.id;
    const status = body.status;

    if (!targetId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: String(targetId) },
      data: {
        status: String(status).toUpperCase() as any,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: unknown) {
    console.error('Failed to update order status exception:', error);
    return NextResponse.json(
      { success: false, error: 'Database order status update failed' },
      { status: 500 }
    );
  }
}
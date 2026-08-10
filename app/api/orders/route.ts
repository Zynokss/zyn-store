import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface OrderItemInput {
  productId?: string;
  selectedSize?: string;
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
        status: 'COMPLETED',
        items: {
          create: (items || []).map((item: OrderItemInput) => ({
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            productId: item.product?.id || item.productId || '',
            selectedSize: item.selectedSize || 'DEFAULT',
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
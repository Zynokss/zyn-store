import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders - Fetches metrics for Zynboard dashboard
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
      },
      orders,
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order metrics' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Saves checkout order to PostgreSQL database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, address, city, state, zipCode, total, items } = body;

    const newOrder = await prisma.order.create({
      data: {
        email,
        firstName,
        lastName,
        address,
        city,
        state,
        zipCode,
        total,
        status: 'COMPLETED',
        items: {
          create: items.map((item: any) => ({
            productId: item.product.id,
            selectedSize: item.selectedSize,
            quantity: item.quantity,
            price: item.product.price,
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
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { success: false, error: 'Database order creation failed' },
      { status: 400 }
    );
  }
}
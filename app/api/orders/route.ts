import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession, verifyUserSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const VALID_STATUSES = [
  'PENDING_PAYMENT',
  'PENDING_CONFIRMATION',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
] as const;

type ValidStatus = typeof VALID_STATUSES[number];

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

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminSession(req);
    const user = await verifyUserSession(req);
    const { searchParams } = new URL(req.url);
    const justMine = searchParams.get('mine') === 'true';

    let orders;
    if (admin) {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      });
    } else if (user && justMine) {
      orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orderList = orders || [];
    const totalRevenue = orderList.reduce((sum: number, order: OrderRecord) => sum + (Number(order.total) || 0), 0);
    const totalOrders = orderList.length;

    return NextResponse.json({
      success: true,
      metrics: admin
        ? {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
          }
        : undefined,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, address, city, state, zipCode, items } = body;

    if (!email || !firstName || !lastName || !address || !city || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    const user = await verifyUserSession(req);

    const productIds = items
      .map((i: OrderItemInput) => i.product?.id || i.productId)
      .filter(Boolean);

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, inStock: true },
    });

    const productPriceMap = new Map(dbProducts.map((p) => [p.id, p.price]));
    const outOfStockIds = dbProducts.filter((p) => !p.inStock).map((p) => p.id);

    if (outOfStockIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Some items are no longer in stock', outOfStockIds },
        { status: 400 }
      );
    }

    const orderItems: { productId: string; selectedSize: string; selectedColor: string | null; quantity: number; price: number; lineTotal: number }[] = (items || []).map((item: OrderItemInput) => {
      const pid = item.product?.id || item.productId || '';
      const verifiedPrice = Number(productPriceMap.get(pid) || 0);
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      return {
        productId: pid,
        selectedSize: item.selectedSize || 'DEFAULT',
        selectedColor: item.selectedColor || null,
        quantity: qty,
        price: verifiedPrice,
        lineTotal: verifiedPrice * qty,
      };
    });

    const verifiedTotal = Number(
      orderItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2)
    );

    const cleanEmail = String(email).toLowerCase().trim();

    const newOrder = await prisma.order.create({
      data: {
        userId: user?.id || null,
        email: cleanEmail,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        state: state ? String(state).trim() : '',
        zipCode: zipCode ? String(zipCode).trim() : '',
        total: verifiedTotal,
        status: 'PENDING_PAYMENT',
        items: {
          create: orderItems.map(({ lineTotal, ...rest }) => rest),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created and persisted successfully',
        order: newOrder,
        verifiedTotal,
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

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const targetId = body.orderId || body.id;
    const rawStatus = String(body.status || '').toUpperCase();

    if (!targetId || !rawStatus) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const status = VALID_STATUSES.includes(rawStatus as ValidStatus)
      ? (rawStatus as ValidStatus)
      : 'PENDING_CONFIRMATION';

    const updatedOrder = await prisma.order.update({
      where: { id: String(targetId) },
      data: { status },
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
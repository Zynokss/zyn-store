import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const totalOrdersCount = await prisma.order.count();
    const revenueSum = await prisma.order.aggregate({
      _sum: { total: true },
    });
    const totalRevenue = Number(revenueSum._sum.total || 0);

    // Direct database customer count (replaces Vercel Web Analytics API)
    const totalVisitors = await prisma.user.count();

    const orderItems = await prisma.orderItem.findMany({
      include: { product: { select: { category: true } } },
    });

    const categoryTotals: Record<string, number> = {};
    orderItems.forEach((item) => {
      const cat = item.product?.category || 'Uncategorized';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + item.price * item.quantity;
    });

    const topCategories = Object.entries(categoryTotals).map(([name, total]) => ({
      name,
      amount: `${total.toFixed(2)} MAD`,
      numericTotal: total,
    }));

    const recentOrders = await prisma.order.findMany({
      take: 30,
      orderBy: { createdAt: 'asc' },
      select: { total: true, createdAt: true },
    });

    const chartMap: Record<string, number> = {};
    recentOrders.forEach((ord) => {
      const dateLabel = new Date(ord.createdAt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      });
      chartMap[dateLabel] = (chartMap[dateLabel] || 0) + ord.total;
    });

    const dynamicChartData = Object.entries(chartMap).map(([month, topGross]) => ({
      month,
      firstHalf: Math.round(topGross * 0.6),
      topGross,
    }));

    const pendingPayment = await prisma.order.count({ where: { status: 'PENDING_PAYMENT' } });
    const processing = await prisma.order.count({ where: { status: 'PROCESSING' } });
    const shipped = await prisma.order.count({ where: { status: 'SHIPPED' } });
    const delivered = await prisma.order.count({ where: { status: 'DELIVERED' } });
    const productsCount = await prisma.product.count();
    const productsInStock = await prisma.product.count({ where: { inStock: true } });
    const customersCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      customers: totalVisitors,
      revenue: totalRevenue,
      deals: totalOrdersCount,
      topCategories,
      chartData: dynamicChartData,
      breakdown: {
        pendingPayment,
        processing,
        shipped,
        delivered,
        productsCount,
        productsInStock,
        customersCount,
      },
    });
  } catch (error) {
    console.error('Failed to calculate stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store stats' },
      { status: 500 }
    );
  }
}
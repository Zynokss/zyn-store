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
      include: { product: { select: { category: true, price: true } } },
    });

    const categoryTotals: Record<string, number> = {};
    orderItems.forEach((item) => {
      const cat = item.product?.category || 'Uncategorized';
      const price = item.product?.price || item.price || 0;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + price * item.quantity;
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
        month: 'short',
        day: 'numeric'
      });
      chartMap[dateLabel] = (chartMap[dateLabel] || 0) + Number(ord.total || 0);
    });

    const chartData = Object.entries(chartMap).map(([date, revenue]) => ({
      date,
      revenue
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        totalVisitors,
        conversionRate: totalVisitors > 0 ? ((totalOrdersCount / totalVisitors) * 100).toFixed(1) + '%' : '0%',
        topCategories,
        chartData
      }
    });

  } catch (error: unknown) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
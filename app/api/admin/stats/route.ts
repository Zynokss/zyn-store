import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Fetch live total orders count & calculate total revenue sum from Neon DB
    const totalOrdersCount = await prisma.order.count();
    const revenueSum = await prisma.order.aggregate({
      _sum: { total: true },
    });
    const totalRevenue = revenueSum._sum.total || 0;

    // 2. Fetch live visitor count from Vercel Web Analytics API
    let totalVisitors = 0;
    const token = process.env.VERCEL_AUTH_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (token && projectId) {
      try {
        const vercelRes = await fetch(
          `https://vercel.com/api/v1/web-analytics/stats?projectId=${projectId}&environment=production`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            next: { revalidate: 60 }, // Cache traffic stats for 60 seconds
          }
        );

        if (vercelRes.ok) {
          const analytics = await vercelRes.json();
          totalVisitors = analytics?.pageviews?.value || analytics?.visitors?.value || 0;
        } else {
          console.error('Vercel Analytics response status:', vercelRes.status);
        }
      } catch (err) {
        console.error('Failed to query Vercel Analytics API:', err);
      }
    }

    // Fallback to database user count if Vercel Analytics returns 0 or isn't populated yet
    if (totalVisitors === 0) {
      totalVisitors = await prisma.user.count();
    }

    // 3. Fetch order items to calculate dynamic category breakdown
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: { select: { category: true } },
      },
    });

    const categoryTotals: Record<string, number> = {};
    orderItems.forEach((item) => {
      const cat = item.product?.category || 'Uncategorized';
      const itemTotal = item.price * item.quantity;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + itemTotal;
    });

    // Format top categories array
    const topCategories = Object.entries(categoryTotals).map(([name, total]) => ({
      name,
      amount: `${total.toFixed(2)} MAD`,
      numericTotal: total,
    }));

    // 4. Calculate dynamic monthly chart trajectory (grouping orders by date)
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
      firstHalf: Math.round(topGross * 0.6), // Benchmark baseline
      topGross,
    }));

    return NextResponse.json({
      success: true,
      customers: totalVisitors,
      revenue: totalRevenue,
      deals: totalOrdersCount,
      topCategories,
      chartData: dynamicChartData,
    });
  } catch (error) {
    console.error('Failed to calculate stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store stats' },
      { status: 500 }
    );
  }
}
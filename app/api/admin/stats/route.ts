import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [totalCustomers, revenueResult, totalDeals] = await Promise.all([
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      customers: totalCustomers,
      revenue: revenueResult._sum.total || 0,
      deals: totalDeals,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
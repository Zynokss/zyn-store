import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('API Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products', products: [] },
      { status: 500 }
    );
  }
}
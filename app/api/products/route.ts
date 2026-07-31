import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Format products to match what Zynstore components expect
    const formattedProducts = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      category: p.category || 'Uncategorized',
      price: typeof p.price === 'number' ? p.price : parseFloat(p.price as any) || 0,
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
      images: Array.isArray(p.images) && p.images.length > 0 
        ? p.images 
        : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'],
      inStock: p.inStock ?? true,
    }));

    return NextResponse.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error('API Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products', products: [] },
      { status: 500 }
    );
  }
}
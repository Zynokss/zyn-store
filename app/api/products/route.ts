import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RawProduct {
  id: string | number;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  sizes?: string[];
  images?: string[];
  image?: string;
  inStock?: boolean;
  slug?: string;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany();

    const formattedProducts = (products || []).map((p: RawProduct) => {
      const primaryImage =
        Array.isArray(p.images) && p.images.length > 0
          ? p.images[0]
          : p.image ||
            'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop';

      return {
        id: String(p.id),
        name: String(p.name || ''),
        description: String(p.description || p.name || ''),
        category: String(p.category || 'Streetwear'),
        price: Number(p.price) || 0,
        sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [primaryImage],
        image: primaryImage,
        inStock: p.inStock ?? true,
        slug: p.slug || String(p.id),
      };
    });

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unexpected API error';
    console.error('Unexpected API error:', err);
    return NextResponse.json(
      { success: false, error: errorMessage, products: [] },
      { status: 500 }
    );
  }
}
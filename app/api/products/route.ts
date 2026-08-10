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
  colors?: string[];
  images?: string[];
  image?: string;
  inStock?: boolean;
}

function formatProduct(p: RawProduct) {
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
    colors: Array.isArray(p.colors) ? p.colors : [],
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [primaryImage],
    image: primaryImage,
    inStock: p.inStock ?? true,
    slug: String(p.id),
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      products: (products || []).map(formatProduct),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unexpected API error';
    return NextResponse.json({ success: false, error: errorMessage, products: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Product name is required.' }, { status: 400 });
    }

    const name = String(body.name);
    const category = String(body.category || 'Streetwear');
    const price = Number(body.price) || 0;
    const description = String(body.description || name);
    const primaryImage =
      body.image ||
      (Array.isArray(body.images) && body.images.length > 0 ? body.images[0] : '') ||
      'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop';

    const inStock =
      typeof body.inStock === 'boolean'
        ? body.inStock
        : body.stockStatus
        ? body.stockStatus === 'In Stock'
        : true;

    const colors = Array.isArray(body.colors)
      ? body.colors.map((c: unknown) => String(c).trim()).filter(Boolean)
      : [];

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        sizes: Array.isArray(body.sizes) && body.sizes.length > 0 ? body.sizes : ['S', 'M', 'L', 'XL'],
        colors,
        images: [primaryImage],
        inStock,
      },
    });

    return NextResponse.json({ success: true, product: formatProduct(newProduct) });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    // Format & clean price
    if (updateData.price) updateData.price = Number(updateData.price);

    // Format & clean stock status
    if (typeof updateData.inStock === 'undefined' && updateData.stockStatus) {
      updateData.inStock = updateData.stockStatus === 'In Stock';
    }

    // Process image updates
    if (updateData.image && (!updateData.images || updateData.images.length === 0)) {
      updateData.images = [updateData.image];
    }

    // Ensure colors are sanitized properly
    if (Array.isArray(updateData.colors)) {
      updateData.colors = updateData.colors.map((c: unknown) => String(c).trim()).filter(Boolean);
    }

    // Remove non-Prisma metadata fields
    delete updateData.slug;
    delete updateData.image;
    delete updateData.stockStatus;
    delete updateData.stockCount;
    delete updateData.totalSales;

    const updatedProduct = await prisma.product.update({
      where: { id: String(id) },
      data: updateData,
    });

    return NextResponse.json({ success: true, product: formatProduct(updatedProduct) });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });

    const targetId = String(id);

    await prisma.$transaction(async (tx) => {
      if ('orderItem' in tx) await (tx as any).orderItem.deleteMany({ where: { productId: targetId } });
      if ('cartItem' in tx) await (tx as any).cartItem.deleteMany({ where: { productId: targetId } });
      await tx.product.delete({ where: { id: targetId } });
    });

    return NextResponse.json({ success: true, id: targetId });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
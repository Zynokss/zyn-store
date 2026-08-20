import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminAuth';

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
  featured?: boolean;
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
    featured: Boolean(p.featured),
    slug: String(p.id),
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');
    
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product: formatProduct(product) });
    }
    
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      products: (products || []).map(formatProduct),
    });
  } catch (err: unknown) {
    console.error('Failed to fetch products:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch products', products: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminSession(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin authentication required' }, { status: 401 });
    }
    
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Product name is required.' }, { status: 400 });
    }
    
    const name = String(body.name).trim();
    const category = String(body.category || 'Streetwear').trim();
    const price = Math.max(0, Number(body.price) || 0);
    const description = String(body.description || name).trim();
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
    console.error('Failed to create product:', err);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdminSession(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin authentication required' }, { status: 401 });
    }
    
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }
    
    if (updateData.price !== undefined) updateData.price = Math.max(0, Number(updateData.price) || 0);
    if (updateData.name) updateData.name = String(updateData.name).trim();
    if (updateData.category) updateData.category = String(updateData.category).trim();
    if (updateData.description) updateData.description = String(updateData.description).trim();
    if (typeof updateData.inStock === 'undefined' && updateData.stockStatus) {
      updateData.inStock = updateData.stockStatus === 'In Stock';
    }
    if (updateData.image && (!updateData.images || updateData.images.length === 0)) {
      updateData.images = [updateData.image];
    }
    if (Array.isArray(updateData.colors)) {
      updateData.colors = updateData.colors.map((c: unknown) => String(c).trim()).filter(Boolean);
    }
    
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
    console.error('Failed to update product:', err);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdminSession(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin authentication required' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    
    const targetId = String(id);
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { productId: targetId } });
      await tx.product.delete({ where: { id: targetId } });
    });
    
    return NextResponse.json({ success: true, id: targetId });
  } catch (err: unknown) {
    console.error('Failed to delete product:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
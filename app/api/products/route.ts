import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ujfxkybkhqdpdjigkqei.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_t9b4bZCrElb8trjHmfFdkQ_fjDWOi0l';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('Product')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching products for zyn-store:', error);
      return NextResponse.json(
        { success: false, error: error.message, products: [] },
        { status: 500 }
      );
    }

    const formattedProducts = (products || []).map((p: any) => {
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
  } catch (err: any) {
    console.error('Unexpected API error:', err);
    return NextResponse.json(
      { success: false, error: err.message, products: [] },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();

  if (!query) {
    return NextResponse.json({ success: false, error: 'Missing order search query' }, { status: 400 });
  }

  try {
    const cleanQuery = query.toLowerCase();

    const { data: orders, error } = await supabase
      .from('Order')
      .select(`
        *,
        items:OrderItem (
          *,
          product:Product (*)
        )
      `)
      .or(`id.eq.${query},email.eq.${cleanQuery}`)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Order tracking query error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error: any) {
    console.error('Order tracking server exception:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}
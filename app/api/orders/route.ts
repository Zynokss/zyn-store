import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from('Order')
      .select(`
        *,
        items:OrderItem (
          *,
          product:Product (*)
        )
      `)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Failed to fetch orders:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch order metrics' },
        { status: 500 }
      );
    }

    const orderList = orders || [];
    const totalRevenue = orderList.reduce((sum: number, order: any) => sum + (Number(order.total) || 0), 0);
    const totalOrders = orderList.length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
      },
      orders: orderList,
    });
  } catch (error: any) {
    console.error('Failed to fetch orders exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, address, city, state, zipCode, total, items } = body;
    const now = new Date().toISOString();
    const orderId = `ord_${Date.now()}`;

    // 1. Create main order record without updatedAt
    const { data: newOrder, error: orderError } = await supabase
      .from('Order')
      .insert([
        {
          id: orderId,
          email: email?.toLowerCase().trim(),
          firstName,
          lastName,
          address,
          city,
          state,
          zipCode,
          total: total || 0,
          status: 'COMPLETED',
          createdAt: now,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order record:', orderError);
      return NextResponse.json(
        { success: false, error: orderError.message },
        { status: 400 }
      );
    }

    // 2. Insert order items
    let createdItems: any[] = [];
    if (items && Array.isArray(items) && items.length > 0) {
      const orderItemsPayload = items.map((item: any) => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId: newOrder.id,
        productId: item.product?.id || item.productId,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        price: item.product?.price || item.price,
        createdAt: now,
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('OrderItem')
        .insert(orderItemsPayload)
        .select();

      if (itemsError) {
        console.error('Failed to insert order items:', itemsError);
      } else {
        createdItems = insertedItems || [];
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created and persisted successfully',
        order: {
          ...newOrder,
          items: createdItems,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create order exception:', error);
    return NextResponse.json(
      { success: false, error: 'Database order creation failed' },
      { status: 400 }
    );
  }
}
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formData, cart, total, activeUserId, saveAddressToProfile } = body;

    if (!formData?.email || !cart || cart.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required checkout details.' },
        { status: 400 }
      );
    }

    const cleanEmail = formData.email.toLowerCase().trim();
    const now = new Date().toISOString();
    const orderId = `ord_${Date.now()}`;

    // 1. Save/Update Profile Address if user is logged in
    if (activeUserId && saveAddressToProfile) {
      try {
        await supabase
          .from('User')
          .update({
            phone: formData.phone || null,
            address1: formData.address1 || null,
            address2: formData.address2 || null,
            city: formData.city || null,
            postalCode: formData.postalCode || null,
            updatedAt: now,
          })
          .eq('id', activeUserId);
      } catch (userErr) {
        console.error('Could not update user profile address:', userErr);
      }
    }

    // 2. Format full shipping address string
    const addressDetails = [
      formData.address1,
      formData.address2,
      `${formData.city || ''}, ${formData.postalCode || ''}`.trim(),
      `Tel: ${formData.phone || ''}`,
    ]
      .filter(Boolean)
      .join(' ');

    // 3. Create Order — including non-null `state` field
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .insert([
        {
          id: orderId,
          userId: activeUserId || null,
          email: cleanEmail,
          firstName: formData.firstName || cleanEmail.split('@')[0],
          lastName: formData.lastName || '',
          address: addressDetails,
          city: formData.city || '',
          state: formData.state || formData.region || formData.city || '', // Prevents NULL constraint violation
          zipCode: formData.postalCode || '',
          total: total || 0,
          status: 'PENDING_PAYMENT',
          createdAt: now,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Transfer Order Error:', orderError);
      return NextResponse.json(
        { success: false, error: orderError.message },
        { status: 500 }
      );
    }

    // 4. Create Order Items
    let createdItems: any[] = [];
    if (cart && Array.isArray(cart) && cart.length > 0) {
      const orderItemsPayload = cart.map((item: any) => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId: order.id,
        productId: item.product?.id || item.id,
        selectedSize: item.selectedSize || 'DEFAULT',
        quantity: item.quantity || 1,
        price: item.product?.price || item.price || 0,
        createdAt: now,
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('OrderItem')
        .insert(orderItemsPayload)
        .select();

      if (itemsError) {
        console.error('Transfer Order Items Error:', itemsError);
      } else {
        createdItems = insertedItems || [];
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: createdItems,
      },
    });
  } catch (err: any) {
    console.error('Transfer Order Server Exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
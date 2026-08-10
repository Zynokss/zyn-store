import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CartItem {
  id?: string;
  selectedSize?: string;
  quantity?: number;
  price?: number;
  product?: {
    id?: string;
    price?: number;
  };
}

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
    const orderId = `ord_${Date.now()}`;

    if (activeUserId && saveAddressToProfile) {
      try {
        await prisma.user.update({
          where: { id: activeUserId },
          data: {
            phone: formData.phone || null,
            address1: formData.address1 || null,
            address2: formData.address2 || null,
            city: formData.city || null,
            postalCode: formData.postalCode || null,
          },
        });
      } catch (userErr) {
        console.error('Could not update user profile address:', userErr);
      }
    }

    const addressDetails = [
      formData.address1,
      formData.address2,
      `${formData.city || ''}, ${formData.postalCode || ''}`.trim(),
      `Tel: ${formData.phone || ''}`,
    ]
      .filter(Boolean)
      .join(' ');

    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: activeUserId || null,
        email: cleanEmail,
        firstName: formData.firstName || cleanEmail.split('@')[0],
        lastName: formData.lastName || '',
        address: addressDetails,
        city: formData.city || '',
        state: formData.state || formData.region || formData.city || '',
        zipCode: formData.postalCode || '',
        total: total || 0,
        status: 'PENDING_PAYMENT',
        items: {
          create: cart.map((item: CartItem) => ({
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            productId: item.product?.id || item.id || '',
            selectedSize: item.selectedSize || 'DEFAULT',
            quantity: item.quantity || 1,
            price: item.product?.price || item.price || 0,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unexpected server error.';
    console.error('Transfer Order Server Exception:', err);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
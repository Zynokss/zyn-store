import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { 
      cart, 
      formData, 
      userId, 
      shippingCost = 35, 
      saveAddressToProfile 
    } = await request.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ success: false, error: 'Empty cart' }, { status: 400 });
    }

    if (!formData?.email || !formData?.firstName || !formData?.lastName || !formData?.address1 || !formData?.city || !formData?.phone) {
      return NextResponse.json({ success: false, error: 'Missing required shipping details' }, { status: 400 });
    }

    // Calculate subtotal + shipping (35 MAD)
    const subtotal = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const grandTotal = subtotal + Number(shippingCost);

    const orderId = `ZYN-${Date.now().toString().slice(-6)}`;
    let activeUserId = userId || null;

    // 1. Account Creation Logic (if user is guest and entered a password)
    if (!activeUserId && formData.password && formData.password.trim().length > 0) {
      const existingUser = await prisma.user.findUnique({
        where: { email: formData.email.toLowerCase().trim() },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(formData.password, 10);
        const newUser = await prisma.user.create({
          data: {
            email: formData.email.toLowerCase().trim(),
            name: `${formData.firstName} ${formData.lastName}`,
            password: hashedPassword,
            phone: formData.phone,
            address1: formData.address1,
            address2: formData.address2 || null,
            city: formData.city,
            postalCode: formData.postalCode || null,
          },
        });
        activeUserId = newUser.id;
      } else {
        activeUserId = existingUser.id;
      }
    }

    // 2. Save/Update Profile Address if authenticated
    if (activeUserId && saveAddressToProfile) {
      try {
        await prisma.user.update({
          where: { id: activeUserId },
          data: {
            phone: formData.phone,
            address1: formData.address1,
            address2: formData.address2 || null,
            city: formData.city,
            postalCode: formData.postalCode || null,
          },
        });
      } catch (err) {
        console.warn('Could not update user profile address:', err);
      }
    }

    // Format full address line
    const fullAddress = [
      formData.address1,
      formData.address2 ? `(${formData.address2})` : null,
      `Tel: ${formData.phone}`
    ].filter(Boolean).join(' ');

    // 3. Create Order with PENDING_PAYMENT status
    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: activeUserId,
        email: formData.email.toLowerCase().trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: fullAddress,
        city: formData.city,
        state: 'Morocco',
        zipCode: formData.postalCode || '00000',
        total: grandTotal,
        status: 'PENDING_PAYMENT',
        items: {
          create: cart.map((item: any) => ({
            productId: item.id,
            selectedSize: item.selectedSize || 'M',
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('Transfer Order Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
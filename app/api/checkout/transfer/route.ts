import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/adminAuth';
import { getBankTransferDetails } from '@/lib/payment';

const SHIPPING_COST = 35;
const FREE_SHIPPING_THRESHOLD = 500;

interface CartItem {
  id?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
  price?: number;
  product?: {
    id?: string;
    price?: number;
  };
}

type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formData, cart, saveAddressToProfile } = body;
    const paymentMethod: PaymentMethod = body.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'COD';

    if (!formData?.email || !cart || cart.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required checkout details.' },
        { status: 400 }
      );
    }

    // Bank transfer needs a real, operator-configured account to send funds to — never
    // fall back to a hardcoded account number baked into source. Fail loudly instead.
    const bankTransfer = paymentMethod === 'BANK_TRANSFER' ? getBankTransferDetails() : null;
    if (paymentMethod === 'BANK_TRANSFER' && !bankTransfer) {
      console.error('Bank transfer checkout attempted but CIH_BANK_NAME/CIH_ACCOUNT_HOLDER/CIH_RIB are not configured.');
      return NextResponse.json(
        { success: false, error: 'Bank transfer is not available right now. Please choose Cash on Delivery.' },
        { status: 503 }
      );
    }

    if (!formData.firstName || !formData.lastName || !formData.address1 || !formData.city || !formData.phone) {
      return NextResponse.json(
        { success: false, error: 'Please complete all required shipping fields.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(formData.email).toLowerCase().trim();
    const user = await verifyUserSession();
    let activeUserId = user?.id || body.activeUserId || null;

    if (!activeUserId) {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingUser) {
        activeUserId = existingUser.id;
      }
    }

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

    const productIds = cart
      .map((i: CartItem) => i.product?.id || i.id)
      .filter(Boolean);

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, inStock: true, name: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const outOfStock: string[] = [];
    const missingProducts: string[] = [];

    dbProducts.forEach((p) => {
      if (!p.inStock) outOfStock.push(p.name || p.id);
    });
    productIds.forEach((pid: string) => {
      if (!productMap.has(pid)) missingProducts.push(pid);
    });

    if (outOfStock.length > 0) {
      return NextResponse.json(
        { success: false, error: `Out of stock items: ${outOfStock.join(', ')}` },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const lineItems = cart.map((item: CartItem) => {
      const pid = item.product?.id || item.id || '';
      const product = productMap.get(pid);
      const verifiedPrice = product?.price || item.price || 0;
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const lineTotal = verifiedPrice * qty;
      subtotal += lineTotal;
      return {
        productId: pid,
        selectedSize: item.selectedSize || 'DEFAULT',
        selectedColor: item.selectedColor || null,
        quantity: qty,
        price: verifiedPrice,
      };
    });

    if (subtotal === 0) {
      return NextResponse.json(
        { success: false, error: 'Order subtotal could not be verified.' },
        { status: 400 }
      );
    }

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const verifiedGrandTotal = Number((subtotal + shipping).toFixed(2));

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
        userId: activeUserId || null,
        email: cleanEmail,
        firstName: String(formData.firstName).trim(),
        lastName: String(formData.lastName).trim(),
        address: addressDetails,
        city: String(formData.city || '').trim(),
        state: String(formData.state || formData.region || formData.city || '').trim(),
        zipCode: String(formData.postalCode || '').trim(),
        total: verifiedGrandTotal,
        status: 'PENDING_PAYMENT',
        paymentMethod,
        items: { create: lineItems },
      },
      include: { items: true },
    });

    const bankDetails = bankTransfer ? { ...bankTransfer, transferReason: order.id } : null;

    return NextResponse.json({
      success: true,
      order,
      paymentMethod,
      verifiedGrandTotal,
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      bankDetails,
    });
  } catch (err: unknown) {
    console.error('Transfer Order Server Exception:', err);
    return NextResponse.json(
      { success: false, error: 'Unable to process checkout. Please try again.' },
      { status: 500 }
    );
  }
}
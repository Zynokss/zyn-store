import { NextResponse } from 'next/server';
import { getBankTransferDetails } from '@/lib/payment';

export async function GET() {
  const bankTransfer = getBankTransferDetails();
  return NextResponse.json({
    success: true,
    bankTransferAvailable: Boolean(bankTransfer),
    bankTransfer,
  });
}

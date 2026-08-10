import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      await (prisma as unknown as { newsletter: { create: (data: unknown) => Promise<unknown> } }).newsletter.create({
        data: { email: cleanEmail },
      });
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code !== 'P2002') {
        console.error('Newsletter submission error:', error);
        return NextResponse.json(
          { success: false, error: 'Database error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully!',
    });
  } catch (err: unknown) {
    console.error('Newsletter error:', err);
    return NextResponse.json(
      { success: false, error: 'Unexpected error occurred.' },
      { status: 500 }
    );
  }
}
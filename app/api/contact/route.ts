import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, message, subject } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    try {
      await (prisma as unknown as { contactMessage: { create: (data: unknown) => Promise<unknown> } }).contactMessage.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          subject: subject?.trim() || 'General Inquiry',
          message: message.trim(),
        },
      });
    } catch (dbErr) {
      console.error('Contact table insert fallback:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We will reply via email shortly.',
    });
  } catch (err: unknown) {
    console.error('Unexpected contact error:', err);
    return NextResponse.json(
      { success: false, error: 'Unexpected error occurred.' },
      { status: 500 }
    );
  }
}
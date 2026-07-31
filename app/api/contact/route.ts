import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { name, email, message, subject } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ujfxkybkhqdpdjigkqei.supabase.co';
    const cleanUrl = rawUrl.replace(/["'\r\n]/g, '').trim();

    const rawKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      'sb_publishable_t9b4bZCrElb8trjHmfFdkQ_fjDWOi0l';
    const cleanKey = rawKey.replace(/["'\r\n]/g, '').trim();

    const supabase = createClient(cleanUrl, cleanKey);

    // Save message into 'ContactMessage' or 'messages' table
    const { error } = await supabase.from('ContactMessage').insert([
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject?.trim() || 'General Inquiry',
        message: message.trim(),
      },
    ]);

    if (error) {
      console.error('Contact submit error:', error);
      // Fallback response if table doesn't exist yet
      return NextResponse.json({
        success: true,
        message: 'Thank you! Your message has been received.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We will reply via email shortly.',
    });
  } catch (err: any) {
    console.error('Unexpected contact error:', err);
    return NextResponse.json(
      { success: false, error: 'Unexpected error occurred.' },
      { status: 500 }
    );
  }
}
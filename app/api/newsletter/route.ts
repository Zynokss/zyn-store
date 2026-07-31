import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
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

    // Insert into Newsletter table
    const { error } = await supabase.from('Newsletter').insert([{ email: email.toLowerCase().trim() }]);

    if (error && error.code !== '23505') { // Ignore unique constraint duplicate error code
      console.error('Newsletter submission error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully!',
    });
  } catch (err: any) {
    console.error('Newsletter error:', err);
    return NextResponse.json(
      { success: false, error: 'Unexpected error occurred.' },
      { status: 500 }
    );
  }
}
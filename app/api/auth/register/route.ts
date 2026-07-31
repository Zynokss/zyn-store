import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Sanitize Supabase environment variables
    const rawUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://ujfxkybkhqdpdjigkqei.supabase.co';
    let cleanUrl = rawUrl.replace(/["'\r\n]/g, '').trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const rawKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      'sb_publishable_t9b4bZCrElb8trjHmfFdkQ_fjDWOi0l';
    const cleanKey = rawKey.replace(/["'\r\n]/g, '').trim();

    const supabase = createClient(cleanUrl, cleanKey);

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const now = new Date().toISOString();

    // 4. Insert new user record with explicit timestamp fields
    const { data: newUser, error } = await supabase
      .from('User')
      .insert([
        {
          id: userId,
          name: name?.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          password: hashedPassword,
          role: 'USER',
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Registration Error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err: any) {
    console.error('Registration API unexpected error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
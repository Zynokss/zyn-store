import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Check user error:', checkError);
      return NextResponse.json(
        { success: false, error: 'Database check failed.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    // 3. Insert user into PostgreSQL public."User" table
    const { data: newUser, error: insertError } = await supabase
      .from('User')
      .insert([
        {
          id: `usr_${Date.now()}`,
          name: name?.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          password: hashedPassword,
          role: 'CUSTOMER',
          createdAt: now,
          updatedAt: now, // Satisfies PostgreSQL NOT NULL constraint
        },
      ])
      .select('id, name, email')
      .single();

    if (insertError) {
      console.error('Registration insert error:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (err: any) {
    console.error('Registration API exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
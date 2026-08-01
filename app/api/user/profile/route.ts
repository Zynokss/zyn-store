import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('id, name, email, phone, address1, address2, city, postalCode')
      .eq('email', session.user.email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, address1, address2, city, postalCode } = body;
    const now = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('User')
      .update({
        name,
        phone,
        address1,
        address2: address2 || null,
        city,
        postalCode: postalCode || null,
        updatedAt: now, // Updates timestamp on change
      })
      .eq('email', session.user.email.toLowerCase().trim())
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
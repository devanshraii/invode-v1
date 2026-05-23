import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!paymentId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch the payment, joining the campaign and creator data
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, amount, status, due_date, notes, created_at,
        campaigns ( name, budget, status, client_brand ),
        creators ( name, email, phone_number, social_handles, city, gst_status )
      `)
      .eq('id', paymentId)
      .eq('user_id', userId) // Security check
      .single();

    if (error) throw error;
    return NextResponse.json({ documentData: data }, { status: 200 });
  } catch (error: any) {
    console.error('Invoice API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
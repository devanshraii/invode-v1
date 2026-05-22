import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch the financial ledger for this specific brand
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, amount, status, due_date, notes, created_at,
        campaigns ( name ),
        creators ( name )
      `)
      .eq('user_id', userId)
      .order('due_date', { ascending: true }); // Show upcoming payments first

    if (error) throw error;
    return NextResponse.json({ payments: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Log a new pending payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, campaign_id, creator_id, amount, due_date, notes } = body;

    if (!user_id || !campaign_id || !creator_id || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        user_id,
        campaign_id,
        creator_id,
        amount: parseFloat(amount),
        due_date: due_date || null,
        notes: notes || '',
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ payment: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Mark a payment as Paid
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, user_id } = body;

    if (!id || !status || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user_id) // Security: Only update if it belongs to this brand
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ payment: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
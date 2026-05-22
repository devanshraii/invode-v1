import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: User ID required' }, { status: 401 });
    }

    // Fetch Campaigns to calculate total budget
    const { data: campaigns, error: campErr } = await supabase
      .from('campaigns')
      .select('id, name, budget, status')
      .eq('user_id', userId);
      
    // Fetch Payments to calculate cash flow
    const { data: payments, error: payErr } = await supabase
      .from('payments')
      .select('id, amount, status, campaign_id')
      .eq('user_id', userId);

    if (campErr || payErr) throw new Error('Failed to fetch report data');

    return NextResponse.json({ 
      campaigns: campaigns || [], 
      payments: payments || [] 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Reports Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
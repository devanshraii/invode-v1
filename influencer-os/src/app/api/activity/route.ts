import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// Fetch logs for a specific campaign
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const userId = searchParams.get('userId');

    if (!campaignId || !userId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Only load the 50 most recent actions

    if (error) throw error;
    return NextResponse.json({ logs: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Log a new action
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaign_id, user_id, action_type, details } = body;

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([{ campaign_id, user_id, action_type, details }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, log: data[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch all campaigns
export async function GET() {
  try {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ campaigns }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new campaign
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    }

    const { data: newCampaign, error } = await supabase
      .from('campaigns')
      .insert([
        {
          name: body.name,
          client_brand: body.client_brand || null,
          goals: body.goals || null,
          budget: body.budget ? parseFloat(body.budget) : null,
          platform: body.platform || null,
          start_date: body.start_date || null,
          end_date: body.end_date || null,
          status: body.status || 'Shortlisted',
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: newCampaign }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
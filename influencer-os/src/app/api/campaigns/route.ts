import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch all campaigns OR a single campaign if ID is provided
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If an ID is provided, fetch just that specific campaign
    if (id) {
      const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
      if (error) throw error;
      return NextResponse.json({ campaign: data }, { status: 200 });
    }

    // Otherwise, fetch all campaigns for the main dashboard
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
      .insert([{
          name: body.name,
          client_brand: body.client_brand || null,
          goals: body.goals || null,
          budget: body.budget ? parseFloat(body.budget) : null,
          platform: body.platform || null,
          start_date: body.start_date || null,
          end_date: body.end_date || null,
          status: body.status || 'Active', // Default to Active
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: newCampaign }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update Campaign Master Status
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Campaign ID and status are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: data }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
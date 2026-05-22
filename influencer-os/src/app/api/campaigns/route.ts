import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch campaigns (either a specific one by ID, or all for the user)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); 
    const id = searchParams.get('id'); // Check if we are asking for a specific campaign

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: User ID required' }, { status: 401 });
    }

    // If an ID is provided, fetch just that specific campaign SECURELY
    if (id) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId) // <-- Ensure this campaign belongs to this brand
        .single();
        
      if (error) throw error;
      return NextResponse.json({ campaign: data }, { status: 200 });
    }

    // Otherwise, fetch all campaigns for this brand
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId) 
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ campaigns }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Stamp new campaigns with the brand's ID
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, user_id, client_brand, budget, platform, start_date, end_date } = body;

    if (!name || !user_id) {
      return NextResponse.json({ error: 'Campaign name and User ID are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
          name,
          client_brand,
          budget: budget ? parseFloat(budget) : null,
          platform,
          start_date,
          end_date,
          status: 'Active',
          user_id: user_id, // <-- STAMP IT: Attach this campaign to the brand forever
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ campaign: data }, { status: 201 });
  } catch (error: any) {
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

// DELETE: Remove campaign
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 });

    // Note: Supabase ON DELETE CASCADE handles removing linked campaign_creators and approvals
    const { error } = await supabase.from('campaigns').delete().eq('id', id).eq('user_id', userId);
    
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
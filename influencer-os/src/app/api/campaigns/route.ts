import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch only campaigns belonging to the logged-in brand
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // The brand's ID

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: User ID required' }, { status: 401 });
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId) // <-- THE MAGIC FILTER: Only get this brand's stuff
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
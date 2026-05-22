import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch only the content approval queue for this brand
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('content_approvals')
      .select(`
        id,
        deliverable_type,
        asset_url,
        caption,
        status,
        created_at,
        campaign_creators (
          id,
          creators ( name, phone_number ),
          campaigns ( name )
        )
      `)
      .eq('user_id', userId) // <-- THE FILTER
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ approvals: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Submit a new deliverable securely
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaign_creator_id, deliverable_type, drive_link, caption, user_id } = body;

    if (!campaign_creator_id || !drive_link || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('content_approvals')
      .insert([{
        campaign_creator_id,
        deliverable_type: deliverable_type || 'Video Draft',
        asset_url: drive_link,
        caption: caption || '',
        status: 'Pending Review',
        user_id: user_id // <-- THE STAMP
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ record: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update the approval status securely
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, user_id } = body;

    if (!id || !status || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('content_approvals')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user_id) // <-- Security check: Only update if they own it
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ record: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
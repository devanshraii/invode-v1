import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch the content approval queue
// GET: Fetch the content approval queue
export async function GET() {
  try {
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
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ approvals: data }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Submit a new deliverable (using Google Drive link)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaign_creator_id, deliverable_type, drive_link, caption } = body;

    if (!campaign_creator_id || !drive_link) {
      return NextResponse.json({ error: 'Campaign Creator ID and Drive Link are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('content_approvals')
      .insert([
        {
          campaign_creator_id,
          deliverable_type: deliverable_type || 'Video Draft',
          asset_url: drive_link, // Storing the Google Drive link here
          caption: caption || '',
          status: 'Pending Review'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ record: data }, { status: 201 });
  } catch (error: any) {
    console.error('Submit Approval Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update the approval status
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Approval ID and new status are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('content_approvals')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ record: data }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating approval:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
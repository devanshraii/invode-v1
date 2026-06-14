import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch all creators linked to a specific campaign
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');

  if (!campaignId) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        status,
        agreed_fee,
        creators (
          id,
          name,
          niche_category,
          follower_count,
          pricing
        )
      `)
      .eq('campaign_id', campaignId);

    if (error) throw error;

    return NextResponse.json({ records: data }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add a creator to a campaign
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaign_id, creator_id } = body;

    if (!campaign_id || !creator_id) {
      return NextResponse.json({ error: 'Campaign ID and Creator ID are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('campaign_creators')
      .insert([{ campaign_id, creator_id, status: 'Shortlisted' }])
      .select(`
        *,
        creators (
          name,
          follower_count,
          niche_category
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Creator is already in this campaign' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ record: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error linking creator:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update the pipeline status of a creator in a campaign
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, views, likes, comments } = body;

    if (!id) return NextResponse.json({ error: 'Record ID required' }, { status: 400 });

    // Build dynamic update payload
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (views !== undefined) updates.views = Number(views);
    if (likes !== undefined) updates.likes = Number(likes);
    if (comments !== undefined) updates.comments = Number(comments);

    const { data, error } = await supabase
      .from('campaign_creators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ record: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Inside src/app/api/campaign-creators/route.ts

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Record ID required' }, { status: 400 });

    const { error } = await supabase
      .from('campaign_creators')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
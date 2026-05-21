import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

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
      .insert([
        { 
          campaign_id, 
          creator_id,
          status: 'Shortlisted' // Default starting point in the pipeline
        }
      ])
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
      // Handle the unique constraint error gracefully
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

// Add this GET function to your existing src/app/api/campaign-creators/route.ts file

// GET: Fetch all creators linked to a specific campaign
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');

  if (!campaignId) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
  }

  try {
    // We use Supabase's relation querying to fetch the junction table AND the creator details
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
          follower_count
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
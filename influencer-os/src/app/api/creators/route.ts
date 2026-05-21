import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch all creators for the dashboard
export async function GET() {
  try {
    // Using the standard client without strict cookie checks for rapid prototyping
    const { data: creators, error } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ creators }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching creators:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new creator in the CRM
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation for required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Creator name is required' }, { status: 400 });
    }

    // Insert the new creator directly into the database
    const { data: newCreator, error } = await supabase
      .from('creators')
      .insert([
        {
          name: body.name,
          social_handles: body.social_handles || null,
          niche_category: body.niche_category || null,
          phone_number: body.phone_number || null,
          email: body.email || null,
          city: body.city || null,
          language: body.language || null,
          follower_count: body.follower_count ? parseInt(body.follower_count) : null,
          engagement_rate: body.engagement_rate ? parseFloat(body.engagement_rate) : null,
          pricing: body.pricing ? parseFloat(body.pricing) : null,
          manager_details: body.manager_details || null,
          gst_status: body.gst_status || false,
          notes: body.notes || null,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ creator: newCreator }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating creator:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
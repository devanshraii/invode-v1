import { NextResponse } from 'next/server';
import { supabase } from '@/library/supabase';

// GET: Fetch all creators OR a single creator if ID is provided
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (id) {
      const { data, error } = await supabase.from('creators').select('*').eq('id', id).eq('user_id', userId).single();
      if (error) throw error;
      return NextResponse.json({ creator: data }, { status: 200 });
    }

    const { data: creators, error } = await supabase.from('creators').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ creators }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create new creator
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.user_id) return NextResponse.json({ error: 'Name and User ID required' }, { status: 400 });

    const { data, error } = await supabase.from('creators').insert([body]).select().single();
    if (error) throw error;
    return NextResponse.json({ creator: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update creator
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, user_id, ...updateData } = body;

    if (!id || !user_id) return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 });

    const { data, error } = await supabase.from('creators').update(updateData).eq('id', id).eq('user_id', user_id).select().single();
    if (error) throw error;
    return NextResponse.json({ creator: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove creator
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) return NextResponse.json({ error: 'ID and User ID required' }, { status: 400 });

    const { error } = await supabase.from('creators').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
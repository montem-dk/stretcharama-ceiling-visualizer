// app/api/colors/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Fetch all style rows, but only their color field
    const { data, error } = await supabaseServer
      .from('styles')
      .select('color');

    if (error) {
      console.error('Error fetching colors from styles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch colors' },
        { status: 500 }
      );
    }

    // Deduplicate and sort
    const colors = Array.from(new Set((data ?? []).map((row) => row.color))).sort();

    return NextResponse.json(colors);
  } catch (err) {
    console.error('Unexpected error in /api/colors:', err);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface PlayerInput {
  player_name: string;
  role: string;
  player_number: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamData, playersData } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase service environment variables are missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Insert Team Registration
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .insert([teamData])
      .select()
      .single();

    if (regError) {
      return NextResponse.json({ error: regError.message }, { status: 400 });
    }

    // 2. Insert Players linked to registration ID
    if (playersData && playersData.length > 0) {
      const playersToInsert = playersData.map((player: PlayerInput) => ({
        ...player,
        registration_id: regData.id,
      }));

      const { error: playersError } = await supabase
        .from('players')
        .insert(playersToInsert);

      if (playersError) {
        return NextResponse.json({ error: playersError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, data: regData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
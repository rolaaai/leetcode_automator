import { NextResponse } from 'next/server';
import { fetchDailyChallenge } from '@/lib/playwright/leetcode';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dailyChallenge = await fetchDailyChallenge();
    
    console.log('Daily Challenge:', `${dailyChallenge.questionNumber}. ${dailyChallenge.title}`);
    
    return NextResponse.json({ dailyChallenge });
  } catch (error) {
    console.error('Daily challenge API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch daily challenge' },
      { status: 500 }
    );
  }
}

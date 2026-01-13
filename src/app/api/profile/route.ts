import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LeetCodeStats } from '@/types';

// Extract username from LeetCode URL
function extractUsername(urlOrUsername: string): string | null {
  const trimmed = urlOrUsername.trim();
  
  // If it's a URL
  const urlMatch = trimmed.match(/leetcode\.com\/(?:u\/)?([^/\s?]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // If it's just a username (alphanumeric and underscores)
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }
  
  return null;
}

// Fetch LeetCode user stats from their public API
async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats> {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      allQuestionsCount {
        difficulty
        count
      }
    }
  `;

  const response = await fetch('https://leetcode.com/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': `https://leetcode.com/${username}/`,
      'Origin': 'https://leetcode.com',
    },
    body: JSON.stringify({
      query,
      variables: { username },
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.data?.matchedUser) {
    throw new Error('User not found on LeetCode');
  }

  const user = data.data.matchedUser;
  const allQuestions = data.data.allQuestionsCount;
  const submissions = user.submitStatsGlobal?.acSubmissionNum || [];

  // Parse solved counts
  const getSolved = (diff: string) => 
    submissions.find((s: { difficulty: string; count: number }) => s.difficulty === diff)?.count || 0;
  
  const getTotal = (diff: string) =>
    allQuestions.find((q: { difficulty: string; count: number }) => q.difficulty === diff)?.count || 0;

  const totalSolved = getSolved('All');
  const totalQuestions = getTotal('All');

  return {
    username: user.username,
    ranking: user.profile?.ranking || 0,
    totalSolved,
    easySolved: getSolved('Easy'),
    mediumSolved: getSolved('Medium'),
    hardSolved: getSolved('Hard'),
    totalQuestions,
    easyTotal: getTotal('Easy'),
    mediumTotal: getTotal('Medium'),
    hardTotal: getTotal('Hard'),
    acceptanceRate: totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0,
    contributionPoints: user.contributions?.points || 0,
    reputation: user.profile?.reputation || 0,
  };
}

// GET: Fetch user's saved LeetCode profile and stats
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get saved profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ connected: false });
    }

    // Fetch fresh stats
    try {
      const stats = await fetchLeetCodeStats(profile.leetcode_username);
      return NextResponse.json({ 
        connected: true, 
        profile, 
        stats 
      });
    } catch (error) {
      // Return profile without stats if fetch fails
      return NextResponse.json({ 
        connected: true, 
        profile,
        statsError: error instanceof Error ? error.message : 'Failed to fetch stats'
      });
    }
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Save LeetCode profile URL
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract username
    const username = extractUsername(url);
    if (!username) {
      return NextResponse.json({ error: 'Invalid LeetCode URL or username' }, { status: 400 });
    }

    // Verify the user exists on LeetCode
    let stats: LeetCodeStats;
    try {
      stats = await fetchLeetCodeStats(username);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to verify LeetCode user' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          leetcode_username: username,
          leetcode_url: `https://leetcode.com/u/${username}/`,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } else {
      // Insert new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          leetcode_username: username,
          leetcode_url: `https://leetcode.com/u/${username}/`,
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      username,
      stats 
    });
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

// DELETE: Remove LeetCode profile
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { smartSearch, scrapeLeetCodeQuestion } from '@/lib/playwright/leetcode';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { query, slug } = body;

    // If a specific slug is provided (from suggestion selection), fetch directly
    if (slug && typeof slug === 'string') {
      console.log(`User ${user.id} selected suggestion: ${slug}`);
      const question = await scrapeLeetCodeQuestion(slug);

      // Save to search history
      await saveToHistory(supabase, user.id, question);

      return NextResponse.json({ 
        question, 
        type: 'exact' 
      });
    }

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`User ${user.id} searching for: ${query}`);

    // Use smart search for intelligent matching
    const result = await smartSearch(query);

    if (result.type === 'error') {
      return NextResponse.json(
        { error: result.error, type: 'error' },
        { status: 404 }
      );
    }

    if (result.type === 'exact' && result.question) {
      // Save to search history
      await saveToHistory(supabase, user.id, result.question);

      return NextResponse.json({ 
        question: result.question, 
        type: 'exact' 
      });
    }

    // Return suggestions for partial matches
    return NextResponse.json({ 
      suggestions: result.suggestions, 
      type: 'suggestions' 
    });

  } catch (error) {
    console.error('LeetCode API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch question', type: 'error' },
      { status: 500 }
    );
  }
}

// Helper to save search to history
async function saveToHistory(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  userId: string, 
  question: { title: string; url: string; difficulty: string }
) {
  const { error: insertError } = await supabase
    .from('search_history')
    .insert({
      user_id: userId,
      question_title: question.title,
      question_url: question.url,
      difficulty: question.difficulty,
    });

  if (insertError) {
    console.error('Failed to save to history:', insertError);
  }
}

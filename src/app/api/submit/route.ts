import { NextRequest, NextResponse } from 'next/server';
import { submitCodeToLeetCode } from '@/lib/playwright/submit';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { problemSlug, code, language, sessionCookie, csrfToken } = body;

    if (!problemSlug || !code || !language || !sessionCookie) {
      return NextResponse.json(
        { error: 'Missing required fields: problemSlug, code, language, sessionCookie' },
        { status: 400 }
      );
    }

    console.log(`User ${user.id} submitting solution for: ${problemSlug}`);
    console.log(`Language: ${language}, Code length: ${code.length} chars`);

    // Submit code using Playwright
    const result = await submitCodeToLeetCode({
      problemSlug,
      code,
      language,
      sessionCookie,
      csrfToken,
      headless: false, // Visible browser for transparency
    });

    // Save submission to history (optional)
    const { error: insertError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        question_slug: problemSlug,
        code,
        language,
        status: result.status,
        runtime: result.runtime,
        memory: result.memory,
        test_cases_passed: result.testCasesPassed,
        total_test_cases: result.totalTestCases,
        error_message: result.errorMessage,
      });

    if (insertError) {
      console.error('Failed to save submission:', insertError.message);
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Submit API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Submission failed' },
      { status: 500 }
    );
  }
}

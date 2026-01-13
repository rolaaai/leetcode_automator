import type { LeetCodeQuestion, Example } from '@/types';

// Type for search results
export interface LeetCodeSearchResult {
  titleSlug: string;
  title: string;
  difficulty: string;
  frontendQuestionId: string;
}

interface LeetCodeGraphQLResponse {
  data: {
    question: {
      title: string;
      titleSlug: string;
      difficulty: string;
      content: string;
      exampleTestcases: string;
      hints: string[];
      questionFrontendId: string;
    } | null;
  };
}

interface LeetCodeSearchResponse {
  data: {
    problemsetQuestionList: {
      questions: Array<{
        title: string;
        titleSlug: string;
        difficulty: string;
        frontendQuestionId: string;
      }>;
    } | null;
  };
}

// Daily Challenge response type
interface DailyChallengeResponse {
  data: {
    activeDailyCodingChallengeQuestion: {
      date: string;
      link: string;
      question: {
        title: string;
        titleSlug: string;
        difficulty: string;
        questionFrontendId: string;
      };
    } | null;
  };
}

export interface DailyChallenge {
  date: string;
  questionNumber: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  url: string;
}

// Convert problem name/url to slug
function toSlug(input: string): string {
  let slug = input.trim();
  
  // If it's a full URL, extract the slug
  const urlMatch = slug.match(/leetcode\.com\/problems\/([^/]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // Convert problem name to slug
  return slug
    // Remove problem number prefix like "1." or "1266."
    .replace(/^\d+\.\s*/, '')
    // Convert to lowercase
    .toLowerCase()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove any characters that aren't alphanumeric or hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

// Check if input is a problem number
function isProblemNumber(input: string): boolean {
  return /^\d+$/.test(input.trim());
}

// Parse examples from HTML content
function parseExamples(content: string): Example[] {
  const examples: Example[] = [];
  
  // Remove HTML tags for parsing
  const textContent = content
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
  
  // Match example patterns
  const exampleRegex = /Example\s*\d*:\s*\n*Input:\s*(.+?)\n+Output:\s*(.+?)(?:\n+Explanation:\s*(.+?))?(?=\n+Example|\n+Constraints|\n*$)/gis;
  
  let match;
  while ((match = exampleRegex.exec(textContent)) !== null) {
    examples.push({
      input: match[1]?.trim() || '',
      output: match[2]?.trim() || '',
      explanation: match[3]?.trim(),
    });
  }
  
  return examples;
}

// Parse constraints from HTML content
function parseConstraints(content: string): string[] {
  const textContent = content
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  
  const constraintsMatch = textContent.match(/Constraints:\s*([\s\S]*?)$/i);
  if (!constraintsMatch) return [];
  
  return constraintsMatch[1]
    .split('\n')
    .map(c => c.trim())
    .filter(c => c.length > 0 && !c.startsWith('Example'));
}

// Extract description (before examples)
function parseDescription(content: string): string {
  const textContent = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  
  const exampleIndex = textContent.search(/Example\s*\d*:/i);
  if (exampleIndex > 0) {
    return textContent.substring(0, exampleIndex).trim();
  }
  return textContent;
}

// Search for problems matching a query (for autocomplete/suggestions)
export async function searchLeetCodeProblems(query: string, limit: number = 10): Promise<LeetCodeSearchResult[]> {
  // Use a simpler approach: fetch all problems and filter locally
  // This uses the problemsetQuestionList query with proper structure
  const searchQuery = `
    query problemsetQuestionList($categorySlug: String!, $skip: Int, $limit: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList(
        categorySlug: $categorySlug
        skip: $skip
        limit: $limit
        filters: $filters
      ) {
        total
        questions {
          title
          titleSlug
          difficulty
          frontendQuestionId
        }
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com/problemset/',
        'Origin': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query: searchQuery,
        variables: {
          categorySlug: "",
          skip: 0,
          limit: 3000,
          filters: {},
        },
      }),
    });

    if (!response.ok) {
      // If GraphQL fails, use a fallback approach
      console.log('GraphQL search failed, using fallback...');
      return fallbackSearch(query, limit);
    }

    const data = await response.json();
    
    if (!data.data?.problemsetQuestionList?.questions) {
      console.log('No questions in response, using fallback...');
      return fallbackSearch(query, limit);
    }

    const questions = data.data.problemsetQuestionList.questions;
    const queryLower = query.toLowerCase().trim();
    const queryNumber = isProblemNumber(query) ? query.trim() : null;

    // Filter and rank problems by relevance
    let results = questions
      .map((q: { title: string; titleSlug: string; frontendQuestionId: string; difficulty: string }) => ({
        ...q,
        score: calculateMatchScore(q, queryLower, queryNumber),
      }))
      .filter((q: { score: number }) => q.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, limit);

    return results.map(({ score, ...rest }: { score: number; title: string; titleSlug: string; frontendQuestionId: string; difficulty: string }) => rest);
  } catch (error) {
    console.error('Error searching LeetCode:', error);
    return fallbackSearch(query, limit);
  }
}

// Fallback search using a known list of popular problems
async function fallbackSearch(query: string, limit: number): Promise<LeetCodeSearchResult[]> {
  // A list of popular problems as fallback
  const popularProblems: LeetCodeSearchResult[] = [
    { frontendQuestionId: '1', title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy' },
    { frontendQuestionId: '2', title: 'Add Two Numbers', titleSlug: 'add-two-numbers', difficulty: 'Medium' },
    { frontendQuestionId: '3', title: 'Longest Substring Without Repeating Characters', titleSlug: 'longest-substring-without-repeating-characters', difficulty: 'Medium' },
    { frontendQuestionId: '4', title: 'Median of Two Sorted Arrays', titleSlug: 'median-of-two-sorted-arrays', difficulty: 'Hard' },
    { frontendQuestionId: '5', title: 'Longest Palindromic Substring', titleSlug: 'longest-palindromic-substring', difficulty: 'Medium' },
    { frontendQuestionId: '6', title: 'Zigzag Conversion', titleSlug: 'zigzag-conversion', difficulty: 'Medium' },
    { frontendQuestionId: '7', title: 'Reverse Integer', titleSlug: 'reverse-integer', difficulty: 'Medium' },
    { frontendQuestionId: '8', title: 'String to Integer (atoi)', titleSlug: 'string-to-integer-atoi', difficulty: 'Medium' },
    { frontendQuestionId: '9', title: 'Palindrome Number', titleSlug: 'palindrome-number', difficulty: 'Easy' },
    { frontendQuestionId: '10', title: 'Regular Expression Matching', titleSlug: 'regular-expression-matching', difficulty: 'Hard' },
    { frontendQuestionId: '11', title: 'Container With Most Water', titleSlug: 'container-with-most-water', difficulty: 'Medium' },
    { frontendQuestionId: '12', title: 'Integer to Roman', titleSlug: 'integer-to-roman', difficulty: 'Medium' },
    { frontendQuestionId: '13', title: 'Roman to Integer', titleSlug: 'roman-to-integer', difficulty: 'Easy' },
    { frontendQuestionId: '14', title: 'Longest Common Prefix', titleSlug: 'longest-common-prefix', difficulty: 'Easy' },
    { frontendQuestionId: '15', title: '3Sum', titleSlug: '3sum', difficulty: 'Medium' },
    { frontendQuestionId: '20', title: 'Valid Parentheses', titleSlug: 'valid-parentheses', difficulty: 'Easy' },
    { frontendQuestionId: '21', title: 'Merge Two Sorted Lists', titleSlug: 'merge-two-sorted-lists', difficulty: 'Easy' },
    { frontendQuestionId: '22', title: 'Generate Parentheses', titleSlug: 'generate-parentheses', difficulty: 'Medium' },
    { frontendQuestionId: '23', title: 'Merge k Sorted Lists', titleSlug: 'merge-k-sorted-lists', difficulty: 'Hard' },
    { frontendQuestionId: '26', title: 'Remove Duplicates from Sorted Array', titleSlug: 'remove-duplicates-from-sorted-array', difficulty: 'Easy' },
    { frontendQuestionId: '33', title: 'Search in Rotated Sorted Array', titleSlug: 'search-in-rotated-sorted-array', difficulty: 'Medium' },
    { frontendQuestionId: '42', title: 'Trapping Rain Water', titleSlug: 'trapping-rain-water', difficulty: 'Hard' },
    { frontendQuestionId: '49', title: 'Group Anagrams', titleSlug: 'group-anagrams', difficulty: 'Medium' },
    { frontendQuestionId: '53', title: 'Maximum Subarray', titleSlug: 'maximum-subarray', difficulty: 'Medium' },
    { frontendQuestionId: '55', title: 'Jump Game', titleSlug: 'jump-game', difficulty: 'Medium' },
    { frontendQuestionId: '56', title: 'Merge Intervals', titleSlug: 'merge-intervals', difficulty: 'Medium' },
    { frontendQuestionId: '70', title: 'Climbing Stairs', titleSlug: 'climbing-stairs', difficulty: 'Easy' },
    { frontendQuestionId: '72', title: 'Edit Distance', titleSlug: 'edit-distance', difficulty: 'Medium' },
    { frontendQuestionId: '76', title: 'Minimum Window Substring', titleSlug: 'minimum-window-substring', difficulty: 'Hard' },
    { frontendQuestionId: '78', title: 'Subsets', titleSlug: 'subsets', difficulty: 'Medium' },
    { frontendQuestionId: '79', title: 'Word Search', titleSlug: 'word-search', difficulty: 'Medium' },
    { frontendQuestionId: '94', title: 'Binary Tree Inorder Traversal', titleSlug: 'binary-tree-inorder-traversal', difficulty: 'Easy' },
    { frontendQuestionId: '98', title: 'Validate Binary Search Tree', titleSlug: 'validate-binary-search-tree', difficulty: 'Medium' },
    { frontendQuestionId: '100', title: 'Same Tree', titleSlug: 'same-tree', difficulty: 'Easy' },
    { frontendQuestionId: '101', title: 'Symmetric Tree', titleSlug: 'symmetric-tree', difficulty: 'Easy' },
    { frontendQuestionId: '102', title: 'Binary Tree Level Order Traversal', titleSlug: 'binary-tree-level-order-traversal', difficulty: 'Medium' },
    { frontendQuestionId: '104', title: 'Maximum Depth of Binary Tree', titleSlug: 'maximum-depth-of-binary-tree', difficulty: 'Easy' },
    { frontendQuestionId: '121', title: 'Best Time to Buy and Sell Stock', titleSlug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy' },
    { frontendQuestionId: '124', title: 'Binary Tree Maximum Path Sum', titleSlug: 'binary-tree-maximum-path-sum', difficulty: 'Hard' },
    { frontendQuestionId: '128', title: 'Longest Consecutive Sequence', titleSlug: 'longest-consecutive-sequence', difficulty: 'Medium' },
    { frontendQuestionId: '136', title: 'Single Number', titleSlug: 'single-number', difficulty: 'Easy' },
    { frontendQuestionId: '139', title: 'Word Break', titleSlug: 'word-break', difficulty: 'Medium' },
    { frontendQuestionId: '141', title: 'Linked List Cycle', titleSlug: 'linked-list-cycle', difficulty: 'Easy' },
    { frontendQuestionId: '146', title: 'LRU Cache', titleSlug: 'lru-cache', difficulty: 'Medium' },
    { frontendQuestionId: '152', title: 'Maximum Product Subarray', titleSlug: 'maximum-product-subarray', difficulty: 'Medium' },
    { frontendQuestionId: '153', title: 'Find Minimum in Rotated Sorted Array', titleSlug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium' },
    { frontendQuestionId: '155', title: 'Min Stack', titleSlug: 'min-stack', difficulty: 'Medium' },
    { frontendQuestionId: '160', title: 'Intersection of Two Linked Lists', titleSlug: 'intersection-of-two-linked-lists', difficulty: 'Easy' },
    { frontendQuestionId: '169', title: 'Majority Element', titleSlug: 'majority-element', difficulty: 'Easy' },
    { frontendQuestionId: '198', title: 'House Robber', titleSlug: 'house-robber', difficulty: 'Medium' },
    { frontendQuestionId: '200', title: 'Number of Islands', titleSlug: 'number-of-islands', difficulty: 'Medium' },
    { frontendQuestionId: '206', title: 'Reverse Linked List', titleSlug: 'reverse-linked-list', difficulty: 'Easy' },
    { frontendQuestionId: '207', title: 'Course Schedule', titleSlug: 'course-schedule', difficulty: 'Medium' },
    { frontendQuestionId: '208', title: 'Implement Trie (Prefix Tree)', titleSlug: 'implement-trie-prefix-tree', difficulty: 'Medium' },
    { frontendQuestionId: '215', title: 'Kth Largest Element in an Array', titleSlug: 'kth-largest-element-in-an-array', difficulty: 'Medium' },
    { frontendQuestionId: '226', title: 'Invert Binary Tree', titleSlug: 'invert-binary-tree', difficulty: 'Easy' },
    { frontendQuestionId: '230', title: 'Kth Smallest Element in a BST', titleSlug: 'kth-smallest-element-in-a-bst', difficulty: 'Medium' },
    { frontendQuestionId: '234', title: 'Palindrome Linked List', titleSlug: 'palindrome-linked-list', difficulty: 'Easy' },
    { frontendQuestionId: '236', title: 'Lowest Common Ancestor of a Binary Tree', titleSlug: 'lowest-common-ancestor-of-a-binary-tree', difficulty: 'Medium' },
    { frontendQuestionId: '238', title: 'Product of Array Except Self', titleSlug: 'product-of-array-except-self', difficulty: 'Medium' },
    { frontendQuestionId: '239', title: 'Sliding Window Maximum', titleSlug: 'sliding-window-maximum', difficulty: 'Hard' },
    { frontendQuestionId: '240', title: 'Search a 2D Matrix II', titleSlug: 'search-a-2d-matrix-ii', difficulty: 'Medium' },
    { frontendQuestionId: '283', title: 'Move Zeroes', titleSlug: 'move-zeroes', difficulty: 'Easy' },
    { frontendQuestionId: '287', title: 'Find the Duplicate Number', titleSlug: 'find-the-duplicate-number', difficulty: 'Medium' },
    { frontendQuestionId: '295', title: 'Find Median from Data Stream', titleSlug: 'find-median-from-data-stream', difficulty: 'Hard' },
    { frontendQuestionId: '297', title: 'Serialize and Deserialize Binary Tree', titleSlug: 'serialize-and-deserialize-binary-tree', difficulty: 'Hard' },
    { frontendQuestionId: '300', title: 'Longest Increasing Subsequence', titleSlug: 'longest-increasing-subsequence', difficulty: 'Medium' },
    { frontendQuestionId: '322', title: 'Coin Change', titleSlug: 'coin-change', difficulty: 'Medium' },
    { frontendQuestionId: '347', title: 'Top K Frequent Elements', titleSlug: 'top-k-frequent-elements', difficulty: 'Medium' },
    { frontendQuestionId: '394', title: 'Decode String', titleSlug: 'decode-string', difficulty: 'Medium' },
    { frontendQuestionId: '416', title: 'Partition Equal Subset Sum', titleSlug: 'partition-equal-subset-sum', difficulty: 'Medium' },
    { frontendQuestionId: '437', title: 'Path Sum III', titleSlug: 'path-sum-iii', difficulty: 'Medium' },
    { frontendQuestionId: '438', title: 'Find All Anagrams in a String', titleSlug: 'find-all-anagrams-in-a-string', difficulty: 'Medium' },
    { frontendQuestionId: '543', title: 'Diameter of Binary Tree', titleSlug: 'diameter-of-binary-tree', difficulty: 'Easy' },
    { frontendQuestionId: '560', title: 'Subarray Sum Equals K', titleSlug: 'subarray-sum-equals-k', difficulty: 'Medium' },
    { frontendQuestionId: '617', title: 'Merge Two Binary Trees', titleSlug: 'merge-two-binary-trees', difficulty: 'Easy' },
    { frontendQuestionId: '739', title: 'Daily Temperatures', titleSlug: 'daily-temperatures', difficulty: 'Medium' },
    { frontendQuestionId: '763', title: 'Partition Labels', titleSlug: 'partition-labels', difficulty: 'Medium' },
  ];
  
  const queryLower = query.toLowerCase().trim();
  const queryNumber = isProblemNumber(query) ? query.trim() : null;
  
  return popularProblems
    .map(q => ({
      ...q,
      score: calculateMatchScore(q, queryLower, queryNumber),
    }))
    .filter(q => q.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...rest }) => rest);
}

// Calculate match score for ranking search results
function calculateMatchScore(
  problem: { title: string; titleSlug: string; frontendQuestionId: string },
  queryLower: string,
  queryNumber: string | null
): number {
  let score = 0;
  const titleLower = problem.title.toLowerCase();
  const slugLower = problem.titleSlug.toLowerCase();

  // Exact number match (highest priority)
  if (queryNumber && problem.frontendQuestionId === queryNumber) {
    return 1000;
  }

  // Exact title match
  if (titleLower === queryLower) {
    return 900;
  }

  // Exact slug match
  if (slugLower === queryLower || slugLower === queryLower.replace(/\s+/g, '-')) {
    return 850;
  }

  // Title starts with query
  if (titleLower.startsWith(queryLower)) {
    score += 100;
  }

  // Title contains query
  if (titleLower.includes(queryLower)) {
    score += 50;
  }

  // Slug contains query
  if (slugLower.includes(queryLower.replace(/\s+/g, '-'))) {
    score += 30;
  }

  // Word-level matching
  const queryWords = queryLower.split(/\s+/);
  const titleWords = titleLower.split(/\s+/);
  
  for (const qWord of queryWords) {
    if (qWord.length < 2) continue;
    for (const tWord of titleWords) {
      if (tWord.startsWith(qWord)) {
        score += 20;
      } else if (tWord.includes(qWord)) {
        score += 10;
      }
    }
  }

  return score;
}

// Get question by problem number
export async function getQuestionByNumber(num: string): Promise<LeetCodeQuestion | null> {
  const results = await searchLeetCodeProblems(num, 1);
  if (results.length === 0 || results[0].frontendQuestionId !== num) {
    return null;
  }
  return scrapeLeetCodeQuestion(results[0].titleSlug);
}

// Main function to fetch a LeetCode question
export async function scrapeLeetCodeQuestion(urlOrSlug: string): Promise<LeetCodeQuestion> {
  const slug = toSlug(urlOrSlug);
  console.log(`Fetching question: ${slug}`);

  const query = `
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        titleSlug
        difficulty
        content
        exampleTestcases
        hints
        questionFrontendId
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': `https://leetcode.com/problems/${slug}/`,
        'Origin': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug: slug },
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode API returned ${response.status}`);
    }

    const data: LeetCodeGraphQLResponse = await response.json();
    
    if (!data.data.question) {
      throw new Error(`Question not found: ${slug}`);
    }

    const q = data.data.question;
    const url = `https://leetcode.com/problems/${q.titleSlug}/`;

    const question: LeetCodeQuestion = {
      title: `${q.questionFrontendId}. ${q.title}`,
      difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard',
      description: parseDescription(q.content),
      examples: parseExamples(q.content),
      constraints: parseConstraints(q.content),
      url,
    };

    console.log('Fetched question:', question.title, '-', question.difficulty);
    return question;

  } catch (error) {
    console.error('Error fetching from LeetCode:', error);
    throw new Error(`Failed to fetch LeetCode question: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Smart search: try exact match first, then return suggestions
export async function smartSearch(query: string): Promise<{
  question?: LeetCodeQuestion;
  suggestions?: LeetCodeSearchResult[];
  type: 'exact' | 'suggestions' | 'error';
  error?: string;
}> {
  const trimmedQuery = query.trim();
  
  // If it's a number, search by problem number
  if (isProblemNumber(trimmedQuery)) {
    console.log(`Searching by number: ${trimmedQuery}`);
    
    // Use search API to find problem by number
    const suggestions = await searchLeetCodeProblems(trimmedQuery, 10);
    
    // Find exact number match
    const exactMatch = suggestions.find(s => s.frontendQuestionId === trimmedQuery);
    
    if (exactMatch) {
      try {
        const question = await scrapeLeetCodeQuestion(exactMatch.titleSlug);
        return { question, type: 'exact' };
      } catch (error) {
        console.error('Error fetching question by number:', error);
      }
    }
    
    // No exact number match, show suggestions or error
    if (suggestions.length > 0) {
      return { suggestions, type: 'suggestions' };
    }
    
    return { type: 'error', error: `No question found with number ${trimmedQuery}` };
  }

  // If it looks like a URL, try to fetch directly
  if (trimmedQuery.includes('leetcode.com/problems/')) {
    try {
      const question = await scrapeLeetCodeQuestion(trimmedQuery);
      return { question, type: 'exact' };
    } catch (error) {
      return { 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Failed to fetch question'
      };
    }
  }

  // Try exact slug match first
  const slug = toSlug(trimmedQuery);
  if (slug.length >= 2) {
    try {
      const question = await scrapeLeetCodeQuestion(slug);
      return { question, type: 'exact' };
    } catch {
      // Not an exact match, continue to search for suggestions
    }
  }

  // No exact match, return suggestions
  console.log(`No exact match, searching for suggestions: ${trimmedQuery}`);
  const suggestions = await searchLeetCodeProblems(trimmedQuery, 8);
  
  if (suggestions.length === 0) {
    return { type: 'error', error: 'No matching problems found' };
  }

  // If there's only one suggestion with high confidence, return it directly
  if (suggestions.length === 1) {
    try {
      const question = await scrapeLeetCodeQuestion(suggestions[0].titleSlug);
      return { question, type: 'exact' };
    } catch (error) {
      return { suggestions, type: 'suggestions' };
    }
  }

  return { suggestions, type: 'suggestions' };
}

// Fetch today's daily challenge
export async function fetchDailyChallenge(): Promise<DailyChallenge> {
  const query = `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        link
        question {
          title
          titleSlug
          difficulty
          questionFrontendId
        }
      }
    }
  `;

  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      body: JSON.stringify({ 
        query,
        operationName: 'questionOfToday'
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Daily challenge API status:', response.status);
      throw new Error(`LeetCode API error: ${response.status}`);
    }

    const data: DailyChallengeResponse = await response.json();
    
    if (!data.data?.activeDailyCodingChallengeQuestion) {
      console.error('Daily challenge response:', JSON.stringify(data));
      throw new Error('Daily challenge not available');
    }

    const challenge = data.data.activeDailyCodingChallengeQuestion;
    
    return {
      date: challenge.date,
      questionNumber: challenge.question.questionFrontendId,
      title: challenge.question.title,
      titleSlug: challenge.question.titleSlug,
      difficulty: challenge.question.difficulty,
      url: `https://leetcode.com${challenge.link}`,
    };
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    
    // If fetch fails, return a fallback daily challenge based on current date
    // This is a workaround when LeetCode API is blocked
    const today = new Date().toISOString().split('T')[0];
    console.log('Using fallback for daily challenge, date:', today);
    
    // Return a popular problem as fallback
    return {
      date: today,
      questionNumber: '1',
      title: 'Two Sum (Daily Challenge Unavailable)',
      titleSlug: 'two-sum',
      difficulty: 'Easy',
      url: 'https://leetcode.com/problems/two-sum/',
    };
  }
}

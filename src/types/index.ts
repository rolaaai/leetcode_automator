// TypeScript types for the application

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  question_title: string;
  question_url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  searched_at: string;
}

export interface LeetCodeQuestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Example[];
  constraints: string[];
  url: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'Free' | 'Premium';
  price: number;
  features: string[];
}

export interface LeetCodeSearchResult {
  titleSlug: string;
  title: string;
  difficulty: string;
  frontendQuestionId: string;
}

export interface LeetCodeProfile {
  id?: string;
  user_id: string;
  leetcode_username: string;
  leetcode_url: string;
  created_at?: string;
}

export interface LeetCodeStats {
  username: string;
  ranking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalQuestions: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
  acceptanceRate: number;
  contributionPoints: number;
  reputation: number;
}

export type SidebarSection = 'leetcode' | 'search' | 'history' | 'subscription';

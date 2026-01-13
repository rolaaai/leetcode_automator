'use client';

import { useState } from 'react';
import SearchInput from '@/components/search/SearchInput';
import QuestionDisplay from '@/components/search/QuestionDisplay';
import SuggestionsList from '@/components/search/SuggestionsList';
import type { LeetCodeQuestion, LeetCodeSearchResult } from '@/types';

export default function DashboardPage() {
    const [question, setQuestion] = useState<LeetCodeQuestion | null>(null);
    const [suggestions, setSuggestions] = useState<LeetCodeSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [dailyLoading, setDailyLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSearch = async (query: string) => {
        setLoading(true);
        setError(null);
        setQuestion(null);
        setSuggestions([]);
        setShowSuggestions(false);

        try {
            const response = await fetch('/api/leetcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();

            if (data.type === 'exact' && data.question) {
                setQuestion(data.question);
                console.log('LeetCode Question:', data.question);
            } else if (data.type === 'suggestions' && data.suggestions) {
                setSuggestions(data.suggestions);
                setShowSuggestions(true);
            } else if (data.type === 'error' || !response.ok) {
                throw new Error(data.error || 'Failed to fetch question');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSuggestion = async (slug: string) => {
        setLoading(true);
        setError(null);
        setSuggestions([]);
        setShowSuggestions(false);

        try {
            const response = await fetch('/api/leetcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ slug }),
            });

            const data = await response.json();

            if (data.question) {
                setQuestion(data.question);
                console.log('LeetCode Question:', data.question);
            } else {
                throw new Error(data.error || 'Failed to fetch question');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching suggestion:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDailyChallenge = async () => {
        setDailyLoading(true);
        setError(null);
        setQuestion(null);
        setSuggestions([]);
        setShowSuggestions(false);

        try {
            // First, fetch the daily challenge info
            const dailyResponse = await fetch('/api/daily');
            const dailyData = await dailyResponse.json();

            if (!dailyResponse.ok || !dailyData.dailyChallenge) {
                throw new Error(dailyData.error || 'Failed to fetch daily challenge');
            }

            const daily = dailyData.dailyChallenge;
            console.log('Daily Challenge:', `${daily.questionNumber}. ${daily.title}`);

            // Now fetch the full question details
            const response = await fetch('/api/leetcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ slug: daily.titleSlug }),
            });

            const data = await response.json();

            if (data.question) {
                setQuestion(data.question);
                console.log('LeetCode Question:', data.question);
            } else {
                throw new Error(data.error || 'Failed to fetch question');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Daily challenge error:', err);
        } finally {
            setDailyLoading(false);
        }
    };

    const hasResults = question || showSuggestions || loading || dailyLoading;

    return (
        <div className="h-full flex flex-col">
            {/* Welcome section - show when no results */}
            {!hasResults && (
                <div className="flex-1 flex flex-col items-center justify-center -mt-16">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Search LeetCode</span>
                            <br />
                            <span className="text-foreground">Questions</span>
                        </h1>
                        <p className="text-lg text-foreground-secondary max-w-lg mx-auto">
                            Search by <span className="text-accent-primary">number</span>, <span className="text-accent-primary">name</span>, or <span className="text-accent-primary">URL</span>
                        </p>
                    </div>

                    <SearchInput
                        onSearch={handleSearch}
                        onDailyChallenge={handleDailyChallenge}
                        loading={loading}
                        dailyLoading={dailyLoading}
                    />

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 max-w-lg text-center">
                            {error}
                        </div>
                    )}

                    {/* Quick examples */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-foreground-secondary mb-4">Try these examples:</p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                            {[
                                { label: '#1', value: '1' },
                                { label: 'two sum', value: 'two sum' },
                                { label: 'binary', value: 'binary' },
                                { label: 'linked list', value: 'linked list' },
                            ].map((example) => (
                                <button
                                    key={example.value}
                                    onClick={() => handleSearch(example.value)}
                                    disabled={loading || dailyLoading}
                                    className="px-4 py-2 text-sm bg-background-secondary border border-border rounded-lg text-foreground-secondary hover:text-foreground hover:border-accent-primary/50 transition-colors disabled:opacity-50"
                                >
                                    {example.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Results section */}
            {hasResults && (
                <div className="space-y-6">
                    {/* Sticky search bar */}
                    <div className="sticky top-0 bg-background z-10 pb-4">
                        <SearchInput
                            onSearch={handleSearch}
                            onDailyChallenge={handleDailyChallenge}
                            loading={loading}
                            dailyLoading={dailyLoading}
                        />
                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 max-w-3xl mx-auto text-center">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Suggestions */}
                    {showSuggestions && (
                        <SuggestionsList
                            suggestions={suggestions}
                            onSelect={handleSelectSuggestion}
                            loading={loading}
                        />
                    )}

                    {/* Question display */}
                    {question && <QuestionDisplay question={question} loading={loading} />}

                    {/* Loading state when no question yet */}
                    {(loading || dailyLoading) && !question && !showSuggestions && (
                        <QuestionDisplay question={null} loading={true} />
                    )}
                </div>
            )}
        </div>
    );
}

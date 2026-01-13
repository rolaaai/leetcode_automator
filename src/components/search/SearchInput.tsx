'use client';

import { useState, FormEvent } from 'react';
import Button from '@/components/ui/Button';

interface SearchInputProps {
    onSearch: (query: string) => Promise<void>;
    onDailyChallenge?: () => Promise<void>;
    loading?: boolean;
    dailyLoading?: boolean;
}

export default function SearchInput({
    onSearch,
    onDailyChallenge,
    loading = false,
    dailyLoading = false
}: SearchInputProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim() || loading) return;
        await onSearch(query.trim());
    };

    const placeholders = [
        'Enter LeetCode problem URL or name...',
        'e.g., https://leetcode.com/problems/two-sum/',
        'e.g., two-sum',
        'e.g., reverse-linked-list',
    ];

    return (
        <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl opacity-20 blur-lg group-focus-within:opacity-40 transition-opacity duration-300" />

                    {/* Input container */}
                    <div className="relative bg-background-secondary border border-border rounded-2xl overflow-hidden focus-within:border-accent-primary/50 transition-colors">
                        <div className="flex items-center">
                            {/* Search icon */}
                            <div className="pl-5 text-foreground-secondary">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Input field */}
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={placeholders[0]}
                                disabled={loading || dailyLoading}
                                className="flex-1 bg-transparent px-4 py-5 text-lg text-foreground placeholder:text-foreground-secondary focus:outline-none disabled:opacity-50"
                            />

                            {/* Submit button */}
                            <div className="pr-3">
                                <Button
                                    type="submit"
                                    disabled={!query.trim() || loading || dailyLoading}
                                    loading={loading}
                                    size="lg"
                                    className="!rounded-xl"
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Helper text */}
                <p className="mt-4 text-center text-sm text-foreground-secondary">
                    Paste a LeetCode problem URL or enter the problem slug (e.g., <code className="text-accent-primary">two-sum</code>)
                </p>
            </form>

            {/* Daily Challenge Button */}
            {onDailyChallenge && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={onDailyChallenge}
                        disabled={loading || dailyLoading}
                        className={`
                            flex items-center gap-3 px-6 py-3 rounded-xl
                            bg-gradient-to-r from-orange-500/10 to-yellow-500/10
                            border border-orange-500/30 hover:border-orange-500/50
                            text-orange-400 hover:text-orange-300
                            transition-all duration-200 hover:scale-[1.02]
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                        `}
                    >
                        {dailyLoading ? (
                            <>
                                <div className="animate-spin w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full" />
                                <span>Loading Daily Challenge...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">Today&apos;s Daily Challenge</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

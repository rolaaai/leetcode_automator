'use client';

import Card from '@/components/ui/Card';
import type { LeetCodeSearchResult } from '@/types';

interface SuggestionsListProps {
    suggestions: LeetCodeSearchResult[];
    onSelect: (slug: string) => void;
    loading?: boolean;
}

export default function SuggestionsList({ suggestions, onSelect, loading = false }: SuggestionsListProps) {
    const difficultyColors = {
        Easy: 'text-green-400 bg-green-400/10 border-green-400/30',
        Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
        Hard: 'text-red-400 bg-red-400/10 border-red-400/30',
    };

    if (loading) {
        return (
            <div className="w-full max-w-3xl mx-auto space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-5 w-3/4 rounded" />
                                <div className="skeleton h-4 w-1/4 rounded" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="mb-4 text-center">
                <p className="text-foreground-secondary text-sm">
                    No exact match found. Did you mean one of these?
                </p>
            </div>

            <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={suggestion.titleSlug}
                        onClick={() => onSelect(suggestion.titleSlug)}
                        className="w-full text-left animate-fade-in group"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <Card hover className="transition-all duration-200 group-hover:border-accent-primary/50">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-foreground-secondary text-sm font-mono">
                                            #{suggestion.frontendQuestionId}
                                        </span>
                                        <h3 className="text-foreground font-medium truncate group-hover:text-accent-primary transition-colors">
                                            {suggestion.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`
                    px-2.5 py-1 rounded-full text-xs font-medium border
                    ${difficultyColors[suggestion.difficulty as keyof typeof difficultyColors] || difficultyColors.Medium}
                  `}>
                                        {suggestion.difficulty}
                                    </span>

                                    <svg
                                        className="w-5 h-5 text-foreground-secondary group-hover:text-accent-primary transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                    </button>
                ))}
            </div>
        </div>
    );
}

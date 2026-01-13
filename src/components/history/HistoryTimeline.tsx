'use client';

import Card from '@/components/ui/Card';
import type { SearchHistory } from '@/types';

interface HistoryTimelineProps {
    history: SearchHistory[];
    loading?: boolean;
}

export default function HistoryTimeline({ history, loading = false }: HistoryTimelineProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-fade-in">
                        <div className="flex items-center gap-4">
                            <div className="skeleton w-3 h-3 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-5 w-2/3 rounded" />
                                <div className="skeleton h-4 w-1/4 rounded" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <Card className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background flex items-center justify-center">
                    <svg className="w-8 h-8 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No search history yet</h3>
                <p className="text-foreground-secondary">
                    Your searched LeetCode questions will appear here
                </p>
            </Card>
        );
    }

    const difficultyColors = {
        Easy: 'text-green-400 bg-green-400',
        Medium: 'text-yellow-400 bg-yellow-400',
        Hard: 'text-red-400 bg-red-400',
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    // Group history by date
    const groupedHistory = history.reduce((groups, item) => {
        const date = new Date(item.searched_at).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(item);
        return groups;
    }, {} as Record<string, SearchHistory[]>);

    return (
        <div className="space-y-8">
            {Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date}>
                    <h3 className="text-sm font-medium text-foreground-secondary mb-4 sticky top-0 bg-background py-2">
                        {date}
                    </h3>
                    <div className="relative pl-6 space-y-4">
                        {/* Timeline line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

                        {items.map((item, index) => (
                            <div key={item.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                {/* Timeline dot */}
                                <div className={`
                  absolute -left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background
                  ${item.difficulty ? difficultyColors[item.difficulty] : 'bg-foreground-secondary'}
                `} />

                                <Card hover className="ml-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <a
                                                href={item.question_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-foreground font-medium hover:text-accent-primary transition-colors line-clamp-1"
                                            >
                                                {item.question_title}
                                            </a>
                                            <div className="flex items-center gap-3 mt-1">
                                                {item.difficulty && (
                                                    <span className={`text-xs font-medium ${difficultyColors[item.difficulty].split(' ')[0]}`}>
                                                        {item.difficulty}
                                                    </span>
                                                )}
                                                <span className="text-xs text-foreground-secondary">
                                                    {formatDate(item.searched_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={item.question_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-foreground-secondary hover:text-foreground hover:bg-border/50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

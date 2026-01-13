'use client';

import Card from '@/components/ui/Card';
import type { LeetCodeQuestion } from '@/types';

interface QuestionDisplayProps {
    question: LeetCodeQuestion | null;
    loading?: boolean;
}

export default function QuestionDisplay({ question, loading = false }: QuestionDisplayProps) {
    if (loading) {
        return (
            <Card className="w-full max-w-4xl mx-auto animate-fade-in">
                <div className="space-y-4">
                    <div className="skeleton h-8 w-2/3 rounded-lg" />
                    <div className="skeleton h-6 w-24 rounded-full" />
                    <div className="space-y-2">
                        <div className="skeleton h-4 w-full rounded" />
                        <div className="skeleton h-4 w-full rounded" />
                        <div className="skeleton h-4 w-3/4 rounded" />
                    </div>
                </div>
            </Card>
        );
    }

    if (!question) return null;

    const difficultyClasses = {
        Easy: 'difficulty-easy',
        Medium: 'difficulty-medium',
        Hard: 'difficulty-hard',
    };

    return (
        <Card className="w-full max-w-4xl mx-auto animate-fade-in" hover>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        {question.title}
                    </h2>
                    <a
                        href={question.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-primary hover:underline"
                    >
                        View on LeetCode →
                    </a>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyClasses[question.difficulty]}`}>
                    {question.difficulty}
                </span>
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                <div className="text-foreground-secondary whitespace-pre-wrap leading-relaxed">
                    {question.description}
                </div>
            </div>

            {/* Examples */}
            {question.examples.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Examples</h3>
                    <div className="space-y-4">
                        {question.examples.map((example, index) => (
                            <div
                                key={index}
                                className="bg-background rounded-xl p-4 border border-border"
                            >
                                <p className="text-sm text-foreground-secondary mb-2">
                                    <span className="text-accent-primary font-medium">Example {index + 1}:</span>
                                </p>
                                <div className="font-mono text-sm space-y-1">
                                    <p><span className="text-foreground-secondary">Input:</span> <span className="text-foreground">{example.input}</span></p>
                                    <p><span className="text-foreground-secondary">Output:</span> <span className="text-green-400">{example.output}</span></p>
                                    {example.explanation && (
                                        <p className="text-foreground-secondary mt-2">
                                            <span className="text-yellow-400">Explanation:</span> {example.explanation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Constraints */}
            {question.constraints.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1 text-foreground-secondary font-mono text-sm">
                        {question.constraints.map((constraint, index) => (
                            <li key={index}>{constraint}</li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
}

'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { LeetCodeQuestion } from '@/types';

interface QuestionDisplayProps {
    question: LeetCodeQuestion | null;
    loading?: boolean;
    onSubmitClick?: () => void;
}

export default function QuestionDisplay({ question, loading = false, onSubmitClick }: QuestionDisplayProps) {
    const [selectedLang, setSelectedLang] = useState<string>('');
    const [copiedCode, setCopiedCode] = useState(false);

    // Set default language when question loads
    if (question?.codeSnippets?.length && !selectedLang) {
        // Default to Python3, then JavaScript, then first available
        const defaultLang = question.codeSnippets.find(s => s.langSlug === 'python3')?.langSlug
            || question.codeSnippets.find(s => s.langSlug === 'javascript')?.langSlug
            || question.codeSnippets[0]?.langSlug;
        if (defaultLang) setSelectedLang(defaultLang);
    }

    const copyCode = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

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
                    <div className="skeleton h-32 w-full rounded-lg" />
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

    const currentSnippet = question.codeSnippets?.find(s => s.langSlug === selectedLang);

    return (
        <Card className="w-full max-w-4xl mx-auto animate-fade-in" hover>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        {question.title}
                    </h2>
                    <div className="flex items-center gap-4">
                        <a
                            href={question.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent-primary hover:underline"
                        >
                            View on LeetCode →
                        </a>
                        {onSubmitClick && (
                            <Button
                                size="sm"
                                onClick={onSubmitClick}
                                className="!py-1.5"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Submit Solution
                            </Button>
                        )}
                    </div>
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
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1 text-foreground-secondary font-mono text-sm">
                        {question.constraints.map((constraint, index) => (
                            <li key={index}>{constraint}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Test Cases */}
            {question.testCases && question.testCases.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Sample Test Cases</h3>
                    <div className="bg-background rounded-xl p-4 border border-border">
                        <pre className="font-mono text-sm text-foreground-secondary overflow-x-auto">
                            {question.testCases.map((tc, i) => (
                                <div key={i} className="mb-1">
                                    <span className="text-accent-primary">Case {i + 1}:</span> {tc}
                                </div>
                            ))}
                        </pre>
                    </div>
                </div>
            )}

            {/* Code Snippets */}
            {question.codeSnippets && question.codeSnippets.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-foreground">Starter Code</h3>
                        {currentSnippet && (
                            <button
                                onClick={() => copyCode(currentSnippet.code)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-lg hover:border-accent-primary/50 transition-colors"
                            >
                                {copiedCode ? (
                                    <>
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-green-400">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-foreground-secondary">Copy</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Language Tabs */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {question.codeSnippets.map((snippet) => (
                            <button
                                key={snippet.langSlug}
                                onClick={() => setSelectedLang(snippet.langSlug)}
                                className={`
                                    px-3 py-1.5 text-sm rounded-lg transition-all
                                    ${selectedLang === snippet.langSlug
                                        ? 'bg-accent-primary text-white'
                                        : 'bg-background-secondary text-foreground-secondary hover:text-foreground border border-border hover:border-accent-primary/50'
                                    }
                                `}
                            >
                                {snippet.lang}
                            </button>
                        ))}
                    </div>

                    {/* Code Block */}
                    {currentSnippet && (
                        <div className="bg-background rounded-xl border border-border overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background-secondary">
                                <span className="text-sm font-medium text-foreground-secondary">{currentSnippet.lang}</span>
                            </div>
                            <pre className="p-4 overflow-x-auto">
                                <code className="font-mono text-sm text-foreground whitespace-pre">
                                    {currentSnippet.code}
                                </code>
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

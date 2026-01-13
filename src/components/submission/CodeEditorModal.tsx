'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { LeetCodeQuestion, SubmissionResult, CodeSnippet } from '@/types';

interface CodeEditorModalProps {
    question: LeetCodeQuestion;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (code: string, language: string, sessionCookie: string) => Promise<void>;
    submitting: boolean;
    result: SubmissionResult | null;
}

export default function CodeEditorModal({
    question,
    isOpen,
    onClose,
    onSubmit,
    submitting,
    result,
}: CodeEditorModalProps) {
    const [code, setCode] = useState<string>('');
    const [selectedLang, setSelectedLang] = useState<string>('');
    const [sessionCookie, setSessionCookie] = useState<string>('');
    const [showCookieInput, setShowCookieInput] = useState(false);

    // Set default language and code when modal opens
    if (isOpen && !selectedLang && question.codeSnippets?.length) {
        const defaultSnippet = question.codeSnippets.find(s => s.langSlug === 'python3')
            || question.codeSnippets.find(s => s.langSlug === 'javascript')
            || question.codeSnippets[0];
        if (defaultSnippet) {
            setSelectedLang(defaultSnippet.langSlug);
            setCode(defaultSnippet.code);
        }
    }

    if (!isOpen) return null;

    const handleLanguageChange = (langSlug: string) => {
        setSelectedLang(langSlug);
        const snippet = question.codeSnippets?.find(s => s.langSlug === langSlug);
        if (snippet) {
            setCode(snippet.code);
        }
    };

    const handleSubmit = async () => {
        if (!sessionCookie) {
            setShowCookieInput(true);
            return;
        }
        await onSubmit(code, selectedLang, sessionCookie);
    };

    const resultColors = {
        Accepted: 'text-green-400 bg-green-400/10 border-green-400/30',
        'Wrong Answer': 'text-red-400 bg-red-400/10 border-red-400/30',
        'Runtime Error': 'text-red-400 bg-red-400/10 border-red-400/30',
        'Compile Error': 'text-red-400 bg-red-400/10 border-red-400/30',
        'Time Limit Exceeded': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
        'Memory Limit Exceeded': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
        Pending: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
        Error: 'text-red-400 bg-red-400/10 border-red-400/30',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background-secondary border border-border rounded-2xl shadow-2xl flex flex-col m-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Submit Solution</h2>
                        <p className="text-sm text-foreground-secondary">{question.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-border/50 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Language Tabs */}
                <div className="flex flex-wrap gap-2 p-4 border-b border-border bg-background">
                    {question.codeSnippets?.map((snippet) => (
                        <button
                            key={snippet.langSlug}
                            onClick={() => handleLanguageChange(snippet.langSlug)}
                            disabled={submitting}
                            className={`
                px-3 py-1.5 text-sm rounded-lg transition-all
                ${selectedLang === snippet.langSlug
                                    ? 'bg-accent-primary text-white'
                                    : 'bg-background-secondary text-foreground-secondary hover:text-foreground border border-border hover:border-accent-primary/50'
                                }
                disabled:opacity-50
              `}
                        >
                            {snippet.lang}
                        </button>
                    ))}
                </div>

                {/* Code Editor */}
                <div className="flex-1 overflow-hidden p-4">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={submitting}
                        placeholder="Paste your solution here..."
                        className="w-full h-full min-h-[300px] bg-background border border-border rounded-xl p-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none disabled:opacity-50"
                        spellCheck={false}
                    />
                </div>

                {/* Session Cookie Input */}
                {showCookieInput && (
                    <div className="px-4 pb-4">
                        <Card className="bg-yellow-500/10 border-yellow-500/30">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm text-yellow-400 font-medium mb-1">LeetCode Session Required</p>
                                        <p className="text-xs text-foreground-secondary mb-3">
                                            To submit code, paste your LEETCODE_SESSION cookie from browser.
                                            <a href="https://www.youtube.com/watch?v=example" target="_blank" className="text-accent-primary ml-1">How to get it?</a>
                                        </p>
                                        <input
                                            type="text"
                                            value={sessionCookie}
                                            onChange={(e) => setSessionCookie(e.target.value)}
                                            placeholder="eyJ0eXAiOiJKV1..."
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <div className="px-4 pb-4">
                        <div className={`p-4 rounded-xl border ${resultColors[result.status]}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-lg">{result.status}</span>
                                {result.runtime && result.memory && (
                                    <span className="text-sm">
                                        {result.runtime} | {result.memory}
                                    </span>
                                )}
                            </div>
                            {result.testCasesPassed !== undefined && result.totalTestCases && (
                                <div className="text-sm mb-2">
                                    Test Cases: {result.testCasesPassed} / {result.totalTestCases} passed
                                </div>
                            )}
                            {result.errorMessage && (
                                <div className="mt-2 p-3 bg-background rounded-lg">
                                    <p className="text-sm font-mono text-red-400">{result.errorMessage}</p>
                                </div>
                            )}
                            {result.status === 'Wrong Answer' && (
                                <div className="mt-2 space-y-2">
                                    {result.input && (
                                        <div className="p-2 bg-background rounded text-sm font-mono">
                                            <span className="text-foreground-secondary">Input: </span>
                                            <span>{result.input}</span>
                                        </div>
                                    )}
                                    {result.expectedOutput && (
                                        <div className="p-2 bg-background rounded text-sm font-mono">
                                            <span className="text-foreground-secondary">Expected: </span>
                                            <span className="text-green-400">{result.expectedOutput}</span>
                                        </div>
                                    )}
                                    {result.actualOutput && (
                                        <div className="p-2 bg-background rounded text-sm font-mono">
                                            <span className="text-foreground-secondary">Actual: </span>
                                            <span className="text-red-400">{result.actualOutput}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={!code.trim() || submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit to LeetCode'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

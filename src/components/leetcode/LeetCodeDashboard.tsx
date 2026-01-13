'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { LeetCodeStats } from '@/types';

interface LeetCodeDashboardProps {
    stats: LeetCodeStats | null;
    connected: boolean;
    loading: boolean;
    onConnect: (url: string) => Promise<void>;
    onDisconnect: () => Promise<void>;
    error?: string | null;
}

export default function LeetCodeDashboard({
    stats,
    connected,
    loading,
    onConnect,
    onDisconnect,
    error,
}: LeetCodeDashboardProps) {
    const [url, setUrl] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        if (!url.trim()) return;
        setIsConnecting(true);
        await onConnect(url.trim());
        setIsConnecting(false);
        setUrl('');
    };

    // Not connected - show connect form
    if (!connected) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Connect LeetCode</h1>
                    <p className="text-foreground-secondary">
                        Link your LeetCode profile to track your progress
                    </p>
                </div>

                <Card className="p-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground-secondary mb-2">
                                LeetCode Profile URL or Username
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://leetcode.com/u/yourname or yourname"
                                disabled={isConnecting}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleConnect}
                            disabled={!url.trim() || isConnecting}
                            loading={isConnecting}
                            size="lg"
                            className="w-full"
                        >
                            Connect LeetCode
                        </Button>

                        <p className="text-xs text-foreground-secondary text-center">
                            Your profile will be used to track your solving progress
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    // Connected - show stats
    if (!stats) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-foreground-secondary">Loading your LeetCode stats...</p>
                </Card>
            </div>
        );
    }

    const progressPercentage = (stats.totalSolved / stats.totalQuestions) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">@{stats.username}</h1>
                        <p className="text-foreground-secondary">
                            Rank: <span className="text-accent-primary font-medium">#{stats.ranking.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={onDisconnect}
                    disabled={loading}
                    className="p-2 text-foreground-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Disconnect LeetCode"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Progress Overview */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Problems Solved</h2>
                    <span className="text-2xl font-bold gradient-text">
                        {stats.totalSolved} / {stats.totalQuestions}
                    </span>
                </div>

                <div className="h-4 bg-background rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full gradient-bg rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Difficulty Breakdown */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-background rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">{stats.easySolved}</div>
                        <div className="text-sm text-foreground-secondary">Easy</div>
                        <div className="text-xs text-foreground-secondary mt-1">/ {stats.easyTotal}</div>
                        <div className="mt-2 h-1.5 bg-background-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-400 rounded-full"
                                style={{ width: `${(stats.easySolved / stats.easyTotal) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-background rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-400">{stats.mediumSolved}</div>
                        <div className="text-sm text-foreground-secondary">Medium</div>
                        <div className="text-xs text-foreground-secondary mt-1">/ {stats.mediumTotal}</div>
                        <div className="mt-2 h-1.5 bg-background-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${(stats.mediumSolved / stats.mediumTotal) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-background rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-400">{stats.hardSolved}</div>
                        <div className="text-sm text-foreground-secondary">Hard</div>
                        <div className="text-xs text-foreground-secondary mt-1">/ {stats.hardTotal}</div>
                        <div className="mt-2 h-1.5 bg-background-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-400 rounded-full"
                                style={{ width: `${(stats.hardSolved / stats.hardTotal) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="text-center">
                    <div className="text-3xl font-bold text-accent-primary mb-1">
                        {stats.acceptanceRate}%
                    </div>
                    <div className="text-sm text-foreground-secondary">Acceptance Rate</div>
                </Card>

                <Card className="text-center">
                    <div className="text-3xl font-bold text-accent-primary mb-1">
                        {stats.reputation}
                    </div>
                    <div className="text-sm text-foreground-secondary">Reputation</div>
                </Card>
            </div>
        </div>
    );
}

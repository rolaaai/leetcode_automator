'use client';

import { useState, useEffect } from 'react';
import LeetCodeDashboard from '@/components/leetcode/LeetCodeDashboard';
import type { LeetCodeStats, LeetCodeProfile } from '@/types';

export default function LeetCodePage() {
    const [connected, setConnected] = useState(false);
    const [stats, setStats] = useState<LeetCodeStats | null>(null);
    const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/profile');
            const data = await response.json();

            if (data.connected) {
                setConnected(true);
                setProfile(data.profile);
                setStats(data.stats || null);

                if (data.statsError) {
                    console.error('Stats error:', data.statsError);
                }
            } else {
                setConnected(false);
                setProfile(null);
                setStats(null);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (url: string) => {
        setError(null);

        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to connect');
            }

            setConnected(true);
            setStats(data.stats);

            // Refresh to get full profile
            await fetchProfile();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed');
        }
    };

    const handleDisconnect = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/profile', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to disconnect');
            }

            setConnected(false);
            setProfile(null);
            setStats(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Disconnect failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !connected) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <LeetCodeDashboard
            stats={stats}
            connected={connected}
            loading={loading}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            error={error}
        />
    );
}

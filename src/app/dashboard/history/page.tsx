'use client';

import { useState, useEffect } from 'react';
import HistoryTimeline from '@/components/history/HistoryTimeline';
import { createClient } from '@/lib/supabase/client';
import type { SearchHistory } from '@/types';

export default function HistoryPage() {
    const [history, setHistory] = useState<SearchHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .order('searched_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Failed to fetch history:', error);
            } else {
                setHistory(data || []);
            }

            setLoading(false);
        };

        fetchHistory();
    }, []);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Search History</h1>
                <p className="text-foreground-secondary">
                    Your recently searched LeetCode problems
                </p>
            </div>

            <HistoryTimeline history={history} loading={loading} />
        </div>
    );
}

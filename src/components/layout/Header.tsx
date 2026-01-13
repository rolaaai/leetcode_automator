'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
    user: User | null;
}

export default function Header({ user }: HeaderProps) {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = user?.user_metadata?.avatar_url;

    return (
        <header className="h-16 bg-background-secondary/50 backdrop-blur-sm border-b border-border flex items-center justify-end px-6">
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-border/50 transition-colors"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">{userName}</p>
                        <p className="text-xs text-foreground-secondary">{user?.email}</p>
                    </div>
                    <Avatar
                        src={userAvatar}
                        alt={userName}
                        fallback={userName}
                        size="md"
                    />
                    <svg
                        className={`w-4 h-4 text-foreground-secondary transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-background-secondary border border-border rounded-xl shadow-xl z-20 animate-fade-in overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <p className="font-medium text-foreground">{userName}</p>
                                <p className="text-sm text-foreground-secondary truncate">{user?.email}</p>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}

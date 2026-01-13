'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SidebarSection } from '@/types';

interface SidebarProps {
    onSectionChange?: (section: SidebarSection) => void;
}

export default function Sidebar({ onSectionChange }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const sections = [
        {
            id: 'leetcode' as SidebarSection,
            label: 'LeetCode Dashboard',
            href: '/dashboard/leetcode',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z" />
                </svg>
            ),
        },
        {
            id: 'search' as SidebarSection,
            label: 'Search Question',
            href: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
        },
        {
            id: 'history' as SidebarSection,
            label: 'History',
            href: '/dashboard/history',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            id: 'subscription' as SidebarSection,
            label: 'Subscription',
            href: '/dashboard/subscription',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
        },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`
        h-screen bg-background-secondary border-r border-border
        flex flex-col transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}
        >
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg font-bold gradient-text">LeetCode AI</span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {sections.map((section) => (
                    <Link
                        key={section.id}
                        href={section.href}
                        onClick={() => onSectionChange?.(section.id)}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive(section.href)
                                ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-white border border-accent-primary/30'
                                : 'text-foreground-secondary hover:text-foreground hover:bg-border/50'
                            }
            `}
                    >
                        {section.icon}
                        {!isCollapsed && (
                            <span className="font-medium">{section.label}</span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Collapse Button */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-foreground-secondary hover:text-foreground rounded-xl hover:bg-border/50 transition-all"
                >
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    {!isCollapsed && <span className="text-sm">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}

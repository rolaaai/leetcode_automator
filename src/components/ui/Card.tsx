'use client';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
}

export default function Card({
    children,
    className = '',
    hover = false,
    glow = false
}: CardProps) {
    return (
        <div
            className={`
        bg-background-secondary border border-border rounded-2xl p-6
        ${hover ? 'transition-all duration-300 hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/5' : ''}
        ${glow ? 'animate-pulse-glow' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

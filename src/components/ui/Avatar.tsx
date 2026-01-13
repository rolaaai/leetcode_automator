'use client';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Avatar({
    src,
    alt = 'Avatar',
    fallback = '?',
    size = 'md',
    className = ''
}: AvatarProps) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg',
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={`
        ${sizes[size]} 
        rounded-full overflow-hidden 
        flex items-center justify-center 
        bg-gradient-to-br from-accent-primary to-accent-secondary
        text-white font-semibold
        ring-2 ring-border ring-offset-2 ring-offset-background
        ${className}
      `}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{getInitials(fallback)}</span>
            )}
        </div>
    );
}

import React from 'react';
import Image from 'next/image';
import { User } from '@phosphor-icons/react';

interface UserAvatarProps {
    user?: {
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
        avatar?: string;
    } | null;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    className?: string;
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
    const sizeClasses = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-[11px]',
        lg: 'w-10 h-10 text-xs',
        xl: 'w-12 h-12 text-sm',
        xxl: 'w-24 h-24 text-2xl',
    };

    const containerClasses = `relative shrink-0 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm border border-border/50 ${sizeClasses[size]} ${className}`;

    // If no user object, show generic icon
    if (!user) {
        return (
            <div className={`bg-bg-light text-text-muted ${containerClasses}`}>
                <User weight="fill" className="w-1/2 h-1/2 opacity-50" />
            </div>
        );
    }

    // If profile picture exists, render Image
    const photoUrl = user.avatar || user.profilePicture;
    if (photoUrl) {
        // Fallback robust profile picture URL generation (assuming Cloudinary relative paths might come without absolute URL)
        const picUrl = photoUrl.startsWith('http') || photoUrl.startsWith('data:')
            ? photoUrl
            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;

        return (
            <div className={containerClasses}>
                <Image
                    src={picUrl}
                    alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
        );
    }

    // Default: initials
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';

    return (
        <div className={`bg-primary/10 text-primary ${containerClasses}`}>
            {initials}
        </div>
    );
}

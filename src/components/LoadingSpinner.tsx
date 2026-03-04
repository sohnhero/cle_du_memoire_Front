'use client';

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    light?: boolean;
}

const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-4',
    xl: 'w-12 h-12 border-4',
};

export default function LoadingSpinner({
    size = 'md',
    className = "",
    light = false
}: LoadingSpinnerProps) {
    return (
        <div
            className={`
                animate-spin rounded-full 
                ${sizeClasses[size]} 
                ${light
                    ? 'border-white/30 border-t-white'
                    : 'border-accent/20 border-t-accent'} 
                ${className}
            `}
            role="status"
            aria-label="Chargement..."
        />
    );
}

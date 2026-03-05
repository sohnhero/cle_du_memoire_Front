import React from 'react';
import { Icon as PhosphorIcon } from '@phosphor-icons/react';

interface BrandIconProps {
    icon: PhosphorIcon;
    size?: number | string;
    className?: string;
    iconClassName?: string;
}

export function BrandIcon({
    icon: Icon,
    size = 48,
    className = "",
    iconClassName = ""
}: BrandIconProps) {
    // To keep proportions according to the model (48px container, 24px icon)
    const iconSize = typeof size === 'number' ? size / 2 : "50%";

    // Only skip inline size if a BASE (non-responsive) w- or h- class is present.
    // e.g. 'w-16' or '!w-16' matches, but 'sm:!w-16' does NOT match.
    const classes = className.split(/\s+/);
    const hasBaseWidth = classes.some(c => /^!?w-/.test(c));
    const hasBaseHeight = classes.some(c => /^!?h-/.test(c));

    return (
        <div
            className={`bg-primary flex items-center justify-center shrink-0 rounded-full ${className}`}
            style={{
                width: hasBaseWidth ? undefined : size,
                height: hasBaseHeight ? undefined : size,
            }}
        >
            <Icon
                weight="fill"
                className={`text-white ${iconClassName}`}
                size={iconSize}
            />
        </div>
    );
}

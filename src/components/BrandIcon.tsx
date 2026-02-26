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

    return (
        <div
            className={`bg-primary flex items-center justify-center shrink-0 rounded-full ${className}`}
            style={{
                width: size,
                height: size,
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

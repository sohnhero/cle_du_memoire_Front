import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'icon' | 'full';
    showGlow?: boolean;
    monochrome?: boolean;
}

export default function Logo({ className = "h-12", variant = 'full', showGlow = true, monochrome = false }: LogoProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* The glowing backing effect disabled for cleaner look */}
            {showGlow && false && (
                <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full scale-150 animate-pulse pointer-events-none" />
            )}

            {/* The actual logo image */}
            <img
                src={monochrome ? "/logo-monochrome.png" : "/logo-new.png"}
                alt="Clé du Mémoire Logo"
                className="relative z-10 w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
            />
        </div>
    );
}

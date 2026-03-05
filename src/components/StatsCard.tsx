'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon as PhosphorIcon, ArrowUpRight } from '@phosphor-icons/react';
import { BrandIcon } from './BrandIcon';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: PhosphorIcon;
    change?: string;
    delay?: number;
    className?: string;
    iconColor?: string;
    valueColor?: string;
}

export function StatsCard({
    label,
    value,
    icon,
    change,
    delay = 0,
    className = "",
    iconColor = "bg-primary",
    valueColor = "text-primary"
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            className={`card-premium p-5 flex items-center justify-between group overflow-hidden min-h-[140px] sm:min-h-[160px] ${className}`}
        >
            <div className="flex-1 min-w-0 flex flex-col h-full py-0.5">
                <p className="text-[10px] sm:text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">
                    {label}
                </p>

                <div className="flex-1 flex items-center">
                    <h4 className={`text-xl sm:text-3xl font-black ${valueColor} tracking-tighter leading-none mb-1`}>
                        {value}
                    </h4>
                </div>

                {change && (
                    <div className="mt-2 text-left">
                        <span className="inline-flex items-center text-[9px] font-black text-success bg-success/5 px-2.5 py-1 rounded-lg border border-success/10 shadow-sm">
                            <ArrowUpRight className="w-2.5 h-2.5 mr-1" weight="bold" />
                            {change}
                        </span>
                    </div>
                )}
            </div>

            <div className="relative shrink-0 ml-2 sm:ml-4">
                <BrandIcon
                    icon={icon}
                    size={40}
                    className={`${iconColor} transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 shadow-md ring-2 ring-white/20 relative z-10 sm:!w-16 sm:!h-16`}
                    iconClassName="sm:!size-8"
                />
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${iconColor}/10 rounded-full blur-3xl group-hover:opacity-100 transition-opacity opacity-50`} />
            </div>
        </motion.div>
    );
}

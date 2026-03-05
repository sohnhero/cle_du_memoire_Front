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
            className={`card-premium p-3 sm:p-4 flex items-center justify-between group overflow-hidden min-h-[90px] sm:min-h-[120px] ${className}`}
        >
            <div className="flex-1 min-w-0 flex flex-col h-full py-0.5">
                <p className="text-[10px] sm:text-[11px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">
                    {label}
                </p>

                <div className="flex-1 flex items-center">
                    <h4 className={`text-lg sm:text-2xl font-black ${valueColor} tracking-tighter leading-none mb-1`}>
                        {value}
                    </h4>
                </div>

                {change && (
                    <div className="mt-2 text-left">
                        <span className="inline-flex items-center text-[9px] font-black text-success bg-success/5 px-2 py-0.5 rounded-lg border border-success/10 shadow-sm">
                            <ArrowUpRight className="w-2.5 h-2.5 mr-1" weight="bold" />
                            {change}
                        </span>
                    </div>
                )}
            </div>

            <div className="relative shrink-0 ml-2 sm:ml-3">
                <BrandIcon
                    icon={icon}
                    size={32}
                    className={`${iconColor} transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 shadow-md ring-2 ring-white/20 relative z-10 sm:!w-12 sm:!h-12`}
                    iconClassName="sm:!size-6"
                />
                <div className={`absolute -right-6 -bottom-6 w-20 h-20 ${iconColor}/10 rounded-full blur-2xl group-hover:opacity-100 transition-opacity opacity-50`} />
            </div>
        </motion.div>
    );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import LoadingSpinner from './LoadingSpinner';

interface Column {
    key: string;
    label: string;
    className?: string; // Classes for the desktop <th> and <td>
    breakpoint?: 'sm' | 'md' | 'lg' | 'xl'; // Hide on mobile and below this breakpoint
}

interface ResponsiveTableProps<T> {
    columns: Column[];
    data: T[];
    renderDesktopRow: (item: T) => React.ReactNode;
    renderMobileSummary: (item: T) => { label: string; value: React.ReactNode };
    renderMobileDetails: (item: T) => { label: string; value: React.ReactNode }[];
    renderActions?: (item: T) => React.ReactNode;
    loading?: boolean;
    emptyMessage?: string;
    primaryKey: keyof T | ((item: T) => string);
}

export default function ResponsiveTable<T>({
    columns,
    data,
    renderDesktopRow,
    renderMobileSummary,
    renderMobileDetails,
    renderActions,
    loading = false,
    emptyMessage = "Aucune donnée trouvée",
    primaryKey
}: ResponsiveTableProps<T>) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getRowId = (item: T): string => {
        if (typeof primaryKey === 'function') return primaryKey(item);
        return String(item[primaryKey]);
    };

    if (loading && data.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-text-muted">
                <LoadingSpinner size="lg" className="mb-4" />
                Chargement...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border-light rounded-2xl">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto card-premium overflow-hidden !p-0">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border/10 bg-bg-light/30">
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`px-6 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-widest ${col.breakpoint ? `hidden ${col.breakpoint}:table-cell` : ''} ${col.className || ''}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {renderActions && (
                                <th className="px-6 py-3.5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <motion.tr
                                key={getRowId(item)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-b border-border-light/50 hover:bg-bg-light/30 transition-colors"
                            >
                                {renderDesktopRow(item)}
                                {renderActions && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {renderActions(item)}
                                        </div>
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden space-y-3">
                {data.map((item, idx) => {
                    const id = getRowId(item);
                    const isExpanded = expandedRows[id];
                    const summary = renderMobileSummary(item);
                    const details = renderMobileDetails(item);

                    return (
                        <div key={id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden transition-all">
                            {/* Card Header (Always visible) */}
                            <div className="p-3.5 flex items-center gap-3">
                                <button
                                    onClick={() => toggleRow(id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary border border-primary/10'}`}
                                >
                                    {isExpanded ? <CaretUp weight="bold" className="w-4 h-4" /> : <CaretDown weight="bold" className="w-4 h-4" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">{summary.label}</div>
                                    <div className="text-sm font-black text-primary truncate leading-tight">
                                        {summary.value}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-bg-light/30 border-t border-border-light"
                                    >
                                        <div className="p-4 space-y-3.5">
                                            {details.map((detail, dIdx) => (
                                                <div key={dIdx} className="flex justify-between items-start gap-4">
                                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed">{detail.label}</div>
                                                    <div className="text-sm font-bold text-primary text-right flex-1">{detail.value}</div>
                                                </div>
                                            ))}
                                            {renderActions && (
                                                <div className="flex justify-between items-center gap-4 pt-3 border-t border-border-light">
                                                    <div className="text-xs font-bold text-text-muted uppercase tracking-tighter">Action</div>
                                                    <div className="flex gap-2">
                                                        {renderActions(item)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

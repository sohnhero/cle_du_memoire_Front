'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}: PaginationProps) {
    const showButtons = totalPages > 1;

    // Don't render at all if there's nothing to show
    if (!showButtons && !totalItems) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === i
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-text-secondary hover:bg-bg-light hover:text-primary border border-transparent hover:border-border-light'
                        }`}
                >
                    {currentPage === i && (
                        <motion.div
                            layoutId="activePage"
                            className="absolute inset-0 bg-primary rounded-xl -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    {i}
                </button>
            );
        }
        return pages;
    };

    const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : 0;
    const endItem = totalItems ? Math.min(currentPage * (itemsPerPage || 10), totalItems) : 0;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2 py-3">
            {totalItems !== undefined && (
                <p className="text-xs font-medium text-text-muted">
                    Affichage de <span className="text-primary font-bold">{startItem}</span> à <span className="text-primary font-bold">{endItem}</span> sur <span className="text-primary font-bold">{totalItems}</span> éléments
                </p>
            )}

            {showButtons && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl border border-border-light bg-white text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-light transition-colors shadow-sm"
                    >
                        <CaretLeft className="w-5 h-5" weight="bold" />
                    </button>

                    <div className="flex items-center gap-1.5">
                        {renderPageNumbers()}
                    </div>

                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-xl border border-border-light bg-white text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-light transition-colors shadow-sm"
                    >
                        <CaretRight className="w-5 h-5" weight="bold" />
                    </button>
                </div>
            )}
        </div>
    );
}

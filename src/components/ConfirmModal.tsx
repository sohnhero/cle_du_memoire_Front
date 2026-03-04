'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Warning as AlertTriangle, Trash, X } from '@phosphor-icons/react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const variantConfig = {
    danger: {
        icon: Trash,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        buttonBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
        buttonBg: 'bg-warning hover:bg-warning/90',
    },
    info: {
        icon: AlertTriangle,
        iconBg: 'bg-accent/10',
        iconColor: 'text-accent',
        buttonBg: 'bg-accent hover:bg-accent-light',
    },
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmer l\'action',
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    variant = 'danger',
}: ConfirmModalProps) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
                    >
                        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-bg-light text-text-muted transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-full ${config.iconBg} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${config.iconColor}`} />
                        </div>
                        <h3 className="text-base font-bold text-primary mb-2">{title}</h3>
                        <p className="text-sm text-text-secondary mb-6 leading-relaxed">{message}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl bg-bg-light text-primary font-bold text-sm hover:bg-border/30 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-colors ${config.buttonBg}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

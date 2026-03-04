'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import {
    Bell, Checks as CheckCheck, ChatCircle as MessageCircle, Package, FileText, WarningCircle as AlertCircle, Info, CircleNotch as Loader2, Tray as Inbox
} from '@phosphor-icons/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<any>; color: string }> = {
    message: { icon: MessageCircle, color: 'bg-info/10 text-info' },
    pack: { icon: Package, color: 'bg-accent/10 text-accent' },
    document: { icon: FileText, color: 'bg-success/10 text-success' },
    warning: { icon: AlertCircle, color: 'bg-warning/10 text-warning' },
    info: { icon: Info, color: 'bg-primary/10 text-primary' },
};

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        try {
            const res = await api.getNotifications();
            setNotifications(res.notifications);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkRead(id: string) {
        try {
            await api.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    }

    async function handleMarkAllRead() {
        setMarkingAll(true);
        try {
            await api.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        } finally {
            setMarkingAll(false);
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            await handleMarkRead(notif.id);
        }

        // Logic routing based on type
        switch (notif.type) {
            case 'message':
                router.push('/dashboard/messages');
                break;
            case 'document':
                router.push('/dashboard/documents');
                break;
            case 'pack':
                router.push('/dashboard/packs');
                break;
            default:
                // If it's a general notification or specific one, stay or go to dashboard
                break;
        }
    };

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes}min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary">Notifications</h1>
                    <p className="text-text-secondary mt-1 text-sm">
                        {unreadCount > 0
                            ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                            : 'Toutes les notifications sont lues'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markingAll}
                        className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors"
                    >
                        {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <Inbox className="w-16 h-16 mx-auto text-text-muted/30 mb-4" />
                    <p className="text-text-secondary font-medium">Aucune notification</p>
                    <p className="text-text-muted text-sm mt-1">Vous recevrez des notifications pour les messages, documents et mises à jour.</p>
                </motion.div>
            ) : (
                <div className="space-y-2">
                    <AnimatePresence>
                        {notifications.map((notif, index) => {
                            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer ${notif.isRead
                                        ? 'bg-white border-border/30 opacity-60'
                                        : 'bg-white border-accent/20 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`text-sm font-semibold ${notif.isRead ? 'text-text-secondary' : 'text-primary'}`}>
                                                    {notif.title}
                                                </h3>
                                                <span className="text-xs text-text-muted whitespace-nowrap">{formatDate(notif.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-text-secondary mt-0.5">{notif.content}</p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

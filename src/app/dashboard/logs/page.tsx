'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    SignIn as LogIn,
    Clock,
    FileText,
    ShieldCheck as Shield,
    User,
    Warning as AlertTriangle,
    MagnifyingGlass as Search
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';
import ResponsiveTable from '@/components/ResponsiveTable';
import toast from 'react-hot-toast';

const actionIcons: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
    LOGIN: { icon: LogIn, color: 'bg-success/10 text-success', label: 'Connexion' },
    LOGOUT: { icon: Clock, color: 'bg-text-muted/10 text-text-muted', label: 'Déconnexion' },
    UPLOAD: { icon: FileText, color: 'bg-info/10 text-info', label: 'Envoi' },
    REVIEW: { icon: Shield, color: 'bg-accent/10 text-accent', label: 'Évaluation' },
    REGISTER: { icon: User, color: 'bg-primary/10 text-primary', label: 'Inscription' },
    MESSAGE: { icon: FileText, color: 'bg-info/10 text-info', label: 'Message' },
    LOGIN_FAILED: { icon: AlertTriangle, color: 'bg-error/10 text-error', label: 'Échec Connexion' },
    USER_UPDATE: { icon: User, color: 'bg-warning/10 text-warning', label: 'Modif Profil' },
    DOCUMENT_UPDATE: { icon: FileText, color: 'bg-warning/10 text-warning', label: 'Modif Doc' },
};

export default function LogsPage() {
    const [logs, setLogs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [actionType, setActionType] = React.useState('ALL');

    // Pagination state
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [totalLogs, setTotalLogs] = React.useState(0);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await api.getAdminLogs(currentPage, 5, searchQuery, actionType);
            setLogs(res.logs || []);
            setTotalPages(res.totalPages || 1);
            setTotalLogs(res.total || 0);
        } catch (error) {
            console.error(error);
            toast.error("Erreur de chargement des logs");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadLogs();
    }, [currentPage, actionType]);

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else loadLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                        Logs & Sécurité
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Journal d'activité de la plateforme</p>
                </div>
            </div>

            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-accent/10 focus-within:border-accent transition-all">
                    <Search className="w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Rechercher par utilisateur ou description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1 text-primary placeholder:text-text-muted"
                    />
                </div>
                <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-border bg-white text-sm text-text-secondary shadow-sm outline-none hover:border-accent/30 appearance-none cursor-pointer min-w-[150px]"
                >
                    <option value="ALL">Toutes les actions</option>
                    {Object.keys(actionIcons).map(type => (
                        <option key={type} value={type}>{actionIcons[type].label}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : logs.length === 0 ? (
                <div className="card-premium p-12 text-center text-text-muted">
                    Aucun log trouvé pour cette recherche.
                </div>
            ) : (
                <>
                    <ResponsiveTable
                        loading={loading}
                        data={logs}
                        primaryKey="id"
                        columns={[
                            { key: 'action', label: 'Action' },
                            { key: 'user', label: 'Utilisateur' },
                            { key: 'description', label: 'Détails', breakpoint: 'md' },
                            { key: 'ip', label: 'IP', breakpoint: 'lg' },
                            { key: 'date', label: 'Heure', className: 'text-right' }
                        ]}
                        renderDesktopRow={(log) => {
                            const actionConfig = actionIcons[log.action] || actionIcons.LOGIN;
                            const ActionIcon = actionConfig.icon;
                            return (
                                <>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg ${actionConfig.color} flex items-center justify-center`}>
                                                <ActionIcon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-mono text-text-primary uppercase">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.user ? (
                                            <>
                                                <div className="text-sm font-medium text-primary">{log.user.firstName} {log.user.lastName}</div>
                                                <div className="text-xs text-text-muted uppercase tracking-wider font-bold">{log.user.role}</div>
                                            </>
                                        ) : (
                                            <span className="text-text-muted italic">Inconnu</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary hidden md:table-cell max-w-xs truncate" title={log.description}>
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-text-muted hidden lg:table-cell">{log.ipAddress || '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs text-text-muted flex items-center justify-end gap-1">
                                            <Clock className="w-3 h-3" /> {formatDate(log.createdAt)}
                                        </span>
                                    </td>
                                </>
                            );
                        }}
                        renderMobileSummary={(log) => {
                            const actionConfig = actionIcons[log.action] || actionIcons.LOGIN;
                            const ActionIcon = actionConfig.icon;
                            return {
                                label: 'Action',
                                value: (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary`}>
                                            <ActionIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-mono text-xs">{log.action}</span>
                                    </div>
                                )
                            };
                        }}
                        renderMobileDetails={(log) => [
                            {
                                label: 'Utilisateur',
                                value: log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.role})` : 'Inconnu'
                            },
                            { label: 'Détails', value: log.description },
                            { label: 'IP', value: log.ipAddress || '—' },
                            { label: 'Heure', value: formatDate(log.createdAt) }
                        ]}
                    />

                    <div className="mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalLogs}
                            itemsPerPage={5}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

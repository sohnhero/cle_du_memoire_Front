'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck as Shield, Clock, User, SignIn as LogIn, FileText, Warning as AlertTriangle, MagnifyingGlass as Search, Faders as Filter, CaretLeft as ChevronLeft, CaretRight as ChevronRight
} from '@phosphor-icons/react';

const logs = [
    { id: '1', action: 'LOGIN', user: 'Moussa Diop', role: 'Étudiant', details: 'Connexion réussie', ip: '196.1.2.34', time: 'Il y a 5 min' },
    { id: '2', action: 'UPLOAD', user: 'Moussa Diop', role: 'Étudiant', details: 'Chapitre_2_V1.pdf envoyé', ip: '196.1.2.34', time: 'Il y a 10 min' },
    { id: '3', action: 'REVIEW', user: 'Amadou Diallo', role: 'Accompagnateur', details: 'Chapitre 1 approuvé pour Moussa Diop', ip: '41.82.5.67', time: 'Il y a 30 min' },
    { id: '4', action: 'LOGIN', user: 'Admin Système', role: 'Admin', details: 'Connexion admin', ip: '197.149.0.1', time: 'Il y a 1h' },
    { id: '5', action: 'ACTIVATE_PACK', user: 'Admin Système', role: 'Admin', details: 'Pack Complet activé pour Aïssatou Ba', ip: '197.149.0.1', time: 'Il y a 2h' },
    { id: '6', action: 'REGISTER', user: 'Omar Seck', role: 'Étudiant', details: 'Nouvel étudiant inscrit', ip: '154.0.26.10', time: 'Il y a 3h' },
    { id: '7', action: 'MESSAGE', user: 'Fatou Ndiaye', role: 'Accompagnateur', details: 'Message envoyé à Khady Diallo', ip: '41.82.100.5', time: 'Il y a 4h' },
    { id: '8', action: 'LOGIN_FAILED', user: 'inconnu@test.sn', role: '—', details: 'Tentative de connexion échouée', ip: '102.44.0.99', time: 'Il y a 5h' },
];

const actionIcons: Record<string, { icon: React.ComponentType<any>; color: string }> = {
    LOGIN: { icon: LogIn, color: 'bg-success/10 text-success' },
    UPLOAD: { icon: FileText, color: 'bg-info/10 text-info' },
    REVIEW: { icon: Shield, color: 'bg-accent/10 text-accent' },
    ACTIVATE_PACK: { icon: Shield, color: 'bg-accent/10 text-accent' },
    REGISTER: { icon: User, color: 'bg-primary/10 text-primary' },
    MESSAGE: { icon: FileText, color: 'bg-info/10 text-info' },
    LOGIN_FAILED: { icon: AlertTriangle, color: 'bg-error/10 text-error' },
};

export default function LogsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                    Logs & Sécurité
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Journal d'activité de la plateforme</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Connexions aujourd\'hui', value: 24, color: 'text-success' },
                    { label: 'Tentatives échouées', value: 1, color: 'text-error' },
                    { label: 'Documents uploadés', value: 8, color: 'text-info' },
                    { label: 'Actions admin', value: 5, color: 'text-accent' },
                ].map((stat) => (
                    <div key={stat.label} className="card-premium p-4 text-center">
                        <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] sm:text-xs text-text-muted mt-1 truncate">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-4 py-3">
                    <Search className="w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Rechercher dans les logs..." className="bg-transparent text-sm outline-none flex-1" />
                </div>
                <button className="p-3 rounded-xl border border-border bg-white hover:bg-bg-light transition-colors">
                    <Filter className="w-4 h-4 text-text-secondary" />
                </button>
            </div>

            {/* Logs */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-light bg-bg-light/50">
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase px-3 sm:px-6 py-3 sm:py-4">Action</th>
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase px-3 sm:px-6 py-3 sm:py-4">Utilisateur</th>
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase px-6 py-4 hidden md:table-cell">Détails</th>
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase px-6 py-4 hidden lg:table-cell">IP</th>
                                <th className="text-right text-xs font-semibold text-text-secondary uppercase px-3 sm:px-6 py-3 sm:py-4">Heure</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, i) => {
                                const actionConfig = actionIcons[log.action] || actionIcons.LOGIN;
                                const ActionIcon = actionConfig.icon;
                                return (
                                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className={`border-b border-border-light/50 hover:bg-bg-light/30 transition-colors ${log.action === 'LOGIN_FAILED' ? 'bg-error/[0.02]' : ''}`}>
                                        <td className="px-3 sm:px-6 py-3 sm:py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg ${actionConfig.color} flex items-center justify-center`}>
                                                    <ActionIcon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-mono text-text-primary">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-3.5">
                                            <div className="text-sm font-medium text-primary">{log.user}</div>
                                            <div className="text-xs text-text-muted">{log.role}</div>
                                        </td>
                                        <td className="px-6 py-3.5 text-sm text-text-secondary hidden md:table-cell">{log.details}</td>
                                        <td className="px-6 py-3.5 text-xs font-mono text-text-muted hidden lg:table-cell">{log.ip}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-3.5 text-right">
                                            <span className="text-xs text-text-muted flex items-center justify-end gap-1">
                                                <Clock className="w-3 h-3" /> {log.time}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-t border-border-light">
                    <span className="text-sm text-text-muted">Page 1 sur 5</span>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-border hover:bg-bg-light text-text-secondary"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold">1</button>
                        <button className="w-8 h-8 rounded-lg border border-border text-text-secondary text-xs hover:bg-bg-light">2</button>
                        <button className="w-8 h-8 rounded-lg border border-border text-text-secondary text-xs hover:bg-bg-light">3</button>
                        <button className="p-2 rounded-lg border border-border hover:bg-bg-light text-text-secondary"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

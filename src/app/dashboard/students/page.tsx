'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, MagnifyingGlass as Search, Faders as Filter, Eye, ChatCircle as MessageCircle, TrendUp as TrendingUp, Warning as AlertTriangle, CheckCircle
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const phasesList = [
    { id: 'TOPIC', label: 'Choix du sujet' },
    { id: 'OUTLINE', label: 'Plan détaillé' },
    { id: 'INTRO', label: 'Introduction' },
    { id: 'CHAPTER1-3', label: 'Chapitres' },
    { id: 'CONCLUSION', label: 'Conclusion' },
    { id: 'REVIEW', label: 'Relecture finale' },
    { id: 'FINAL', label: 'Soutenance' },
];

export default function StudentsPage() {
    const router = useRouter();
    const [memoires, setMemoires] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.getMyMemoire()
            .then(res => {
                setMemoires(res.memoires || []);
            })
            .catch(err => {
                console.error("Failed to fetch students data", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const getPhaseLabel = (phaseId: string) => {
        const phase = phasesList.find(p => p.id === phaseId);
        return phase ? phase.label : phaseId;
    };

    const isDelayed = (m: any) => m.progressPercent < 20 && m.phase !== 'TOPIC';
    const isCompleted = (m: any) => m.progressPercent === 100 || m.phase === 'FINAL';
    const isOnTrack = (m: any) => !isDelayed(m) && !isCompleted(m);

    const stats = {
        total: memoires.length,
        onTrack: memoires.filter(isOnTrack).length,
        delayed: memoires.filter(isDelayed).length,
        completed: memoires.filter(isCompleted).length,
    };

    const filteredMemoires = memoires.filter(m => {
        const fullName = `${m.student.firstName} ${m.student.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary">Mes Étudiants</h1>
                    <p className="text-text-secondary mt-1">{memoires.length} étudiant{memoires.length > 1 ? 's' : ''} suivi{memoires.length > 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Users, color: 'text-primary bg-primary/10' },
                    { label: 'En bonne voie', value: stats.onTrack, icon: TrendingUp, color: 'text-success bg-success/10' },
                    { label: 'En retard', value: stats.delayed, icon: AlertTriangle, color: 'text-warning bg-warning/10' },
                    { label: 'Terminés', value: stats.completed, icon: CheckCircle, color: 'text-info bg-info/10' },
                ].map((stat) => (
                    <div key={stat.label} className="card-premium p-4 flex items-center gap-3">
                        <BrandIcon icon={stat.icon} size={32} className={stat.color} iconClassName={stat.color.split(' ')[0]} />
                        <div>
                            <div className="text-xl font-bold text-primary">{stat.value}</div>
                            <div className="text-xs text-text-muted">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-4 py-3">
                    <Search className="w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Rechercher un étudiant par nom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1"
                    />
                </div>
                <button className="p-3 rounded-xl border border-border bg-white hover:bg-bg-light transition-colors">
                    <Filter className="w-4 h-4 text-text-secondary" />
                </button>
            </div>

            {/* Student Cards */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
            ) : filteredMemoires.length === 0 ? (
                <div className="card-premium p-12 text-center text-text-secondary">
                    <BrandIcon icon={Users} size={64} className="mx-auto mb-4 opacity-30 grayscale" />
                    <h3 className="text-xl font-bold text-primary mb-2">Aucun étudiant trouvé</h3>
                    <p>Aucun étudiant ne correspond à cette recherche ou aucun ne vous a été assigné.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMemoires.map((memoire, index) => {
                        const student = memoire.student;
                        return (
                            <motion.div
                                key={memoire.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="card-premium p-3 sm:p-5 hover:shadow-lg transition-all"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 cursor-pointer" onClick={() => router.push(`/dashboard/memoire/${memoire.id}`)}>
                                        {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4
                                                className="font-semibold text-primary hover:text-accent cursor-pointer transition-colors"
                                                onClick={() => router.push(`/dashboard/memoire/${memoire.id}`)}
                                            >
                                                {student.firstName} {student.lastName}
                                            </h4>
                                            {isDelayed(memoire) && (
                                                <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">En retard</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-text-muted mt-1 truncate">
                                            <span className="hidden sm:inline">{student.field || 'Filière inconnue'} — {student.university || 'Université inconnue'} · </span>
                                            <span>Phase : {getPhaseLabel(memoire.phase)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-3 sm:mt-0">
                                        <div className="text-right flex-shrink-0 space-y-1">
                                            <div className="text-lg font-bold text-primary leading-none">{memoire.progressPercent}%</div>
                                            <div className="w-20 sm:w-24 h-1.5 bg-border rounded-full overflow-hidden">
                                                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${memoire.progressPercent}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 items-center">
                                            <button
                                                onClick={() => router.push(`/dashboard/memoire/${memoire.id}`)}
                                                className="p-2 rounded-lg bg-bg-light hover:bg-primary/5 text-primary transition-colors flex items-center justify-center"
                                                title="Voir profil"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => router.push('/dashboard/messages')}
                                                className="p-2 rounded-lg bg-bg-light hover:bg-info/10 text-info transition-colors flex items-center justify-center"
                                                title="Message"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

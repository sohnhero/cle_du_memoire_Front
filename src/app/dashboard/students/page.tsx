'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, MagnifyingGlass as Search, Faders as Filter, Eye, ChatCircle as MessageCircle, TrendUp as TrendingUp, Warning as AlertTriangle, CheckCircle
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Users, branded: true },
                    { label: 'En bonne voie', value: stats.onTrack, icon: TrendingUp, branded: true },
                    { label: 'En retard', value: stats.delayed, icon: AlertTriangle, branded: true },
                    { label: 'Terminés', value: stats.completed, icon: CheckCircle, branded: true },
                ].map((stat) => {
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card-premium p-3 sm:p-6 flex flex-col justify-between overflow-hidden min-w-0"
                        >
                            <BrandIcon icon={stat.icon} size={36} className={stat.branded ? 'shadow-sm' : 'shadow-sm bg-info/10 text-info'} iconClassName={stat.branded ? undefined : '!text-info'} />
                            <div className="mt-3 sm:mt-4 min-w-0">
                                <p className="text-xl sm:text-3xl font-extrabold text-primary mb-1 truncate">{stat.value}</p>
                                <p className="text-[11px] sm:text-sm font-medium text-text-secondary truncate">{stat.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
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

            {/* Student List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : filteredMemoires.length === 0 ? (
                <div className="card-premium p-12 text-center text-text-secondary">
                    <BrandIcon icon={Users} size={64} className="mx-auto mb-4 opacity-30 grayscale" />
                    <h3 className="text-xl font-bold text-primary mb-2">Aucun étudiant trouvé</h3>
                    <p>Aucun étudiant ne correspond à cette recherche ou aucun ne vous a été assigné.</p>
                </div>
            ) : (
                <div className="card-premium p-4 sm:p-6">
                    <div className="space-y-1">
                        {filteredMemoires.map((memoire, index) => {
                            const student = memoire.student;
                            const studentName = `${student.firstName} ${student.lastName}`;
                            return (
                                <motion.div
                                    key={memoire.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-bg-light transition-colors cursor-pointer group"
                                    onClick={() => router.push(`/dashboard/memoire/${memoire.id}`)}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                                        {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-primary truncate group-hover:text-accent transition-colors">{studentName}</span>
                                            {isDelayed(memoire) && (
                                                <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0">En retard</span>
                                            )}
                                            {isCompleted(memoire) && (
                                                <span className="text-[10px] bg-info/10 text-info px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0">Terminé</span>
                                            )}
                                            {isOnTrack(memoire) && (
                                                <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-bold flex-shrink-0">Actif</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-text-muted truncate mt-0.5">
                                            <span className="hidden sm:inline">{student.field || 'Filière inconnue'} — </span>
                                            {getPhaseLabel(memoire.phase)}
                                        </div>
                                        <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden sm:max-w-[200px]">
                                            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${memoire.progressPercent}%` }} />
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-bold text-primary">{memoire.progressPercent}%</div>
                                        <div className="flex gap-1 mt-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/memoire/${memoire.id}`); }}
                                                className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-colors"
                                                title="Voir profil"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); router.push('/dashboard/messages'); }}
                                                className="p-1.5 rounded-lg hover:bg-info/10 text-text-muted hover:text-info transition-colors"
                                                title="Message"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Users, TrendUp as TrendingUp, CheckCircle,
    MagnifyingGlass as Search, Warning as AlertTriangle,
    FileText, UserCircle, CalendarBlank as Calendar,
    ArrowUpRight, Funnel as Filter, X, Eye,
    CircleNotch as Loader2,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { BrandIcon } from '@/components/BrandIcon';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';
import UserAvatar from '@/components/UserAvatar';
import { StatsCard } from '@/components/StatsCard';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ── Phase config ────────────────────────────────────────────────
const PHASES = [
    { id: 'TOPIC', label: 'Choix du Sujet', order: 0, color: 'bg-text-muted/20 text-text-secondary', dot: 'bg-text-muted' },
    { id: 'OUTLINE', label: 'Plan Détaillé', order: 1, color: 'bg-info/10 text-info', dot: 'bg-info' },
    { id: 'INTRO', label: 'Introduction', order: 2, color: 'bg-primary/10 text-primary', dot: 'bg-primary' },
    { id: 'CHAPTER1-3', label: 'Chapitres', order: 3, color: 'bg-warning/10 text-warning', dot: 'bg-warning' },
    { id: 'CONCLUSION', label: 'Conclusion', order: 4, color: 'bg-accent/10 text-accent', dot: 'bg-accent' },
    { id: 'REVIEW', label: 'Relecture Finale', order: 5, color: 'bg-success/10 text-success', dot: 'bg-success' },
    { id: 'FINAL', label: 'Soutenance', order: 6, color: 'bg-success/20 text-success', dot: 'bg-success' },
];

function getPhase(id: string) {
    return PHASES.find(p => p.id === id) || PHASES[0];
}

function daysUntil(dateStr?: string) {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ── Mini Progress Bar ───────────────────────────────────────────
function ProgressBar({ value, color = 'bg-accent' }: { value: number; color?: string }) {
    return (
        <div className="h-2 bg-bg-light rounded-full overflow-hidden w-full">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${color} rounded-full`}
            />
        </div>
    );
}


// ── Phase Distribution Bar ──────────────────────────────────────
function PhaseDistribution({ phaseCounts, total }: { phaseCounts: any[]; total: number }) {
    if (!total) return null;
    return (
        <div className="card-premium p-4 sm:p-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
                Distribution par Phase
            </h3>
            <div className="space-y-3">
                {PHASES.map(ph => {
                    const entry = phaseCounts.find((p: any) => p.phase === ph.id);
                    const count = entry?._count?.id || 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                        <div key={ph.id} className="flex items-center gap-3">
                            <div className="w-28 text-xs font-medium text-text-secondary truncate">{ph.label}</div>
                            <div className="flex-1 h-2.5 bg-bg-light rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full ${ph.dot} rounded-full`}
                                />
                            </div>
                            <div className="text-xs font-bold text-primary w-8 text-right">{count}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────────
export default function TrackingPage() {
    const router = useRouter();

    // Data
    const [memoires, setMemoires] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [phaseFilter, setPhaseFilter] = useState('ALL');
    const [coachFilter, setCoachFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Detail drawer
    const [selected, setSelected] = useState<any>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.getTrackingData(currentPage, 5, search, phaseFilter, coachFilter);
            setMemoires(res.memoires || []);
            setStats(res.stats);
            setCoaches(res.coaches || []);
            setTotalPages(res.totalPages || 1);
            setTotal(res.total || 0);
        } catch {
            toast.error('Erreur de chargement du suivi');
        } finally {
            setLoading(false);
        }
    }, [currentPage, phaseFilter, coachFilter, search]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else load();
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        load();
    }, [currentPage, phaseFilter, coachFilter]);

    const resetFilters = () => {
        setSearch('');
        setPhaseFilter('ALL');
        setCoachFilter('');
        setCurrentPage(1);
    };

    const hasFilter = search || phaseFilter !== 'ALL' || coachFilter;

    return (
        <div className="space-y-6 px-1 sm:px-0 max-w-full overflow-x-hidden pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-3 sm:px-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">Suivi Global des Mémoires</h1>
                    <p className="text-text-secondary mt-1 text-[10px] sm:text-sm font-semibold italic">Progression de tous les étudiants en temps réel</p>
                </div>
            </div>

            {/* Stats Row */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 px-2 sm:px-0">
                    <StatsCard label="Total" value={stats.totalMemoires} icon={Users} delay={0.05} />
                    <StatsCard label="Prog. Moy." value={`${stats.avgProgress}%`} icon={TrendingUp} delay={0.1} />
                    <StatsCard label="Finalisés" value={stats.completed} icon={CheckCircle} delay={0.15} />
                    <StatsCard label="Coachés" value={stats.withCoach} icon={UserCircle} delay={0.2} />
                    <StatsCard label="Sans Coach" value={stats.withoutCoach} icon={AlertTriangle} delay={0.25} iconColor="bg-warning" />
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6 px-2 sm:px-0">
                {/* Right (Main Content): Table - Moved up on mobile */}
                <div className="lg:col-span-2 order-1 lg:order-2 space-y-4 px-3 sm:px-0">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-accent/10 focus-within:border-accent transition-all min-w-0">
                            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Rechercher un étudiant ou un titre..."
                                className="bg-transparent text-sm outline-none flex-1 text-primary placeholder:text-text-muted"
                            />
                        </div>
                        <select
                            value={phaseFilter}
                            onChange={e => { setPhaseFilter(e.target.value); setCurrentPage(1); }}
                            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text-secondary shadow-sm outline-none hover:border-accent/30 appearance-none cursor-pointer min-w-[150px]"
                        >
                            <option value="ALL">Toutes les phases</option>
                            {PHASES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                        <select
                            value={coachFilter}
                            onChange={e => { setCoachFilter(e.target.value); setCurrentPage(1); }}
                            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text-secondary shadow-sm outline-none hover:border-accent/30 appearance-none cursor-pointer min-w-[160px]"
                        >
                            <option value="">Tous les coaches</option>
                            {coaches.map(c => (
                                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                            ))}
                        </select>
                        {hasFilter && (
                            <button onClick={resetFilters} className="p-2.5 rounded-xl border border-border bg-white text-text-muted hover:text-error hover:border-error/30 transition-colors shadow-sm">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Cards */}
                    <div className="card-premium overflow-hidden">
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : memoires.length === 0 ? (
                            <div className="py-20 text-center text-text-muted">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">Aucun mémoire trouvé</p>
                                {hasFilter && <button onClick={resetFilters} className="mt-2 text-xs text-accent hover:underline">Réinitialiser les filtres</button>}
                            </div>
                        ) : (
                            <div className="divide-y divide-border-light">
                                {memoires.map((m, idx) => {
                                    const ph = getPhase(m.phase);
                                    const days = daysUntil(m.student?.targetDefenseDate);
                                    const docsTotal = m.documents?.length || 0;
                                    const docsApproved = m.documents?.filter((d: any) => d.status === 'APPROVED').length || 0;
                                    const urgentDays = days !== null && days < 30;

                                    return (
                                        <div
                                            key={m.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-bg-light transition-all border-b border-border/5 group relative"
                                        >
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <div className="relative shrink-0">
                                                    <UserAvatar user={m.student} size="xl" className="shadow-sm uppercase ring-2 ring-white" />
                                                    {m.accompagnateur && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border border-white" />}
                                                </div>
                                                <div className="min-w-0 flex-1 sm:hidden">
                                                    <div className="font-bold text-sm text-primary truncate">{m.student?.firstName} {m.student?.lastName}</div>
                                                    <div className={`text-[9px] font-bold uppercase ${ph.color} w-fit px-1.5 py-0.5 rounded`}>{ph.label}</div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 w-full">
                                                <div className="hidden sm:flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-primary truncate hover:text-accent transition-colors cursor-pointer" onClick={() => setSelected(m)}>
                                                        {m.student?.firstName} {m.student?.lastName}
                                                    </span>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${ph.color} tracking-wider`}>
                                                        {ph.label}
                                                    </span>
                                                </div>

                                                <p className="text-[11px] sm:text-xs text-text-secondary line-clamp-2 sm:line-clamp-1 mb-2 sm:mb-2 group-hover:text-primary transition-colors pr-8 sm:pr-0">
                                                    « {m.title} »
                                                </p>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                    <div className="flex-1 flex items-center gap-2 min-w-0">
                                                        <div className="flex-1 h-1.5 bg-bg-light rounded-full overflow-hidden border border-border/10">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${m.progressPercent >= 80 ? 'bg-success' : m.progressPercent >= 40 ? 'bg-accent' : 'bg-warning'}`}
                                                                style={{ width: `${m.progressPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] sm:text-[11px] font-bold text-primary min-w-[28px]">{m.progressPercent}%</span>
                                                    </div>

                                                    <div className="flex items-center gap-x-3 gap-y-1 sm:gap-3 flex-wrap sm:flex-nowrap">
                                                        {m.accompagnateur ? (
                                                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-success font-bold whitespace-nowrap">
                                                                <UserCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                                                <span className="truncate max-w-[80px] sm:max-w-none">{m.accompagnateur.firstName}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-warning font-bold whitespace-nowrap">
                                                                <AlertTriangle className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                                                Sans coach
                                                            </span>
                                                        )}

                                                        <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-text-muted font-bold whitespace-nowrap">
                                                            <FileText className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                                            {docsTotal} docs
                                                        </span>

                                                        {days !== null && (
                                                            <span className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${urgentDays ? 'text-error animate-pulse' : 'text-text-muted'}`}>
                                                                <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                                                J-{days}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute top-4 right-4 sm:static flex items-center gap-1">
                                                <button
                                                    onClick={() => setSelected(m)}
                                                    className="p-2 rounded-xl bg-bg-light hover:bg-primary hover:text-white transition-all text-text-muted shadow-sm lg:opacity-0 lg:group-hover:opacity-100"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="border-t border-border-light bg-bg-light/30">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={total}
                                        itemsPerPage={5}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Left (Sidebar): Phase Distribution - Moved down on mobile */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                    {stats && (
                        <PhaseDistribution phaseCounts={stats.phaseCounts || []} total={stats.totalMemoires} />
                    )}
                </div>
            </div>

            {/* Detail Drawer */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
                            onClick={() => setSelected(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-border-light sticky top-0 bg-white z-10">
                                <h2 className="text-base font-bold text-primary">Détail du Mémoire</h2>
                                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-bg-light transition-colors text-text-muted">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 flex-1">
                                {/* Student Info */}
                                <div className="flex items-start gap-4">
                                    <UserAvatar user={selected.student} size="xl" className="shadow-sm uppercase" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-lg text-primary">{selected.student?.firstName} {selected.student?.lastName}</div>
                                        <div className="text-sm text-text-muted">{selected.student?.email}</div>
                                        {selected.student?.field && (
                                            <div className="text-xs text-text-secondary mt-1">{selected.student.field} — {selected.student.university || 'Université non renseignée'}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Memoire Info */}
                                <div className="p-4 rounded-2xl bg-bg-light/60 space-y-3 border border-border-light">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Mémoire</div>
                                    <p className="text-sm font-semibold text-primary italic">« {selected.title} »</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${getPhase(selected.phase).color}`}>
                                            {getPhase(selected.phase).label}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-primary">Progression</span>
                                        <span className="text-sm font-extrabold text-accent">{selected.progressPercent}%</span>
                                    </div>
                                    <ProgressBar
                                        value={selected.progressPercent}
                                        color={selected.progressPercent >= 80 ? 'bg-success' : selected.progressPercent >= 40 ? 'bg-accent' : 'bg-warning'}
                                    />

                                    {/* Phase stepper */}
                                    <div className="flex items-center justify-between mt-3">
                                        {PHASES.map((p) => {
                                            const ph = getPhase(selected.phase);
                                            const isDone = p.order < ph.order;
                                            const isCurrent = p.id === selected.phase;
                                            return (
                                                <div key={p.id} className="flex flex-col items-center gap-1">
                                                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${isDone ? 'bg-success' : isCurrent ? 'bg-accent ring-2 ring-accent/30 scale-125' : 'bg-border'}`} />
                                                    <span className="text-[9px] text-text-muted hidden lg:block">{p.label.split(' ')[0]}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Coach */}
                                <div className="p-4 rounded-2xl border border-border-light">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Accompagnateur</div>
                                    {selected.accompagnateur ? (
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={selected.accompagnateur} size="lg" className="uppercase" />
                                            <div>
                                                <div className="text-sm font-semibold text-primary">{selected.accompagnateur.firstName} {selected.accompagnateur.lastName}</div>
                                                <div className="text-xs text-success">Assigné</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-warning text-sm">
                                            <AlertTriangle className="w-4 h-4" />
                                            Aucun accompagnateur assigné
                                        </div>
                                    )}
                                </div>

                                {/* Dates */}
                                {selected.student?.targetDefenseDate && (
                                    <div className="p-4 rounded-2xl border border-border-light">
                                        <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Soutenance Prévue</div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-accent" />
                                            <span className="text-sm font-semibold text-primary">
                                                {new Date(selected.student.targetDefenseDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            {(() => {
                                                const d = daysUntil(selected.student.targetDefenseDate);
                                                if (d === null) return null;
                                                return (
                                                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${d < 30 ? 'bg-error/10 text-error' : d < 90 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                                                        {d > 0 ? `J-${d}` : 'Dépassé'}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Documents */}
                                <div className="p-4 rounded-2xl border border-border-light">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Documents</div>
                                    {selected.documents?.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {[
                                                { status: 'APPROVED', label: 'Approuvés', color: 'text-success' },
                                                { status: 'UNDER_REVIEW', label: 'En attente', color: 'text-warning' },
                                                { status: 'REJECTED', label: 'Rejetés', color: 'text-error' },
                                                { status: 'UPLOADED', label: 'Soumis', color: 'text-info' },
                                            ].map(s => {
                                                const count = selected.documents.filter((d: any) => d.status === s.status).length;
                                                if (count === 0) return null;
                                                return (
                                                    <div key={s.status} className="flex justify-between text-sm">
                                                        <span className="text-text-secondary">{s.label}</span>
                                                        <span className={`font-bold ${s.color}`}>{count}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="flex justify-between text-sm font-semibold text-primary border-t border-border-light pt-2 mt-2">
                                                <span>Total</span>
                                                <span>{selected.documents.length}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-muted">Aucun document soumis</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            if (selected.student?.id) {
                                                router.push(`/dashboard/users/${selected.student.id}`);
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                        Voir le profil utilisateur
                                    </button>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="w-full py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-light transition-colors"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

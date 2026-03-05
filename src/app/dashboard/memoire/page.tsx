'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, CheckCircle, Clock, Target, TrendUp as TrendingUp, WarningCircle as AlertCircle, ChatCircle as MessageCircle, X
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const phasesList = [
    { id: 'TOPIC', name: 'Choix du sujet', description: 'Sujet validé par l\'accompagnateur' },
    { id: 'OUTLINE', name: 'Plan détaillé', description: 'Plan de 3 chapitres validé' },
    { id: 'INTRO', name: 'Introduction', description: 'Introduction rédigée et approuvée' },
    { id: 'CHAPTER1-3', name: 'Chapitres', description: 'Revue de littérature et analyses' },
    { id: 'CONCLUSION', name: 'Conclusion', description: 'Synthèse et recommandations' },
    { id: 'REVIEW', name: 'Relecture finale', description: 'Corrections et mise en forme' },
    { id: 'FINAL', name: 'Soutenance', description: 'Préparation et simulation' },
];

export default function MemoirePage() {
    const { user } = useAuth();
    const [memoire, setMemoire] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        api.getMyMemoire()
            .then(res => {
                setMemoire(res.memoire);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load memoire progress:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!memoire) {
        return (
            <div className="card-premium p-12 text-center text-text-secondary">
                <BrandIcon icon={BookOpen} size={64} className="mx-auto mb-4 opacity-30 grayscale" />
                <h3 className="text-xl font-bold text-primary mb-2">Aucun mémoire en cours</h3>
                <p>Veuillez contacter votre accompagnateur ou administrateur.</p>
            </div>
        );
    }

    const currentPhaseIndex = Math.max(0, phasesList.findIndex(p => p.id === memoire.phase));
    // Progress is derived from the phase (source of truth for step-based completion)
    const phaseBasedProgress = Math.round(((currentPhaseIndex + 1) / phasesList.length) * 100);
    const progress = phaseBasedProgress > 0 ? phaseBasedProgress : (memoire?.progressPercent || 0);

    // Calculate dates (mocked for past phases based on creation for demo purposes, but real app might store phase transition dates)
    const phases = phasesList.map((p, index) => {
        let status = 'pending';
        let date = '—';
        if (index < currentPhaseIndex) {
            status = 'done';
            date = 'Terminé';
        } else if (index === currentPhaseIndex) {
            status = 'current';
            date = 'En cours';
        }
        return { ...p, status, date };
    });

    const completedPhases = phases.filter(p => p.status === 'done').length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary">Suivi du Mémoire</h1>
                    <p className="text-text-secondary mt-1 text-sm">Suivez votre progression étape par étape</p>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <Target className="w-4 h-4" /> Modifier mon sujet
                </button>
            </div>

            {/* Header Card */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card-premium p-6 sm:p-7 bg-primary overflow-hidden relative group">
                {/* Decorative background circle */}
                <div className="absolute -right-12 -top-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-700" />

                <div className="relative flex flex-col lg:flex-row gap-8 items-center">
                    <div className="flex-1 w-full text-center lg:text-left">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-4 ring-white/10 shrink-0">
                                <BookOpen className="w-8 h-8" weight="fill" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mb-2">
                                    {memoire.title}
                                </h2>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
                                    <span className="inline-flex items-center text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-white/10 text-white uppercase tracking-widest border border-white/10">
                                        Niveau: {user?.studyLevel}
                                    </span>
                                    {user?.targetDefenseDate && (
                                        <span className="inline-flex items-center text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-accent text-primary uppercase tracking-widest border border-accent/20">
                                            Soutenance en {new Date(user.targetDefenseDate).getFullYear()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="text-xl font-black text-success">{completedPhases}</div>
                                <div className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Terminées</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="text-xl font-black text-accent">1</div>
                                <div className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">En cours</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="text-xl font-black text-white/30">{phases.length - completedPhases - 1}</div>
                                <div className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Attente</div>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 relative">
                        <div className="relative w-36 h-36">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                                <motion.circle
                                    cx="50" cy="50" r="42" fill="none" stroke="#F9B700" strokeWidth="6" strokeLinecap="round"
                                    initial={{ strokeDasharray: '0 264' }}
                                    animate={{ strokeDasharray: `${progress * 2.64} 264` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white tracking-tighter">{progress}%</div>
                                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <EditMemoireModal
                        memoire={memoire}
                        onClose={() => setIsEditModalOpen(false)}
                        onUpdate={(updated) => {
                            setMemoire(updated);
                            setIsEditModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6 sm:p-7">
                <h3 className="text-base font-black text-primary mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
                        <TrendingUp className="w-5 h-5" weight="fill" />
                    </div>
                    Progression Détaillée
                </h3>
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-border" />

                    <div className="space-y-1">
                        {phases.map((phase, index) => (
                            <motion.div
                                key={phase.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                className={`relative flex items-start gap-4 p-4 rounded-xl transition-colors ${phase.status === 'current' ? 'bg-accent/5' : 'hover:bg-bg-light'}`}
                            >
                                <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${phase.status === 'done'
                                    ? 'bg-success text-white'
                                    : phase.status === 'current'
                                        ? 'bg-accent text-primary ring-4 ring-accent/20'
                                        : 'bg-white border text-text-muted'
                                    }`}>
                                    {phase.status === 'done' ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : phase.status === 'current' ? (
                                        <Target className="w-5 h-5" />
                                    ) : (
                                        <Clock className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`font-semibold text-sm ${phase.status === 'pending' ? 'text-text-muted' : 'text-primary'}`}>
                                            {phase.name}
                                        </h4>
                                        <span className={`text-xs ${phase.status === 'current' ? 'text-accent font-semibold' : 'text-text-muted'}`}>
                                            {phase.date}
                                        </span>
                                    </div>
                                    <p className={`text-xs mt-1 ${phase.status === 'pending' ? 'text-text-muted' : 'text-text-secondary'}`}>
                                        {phase.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Accompagnateur Notes */}
            {memoire.notes && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-premium p-6">
                    <h3 className="text-base font-black text-primary mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
                            <MessageCircle className="w-5 h-5" weight="fill" />
                        </div>
                        Notes de l'Accompagnateur
                    </h3>
                    <div className="p-4 rounded-xl bg-info/5 border border-info/10">
                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                            "{memoire.notes}"
                        </p>
                        {memoire.accompagnateur && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                                    {memoire.accompagnateur.firstName[0]}{memoire.accompagnateur.lastName[0]}
                                </div>
                                {memoire.accompagnateur.firstName} {memoire.accompagnateur.lastName}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function EditMemoireModal({ memoire, onClose, onUpdate }: { memoire: any, onClose: () => void, onUpdate: (updated: any) => void }) {
    const [title, setTitle] = useState(memoire.title);
    const [phase, setPhase] = useState(memoire.phase);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.updateMemoire(memoire.id, { title, phase });
            onUpdate(res.memoire);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-primary tracking-tight">Modifier mon sujet</h3>
                        <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/50 uppercase tracking-widest px-1">Titre du mémoire</label>
                            <textarea
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                rows={3}
                                className="w-full px-5 py-3.5 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all text-sm font-medium resize-none"
                                placeholder="Entrez le titre officiel de votre mémoire"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/50 uppercase tracking-widest px-1">Phase actuelle</label>
                            <select
                                value={phase}
                                onChange={e => setPhase(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm font-semibold cursor-pointer appearance-none"
                            >
                                {phasesList.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-text-muted px-1">Note: Votre choix sera examiné par votre accompagnateur.</p>
                        </div>

                        <div className="pt-4 grid grid-cols-2 gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-3.5 text-sm font-bold text-text-secondary hover:bg-bg-light rounded-2xl transition-colors">
                                Annuler
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary px-6 py-3.5 text-sm shadow-lg shadow-accent/20">
                                {loading ? 'Enregistrement...' : 'Mettre à jour'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

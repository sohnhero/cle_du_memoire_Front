'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Target, TrendingUp, AlertCircle, MessageCircle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'framer-motion';

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
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-primary mb-2">Aucun mémoire en cours</h3>
                <p>Veuillez contacter votre accompagnateur ou administrateur.</p>
            </div>
        );
    }

    const currentPhaseIndex = phasesList.findIndex(p => p.id === memoire.phase) || 0;
    const progress = memoire.progressPercent || 0;

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
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Suivi du Mémoire</h1>
                    <p className="text-text-secondary mt-1">Suivez votre progression étape par étape</p>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2"
                >
                    <Target className="w-4 h-4" /> Modifier mon sujet
                </button>
            </div>

            {/* Header Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-8 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02]">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-primary">{memoire.title}</h2>
                                <p className="text-sm text-text-secondary">{user?.field || 'Filière non renseignée'} — {user?.university || 'Université non renseignée'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-3 rounded-xl bg-white border border-border-light shadow-sm">
                                <div className="text-2xl font-bold text-success">{completedPhases}</div>
                                <div className="text-xs text-text-muted mt-1">Étapes terminées</div>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-white border border-border-light shadow-sm">
                                <div className="text-2xl font-bold text-accent">1</div>
                                <div className="text-xs text-text-muted mt-1">En cours</div>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-white border border-border-light shadow-sm">
                                <div className="text-2xl font-bold text-text-muted">{phases.length - completedPhases - 1}</div>
                                <div className="text-xs text-text-muted mt-1">Restantes</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-64 flex flex-col items-center justify-center">
                        <div className="relative w-36 h-36">
                            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                                <motion.circle
                                    cx="50" cy="50" r="40" fill="none" stroke="#F9B700" strokeWidth="8" strokeLinecap="round"
                                    initial={{ strokeDasharray: '0 251.2' }}
                                    animate={{ strokeDasharray: `${progress * 2.512} 251.2` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-3xl font-extrabold text-primary">{progress}%</div>
                                    <div className="text-xs text-text-muted">Complété</div>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-8">
                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
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
                                <div className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${phase.status === 'done'
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
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-premium p-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-info" />
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
            alert("Erreur lors de la mise à jour");
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

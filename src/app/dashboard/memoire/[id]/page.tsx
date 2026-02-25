'use client';

import React, { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, CheckCircle, Clock, Target, TrendingUp,
    MessageCircle, ArrowLeft, Save, User as UserIcon,
    FileText, Calendar as CalendarIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const phasesList = [
    { id: 'TOPIC', name: 'Choix du sujet' },
    { id: 'OUTLINE', name: 'Plan détaillé' },
    { id: 'INTRO', name: 'Introduction' },
    { id: 'CHAPTER1-3', name: 'Chapitres' },
    { id: 'CONCLUSION', name: 'Conclusion' },
    { id: 'REVIEW', name: 'Relecture finale' },
    { id: 'FINAL', name: 'Soutenance' },
];

export default function MemoireDetailCoachPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const router = useRouter();
    const { user } = useAuth();
    const [memoire, setMemoire] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        // We reuse getMyMemoire but on backend we need to make sure we can fetch specific one if id provided
        // For now, let's assume we fetch all and find the one. 
        // Better: Backend should have GET /memoires/:id
        loadData();
    }, [params.id]);

    const loadData = async () => {
        try {
            const res = await api.getMyMemoire();
            const found = res.memoires?.find((m: any) => m.id === params.id);
            if (found) {
                setMemoire(found);
                setProgress(found.progressPercent);
                setPhase(found.phase);
                setNotes(found.notes || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.updateMemoire(params.id, {
                progressPercent: progress,
                phase,
                notes
            });
            setMemoire(res.memoire);
            alert("Progression enregistrée !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;
    if (!memoire) return <div className="p-8 text-center text-text-secondary">Mémoire non trouvé.</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-bg-light rounded-xl transition-colors border border-border-light">
                    <ArrowLeft className="w-5 h-5 text-primary" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Détails de l'étudiant</h1>
                    <p className="text-text-secondary text-sm">Gérez la progression de {memoire.student.firstName} {memoire.student.lastName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Student Info & Form */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
                        <div className="flex items-start gap-4 mb-8 pb-6 border-b border-border-light">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                                {memoire.student.firstName[0]}{memoire.student.lastName[0]}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-primary">{memoire.student.firstName} {memoire.student.lastName}</h2>
                                <p className="text-sm text-text-secondary font-medium">{memoire.student.field || 'Filière non renseignée'}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success px-2 py-0.5 rounded-md">Activé</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-bg-light text-text-muted px-2 py-0.5 rounded-md">{memoire.student.university || 'Univ. Inconnue'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-primary">Progression Générale</label>
                                    <span className="text-lg font-extrabold text-accent">{progress}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" step="1"
                                    value={progress}
                                    onChange={(e) => setProgress(parseInt(e.target.value))}
                                    className="w-full h-2 bg-bg-light rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                                <div className="grid grid-cols-5 text-[10px] font-bold text-text-muted px-1">
                                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span className="text-right">100%</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-primary block">Phase Actuelle</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {phasesList.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPhase(p.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${phase === p.id
                                                ? 'bg-accent/10 border-accent shadow-sm'
                                                : 'bg-white border-border-light hover:border-accent/40 hover:bg-bg-light/50'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${phase === p.id ? 'bg-accent' : 'bg-border-dark'}`} />
                                                <span className={`text-xs font-bold ${phase === p.id ? 'text-primary' : 'text-text-secondary'}`}>{p.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-primary block">Notes de l'accompagnateur</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Partagez vos conseils, remarques ou points à améliorer ici..."
                                    rows={5}
                                    className="w-full p-4 rounded-2xl border border-border-light bg-bg-light focus:bg-white focus:border-info outline-none transition-all text-sm font-medium resize-none leading-relaxed"
                                />
                                <p className="text-[10px] text-text-muted">Ces notes sont visibles par l'élève en temps réel.</p>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-3 shadow-lg shadow-accent/20"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Enregistrement...' : 'Enregistrer la progression'}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Sidebar Stats / History */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6">
                        <h3 className="font-bold text-primary mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-accent" />
                            Récapitulatif
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-bg-light">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <FileText className="w-4 h-4 text-info" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Documents</div>
                                    <div className="text-sm font-bold text-primary">0 fichiers partagés</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-bg-light">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <CalendarIcon className="w-4 h-4 text-accent" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Dernière activité</div>
                                    <div className="text-sm font-bold text-primary">Aujourd'hui</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card-premium p-6">
                        <h3 className="font-bold text-primary mb-6 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-primary" />
                            Contacter l'étudiant
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed mb-6">
                            Si vous avez des questions urgentes ou si une étape nécessite une discussion de vive voix.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard/messages')}
                            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" /> Ouvrir le chat
                        </button>
                    </motion.div>

                    <div className="p-6 rounded-3xl bg-gradient-to-br from-primary to-primary-light text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2">Conseil Expert</h4>
                            <p className="text-xs text-white/80 leading-relaxed italic">
                                "La validation régulière des étapes par de petits feedbacks encourage l'étudiant et réduit l'anxiété liée à la rédaction."
                            </p>
                        </div>
                        <Target className="absolute -bottom-4 -right-4 w-20 h-20 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}

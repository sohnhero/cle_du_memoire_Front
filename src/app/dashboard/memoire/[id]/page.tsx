'use client';

import React, { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, CheckCircle, Clock, Target, TrendUp as TrendingUp, ChatCircle as MessageCircle, ArrowLeft, FloppyDisk as Save, User as UserIcon, FileText, CalendarBlank as CalendarIcon
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

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
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
    }, [params.id]);

    const loadData = async () => {
        try {
            const [res, docsRes] = await Promise.all([
                api.getMyMemoire().catch(() => ({ memoires: [], memoire: null })),
                api.getDocuments().catch(() => ({ documents: [] }))
            ]);

            // Coach: search in memoires array; Student: use singular memoire
            let found = res.memoires?.find((m: any) => m.id === params.id);
            if (!found && (res as any).memoire?.id === params.id) {
                found = (res as any).memoire;
            }

            if (found) {
                setMemoire(found);
                // Always derive progress from phase (source of truth)
                const phaseIndex = phasesList.findIndex(p => p.id === found.phase);
                const phaseBasedProgress = phaseIndex >= 0 ? Math.round(((phaseIndex + 1) / phasesList.length) * 100) : 0;
                setProgress(phaseBasedProgress > 0 ? phaseBasedProgress : (found.progressPercent || 0));
                setPhase(found.phase);
                setNotes(found.notes || '');

                const studentDocs = docsRes.documents?.filter((d: any) => d.memoireId === params.id) || [];
                setDocuments(studentDocs);
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
            setMemoire((prev: any) => ({ ...prev, ...res.memoire, student: res.memoire.student || prev?.student }));
            toast.success("Progression enregistrée !");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;
    if (!memoire) return <div className="p-8 text-center text-text-secondary">Mémoire non trouvé.</div>;

    return (
        <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-0">
                <button onClick={() => router.back()} className="p-2 sm:p-2.5 hover:bg-bg-light rounded-xl transition-all border border-border-light shadow-sm bg-white active:scale-95">
                    <ArrowLeft className="w-5 h-5 text-primary" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">Suivi de l'étudiant</h1>
                    <p className="text-text-secondary text-[10px] sm:text-sm font-medium truncate">Gérez la progression de {memoire.student?.firstName || ''} {memoire.student?.lastName || ''}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* Left: Student Info & Form */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-4 sm:p-6 shadow-sm border border-border/50">
                        <div className="flex items-center gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border/50">
                            <div className="relative flex-shrink-0">
                                {memoire.student?.avatar ? (
                                    <img src={memoire.student.avatar} alt={`${memoire.student?.firstName} ${memoire.student?.lastName}`} className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg border-2 border-white ring-1 ring-border/20" />
                                ) : (
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg border-2 border-white ring-1 ring-border/20">
                                        {memoire.student?.firstName?.[0] || '?'}{memoire.student?.lastName?.[0] || '?'}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-success rounded-full border-2 border-white ring-1 ring-border/20" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base sm:text-2xl font-extrabold text-primary truncate">{memoire.student?.firstName || 'Étudiant'} {memoire.student?.lastName || ''}</h2>
                                <p className="text-xs sm:text-base text-text-secondary font-semibold truncate mt-0.5">{memoire.student?.field || 'Filière non renseignée'}</p>
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 flex-wrap">
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-success/10 text-success px-2 py-0.5 rounded-lg border border-success/20">Actif</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-bg-light text-text-muted px-2 py-0.5 rounded-lg border border-border/50 truncate max-w-[150px]">{memoire.student?.university || 'Univ. Inconnue'}</span>
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
                                <label className="text-xs sm:text-sm font-bold text-primary block uppercase tracking-tight">Phase de progression</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {phasesList.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPhase(p.id)}
                                            className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${phase === p.id
                                                ? 'bg-accent/10 border-accent shadow-sm'
                                                : 'bg-white border-border-light hover:border-accent/30 hover:bg-bg-light/30'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${phase === p.id ? 'bg-accent shadow-[0_0_8px_rgba(255,107,107,0.4)]' : 'bg-border-dark'}`} />
                                                <span className={`text-[11px] sm:text-xs font-bold truncate ${phase === p.id ? 'text-primary' : 'text-text-secondary'}`}>{p.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs sm:text-sm font-bold text-primary block uppercase tracking-tight">Commentaires & Remarques</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Partagez vos conseils, remarques ou points à améliorer ici..."
                                    rows={4}
                                    className="w-full p-4 rounded-2xl border border-border-light bg-bg-light/50 focus:bg-white focus:border-accent outline-none transition-all text-xs sm:text-sm font-medium resize-none leading-relaxed shadow-inner"
                                />
                                <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium bg-bg-light/30 p-2 rounded-lg border border-border/10">
                                    <Clock className="w-3 h-3 text-accent" />
                                    Ces notes sont synchronisées en temps réel avec l'étudiant.
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full btn-primary py-3.5 sm:py-4 flex items-center justify-center gap-3 shadow-lg shadow-accent/20 active:scale-[0.98] transition-all"
                            >
                                <Save className="w-5 h-5" />
                                <span className="font-bold">{saving ? 'Enregistrement...' : 'Mettre à jour le suivi'}</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Sidebar Stats / History */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-premium p-4 sm:p-6">
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
                                    <div className="text-sm font-bold text-primary">{documents.length} fichiers partagés</div>
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

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card-premium p-4 sm:p-6">
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

                    <div className="p-6 rounded-3xl bg-primary text-white shadow-xl relative overflow-hidden group">
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

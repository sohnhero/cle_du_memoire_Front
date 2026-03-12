'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
    Package, BookOpen, FileText, ChatCircle as MessageCircle, TrendUp as TrendingUp, Users,
    Clock, Warning as AlertTriangle, CheckCircle, ChartBar as BarChart3, Pulse as Activity, ShieldCheck as Shield,
    SignOut as LogoutIcon, UserCircle, Gear, MagnifyingGlass as Search, Bell,
    Eye, ArrowUpRight, CalendarBlank as CalendarIcon, CaretRight as ChevronRight,
    Plus, FilePlus, SignIn as LogIn, User
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { StatsCard } from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';


// ==================== STUDENT DASHBOARD ====================
function StudentDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [memoire, setMemoire] = useState<any>(null);
    const [stats, setStats] = useState({ activePacks: 0, documents: 0, unreadMessages: 0 });
    const [nextEvent, setNextEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const [memoireRes, subsRes, docsRes, convsRes, nextEventRes] = await Promise.allSettled([
                    api.getMyMemoire(),
                    api.getMySubscriptions(),
                    api.getDocuments(),
                    api.getConversations(),
                    api.getNextEvent(),
                ]);

                if (memoireRes.status === 'fulfilled') setMemoire(memoireRes.value.memoire);
                if (nextEventRes.status === 'fulfilled') setNextEvent(nextEventRes.value.event);

                const activePacks = subsRes.status === 'fulfilled'
                    ? subsRes.value.subscriptions.filter((s: any) => s.status === 'ACTIVE' || s.status === 'PAID').length
                    : 0;
                const documents = docsRes.status === 'fulfilled' ? docsRes.value.documents.length : 0;

                // Fix: Properly sum unread counts from all conversations
                const unreadMessages = convsRes.status === 'fulfilled'
                    ? convsRes.value.conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || (c.lastMessage && !c.lastMessage.isRead && c.lastMessage.senderId !== user?.id ? 1 : 0)), 0)
                    : 0;

                setStats({ activePacks, documents, unreadMessages });
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();

        // Poll memoire every 30s for dynamic coach assignment updates
        const coachPoll = setInterval(async () => {
            try {
                const res = await api.getMyMemoire();
                if (res?.memoire) setMemoire(res.memoire);
            } catch { }
        }, 30000);

        return () => clearInterval(coachPoll);
    }, [user?.id]);

    const phasesList = [
        { id: 'TOPIC', label: 'Choix du sujet' },
        { id: 'OUTLINE', label: 'Plan détaillé' },
        { id: 'INTRO', label: 'Introduction' },
        { id: 'CHAPTER1-3', label: 'Chapitres' },
        { id: 'CONCLUSION', label: 'Conclusion' },
        { id: 'REVIEW', label: 'Relecture finale' },
        { id: 'FINAL', label: 'Soutenance' },
    ];

    const currentPhaseIndex = memoire ? Math.max(0, phasesList.findIndex(p => p.id === memoire.phase)) : 0;
    const phaseBasedProgress = Math.round(((currentPhaseIndex + 1) / phasesList.length) * 100);
    const progress = phaseBasedProgress > 0 ? phaseBasedProgress : (memoire?.progressPercent || 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end pb-2 border-b border-border/10">
                <div>
                    <h1 className="text-2xl font-black text-primary tracking-tight">Mon Espace</h1>
                    <p className="text-text-secondary text-xs font-semibold mt-1">
                        Ravi de vous revoir, <span className="text-accent">{user?.firstName}</span> 👋
                    </p>
                </div>
                {user?.studyLevel && (
                    <span className="hidden sm:inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary text-white uppercase tracking-wider shadow-sm">
                        {user.studyLevel}
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <StatsCard
                    label="Mes Packs"
                    value={loading ? '…' : stats.activePacks}
                    icon={Package}
                    delay={0.1}
                />
                <StatsCard
                    label="Documents"
                    value={loading ? '…' : stats.documents}
                    icon={FileText}
                    delay={0.2}
                />
                <StatsCard
                    label="Conversations"
                    value={loading ? '…' : (stats.unreadMessages > 0 ? `${stats.unreadMessages} non lus` : stats.unreadMessages)}
                    icon={MessageCircle}
                    delay={0.3}
                    valueColor={stats.unreadMessages > 0 ? "text-accent" : "text-primary"}
                />
                <StatsCard
                    label="Progression"
                    value={loading ? '…' : (memoire ? `${progress}%` : '0%')}
                    icon={TrendingUp}
                    delay={0.4}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Progress Card */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card-premium p-4 cursor-pointer hover:border-accent/30 transition-all flex flex-col h-full group"
                        onClick={() => router.push('/dashboard/memoire')}
                    >
                        <div className="flex justify-between items-start mb-5">
                            <h3 className="text-base font-black text-primary flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent ring-4 ring-accent/5 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-5 h-5" weight="fill" />
                                </div>
                                Suivi du Mémoire
                            </h3>
                            {user?.targetDefenseDate && (
                                <div className="text-right">
                                    <span className="block text-xs text-text-muted">Soutenance prévue</span>
                                    <span className="block text-sm font-bold text-accent">
                                        JJ -  {Math.ceil((new Date(user.targetDefenseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                                    </span>
                                </div>
                            )}
                        </div>

                        {memoire ? (
                            <>
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-text-primary line-clamp-1 flex-1 mr-4">{memoire.title}</span>
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.5, type: 'spring' }}
                                            className="text-sm font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md"
                                        >
                                            {progress}%
                                        </motion.span>
                                    </div>

                                    <div className="h-3 bg-bg-light rounded-full overflow-hidden relative shadow-inner mb-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                                            className="absolute top-0 left-0 h-full bg-accent rounded-full"
                                        />
                                        {/* Shimmer effect inside the progress bar */}
                                        <motion.div
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100vw' }}
                                            transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: 1 }}
                                            className="absolute top-0 left-0 w-1/3 h-full hidden z-10"
                                        />
                                    </div>

                                    {/* Mini Stepper Dots */}
                                    <div className="flex justify-between items-center px-1 relative h-6">
                                        {phasesList.map((item, index) => {
                                            const isPast = index < currentPhaseIndex;
                                            const isCurrent = index === currentPhaseIndex;
                                            return (
                                                <div key={item.id} className="relative group/dot cursor-help w-3 h-3 flex items-center justify-center">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: isCurrent ? 1.3 : 1 }}
                                                        transition={{ delay: 0.5 + (index * 0.1), type: 'spring' }}
                                                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${isPast ? 'bg-success' :
                                                            isCurrent ? 'bg-accent shadow-[0_0_8px_rgba(255,107,107,0.6)] ring-2 ring-accent/30' :
                                                                'bg-border'
                                                            }`}
                                                    />
                                                    {/* Tooltip on hover - isolated using named group to avoid parent card conflict */}
                                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-medium py-1.5 px-3 rounded-md opacity-0 group-hover/dot:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-lg translate-y-2 group-hover/dot:translate-y-0">
                                                        {item.label}
                                                        {/* Tooltip Arrow */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-primary" />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Current Phase Highlight */}
                                <div className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors">
                                    <div>
                                        <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">Phase Actuelle</span>
                                        <span className="text-sm font-semibold text-primary">{phasesList[currentPhaseIndex]?.label || 'Démarrage'}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary text-white shadow-sm shadow-primary/20 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5" weight="fill" />
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 text-center">
                                    <span className="text-xs font-bold text-accent hover:underline">Voir les détails du suivi →</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-text-secondary h-full flex items-center justify-center">
                                Chargement de votre progression....
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Middle Column: Next Deadline & Accompagnateur */}
                <div className="space-y-6">
                    {/* Next Deadline Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className={`card-premium p-4 cursor-pointer overflow-hidden relative group ${nextEvent?.type === 'DEADLINE' ? 'border-error/20 bg-error/[0.01]' : 'hover:border-accent/30'}`}
                        onClick={() => router.push('/dashboard/calendar')}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white shadow-sm shadow-primary/20 transition-transform group-hover:scale-110`}>
                                    <Clock className="w-4 h-4" weight="fill" />
                                </div>
                                Prochaine Échéance
                            </h3>
                        </div>

                        {nextEvent ? (
                            <div>
                                <div className="text-lg font-bold text-primary mb-1 truncate">{nextEvent.title}</div>
                                <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
                                    <AlertTriangle className={`w-3 h-3 ${new Date(nextEvent.date).getTime() - Date.now() < 86400000 * 2 ? 'text-error' : 'text-warning'}`} />
                                    <span>{new Date(nextEvent.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${nextEvent.type === 'DEADLINE' ? 'bg-error text-white' : 'bg-accent/20 text-accent'}`}>
                                        {nextEvent.type === 'DEADLINE' ? 'Urgent' : 'Rappel'}
                                    </span>
                                    <span className="text-xs font-medium text-text-muted group-hover:text-accent transition-colors">Voir le calendrier →</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-2">
                                <p className="text-sm text-text-secondary italic">Aucun événement prévu</p>
                                <button className="mt-4 text-xs font-bold text-accent hover:underline">+ Ajouter un rappel</button>
                            </div>
                        )}

                        {/* Decorative background icon */}
                        <CalendarIcon className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/[0.03] group-hover:text-accent/[0.05] transition-colors" />
                    </motion.div>

                    {memoire?.accompagnateur && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="card-premium p-4 group"
                        >
                            <h3 className="text-base font-black text-primary mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20 group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5" weight="fill" />
                                </div>
                                Accompagnateur
                            </h3>
                            <div className="flex items-center gap-3">
                                {memoire.accompagnateur.avatar ? (
                                    <img src={memoire.accompagnateur.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold">
                                        {memoire.accompagnateur.firstName[0]}{memoire.accompagnateur.lastName[0]}
                                    </div>
                                )}
                                <div>
                                    <div className="font-semibold text-primary">{memoire.accompagnateur.firstName} {memoire.accompagnateur.lastName}</div>
                                    <div className="text-xs text-success flex items-center gap-1">
                                        <div className="w-2 h-2 bg-success rounded-full" />
                                        En ligne
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => router.push('/dashboard/messages')} className="w-full mt-4 py-2.5 rounded-2xl bg-primary/5 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all">
                                Envoyer un message
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Actions Rapides */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="card-premium p-4 group"
                    >
                        <h3 className="text-base font-black text-primary mb-4 flex items-center gap-3">
                            Actions Rapides
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Envoyer un document', icon: FileText, color: 'bg-accent', href: '/dashboard/documents' },
                                { label: 'Message à l\'accompagnateur', icon: MessageCircle, color: 'bg-info', href: '/dashboard/messages' },
                                { label: 'Voir ma progression', icon: TrendingUp, color: 'bg-success', href: '/dashboard/memoire' },
                                { label: 'Mes packs', icon: Package, color: 'bg-primary', href: '/dashboard/packs' },
                            ].map((action) => (
                                <button key={action.label} onClick={() => router.push(action.href)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-bg-light transition-colors text-left group">
                                    <div className={`w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/10`}>
                                        <action.icon className={`w-5 h-5 text-white`} weight="fill" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary group-hover:text-primary">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

// ==================== ACCOMPAGNATEUR DASHBOARD ====================
function AccompagnateurDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [memoires, setMemoires] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getMyMemoire().catch(() => ({ memoires: [] })),
            api.getDocuments().catch(() => ({ documents: [] })),
            api.getConversations().catch(() => ({ conversations: [] }))
        ]).then(([memRes, docRes, convRes]) => {
            setMemoires(memRes.memoires || []);
            setDocuments(docRes.documents || []);
            setConversations(convRes.conversations || []);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch dashboard data", err);
            setLoading(false);
        });
    }, []);

    const pendingDocuments = documents.filter(d => d.status === 'UPLOADED' || d.status === 'UNDER_REVIEW');
    const totalUnreadMessages = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

    const phasesList = [
        { id: 'TOPIC', label: 'Choix du sujet' },
        { id: 'OUTLINE', label: 'Plan détaillé' },
        { id: 'INTRO', label: 'Introduction' },
        { id: 'CHAPTER1-3', label: 'Chapitres' },
        { id: 'CONCLUSION', label: 'Conclusion' },
        { id: 'REVIEW', label: 'Relecture finale' },
        { id: 'FINAL', label: 'Soutenance' },
    ];

    const getPhaseLabel = (phaseId: string) => {
        const phase = phasesList.find(p => p.id === phaseId);
        return phase ? phase.label : phaseId;
    };

    return (
        <div className="w-full max-w-full overflow-hidden space-y-6 max-w-7xl mx-auto px-1 sm:px-0">
            <div className="px-3 sm:px-0 flex justify-between items-end pb-2 border-b border-border/10">
                <div>
                    <h1 className="text-2xl font-black text-primary tracking-tight">Accompagnement</h1>
                    <p className="text-text-secondary mt-1 text-xs font-semibold">Gérez vos étudiants et leurs progressions</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-text-muted bg-white px-3 py-1 rounded-lg border border-border/50">
                    <span className="w-2 h-2 rounded-full bg-success"></span> Coach Certifié
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-0">
                <StatsCard label="Étudiants" value={loading ? '…' : memoires.length} icon={Users} delay={0.1} />
                <StatsCard label="À évaluer" value={loading ? '…' : pendingDocuments.length} icon={FileText} delay={0.2} />
                <StatsCard label="Messages non lus" value={loading ? '…' : totalUnreadMessages} icon={MessageCircle} delay={0.3} valueColor={totalUnreadMessages > 0 ? "text-accent" : "text-primary"} />
                <StatsCard label="Progression moyenne" value={loading ? '…' : `${memoires.length > 0 ? Math.round(memoires.reduce((acc, m) => acc + m.progressPercent, 0) / memoires.length) : 0}%`} icon={TrendingUp} delay={0.4} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 px-3 sm:px-0 overflow-hidden">
                {/* Students List */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 card-premium p-4 group"
                >
                    <h3 className="text-base font-black text-primary mb-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" weight="fill" />
                        </div>
                        Mes Étudiants
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : memoires.length === 0 ? (
                        <div className="text-center py-10 text-text-secondary">
                            Aucun étudiant ne vous a encore été assigné.
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {memoires.map((memoire) => {
                                const studentName = `${memoire.student.firstName} ${memoire.student.lastName}`;
                                return (
                                    <div key={memoire.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl hover:bg-bg-light transition-all border border-transparent hover:border-border/50 cursor-pointer group min-w-0" onClick={() => router.push(`/dashboard/memoire/${memoire.id}`)}>
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-sm ring-2 ring-white">
                                                {memoire.student.firstName?.[0]}{memoire.student.lastName?.[0]}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border border-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                <span className="font-bold text-xs sm:text-sm text-primary truncate max-w-[140px] sm:max-w-none group-hover:text-accent transition-colors leading-tight">{studentName}</span>
                                                <span className="px-1.5 py-0.5 rounded-md bg-success/10 text-success text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">Actif</span>
                                            </div>
                                            <div className="text-[9px] sm:text-xs text-text-muted truncate mt-0.5 font-medium">{memoire.student.field || 'Filière'} — {getPhaseLabel(memoire.phase)}</div>
                                            <div className="mt-2 h-1.2 bg-bg-light rounded-full overflow-hidden sm:max-w-[240px] border border-border/10">
                                                <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${memoire.progressPercent}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col items-end justify-center min-w-[35px] sm:min-w-[50px] ml-auto">
                                            <div className="text-[11px] sm:text-sm font-extrabold text-primary leading-none">{memoire.progressPercent}%</div>
                                            <div className="text-[8px] sm:text-[9px] font-bold text-text-muted mt-1 uppercase tracking-tight opacity-70 leading-none">Prog.</div>
                                        </div>
                                        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-bg-light text-text-muted opacity-0 group-hover:opacity-100 transition-all ml-1 flex-shrink-0">
                                            <Eye className="w-4 h-4" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Required Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card-premium p-4 group"
                >
                    <h3 className="text-base font-black text-primary mb-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20 group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-5 h-5" weight="fill" />
                        </div>
                        Actions Requises
                    </h3>
                    <div className="space-y-3.5 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {pendingDocuments.length === 0 && totalUnreadMessages === 0 ? (
                            <div className="text-center py-6 text-text-secondary font-medium text-xs">
                                Tout est à jour !
                            </div>
                        ) : (
                            <>
                                {pendingDocuments.slice(0, 4).map((doc, i) => (
                                    <div key={`doc-${doc.id}`} onClick={() => router.push('/dashboard/documents')} className="p-3 sm:p-3.5 rounded-2xl bg-bg-light/50 border border-border/5 hover:bg-warning/5 hover:border-warning/20 transition-all cursor-pointer group min-w-0">
                                        <div className="flex items-start justify-between gap-3 min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] sm:text-sm font-bold text-primary truncate group-hover:text-warning transition-colors leading-tight break-all">Évaluer : {doc.filename}</div>
                                                <div className="text-[10px] sm:text-xs text-text-muted mt-1 truncate font-medium">
                                                    De {doc.uploader?.firstName} {doc.uploader?.lastName}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-[8px] sm:text-[9px] font-extrabold text-warning bg-warning/10 px-2 py-0.5 rounded-md border border-warning/20 uppercase tracking-tighter self-start">DOC</div>
                                        </div>
                                    </div>
                                ))}
                                {conversations.filter(c => c.unreadCount > 0).slice(0, 3).map((conv, i) => {
                                    const otherUser = conv.participant1Id === user?.id ? conv.participant2 : conv.participant1;
                                    return (
                                        <div key={`conv-${conv.id}`} onClick={() => router.push('/dashboard/messages')} className="p-3 sm:p-3.5 rounded-2xl bg-bg-light/50 border border-border/5 border-border/5 hover:bg-error/5 hover:border-error/20 transition-all cursor-pointer group min-w-0">
                                            <div className="flex items-start justify-between gap-3 min-w-0">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[11px] sm:text-sm font-bold text-primary truncate group-hover:text-error transition-colors leading-tight">Messages non lus</div>
                                                    <div className="text-[10px] sm:text-xs text-text-muted mt-1 truncate font-medium">De {otherUser?.firstName} ({conv.unreadCount})</div>
                                                </div>
                                                <div className="flex-shrink-0 text-[8px] sm:text-[9px] font-extrabold text-error bg-error/10 px-2 py-0.5 rounded-md border border-error/20 uppercase tracking-tighter self-start">CHAT</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAdminStats()
            .then(res => {
                setStats(res.stats);
                setRecentActivity(res.recentActivity || []);
            })
            .catch(err => console.error('Admin stats error:', err))
            .finally(() => setLoading(false));
    }, []);

    const actionConfig: Record<string, { icon: any; color: string; bg: string; badge: string }> = {
        LOGIN: { icon: LogIn, color: 'text-success', bg: 'bg-success/10', badge: 'Connexion' },
        LOGOUT: { icon: Clock, color: 'text-text-muted', bg: 'bg-border/20', badge: 'Déconnexion' },
        UPLOAD: { icon: FileText, color: 'text-info', bg: 'bg-info/10', badge: 'Document' },
        REVIEW: { icon: Shield, color: 'text-accent', bg: 'bg-accent/10', badge: 'Révision' },
        REGISTER: { icon: User, color: 'text-primary', bg: 'bg-primary/10', badge: 'Inscription' },
        MESSAGE: { icon: MessageCircle, color: 'text-info', bg: 'bg-info/10', badge: 'Message' },
        LOGIN_FAILED: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10', badge: 'Échec' },
        USER_UPDATE: { icon: User, color: 'text-warning', bg: 'bg-warning/10', badge: 'Modif' },
        DOCUMENT_UPDATE: { icon: FileText, color: 'text-warning', bg: 'bg-warning/10', badge: 'Modif Doc' },
    };

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes}min`;
        if (hours < 24) return `Il y a ${hours}h`;
        return `Il y a ${days}j`;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end pb-2 border-b border-border/10">
                <div>
                    <h1 className="text-2xl font-black text-primary tracking-tight">Administration</h1>
                    <p className="text-text-secondary mt-1 text-xs font-semibold">Performance et gestion de la plateforme</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-accent bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10 uppercase tracking-widest">
                    <Shield className="w-3.5 h-3.5" weight="fill" /> Super Admin
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatsCard label="Utilisateurs" value={stats?.totalUsers ?? '—'} icon={Users} delay={0.1} />
                        <StatsCard label="Abonnements actifs" value={stats?.activeSubscriptions ?? '—'} icon={Package} delay={0.2} />
                        <StatsCard label="Documents" value={stats?.totalDocuments ?? '—'} icon={FileText} delay={0.3} />
                        <StatsCard label="Messages" value={stats?.totalMessages ?? '—'} icon={MessageCircle} delay={0.4} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        <StatsCard label="Étudiants" value={stats?.totalStudents ?? '—'} icon={Users} delay={0.5} />
                        <StatsCard label="Accompagnateurs" value={stats?.totalAccompagnateurs ?? '—'} icon={BookOpen} delay={0.6} />
                        <StatsCard label="Packs total" value={stats?.totalPacks ?? '—'} icon={Shield} delay={0.7} className="col-span-2 sm:col-span-1" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="lg:col-span-2 card-premium p-4 group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-black text-primary flex items-center gap-3">
                                    Activité Récente
                                </h3>
                                <button onClick={() => router.push('/dashboard/logs')} className="text-xs font-black text-accent uppercase tracking-wider hover:underline">
                                    Journal complet →
                                </button>
                            </div>

                            {recentActivity.length === 0 ? (
                                <div className="py-12 text-center text-text-muted text-sm">Aucune activité récente</div>
                            ) : (
                                <div className="relative pt-2">
                                    <div className="absolute left-[27px] top-2 bottom-0 w-px bg-border-light z-0" />
                                    <div className="space-y-5 relative z-10">
                                        {recentActivity.slice(0, 8).map((item, i) => {
                                            const cfg = actionConfig[item.action] || actionConfig.LOGIN;
                                            const Icon = cfg.icon;
                                            return (
                                                <div key={item.id || i} className="flex gap-4">
                                                    <div className={`w-[54px] h-[54px] rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm shadow-primary/10 bg-primary ring-4 ring-primary/5`}>
                                                        <Icon className={`w-5 h-5 text-white`} weight="fill" />
                                                    </div>
                                                    <div className="flex-1 pb-1 flex items-center justify-between gap-2 min-w-0">
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold text-primary mb-0.5 truncate">
                                                                {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Utilisateur inconnu'}
                                                                <span className="ml-1 font-normal text-text-secondary">— {item.action.replace('_', ' ').toLowerCase()}</span>
                                                            </div>
                                                            {item.details && (
                                                                <div className="text-xs text-text-muted truncate">{item.details}</div>
                                                            )}
                                                            <div className="text-xs font-medium text-text-muted flex items-center gap-1 mt-0.5">
                                                                <Clock className="w-3 h-3" /> {timeAgo(item.createdAt)}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-bg-light px-2.5 py-1 rounded-md text-text-secondary border border-border/50 flex-shrink-0 hidden sm:block">
                                                            {cfg.badge}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Links Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="card-premium p-4 group"
                        >
                            <h3 className="text-base font-black text-primary mb-4 flex items-center gap-3">
                                Accès Rapides
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Gérer les utilisateurs', icon: Users, href: '/dashboard/users', color: 'text-primary', bg: 'bg-primary/10' },
                                    { label: 'Packs & Abonnements', icon: Package, href: '/dashboard/packs-admin', color: 'text-accent', bg: 'bg-accent/10' },
                                    { label: 'Documents soumis', icon: FileText, href: '/dashboard/documents', color: 'text-info', bg: 'bg-info/10' },
                                    { label: 'Ressources pédagogiques', icon: BookOpen, href: '/dashboard/resources', color: 'text-success', bg: 'bg-success/10' },
                                    { label: 'Journaux d\'activité', icon: Activity, href: '/dashboard/logs', color: 'text-warning', bg: 'bg-warning/10' },
                                    { label: 'Calendrier & événements', icon: CalendarIcon, href: '/dashboard/calendar', color: 'text-primary', bg: 'bg-primary/10' },
                                ].map(item => (
                                    <button
                                        key={item.href}
                                        onClick={() => router.push(item.href)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-light transition-colors text-left group"
                                    >
                                        <div className={`w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/10`}>
                                            <item.icon className={`w-4.5 h-4.5 text-white`} weight="fill" />
                                        </div>
                                        <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{item.label}</span>
                                        <ChevronRight className="w-4 h-4 text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
}

// ==================== MAIN DASHBOARD PAGE ====================
export default function DashboardPage() {
    const { user } = useAuth();

    if (!user) return null;

    switch (user.role) {
        case 'STUDENT':
            return <StudentDashboard />;
        case 'ACCOMPAGNATEUR':
            return <AccompagnateurDashboard />;
        case 'ADMIN':
            return <AdminDashboard />;
        default:
            return <StudentDashboard />;
    }
}

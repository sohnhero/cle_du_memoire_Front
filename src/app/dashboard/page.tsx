'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
    Package, BookOpen, FileText, ChatCircle as MessageCircle, TrendUp as TrendingUp, Users,
    Clock, Warning as AlertTriangle, CheckCircle, ChartBar as BarChart3, Pulse as Activity, ShieldCheck as Shield,
    Eye, ArrowUpRight, CalendarBlank as Calendar, CaretRight as ChevronRight
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import LoadingSpinner from '@/components/LoadingSpinner';

// ==================== STATS CARD ====================
function StatsCard({ icon: Icon, label, value, change, color, delay = 0 }: {
    icon: any; label: string; value: string | number;
    change?: string; color: string; delay?: number;
}) {
    const colorMap: Record<string, string> = {
        accent: 'bg-accent/10 text-accent',
        info: 'bg-info/10 text-info',
        success: 'bg-success/10 text-success',
        primary: 'bg-primary/10 text-primary',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-error/10 text-error',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`card-premium p-3 sm:p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden min-w-0`}
        >
            <div className="flex items-start justify-between w-full">
                <BrandIcon icon={Icon} size={36} className={`shadow-sm ${colorMap[color].split(' ')[0].replace('bg-', 'shadow-').replace('/10', '/20')}`} />
                {change && (
                    <p className="text-[10px] sm:text-xs font-bold text-success flex items-center gap-1 bg-success/10 px-2 py-1 rounded-full whitespace-nowrap">
                        <ArrowUpRight className="w-3 h-3" /> {change}
                    </p>
                )}
            </div>
            <div className="mt-3 sm:mt-4 min-w-0">
                <p className="text-xl sm:text-3xl font-extrabold text-primary mb-1 truncate">{value}</p>
                <p className="text-[11px] sm:text-sm font-medium text-text-secondary truncate">{label}</p>
            </div>
        </motion.div>
    );
}

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
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-primary">Mon Tableau de Bord</h1>
                <p className="text-text-secondary mt-1">
                    Bienvenue, {user?.firstName} 👋 {user?.studyLevel && <span className="inline-flex items-center mx-2 text-xs font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">{user.studyLevel}</span>}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={Package} label="Packs Actifs" value={loading ? '…' : stats.activePacks} color="accent" delay={0.1} />
                <StatsCard icon={FileText} label="Documents" value={loading ? '…' : stats.documents} color="info" delay={0.2} />
                <StatsCard icon={MessageCircle} label="Messages non lus" value={loading ? '…' : stats.unreadMessages} change={stats.unreadMessages > 0 ? `${stats.unreadMessages} nouveau${stats.unreadMessages > 1 ? 'x' : ''}` : undefined} color="success" delay={0.3} />
                <StatsCard icon={TrendingUp} label="Progression" value={`${progress}%`} color="primary" delay={0.4} />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Progress Card */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card-premium p-6 cursor-pointer hover:border-accent/30 transition-colors flex flex-col h-full"
                        onClick={() => router.push('/dashboard/memoire')}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-3">
                                <BrandIcon icon={BookOpen} size={36} className="!bg-accent/10 shadow-sm" iconClassName="!text-accent" />
                                Progression du Mémoire
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
                                    <div className="flex justify-between items-center px-1">
                                        {phasesList.map((item, index) => {
                                            const isPast = index < currentPhaseIndex;
                                            const isCurrent = index === currentPhaseIndex;
                                            return (
                                                <div key={item.id} className="relative group cursor-help">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: isCurrent ? 1.3 : 1 }}
                                                        transition={{ delay: 0.5 + (index * 0.1), type: 'spring' }}
                                                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${isPast ? 'bg-success' :
                                                            isCurrent ? 'bg-accent shadow-[0_0_8px_rgba(255,107,107,0.6)] ring-2 ring-accent/30' :
                                                                'bg-border'
                                                            }`}
                                                    />
                                                    {/* Tooltip on hover */}
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                                        {item.label}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Current Phase Highlight */}
                                <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors">
                                    <div>
                                        <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">Phase Actuelle</span>
                                        <span className="text-sm font-semibold text-primary">{phasesList[currentPhaseIndex]?.label || 'Démarrage'}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5" />
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className={`card-premium p-6 cursor-pointer overflow-hidden relative group ${nextEvent?.type === 'DEADLINE' ? 'border-error/20 bg-error/[0.02]' : 'hover:border-accent/30'}`}
                        onClick={() => router.push('/dashboard/calendar')}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3">
                                Prochaine Échéance
                            </h3>
                            <BrandIcon icon={Clock} size={36} className={`shadow-sm ${nextEvent?.type === 'DEADLINE' ? '!bg-error/10' : '!bg-accent/10'}`} iconClassName={nextEvent?.type === 'DEADLINE' ? '!text-error' : '!text-accent'} />
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
                        <Calendar className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/[0.03] group-hover:text-accent/[0.05] transition-colors" />
                    </motion.div>

                    {memoire?.accompagnateur && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="card-premium p-6"
                        >
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
                                <BrandIcon icon={Users} size={36} className="!bg-info/10 shadow-sm" iconClassName="!text-info" />
                                Accompagnateur
                            </h3>
                            <div className="flex items-center gap-3">
                                {memoire.accompagnateur.avatar ? (
                                    <img src={memoire.accompagnateur.avatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
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
                            <button onClick={() => router.push('/dashboard/messages')} className="w-full mt-4 py-2.5 rounded-xl bg-primary/5 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all">
                                Envoyer un message
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Actions Rapides */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="card-premium p-6"
                    >
                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
                            <BrandIcon icon={Activity} size={36} className="!bg-primary/10 shadow-sm" iconClassName="!text-primary" />
                            Actions Rapides
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Envoyer un document', icon: FileText, color: 'bg-accent', href: '/dashboard/documents' },
                                { label: 'Message à l\'accompagnateur', icon: MessageCircle, color: 'bg-info', href: '/dashboard/messages' },
                                { label: 'Voir ma progression', icon: TrendingUp, color: 'bg-success', href: '/dashboard/memoire' },
                                { label: 'Mes packs', icon: Package, color: 'bg-primary', href: '/dashboard/packs' },
                            ].map((action) => (
                                <button key={action.label} onClick={() => router.push(action.href)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-light transition-colors text-left group">
                                    <div className={`w-10 h-10 rounded-xl ${action.color}/10 flex items-center justify-center flex-shrink-0`}>
                                        <action.icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
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
        <div className="space-y-8">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">Espace Accompagnateur</h1>
                <p className="text-text-secondary mt-1 text-sm">Gérez vos étudiants et leurs progressions</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-hidden">
                <StatsCard icon={Users} label="Étudiants Suivis" value={memoires.length} color="primary" delay={0.1} />
                <StatsCard icon={FileText} label="Documents en attente" value={pendingDocuments.length} color="warning" delay={0.2} />
                <StatsCard icon={MessageCircle} label="Messages non lus" value={totalUnreadMessages} color="error" delay={0.3} />
                <StatsCard icon={TrendingUp} label="Progression Moyenne" value={`${memoires.length > 0 ? Math.round(memoires.reduce((acc, m) => acc + m.progressPercent, 0) / memoires.length) : 0}%`} color="success" delay={0.4} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Students List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 card-premium p-4 sm:p-6"
                >
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
                        <BrandIcon icon={Users} size={36} className="!bg-accent/10 shadow-sm" iconClassName="!text-accent" />
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
                        <div className="space-y-3">
                            {memoires.map((memoire) => {
                                const studentName = `${memoire.student.firstName} ${memoire.student.lastName}`;
                                return (
                                    <div key={memoire.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-bg-light transition-colors cursor-pointer group" onClick={() => router.push(`/dashboard/memoire/${memoire.id}`)}>
                                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                                            {memoire.student.firstName[0]}{memoire.student.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-primary truncate group-hover:text-accent transition-colors">{studentName}</span>
                                                <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-bold">Actif</span>
                                            </div>
                                            <div className="text-xs text-text-muted truncate mt-0.5">{memoire.student.field || 'Filière inconnue'} — {getPhaseLabel(memoire.phase)}</div>
                                            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden sm:max-w-[200px]">
                                                <div className="h-full bg-accent rounded-full" style={{ width: `${memoire.progressPercent}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-sm font-bold text-primary">{memoire.progressPercent}%</div>
                                            <button className="text-[10px] font-medium text-text-muted hover:text-accent mt-1 transition-colors">Détails</button>
                                        </div>
                                        <Eye className="w-4 h-4 text-text-muted sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Pending Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card-premium p-4 sm:p-6 flex flex-col h-full"
                >
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
                        <BrandIcon icon={AlertTriangle} size={36} className="!bg-warning/10 shadow-sm" iconClassName="!text-warning" />
                        Actions Requises
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {pendingDocuments.length === 0 && totalUnreadMessages === 0 ? (
                            <div className="text-center py-6 text-text-secondary">
                                Tout est à jour ! Aucune action requise.
                            </div>
                        ) : (
                            <>
                                {pendingDocuments.slice(0, 3).map((doc, i) => (
                                    <div key={`doc-${doc.id}`} onClick={() => router.push('/dashboard/documents')} className="p-3 rounded-xl bg-bg-light hover:bg-warning/5 transition-colors cursor-pointer group">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-primary truncate group-hover:text-warning transition-colors">Évaluer : {doc.filename}</div>
                                                <div className="text-xs text-text-muted mt-0.5 truncate">
                                                    De {doc.uploader?.firstName} {doc.uploader?.lastName}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded">Doc</div>
                                        </div>
                                    </div>
                                ))}
                                {conversations.filter(c => c.unreadCount > 0).slice(0, 2).map((conv, i) => {
                                    const otherUser = conv.participant1Id === user?.id ? conv.participant2 : conv.participant1;
                                    return (
                                        <div key={`conv-${conv.id}`} onClick={() => router.push('/dashboard/messages')} className="p-3 rounded-xl bg-bg-light hover:bg-error/5 transition-colors cursor-pointer group">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-primary truncate group-hover:text-error transition-colors">Nouveau(x) message(s)</div>
                                                    <div className="text-xs text-text-muted mt-0.5 truncate">De {otherUser?.firstName} ({conv.unreadCount} non lu)</div>
                                                </div>
                                                <div className="flex-shrink-0 text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded">Chat</div>
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
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">Administration</h1>
                <p className="text-text-secondary mt-1 text-sm">Vue d'ensemble de la plateforme</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatsCard icon={Users} label="Utilisateurs" value={156} change="+12 ce mois" color="primary" delay={0.1} />
                <StatsCard icon={Package} label="Abonnements actifs" value={89} change="+8 cette semaine" color="accent" delay={0.2} />
                <StatsCard icon={FileText} label="Documents" value={342} color="info" delay={0.3} />
                <StatsCard icon={MessageCircle} label="Messages" value="1.2k" color="success" delay={0.4} />
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <StatsCard icon={Users} label="Étudiants" value={120} color="info" delay={0.5} />
                <StatsCard icon={BookOpen} label="Accompagnateurs" value={12} color="success" delay={0.6} />
                <StatsCard icon={Shield} label="Admins" value={3} color="accent" delay={0.7} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="lg:col-span-2 card-premium p-4 sm:p-6"
                >
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
                        <BrandIcon icon={Activity} size={36} className="!bg-accent/10 shadow-sm" iconClassName="!text-accent" />
                        Activité Récente
                    </h3>
                    <div className="mt-8 relative pt-2">
                        <div className="absolute left-[27px] top-6 bottom-4 w-px bg-border-light z-0" />
                        <div className="space-y-6 relative z-10">
                            {[
                                { action: 'Moussa Diop a soumis un document', time: 'Il y a 5 min', type: 'document', badge: 'Étudiant', icon: FileText, color: 'text-info', bg: 'bg-info/10' },
                                { action: 'Fatou Ndiaye a validé un chapitre', time: 'Il y a 30 min', type: 'validation', badge: 'Accompagnateur', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
                                { action: 'Nouvel abonnement Pack Complet', time: 'Il y a 1h', type: 'subscription', badge: 'Paiement', icon: Package, color: 'text-accent', bg: 'bg-accent/10' },
                                { action: "Aïssatou Ba s'est inscrite", time: 'Il y a 2h', type: 'register', badge: 'Inscription', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
                                { action: 'Omar Seck a terminé son mémoire', time: 'Il y a 3h', type: 'completion', badge: 'Succès', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group/activity">
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm transition-all duration-300 ${item.bg}`}>
                                            <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                                        </div>
                                    </div>
                                    <div className="flex-1 pb-2 flex items-center justify-between gap-2 min-w-0">
                                        <div className="min-w-0">
                                            <div className="text-xs sm:text-sm font-semibold text-primary mb-1 tracking-tight truncate">{item.action}</div>
                                            <div className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" /> {item.time}
                                            </div>
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-bg-light px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-text-secondary border border-border/50 flex-shrink-0 hidden sm:block">
                                            {item.badge}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Alerts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="card-premium p-4 sm:p-6"
                >
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
                        <BrandIcon icon={AlertTriangle} size={36} className="!bg-warning/10 shadow-sm" iconClassName="!text-warning" />
                        Alertes
                    </h3>
                    <div className="space-y-3">
                        {[
                            { text: '3 paiements en attente de validation', color: 'bg-warning/10 text-warning border-warning/20' },
                            { text: '2 étudiants inactifs depuis 7 jours', color: 'bg-error/10 text-error border-error/20' },
                            { text: '5 documents en attente de revue', color: 'bg-info/10 text-info border-info/20' },
                        ].map((alert, i) => (
                            <div key={i} className={`p-3 rounded-xl border text-sm font-medium ${alert.color}`}>
                                {alert.text}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-bold text-primary mb-3">Revenus du mois</h4>
                        <div className="text-2xl sm:text-3xl font-extrabold text-accent">1.250.000</div>
                        <div className="text-xs text-text-muted">FCFA — +15% vs mois précédent</div>
                    </div>
                </motion.div>
            </div>
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

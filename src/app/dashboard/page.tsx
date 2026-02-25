'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
    Package, BookOpen, FileText, MessageCircle, TrendingUp, Users,
    Clock, AlertTriangle, CheckCircle, BarChart3, Activity, Shield,
    Eye, ArrowUpRight, Calendar
} from 'lucide-react';

// ==================== STATS CARD ====================
function StatsCard({ icon: Icon, label, value, change, color, delay = 0 }: {
    icon: React.ComponentType<any>; label: string; value: string | number;
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
            className="card-premium p-6 hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-text-secondary mb-1">{label}</p>
                    <p className="text-2xl font-bold text-primary">{value}</p>
                    {change && (
                        <p className="text-xs text-success mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> {change}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
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
    const progress = memoire?.progressPercent || 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-primary">Mon Tableau de Bord</h1>
                <p className="text-text-secondary mt-1">Bienvenue, {user?.firstName} 👋</p>
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
                {/* Progress Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 card-premium p-6 cursor-pointer hover:border-accent/30 transition-colors"
                    onClick={() => router.push('/dashboard/memoire')}
                >
                    <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-accent" />
                        Progression du Mémoire
                    </h3>

                    {memoire ? (
                        <>
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-text-primary">{memoire.title}</span>
                                    <span className="text-sm font-bold text-accent">{progress}%</span>
                                </div>
                                <div className="h-3 bg-bg-light rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, delay: 0.8 }}
                                        className="h-full bg-gradient-to-r from-accent to-info rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-3 mt-6">
                                {phasesList.map((item, index) => {
                                    let status = 'pending';
                                    if (index < currentPhaseIndex) status = 'done';
                                    else if (index === currentPhaseIndex) status = 'current';

                                    return (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status === 'done' ? 'bg-success' : status === 'current' ? 'bg-accent ring-4 ring-accent/20' : 'bg-border'}`} />
                                            <div className="flex-1 flex items-center justify-between">
                                                <span className={`text-sm ${status === 'pending' ? 'text-text-muted' : 'text-text-primary'} font-medium`}>
                                                    {item.label}
                                                </span>
                                                <span className={`text-xs ${status === 'current' ? 'text-accent font-semibold' : 'text-text-muted'}`}>
                                                    {status === 'done' ? 'Terminé' : status === 'current' ? 'En cours' : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-text-secondary">
                            Chargement de votre progression...
                        </div>
                    )}
                </motion.div>

                {/* Right Column: Next Deadline & Quick Actions */}
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
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Prochaine Échéance</h3>
                            <div className={`p-2 rounded-lg ${nextEvent?.type === 'DEADLINE' ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent'}`}>
                                <Clock className="w-4 h-4" />
                            </div>
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="card-premium p-6"
                    >
                        <h3 className="text-lg font-bold text-primary mb-4">Actions Rapides</h3>
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

                    {memoire?.accompagnateur && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="card-premium p-6"
                        >
                            <h3 className="text-lg font-bold text-primary mb-4">Accompagnateur</h3>
                            <div className="flex items-center gap-3">
                                {memoire.accompagnateur.avatar ? (
                                    <img src={memoire.accompagnateur.avatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold">
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
            </div>
        </div>
    );
}

// ==================== ACCOMPAGNATEUR DASHBOARD ====================
function AccompagnateurDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [memoires, setMemoires] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // As a COACH, this endpoint returns { memoires: [...] }
        api.getMyMemoire()
            .then(res => {
                setMemoires(res.memoires || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch students data", err);
                setLoading(false);
            });
    }, []);

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
                <h1 className="text-2xl font-bold text-primary">Espace Accompagnateur</h1>
                <p className="text-text-secondary mt-1">Gérez vos étudiants et leurs progressions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={Users} label="Étudiants Suivis" value={memoires.length} color="primary" delay={0.1} />
                <StatsCard icon={FileText} label="Documents en attente" value={0} color="warning" delay={0.2} />
                <StatsCard icon={MessageCircle} label="Messages non lus" value={0} color="error" delay={0.3} />
                <StatsCard icon={TrendingUp} label="Progression Moyenne" value={`${memoires.length > 0 ? Math.round(memoires.reduce((acc, m) => acc + m.progressPercent, 0) / memoires.length) : 0}%`} color="success" delay={0.4} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Students List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 card-premium p-6"
                >
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent" />
                        Mes Étudiants
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
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
                                    <div key={memoire.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-bg-light transition-colors cursor-pointer group" onClick={() => router.push(`/dashboard/memoire/${memoire.id}`)}>
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                                            {memoire.student.firstName[0]}{memoire.student.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-primary truncate group-hover:text-accent transition-colors">{studentName}</span>
                                                <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-bold">Actif</span>
                                            </div>
                                            <div className="text-xs text-text-muted truncate mt-0.5">{memoire.student.field || 'Filière inconnue'} — {getPhaseLabel(memoire.phase)}</div>
                                            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden max-w-[200px]">
                                                <div className="h-full bg-gradient-to-r from-accent to-info rounded-full" style={{ width: `${memoire.progressPercent}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-sm font-bold text-primary">{memoire.progressPercent}%</div>
                                            <button className="text-[10px] font-medium text-text-muted hover:text-accent mt-1 transition-colors">Détails</button>
                                        </div>
                                        <Eye className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    className="card-premium p-6"
                >
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        Actions Requises
                    </h3>
                    <div className="space-y-3">
                        {[
                            { text: 'Relire le Chapitre 2', time: 'Il y a 2h', type: 'document' },
                            { text: 'Valider un plan', time: 'Il y a 5h', type: 'validation' },
                            { text: 'Nouveau message', time: 'Hier', type: 'message' },
                        ].map((action, i) => (
                            <div key={i} className="p-3 rounded-xl bg-bg-light hover:bg-accent/5 transition-colors cursor-pointer">
                                <div className="text-sm font-medium text-text-primary">{action.text}</div>
                                <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {action.time}
                                </div>
                            </div>
                        ))}
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
                <h1 className="text-2xl font-bold text-primary">Administration</h1>
                <p className="text-text-secondary mt-1">Vue d&apos;ensemble de la plateforme</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={Users} label="Utilisateurs" value={156} change="+12 ce mois" color="primary" delay={0.1} />
                <StatsCard icon={Package} label="Abonnements actifs" value={89} change="+8 cette semaine" color="accent" delay={0.2} />
                <StatsCard icon={FileText} label="Documents" value={342} color="info" delay={0.3} />
                <StatsCard icon={MessageCircle} label="Messages" value="1.2k" color="success" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard icon={Users} label="Étudiants" value={120} color="info" delay={0.5} />
                <StatsCard icon={BookOpen} label="Accompagnateurs" value={12} color="success" delay={0.6} />
                <StatsCard icon={Shield} label="Admins" value={3} color="accent" delay={0.7} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="lg:col-span-2 card-premium p-6"
                >
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" />
                        Activité Récente
                    </h3>
                    <div className="space-y-3">
                        {[
                            { action: 'Moussa Diop a soumis un document', time: 'Il y a 5 min', type: 'document', badge: 'Étudiant' },
                            { action: 'Fatou Ndiaye a validé un chapitre', time: 'Il y a 30 min', type: 'validation', badge: 'Accompagnateur' },
                            { action: 'Nouvel abonnement Pack Complet', time: 'Il y a 1h', type: 'subscription', badge: 'Paiement' },
                            { action: 'Aïssatou Ba s\'est inscrite', time: 'Il y a 2h', type: 'register', badge: 'Inscription' },
                            { action: 'Omar Seck a terminé son mémoire', time: 'Il y a 3h', type: 'completion', badge: 'Succès' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-bg-light transition-colors">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.type === 'document' ? 'bg-info' :
                                    item.type === 'validation' ? 'bg-success' :
                                        item.type === 'subscription' ? 'bg-accent' :
                                            item.type === 'completion' ? 'bg-green-500' : 'bg-primary'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-text-primary">{item.action}</span>
                                    <div className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {item.time}
                                    </div>
                                </div>
                                <span className="text-xs bg-bg-light px-2.5 py-1 rounded-full text-text-secondary font-medium flex-shrink-0">
                                    {item.badge}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Alerts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="card-premium p-6"
                >
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-warning" />
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
                        <div className="text-3xl font-extrabold text-accent">1.250.000</div>
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

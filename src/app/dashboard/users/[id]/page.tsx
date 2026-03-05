'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, EnvelopeSimple as Mail, Phone, CalendarBlank as Calendar,
    GraduationCap, BookOpen, User, Package, CheckCircle, Warning as AlertTriangle,
    Shield, UserCircle, FileText, Pencil as Edit, ArrowsClockwise as RefreshCw,
    CircleNotch as Loader2,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import UserAvatar from '@/components/UserAvatar';

const PHASES: Record<string, string> = {
    TOPIC: 'Choix du Sujet',
    OUTLINE: 'Plan Détaillé',
    INTRO: 'Introduction',
    'CHAPTER1-3': 'Chapitres',
    CONCLUSION: 'Conclusion',
    REVIEW: 'Relecture Finale',
    FINAL: 'Soutenance',
};

const roleLabel: Record<string, string> = {
    STUDENT: 'Étudiant',
    ACCOMPAGNATEUR: 'Accompagnateur',
    ADMIN: 'Administrateur',
};

const roleBadge: Record<string, string> = {
    STUDENT: 'bg-info/10 text-info',
    ACCOMPAGNATEUR: 'bg-success/10 text-success',
    ADMIN: 'bg-accent/10 text-accent',
};

const docStatusColor: Record<string, string> = {
    APPROVED: 'text-success',
    UNDER_REVIEW: 'text-warning',
    REJECTED: 'text-error',
    UPLOADED: 'text-info',
};

const docStatusLabel: Record<string, string> = {
    APPROVED: 'Approuvé',
    UNDER_REVIEW: 'En attente',
    REJECTED: 'Rejeté',
    UPLOADED: 'Soumis',
};

function InfoBlock({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-bg-light flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-text-muted" />
            </div>
            <div>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{label}</div>
                <div className="text-sm font-medium text-primary mt-0.5">{value}</div>
            </div>
        </div>
    );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="card-premium p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border-light pb-2">{title}</h3>
            {children}
        </div>
    );
}

export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params?.id as string;

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.getUserById(userId);
            setUser(res.user);
        } catch (err: any) {
            toast.error(err.message || 'Utilisateur introuvable');
            router.push('/dashboard/users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) load();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) return null;

    const memoire = user.memoiresAsStudent?.[0] || null;
    const subscription = user.subscriptions?.[0] || null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Back + actions bar */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        className="p-2.5 rounded-xl border border-border bg-white text-text-muted hover:text-primary hover:bg-bg-light transition-colors shadow-sm"
                        title="Rafraîchir"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => router.push(`/dashboard/users?edit=${user.id}`)}
                        className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </button>
                </div>
            </div>

            {/* Profile hero card */}
            <div className="card-premium p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Avatar */}
                    <UserAvatar user={user} size="xxl" className="shadow-md" />

                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-primary">{user.firstName} {user.lastName}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[user.role]}`}>
                                {roleLabel[user.role]}
                            </span>
                            {user.isActive ? (
                                <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" weight="fill" /> Compte actif
                                </span>
                            ) : (
                                <span className="text-[11px] text-error font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" weight="fill" /> Compte inactif
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-text-muted mt-1.5">{user.email}</p>
                    </div>

                    {/* Quick stats for students */}
                    {user.role === 'STUDENT' && memoire && (
                        <div className="flex gap-4 sm:gap-6 flex-shrink-0">
                            <div className="text-center">
                                <div className="text-2xl font-extrabold text-primary">{memoire.progressPercent}%</div>
                                <div className="text-[11px] text-text-muted font-medium">Progression</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-extrabold text-primary">{memoire.documents?.length || 0}</div>
                                <div className="text-[11px] text-text-muted font-medium">Documents</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main grid */}
            <div className="grid md:grid-cols-2 gap-5">
                {/* Contact */}
                <SectionCard title="Coordonnées">
                    <InfoBlock icon={Mail} label="Email" value={user.email} />
                    <InfoBlock icon={Phone} label="Téléphone" value={user.phone || null} />
                    <InfoBlock icon={Calendar} label="Inscrit le" value={new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                </SectionCard>

                {/* Academic - student only */}
                {user.role === 'STUDENT' && (
                    <SectionCard title="Informations académiques">
                        <InfoBlock icon={GraduationCap} label="Université" value={user.university || null} />
                        <InfoBlock icon={BookOpen} label="Filière" value={user.field || null} />
                        <InfoBlock icon={User} label="Niveau d'études" value={user.studyLevel || null} />
                        {user.targetDefenseDate && (
                            <InfoBlock
                                icon={Calendar}
                                label="Soutenance prévue"
                                value={new Date(user.targetDefenseDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            />
                        )}
                    </SectionCard>
                )}

                {/* Role-specific info */}
                {user.role === 'ACCOMPAGNATEUR' && (
                    <SectionCard title="Rôle">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                                <UserCircle className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-primary">Accompagnateur</div>
                                <div className="text-xs text-text-muted">{user.isActive ? 'Compte validé et actif' : 'En attente de validation'}</div>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {user.role === 'ADMIN' && (
                    <SectionCard title="Rôle">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-primary">Administrateur</div>
                                <div className="text-xs text-text-muted">Accès complet à la plateforme</div>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* Accompagnateur */}
                {user.role === 'STUDENT' && (
                    <SectionCard title="Accompagnateur">
                        {memoire?.accompagnateur ? (
                            <div className="flex items-center gap-3">
                                <UserAvatar user={memoire.accompagnateur} size="lg" className="uppercase shadow-sm" />
                                <div>
                                    <div className="text-sm font-semibold text-primary">{memoire.accompagnateur.firstName} {memoire.accompagnateur.lastName}</div>
                                    <div className="text-xs text-text-muted">{memoire.accompagnateur.email}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-warning">
                                <AlertTriangle className="w-4 h-4" />
                                Aucun accompagnateur assigné
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* Pack / Subscription */}
                {user.role === 'STUDENT' && (
                    <SectionCard title="Abonnement">
                        {subscription ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <Package className="w-4 h-4 text-accent" weight="fill" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-primary">{subscription.pack?.name}</div>
                                        <div className="text-xs text-text-muted">{subscription.pack?.price?.toLocaleString()} CFA</div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${subscription.status === 'ACTIVE' ? 'bg-success/10 text-success' :
                                        subscription.status === 'PARTIAL' ? 'bg-warning/10 text-warning' :
                                            subscription.status === 'PENDING' ? 'bg-info/10 text-info' :
                                                'bg-error/10 text-error'
                                        }`}>
                                        {subscription.status === 'ACTIVE' ? 'Actif' :
                                            subscription.status === 'PARTIAL' ? 'Partiel' :
                                                subscription.status === 'PENDING' ? 'En attente' : subscription.status}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-text-secondary border-t border-border-light pt-2">
                                    <span>Montant payé</span>
                                    <span className="font-bold text-primary">{subscription.amountPaid?.toLocaleString()} CFA</span>
                                </div>
                                {subscription.payments?.length > 0 && (
                                    <div className="space-y-1 pt-1">
                                        <div className="text-[11px] font-semibold text-text-muted uppercase">Paiements</div>
                                        {subscription.payments.map((p: any) => (
                                            <div key={p.id} className="flex justify-between text-xs">
                                                <span className="text-text-secondary">{new Date(p.createdAt).toLocaleDateString('fr-FR')} — {p.method}</span>
                                                <span className={`font-bold ${p.status === 'CONFIRMED' ? 'text-success' : 'text-warning'}`}>{p.amount?.toLocaleString()} CFA</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                <Package className="w-4 h-4" />
                                Aucun abonnement
                            </div>
                        )}
                    </SectionCard>
                )}
            </div>

            {/* Mémoire progress - full width */}
            {user.role === 'STUDENT' && memoire && (
                <SectionCard title="Mémoire en cours">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-primary italic mb-1">« {memoire.title} »</p>
                            <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-lg bg-accent/10 text-accent">
                                {PHASES[memoire.phase] || memoire.phase}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-semibold text-primary">Progression</span>
                                <span className="text-sm font-extrabold text-accent">{memoire.progressPercent}%</span>
                            </div>
                            <div className="h-3 bg-bg-light rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${memoire.progressPercent}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${memoire.progressPercent >= 80 ? 'bg-success' : memoire.progressPercent >= 40 ? 'bg-accent' : 'bg-warning'}`}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        {memoire.notes && (
                            <div className="p-3 rounded-xl bg-bg-light/60 text-sm text-text-secondary border border-border-light">
                                <div className="text-[11px] font-bold text-text-muted uppercase mb-1">Notes</div>
                                <p className="leading-relaxed">{memoire.notes}</p>
                            </div>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* Documents */}
            {user.role === 'STUDENT' && memoire?.documents?.length > 0 && (
                <SectionCard title={`Documents soumis (${memoire.documents.length})`}>
                    <div className="divide-y divide-border-light -my-1">
                        {memoire.documents.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between py-2.5 gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
                                    <span className="text-sm text-primary truncate">{doc.title}</span>
                                    {doc.category && (
                                        <span className="text-[10px] text-text-muted hidden sm:inline">{doc.category}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-[11px] font-semibold ${docStatusColor[doc.status]}`}>
                                        {docStatusLabel[doc.status]}
                                    </span>
                                    <span className="text-[11px] text-text-muted">
                                        {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}
        </motion.div>
    );
}

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, EnvelopeSimple as Mail, Phone, MapPin, GraduationCap, CalendarBlank as Calendar,
    User, Package, CheckCircle, BookOpen, Shield, Warning as AlertTriangle, UserCircle,
    ArrowUpRight,
} from '@phosphor-icons/react';

const roleLabel: Record<string, string> = {
    STUDENT: 'Étudiant',
    ACCOMPAGNATEUR: 'Accompagnateur',
    ADMIN: 'Administrateur',
};

const roleBadge: Record<string, { bg: string; text: string }> = {
    STUDENT: { bg: 'bg-info/10', text: 'text-info' },
    ACCOMPAGNATEUR: { bg: 'bg-success/10', text: 'text-success' },
    ADMIN: { bg: 'bg-accent/10', text: 'text-accent' },
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-bg-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-text-muted" />
            </div>
            <div>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{label}</div>
                <div className="text-sm font-medium text-primary mt-0.5">{value}</div>
            </div>
        </div>
    );
}

const PHASES: Record<string, string> = {
    TOPIC: 'Choix du Sujet',
    OUTLINE: 'Plan Détaillé',
    INTRO: 'Introduction',
    'CHAPTER1-3': 'Chapitres',
    CONCLUSION: 'Conclusion',
    REVIEW: 'Relecture Finale',
    FINAL: 'Soutenance',
};

interface UserProfileModalProps {
    user: any | null;
    onClose: () => void;
    onEdit?: (user: any) => void;
}

export default function UserProfileModal({ user, onClose, onEdit }: UserProfileModalProps) {
    if (!user) return null;

    const badge = roleBadge[user.role] || roleBadge['STUDENT'];
    const memoire = user.memoiresAsStudent?.[0] || null;
    const subscription = user.subscriptions?.[0] || null;

    return (
        <AnimatePresence>
            {user && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                        className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border-light sticky top-0 bg-white z-10">
                            <h2 className="text-base font-bold text-primary">Profil Utilisateur</h2>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-bg-light transition-colors text-text-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 flex-1">
                            {/* Avatar + name + role */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 uppercase shadow-md">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-xl text-primary">{user.firstName} {user.lastName}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                                            {roleLabel[user.role]}
                                        </span>
                                        {user.isActive ? (
                                            <span className="text-[11px] text-success font-medium flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" weight="fill" /> Actif
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-error font-medium flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" weight="fill" /> Inactif
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact info */}
                            <div className="p-4 rounded-2xl border border-border-light space-y-3">
                                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Coordonnées</div>
                                <InfoRow icon={Mail} label="Email" value={user.email} />
                                <InfoRow icon={Phone} label="Téléphone" value={user.phone || null} />
                                <InfoRow icon={Calendar} label="Inscrit le" value={new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            </div>

                            {/* Academic info - for students */}
                            {user.role === 'STUDENT' && (
                                <div className="p-4 rounded-2xl border border-border-light space-y-3">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Informations académiques</div>
                                    <InfoRow icon={GraduationCap} label="Université" value={user.university || null} />
                                    <InfoRow icon={BookOpen} label="Filière" value={user.field || null} />
                                    <InfoRow icon={User} label="Niveau d'études" value={user.studyLevel || null} />
                                    {user.targetDefenseDate && (
                                        <InfoRow
                                            icon={Calendar}
                                            label="Soutenance prévue"
                                            value={new Date(user.targetDefenseDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Accompagnateur info - for students */}
                            {user.role === 'STUDENT' && (
                                <div className="p-4 rounded-2xl border border-border-light">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Accompagnateur</div>
                                    {memoire?.accompagnateur ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold text-sm uppercase">
                                                {memoire.accompagnateur.firstName[0]}{memoire.accompagnateur.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-primary">{memoire.accompagnateur.firstName} {memoire.accompagnateur.lastName}</div>
                                                <div className="text-xs text-success">Assigné</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-warning flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Aucun accompagnateur assigné
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mémoire progress - for students */}
                            {user.role === 'STUDENT' && memoire && (
                                <div className="p-4 rounded-2xl border border-border-light space-y-3">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Mémoire en cours</div>
                                    <p className="text-sm font-semibold text-primary italic">« {memoire.title} »</p>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-text-secondary">{PHASES[memoire.phase] || memoire.phase}</span>
                                        <span className="font-extrabold text-accent">{memoire.progressPercent}%</span>
                                    </div>
                                    <div className="h-2 bg-bg-light rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${memoire.progressPercent}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${memoire.progressPercent >= 80 ? 'bg-success' : memoire.progressPercent >= 40 ? 'bg-accent' : 'bg-warning'}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pack / Subscription - for students */}
                            {user.role === 'STUDENT' && (
                                <div className="p-4 rounded-2xl border border-border-light">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Abonnement</div>
                                    {subscription ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                                                <Package className="w-4 h-4 text-accent" weight="fill" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-primary">{subscription.pack?.name || 'Pack'}</div>
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
                                    ) : (
                                        <div className="text-sm text-text-muted flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            Aucun abonnement
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Coach summary - for coaches */}
                            {user.role === 'ACCOMPAGNATEUR' && (
                                <div className="p-4 rounded-2xl border border-border-light">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Rôle</div>
                                    <div className="flex items-center gap-2 text-sm text-primary">
                                        <UserCircle className="w-4 h-4 text-success" />
                                        Accompagnateur — {user.isActive ? 'Compte validé' : 'En attente de validation'}
                                    </div>
                                </div>
                            )}

                            {user.role === 'ADMIN' && (
                                <div className="p-4 rounded-2xl border border-border-light">
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Rôle</div>
                                    <div className="flex items-center gap-2 text-sm text-primary">
                                        <Shield className="w-4 h-4 text-accent" />
                                        Administrateur de la plateforme
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="px-6 pb-6 pt-4 border-t border-border-light space-y-2">
                            {onEdit && (
                                <button
                                    onClick={() => { onEdit(user); onClose(); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                    Modifier le profil
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-light transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

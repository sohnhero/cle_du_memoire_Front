'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Gear as Settings, Globe, Bell, ShieldCheck as Shield,
    FloppyDisk as Save, CaretRight as ChevronRight,
    User, Lock, Key, CheckCircle, Warning as AlertTriangle,
    ChartBar as BarChart3, Package, Users, FileText, ArrowsClockwise as RefreshCw,
    Envelope, Phone, MapPin, Buildings as Building2, Info,
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// ── Toggle Component ────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${value ? 'bg-accent' : 'bg-border'}`}
        >
            <motion.div
                animate={{ x: value ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
        </button>
    );
}

// ── Section ─────────────────────────────────────────────────────
function Section({ icon: Icon, title, color, children, delay = 0 }: {
    icon: any; title: string; color: string; children: React.ReactNode; delay?: number;
}) {
    const colorMap: Record<string, string> = {
        accent: '!bg-accent/10 shadow-sm', info: '!bg-info/10 shadow-sm',
        warning: '!bg-warning/10 shadow-sm', success: '!bg-success/10 shadow-sm',
        primary: '!bg-primary/10 shadow-sm', error: '!bg-error/10 shadow-sm',
    };
    const iconColorMap: Record<string, string> = {
        accent: '!text-accent', info: '!text-info', warning: '!text-warning',
        success: '!text-success', primary: '!text-primary', error: '!text-error',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="card-premium p-4 sm:p-6 shadow-sm border border-border/50"
        >
            <h3 className="text-base sm:text-lg font-bold text-primary mb-5 sm:mb-6 flex items-center gap-3">
                <div className="flex-shrink-0">
                    <BrandIcon icon={Icon} size={32} className={`${colorMap[color]} sm:scale-110 transition-transform`} iconClassName={iconColorMap[color]} />
                </div>
                {title}
            </h3>
            {children}
        </motion.div>
    );
}



// ── Main Page ───────────────────────────────────────────────────
export default function SettingsPage() {
    const { user, setUser } = useAuth() as any;

    // ── Profile state ────────────────────────────────────────────
    const [profile, setProfile] = useState({
        firstName: '', lastName: '', phone: '', university: '', field: '',
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    // ── Password state ───────────────────────────────────────────
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);

    // ── Notification prefs (local) ───────────────────────────────
    const NOTIF_KEY = 'cdm_notif_prefs';
    const defaultNotif = { email: true, push: true, sms: false, inApp: true, digest: false };
    const [notif, setNotif] = useState(defaultNotif);

    // ── Platform settings (server) ───────────────────────────────
    const [platform, setPlatform] = useState<Record<string, string>>({});
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [platformSaving, setPlatformSaving] = useState(false);

    const fetchConfig = async () => {
        try {
            const res = await api.getGlobalSettings();
            const configMap: Record<string, string> = {};
            res.settings.forEach((s: any) => {
                configMap[s.key] = s.value;
            });
            setPlatform(configMap);
        } catch (e) {
            toast.error('Erreur lors du chargement de la configuration');
        } finally {
            setLoadingSettings(false);
        }
    };

    useEffect(() => {
        if (user) {
            setProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                university: user.university || '',
                field: user.field || '',
            });
        }

        fetchConfig();

        // Load saved local prefs (notifications)
        try {
            const n = localStorage.getItem(NOTIF_KEY);
            if (n) {
                const parsed = JSON.parse(n);
                setNotif(prev => ({ ...prev, ...parsed }));
            }
        } catch { }
    }, [user]);

    // ── Handlers ─────────────────────────────────────────────────
    const handleProfileSave = async () => {
        setProfileSaving(true);
        try {
            const res = await api.updateProfile(profile);
            if (setUser) setUser(res.user);
            setProfileSaved(true);
            toast.success('Profil mis à jour');
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (e: any) {
            toast.error(e.message || 'Erreur lors de la mise à jour');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.next !== passwords.confirm) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        if (passwords.next.length < 8) {
            toast.error('8 caractères minimum requis');
            return;
        }
        setPwSaving(true);
        try {
            await api.changePassword(passwords.current, passwords.next);
            toast.success('Mot de passe modifié');
            setPasswords({ current: '', next: '', confirm: '' });
        } catch (e: any) {
            toast.error(e.message || 'Mot de passe actuel incorrect');
        } finally {
            setPwSaving(false);
        }
    };

    const handleNotifChange = (key: string, val: boolean) => {
        const updated = { ...notif, [key]: val };
        setNotif(updated);
        localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
        toast.success('Préférence enregistrée');
    };

    const handlePlatformSave = async () => {
        setPlatformSaving(true);
        try {
            const payload = Object.entries(platform).map(([key, value]) => ({ key, value }));
            await api.updateGlobalSettings(payload);
            toast.success('Configuration sauvegardée');
        } catch (e) {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setPlatformSaving(false);
        }
    };

    const togglePlatformSetting = (key: string) => {
        const newVal = platform[key] === 'true' ? 'false' : 'true';
        setPlatform({ ...platform, [key]: newVal });

        if (key === 'maintenanceMode') {
            toast(newVal === 'true' ? '⚠️ Mode maintenance activé' : '✅ Plateforme accessible', {
                icon: newVal === 'true' ? '⚠️' : '✅',
            });
        }
    };

    const handleExportData = async () => {
        toast.loading('Préparation de l\'export...');
        setTimeout(() => {
            toast.dismiss();
            toast.success('Export disponible — fonctionnalité à connecter au backend');
        }, 1500);
    };

    const getVal = (key: string) => platform[key] || '';

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-4 sm:space-y-6 pb-12 sm:pb-8">
            <div className="pt-2 sm:pt-0">
                <h1 className="text-xl sm:text-2xl font-bold text-primary">Paramètres</h1>
                <p className="text-text-secondary mt-1 text-xs sm:text-sm">Configuration de votre compte et de la plateforme</p>
            </div>

            {/* ── Mon Profil ──────────────────────────────────────── */}
            <Section icon={User} title="Mon Profil Administrateur" color="primary" delay={0.05}>
                <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Prénom</label>
                            <input
                                value={profile.firstName}
                                onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Nom</label>
                            <input
                                value={profile.lastName}
                                onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Email (non modifiable)</label>
                        <input
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-border bg-bg-light text-text-muted outline-none text-sm cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Téléphone</label>
                        <input
                            value={profile.phone}
                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm transition-all"
                            placeholder="+221 77 000 00 00"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleProfileSave}
                            disabled={profileSaving}
                            className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                        >
                            {profileSaved ? (
                                <><CheckCircle className="w-4 h-4" /> Sauvegardé</>
                            ) : profileSaving ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Sauvegarder</>
                            )}
                        </button>
                    </div>
                </div>
            </Section>

            {/* ── Mot de passe ─────────────────────────────────────── */}
            <Section icon={Lock} title="Sécurité — Changer le mot de passe" color="warning" delay={0.1}>
                <div className="space-y-4">
                    {[
                        { key: 'current', label: 'Mot de passe actuel', placeholder: '••••••••' },
                        { key: 'next', label: 'Nouveau mot de passe', placeholder: '8 caractères minimum' },
                        { key: 'confirm', label: 'Confirmer le nouveau', placeholder: '••••••••' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">{f.label}</label>
                            <input
                                type="password"
                                value={passwords[f.key as keyof typeof passwords]}
                                onChange={e => setPasswords({ ...passwords, [f.key]: e.target.value })}
                                placeholder={f.placeholder}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm transition-all"
                            />
                        </div>
                    ))}

                    {passwords.next && passwords.confirm && passwords.next !== passwords.confirm && (
                        <p className="text-xs text-error flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Les mots de passe ne correspondent pas
                        </p>
                    )}

                    <div className="flex justify-end pt-1">
                        <button
                            onClick={handlePasswordChange}
                            disabled={pwSaving || !passwords.current || !passwords.next || passwords.next !== passwords.confirm}
                            className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {pwSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Modification...</> : <><Key className="w-4 h-4" /> Changer</>}
                        </button>
                    </div>
                </div>
            </Section>

            {/* ── Notifications ─────────────────────────────────────── */}
            <Section icon={Bell} title="Préférences de Notifications" color="info" delay={0.15}>
                <div className="space-y-3">
                    {[
                        { key: 'inApp', label: 'Notifications in-app', desc: 'Alertes visibles dans le tableau de bord' },
                        { key: 'email', label: 'Notifications par email', desc: 'Emails pour les événements importants' },
                        { key: 'push', label: 'Notifications push', desc: 'Notifications dans le navigateur' },
                        { key: 'digest', label: 'Résumé quotidien', desc: 'Email récapitulatif de l\'activité' },
                        { key: 'sms', label: 'Alertes SMS', desc: 'SMS pour les alertes critiques uniquement' },
                    ].map(n => (
                        <div key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-bg-light hover:bg-bg-light/80 transition-colors">
                            <div className="flex-1 min-w-0 mr-4">
                                <div className="text-sm font-semibold text-primary">{n.label}</div>
                                <div className="text-xs text-text-muted mt-0.5">{n.desc}</div>
                            </div>
                            <Toggle value={notif[n.key as keyof typeof notif]} onChange={v => handleNotifChange(n.key, v)} />
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Paramètres Plateforme ─────────────────────────────── */}
            <Section icon={Shield} title="Paramètres de la Plateforme" color="accent" delay={0.2}>
                <div className="space-y-4">
                    {loadingSettings ? (
                        <div className="py-8 flex justify-center"><RefreshCw className="w-6 h-6 text-accent animate-spin" /></div>
                    ) : (
                        <>
                            {/* General platform info */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Nom de la plateforme</label>
                                    <input
                                        value={getVal('platformName')}
                                        onChange={e => setPlatform({ ...platform, platformName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm transition-all"
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Email de contact</label>
                                        <input
                                            value={getVal('contactEmail')}
                                            onChange={e => setPlatform({ ...platform, contactEmail: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Téléphone contact</label>
                                        <input
                                            value={getVal('contactPhone')}
                                            onChange={e => setPlatform({ ...platform, contactPhone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${platform.maintenanceMode === 'true' ? 'border-error/30 bg-error/5' : 'bg-bg-light border-transparent'}`}>
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="text-sm font-semibold text-primary flex items-center gap-2">
                                            Mode Maintenance
                                            {platform.maintenanceMode === 'true' && (
                                                <span className="text-[10px] font-bold bg-error/10 text-error px-2 py-0.5 rounded-full uppercase">Actif</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-text-muted mt-0.5">Désactive l&apos;accès public à la plateforme</div>
                                    </div>
                                    <Toggle value={platform.maintenanceMode === 'true'} onChange={() => togglePlatformSetting('maintenanceMode')} />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-bg-light">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="text-sm font-semibold text-primary">Nouvelles inscriptions</div>
                                        <div className="text-xs text-text-muted mt-0.5">Autoriser les nouveaux étudiants à créer un compte</div>
                                    </div>
                                    <Toggle value={platform.allowRegistrations === 'true'} onChange={() => togglePlatformSetting('allowRegistrations')} />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-bg-light">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="text-sm font-semibold text-primary">Approbation requise</div>
                                        <div className="text-xs text-text-muted mt-0.5">Valider manuellement chaque nouveau compte</div>
                                    </div>
                                    <Toggle value={platform.requireApproval === 'true'} onChange={() => togglePlatformSetting('requireApproval')} />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handlePlatformSave}
                                    disabled={platformSaving}
                                    className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                                >
                                    {platformSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sauvegarde...</> : <><Save className="w-4 h-4" /> Sauvegarder la plateforme</>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Section>

            {/* ── Actions Admin ─────────────────────────────────────── */}
            <Section icon={Settings} title="Actions Administrateur" color="success" delay={0.25}>
                <div className="space-y-2">
                    {[
                        {
                            label: 'Gérer les utilisateurs',
                            desc: 'Modifier les rôles, activer/désactiver des comptes',
                            icon: Users, color: 'text-primary bg-primary/10',
                            href: '/dashboard/users',
                        },
                        {
                            label: 'Packs & abonnements',
                            desc: 'Gérer les forfaits et encaisser les paiements',
                            icon: Package, color: 'text-accent bg-accent/10',
                            href: '/dashboard/packs-admin',
                        },
                        {
                            label: 'Suivi global des mémoires',
                            desc: 'Voir la progression de tous les étudiants',
                            icon: BarChart3, color: 'text-info bg-info/10',
                            href: '/dashboard/tracking',
                        },
                        {
                            label: 'Journaux d\'activité',
                            desc: 'Consulter les logs de connexion et actions',
                            icon: Shield, color: 'text-warning bg-warning/10',
                            href: '/dashboard/logs',
                        },
                        {
                            label: 'Ressources pédagogiques',
                            desc: 'Ajouter, modifier ou supprimer des ressources',
                            icon: FileText, color: 'text-success bg-success/10',
                            href: '/dashboard/resources',
                        },
                    ].map(action => (
                        <a
                            key={action.href}
                            href={action.href}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-bg-light hover:bg-white hover:shadow-sm border border-transparent hover:border-border-light transition-all group text-left"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${action.color}`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">{action.label}</div>
                                <div className="text-xs text-text-muted">{action.desc}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border-light">
                    <button
                        onClick={handleExportData}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-bg-light hover:bg-primary/5 border border-dashed border-border hover:border-primary/30 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Save className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-primary">Exporter les données</div>
                            <div className="text-xs text-text-muted">Sauvegarde complète de la plateforme</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </Section>

            {/* ── Infos Plateforme ──────────────────────────────────── */}
            <Section icon={Globe} title="À Propos de la Plateforme" color="accent" delay={0.3}>
                <div className="space-y-3 text-sm">
                    {[
                        { label: 'Nom', value: getVal('platformName') || 'Clé du Mémoire', icon: Globe },
                        { label: 'Version', value: 'v2.0.0', icon: Info },
                        { label: 'Email', value: getVal('contactEmail') || 'contact@cledumemoire.sn', icon: Envelope },
                        { label: 'Téléphone', value: getVal('contactPhone') || '+221 77 000 00 00', icon: Phone },
                        { label: 'Localisation', value: getVal('contactAddress') || 'Dakar, Sénégal — Almadies', icon: MapPin },
                        { label: 'Organisation', value: 'CdM SAS', icon: Building2 },
                    ].map(item => (
                        <div key={item.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-4 py-3 rounded-xl bg-bg-light">
                            <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 text-text-muted flex-shrink-0" />
                                <span className="text-text-secondary sm:w-28 flex-shrink-0 text-xs sm:text-sm">{item.label}</span>
                            </div>
                            <span className="text-primary font-medium text-sm sm:text-base break-all ml-6 sm:ml-0">{item.value}</span>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}

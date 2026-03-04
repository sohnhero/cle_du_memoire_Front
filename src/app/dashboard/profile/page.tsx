'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
    User, EnvelopeSimple as Mail, Phone, Buildings as Building, BookOpen, ShieldCheck as Shield, Camera, FloppyDisk as Save, Lock, CircleNotch as Loader2, CheckCircle
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Profile form
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [university, setUniversity] = useState(user?.university || '');
    const [field, setField] = useState(user?.field || '');
    const [studyLevel, setStudyLevel] = useState(user?.studyLevel || '');
    const [targetDefenseDate, setTargetDefenseDate] = useState(user?.targetDefenseDate ? new Date(user.targetDefenseDate).toISOString().split('T')[0] : '');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPw, setChangingPw] = useState(false);

    if (!user) return null;

    const roleLabels: Record<string, string> = { STUDENT: 'Étudiant', ACCOMPAGNATEUR: 'Accompagnateur', ADMIN: 'Administrateur' };
    const roleColors: Record<string, string> = { STUDENT: 'bg-info/10 text-info border-info/20', ACCOMPAGNATEUR: 'bg-success/10 text-success border-success/20', ADMIN: 'bg-accent/10 text-accent border-accent/20' };

    function showToast(message: string, type: 'success' | 'error') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await api.updateProfile({ firstName, lastName, phone, university, field, studyLevel, targetDefenseDate });
            // Refresh user data
            const { user: updated } = await api.getMe();
            // Show toast instead of reloading
            showToast('Profil mis à jour ! Veuillez rafraîchir la page si nécessaire.', 'success');
            setEditing(false);
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la sauvegarde', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword() {
        if (newPassword !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('Le mot de passe doit avoir au moins 6 caractères', 'error');
            return;
        }
        setChangingPw(true);
        try {
            await api.changePassword(currentPassword, newPassword);
            showToast('Mot de passe mis à jour avec succès', 'success');
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            showToast(err.message || 'Erreur lors du changement', 'error');
        } finally {
            setChangingPw(false);
        }
    }

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast("L'image ne doit pas dépasser 5Mo", 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
                await api.updateAvatar(base64);
                window.location.reload();
            } catch (err: any) {
                showToast(err.message || "Erreur lors de l'upload", 'error');
            }
        };
        reader.readAsDataURL(file);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary">Mon Profil</h1>
                <p className="text-text-secondary mt-1">Gérez vos informations personnelles et votre sécurité</p>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-primary">{user.firstName} {user.lastName}</h2>
                        <p className="text-text-secondary mt-1">{user.email}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${roleColors[user.role]}`}>
                                {roleLabels[user.role]}
                            </span>
                            <span className="text-xs text-text-muted">Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (editing) handleSave();
                            else setEditing(true);
                        }}
                        disabled={saving}
                        className="btn-primary py-2.5 px-5 text-sm"
                    >
                        {saving ? (
                            <><LoadingSpinner size="sm" light className="mr-2" /> Sauvegarde...</>
                        ) : editing ? (
                            <><Save className="w-4 h-4" /> Sauvegarder</>
                        ) : (
                            <>Modifier</>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Info Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-8">
                <h3 className="text-lg font-bold text-primary mb-6">Informations Personnelles</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                    {[
                        { label: 'Prénom', value: firstName, setter: setFirstName, icon: User, type: 'text' },
                        { label: 'Nom', value: lastName, setter: setLastName, icon: User, type: 'text' },
                        { label: 'Email', value: user.email, setter: null, icon: Mail, type: 'text' },
                        { label: 'Téléphone', value: phone, setter: setPhone, icon: Phone, type: 'text' },
                        { label: 'Université', value: university, setter: setUniversity, icon: Building, type: 'text' },
                        { label: 'Filière', value: field, setter: setField, icon: BookOpen, type: 'text' },
                        ...(user.role === 'STUDENT' ? [
                            { label: 'Niveau d\'étude', value: studyLevel, setter: setStudyLevel, icon: BookOpen, type: 'select', options: ['Licence 3', 'Master 1', 'Master 2', 'Autre'] },
                            { label: 'Date de soutenance prévue', value: targetDefenseDate, setter: setTargetDefenseDate, icon: BookOpen, type: 'date' }
                        ] : []),
                    ].map((f) => (
                        <div key={f.label}>
                            <label className="block text-sm font-medium text-text-secondary mb-2">{f.label}</label>
                            <div className="relative">
                                <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                {f.type === 'select' ? (
                                    <select
                                        value={f.value || ''}
                                        onChange={(e) => f.setter?.(e.target.value)}
                                        disabled={!editing || !f.setter}
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all appearance-none ${editing && f.setter
                                            ? 'border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent'
                                            : 'border-border-light bg-bg-light text-text-primary cursor-default'
                                            } outline-none`}
                                    >
                                        <option value="" disabled>Sélectionner...</option>
                                        {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type={f.type || 'text'}
                                        value={f.value || ''}
                                        onChange={(e) => f.setter?.(e.target.value)}
                                        disabled={!editing || !f.setter}
                                        placeholder={`Votre ${f.label.toLowerCase()}`}
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all ${editing && f.setter
                                            ? 'border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent'
                                            : 'border-border-light bg-bg-light text-text-primary cursor-default'
                                            } outline-none`}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Security */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-3">
                        <BrandIcon icon={Shield} size={36} className="!bg-accent/10 shadow-sm" iconClassName="!text-accent" />
                        Sécurité
                    </h3>
                    <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-sm text-accent hover:text-accent-dark font-semibold">
                        {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
                    </button>
                </div>

                {showPasswordForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Mot de passe actuel</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Mot de passe actuel"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Nouveau mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Confirmer le nouveau mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer le mot de passe"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm" />
                            </div>
                        </div>
                        <button onClick={handleChangePassword} disabled={changingPw} className="btn-primary py-3 px-6 text-sm">
                            {changingPw ? <><LoadingSpinner size="sm" light className="mr-2" /> Mise à jour...</> : <><Save className="w-4 h-4" /> Mettre à jour</>}
                        </button>
                    </motion.div>
                )}

                {!showPasswordForm && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-bg-light">
                            <div>
                                <div className="text-sm font-medium text-primary">Dernière connexion</div>
                                <div className="text-xs text-text-muted">Aujourd&apos;hui à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div className="w-2.5 h-2.5 bg-success rounded-full" />
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

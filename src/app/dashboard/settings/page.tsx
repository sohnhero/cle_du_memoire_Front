'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gear as Settings, Globe, Bell, ShieldCheck as Shield, Database, Palette, FloppyDisk as Save, ToggleLeft, ToggleRight, CaretRight as ChevronRight
} from '@phosphor-icons/react';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });
    const [maintenance, setMaintenance] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary">Paramètres</h1>
                <p className="text-text-secondary mt-1">Configuration de la plateforme</p>
            </div>

            {/* General */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent" /> Général
                </h3>
                <div className="space-y-5">
                    {[
                        { label: 'Nom de la plateforme', value: 'Clé du Mémoire', type: 'text' },
                        { label: 'Email de contact', value: 'contact@cledumemoire.sn', type: 'email' },
                        { label: 'Téléphone', value: '+221 77 000 00 00', type: 'tel' },
                        { label: 'Adresse', value: 'Dakar, Sénégal — Almadies', type: 'text' },
                    ].map((field) => (
                        <div key={field.label} className="grid sm:grid-cols-3 items-center gap-4">
                            <label className="text-sm font-medium text-text-secondary">{field.label}</label>
                            <div className="sm:col-span-2">
                                <input type={field.type} defaultValue={field.value}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm" />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6">
                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-accent" /> Notifications
                </h3>
                <div className="space-y-4">
                    {[
                        { key: 'email', label: 'Notifications par email', desc: 'Envoyer des emails pour les événements importants' },
                        { key: 'push', label: 'Notifications push', desc: 'Notifications dans le navigateur' },
                        { key: 'sms', label: 'Notifications SMS', desc: 'Envoyer des SMS pour les alertes critiques' },
                    ].map((notif) => (
                        <div key={notif.key} className="flex items-center justify-between p-4 rounded-xl bg-bg-light hover:bg-bg-light/80 transition-colors">
                            <div>
                                <div className="text-sm font-medium text-primary">{notif.label}</div>
                                <div className="text-xs text-text-muted mt-0.5">{notif.desc}</div>
                            </div>
                            <button
                                onClick={() => setNotifications({ ...notifications, [notif.key]: !notifications[notif.key as keyof typeof notifications] })}
                                className="text-accent"
                            >
                                {notifications[notif.key as keyof typeof notifications]
                                    ? <ToggleRight className="w-8 h-8" />
                                    : <ToggleLeft className="w-8 h-8 text-text-muted" />}
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Maintenance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6">
                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" /> Sécurité & Maintenance
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/10">
                        <div>
                            <div className="text-sm font-medium text-primary">Mode Maintenance</div>
                            <div className="text-xs text-text-muted">Désactive l&apos;accès public à la plateforme</div>
                        </div>
                        <button onClick={() => setMaintenance(!maintenance)}>
                            {maintenance ? <ToggleRight className="w-8 h-8 text-error" /> : <ToggleLeft className="w-8 h-8 text-text-muted" />}
                        </button>
                    </div>
                    {[
                        { label: 'Exporter les données', desc: 'Télécharger une sauvegarde complète' },
                        { label: 'Vider le cache', desc: 'Réinitialiser le cache de la plateforme' },
                        { label: 'Vérifier les mises à jour', desc: 'Chercher les nouvelles versions' },
                    ].map((action) => (
                        <button key={action.label} className="w-full flex items-center justify-between p-4 rounded-xl bg-bg-light hover:bg-accent/5 transition-colors text-left">
                            <div>
                                <div className="text-sm font-medium text-primary">{action.label}</div>
                                <div className="text-xs text-text-muted">{action.desc}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted" />
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="flex justify-end">
                <button className="btn-primary py-3 px-8 text-sm">
                    <Save className="w-4 h-4" /> Sauvegarder les paramètres
                </button>
            </div>
        </div>
    );
}

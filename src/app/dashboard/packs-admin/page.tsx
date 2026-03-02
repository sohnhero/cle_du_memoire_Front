'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, CheckCircle, MagnifyingGlass as Search, Faders as Filter, Plus, ShieldCheck as Shield, User, CreditCard, X, WarningCircle as AlertCircle, CircleNotch as Loader2
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const statusBadge: Record<string, string> = {
    PENDING: 'bg-warning/10 text-warning',
    ACTIVE: 'bg-success/10 text-success',
    EXPIRED: 'bg-error/10 text-error',
    PAID: 'bg-info/10 text-info',
    PARTIAL: 'bg-accent/10 text-accent',
    DEACTIVATED: 'bg-border text-text-muted',
};

const statusLabel: Record<string, string> = {
    PENDING: 'En attente',
    ACTIVE: 'Actif',
    EXPIRED: 'Expiré',
    PAID: 'Payé',
    PARTIAL: 'Avance',
    DEACTIVATED: 'Désactivé',
};

export default function AdminPacksPage() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [packs, setPacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'subs' | 'packs'>('subs');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [subsRes, packsRes] = await Promise.all([
                api.getAllSubscriptions(),
                api.getPacks()
            ]);
            setSubscriptions(subsRes.subscriptions || []);
            setPacks(packsRes.packs || []);
        } catch (error) {
            console.error("Erreur de chargement", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenPayment = (sub: any) => {
        setSelectedSubscription(sub);
        setIsPaymentModalOpen(true);
    };

    const filteredSubs = subscriptions.filter(sub => {
        const target = (sub.user?.firstName + ' ' + sub.user?.lastName + ' ' + sub.user?.email + ' ' + sub.pack?.name).toLowerCase();
        return target.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Gestion des Packs & Abonnements</h1>
                    <p className="text-text-secondary mt-1">Supervisez les forfaits et paiements des étudiants</p>
                </div>
                {activeTab === 'packs' && (
                    <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary py-3 px-6 text-sm">
                        <Plus className="w-4 h-4" /> Ajouter un Pack
                    </button>
                )}
            </div>

            {/* Sub/Packs Tabs */}
            <div className="flex bg-bg-light p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('subs')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'subs' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-primary'}`}
                >
                    Abonnements
                </button>
                <button
                    onClick={() => setActiveTab('packs')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'packs' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-primary'}`}
                >
                    Catalogue de Packs
                </button>
            </div>

            {activeTab === 'subs' && (
                <>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white rounded-xl border border-border px-4 py-3 shadow-sm focus-within:border-accent transition-all">
                            <Search className="w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Rechercher un étudiant ou un pack..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-sm outline-none flex-1 text-primary placeholder:text-text-muted"
                            />
                        </div>
                    </div>

                    <div className="card-premium overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-bg-light/50 border-b border-border-light text-text-secondary text-xs uppercase tracking-wider font-semibold">
                                        <th className="px-6 py-4">Étudiant</th>
                                        <th className="px-6 py-4">Pack</th>
                                        <th className="px-6 py-4 hidden md:table-cell">Date Souscription</th>
                                        <th className="px-6 py-4">Montant Payé</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                                <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                                                Chargement...
                                            </td>
                                        </tr>
                                    ) : filteredSubs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                                Aucun abonnement trouvé
                                            </td>
                                        </tr>
                                    ) : filteredSubs.map((sub, idx) => (
                                        <motion.tr
                                            key={sub.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="border-b border-border-light hover:bg-bg-light/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-info/10 text-info flex items-center justify-center font-bold text-sm">
                                                        {sub.user?.firstName?.[0]}{sub.user?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm text-primary">{sub.user?.firstName} {sub.user?.lastName}</div>
                                                        <div className="text-xs text-text-muted">{sub.user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-sm text-primary">{sub.pack?.name}</div>
                                                <div className="text-xs text-text-muted">{sub.pack?.price} FCFA</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-secondary hidden md:table-cell">
                                                {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-primary">{sub.amountPaid} FCFA</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[sub.status] || 'bg-border text-text-secondary'}`}>
                                                    {statusLabel[sub.status] || sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {sub.status === 'PENDING' || sub.status === 'PARTIAL' ? (
                                                    <button onClick={() => handleOpenPayment(sub)} className="px-3 py-1.5 bg-success/10 text-success hover:bg-success/20 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto">
                                                        <CreditCard className="w-3.5 h-3.5" /> Encaisser
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-text-muted">—</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'packs' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-12 flex justify-center">
                            <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                        </div>
                    ) : packs.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-text-muted card-premium">
                            Aucun pack disponible.
                        </div>
                    ) : packs.map((pack, idx) => (
                        <motion.div
                            key={pack.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card-premium p-6"
                        >
                            <BrandIcon icon={Package} size={48} className="mb-4 shadow-sm" />
                            <h3 className="text-lg font-bold text-primary">{pack.name}</h3>
                            <p className="text-sm text-text-secondary mt-1 mb-3 line-clamp-2">{pack.description}</p>
                            <div className="text-2xl font-extrabold text-primary mb-2">{pack.price} FCFA</div>

                            <h4 className="text-xs font-bold text-text-secondary uppercase mb-2">Caractéristiques</h4>
                            <ul className="space-y-1.5 mb-6 text-sm text-text-primary">
                                {JSON.parse(pack.features || '[]').map((f: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                                        <span className="leading-tight">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-bg-light transition-colors text-text-secondary">
                                Modifier le pack
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreatePackModal onClose={() => setIsCreateModalOpen(false)} onSuccess={loadData} />
                )}
                {isPaymentModalOpen && selectedSubscription && (
                    <PaymentModal
                        subscription={selectedSubscription}
                        onClose={() => { setIsPaymentModalOpen(false); setSelectedSubscription(null); }}
                        onSuccess={loadData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function CreatePackModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: '', description: '', price: 0,
        features: '', // Comma separated for simplicity in UI
        installment1: 0, installment2: 0
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSubmit = {
                ...formData,
                price: Number(formData.price),
                installment1: Number(formData.installment1) || null,
                installment2: Number(formData.installment2) || null,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
            };
            await api.createPack(dataToSubmit);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Erreur lors de la création");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Créer un nouveau Pack</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Nom du Pack</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent resize-none min-h-[80px]" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Prix (FCFA)</label>
                        <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Caractéristiques (séparées par une virgule)</label>
                        <textarea value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} placeholder="Ex: Accompagnement, 2 séances, Email prioritaire" className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent resize-none min-h-[80px]" required />
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border-light">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                            {isSaving ? 'Création...' : 'Créer le Pack'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function PaymentModal({ subscription, onClose, onSuccess }: { subscription: any, onClose: () => void, onSuccess: () => void }) {
    const remaining = subscription.pack.price - subscription.amountPaid;
    const [amount, setAmount] = useState<number>(remaining);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (amount <= 0) {
            setError("Le montant doit être supérieur à 0");
            return;
        }
        if (amount > remaining) {
            setError(`Le montant ne peut pas dépasser le reste à payer (${remaining} FCFA)`);
            return;
        }

        setIsSaving(true);
        try {
            await api.recordPayment(subscription.id, amount);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'enregistrement du paiement");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-primary">Encaisser un paiement</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-primary mb-2">Paiement Enregistré</h4>
                        <p className="text-sm text-text-secondary">L'abonnement a été mis à jour.</p>
                    </motion.div>
                ) : (
                    <>
                        <div className="mb-6 p-4 rounded-xl border border-border-light bg-bg-light space-y-2 text-sm text-primary">
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-medium">Étudiant:</span>
                                <span className="font-bold">{subscription.user.firstName} {subscription.user.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-medium">Pack:</span>
                                <span className="font-bold">{subscription.pack.name}</span>
                            </div>
                            <div className="flex justify-between border-t border-border/10 pt-2 mt-2 font-medium">
                                <span className="text-text-secondary">Total:</span>
                                <span className="text-primary">{subscription.pack.price.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-success">
                                <span>Déjà payé:</span>
                                <span className="font-bold">{subscription.amountPaid.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-error font-bold">
                                <span>Reste:</span>
                                <span>{remaining.toLocaleString()} FCFA</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Montant reçu (FCFA)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={remaining}
                                    value={amount}
                                    onChange={e => setAmount(Number(e.target.value))}
                                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-base font-bold text-primary outline-none focus:border-accent transition-all"
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-error font-medium flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                                </p>
                            )}

                            <div className="mt-8 flex flex-col gap-3">
                                <button type="submit" disabled={isSaving || amount <= 0 || amount > remaining} className="btn-success w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-success/20">
                                    {isSaving ? (
                                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Validation...</span>
                                    ) : (
                                        'Confirmer l\'encaissement'
                                    )}
                                </button>
                                <button type="button" onClick={onClose} className="w-full py-3 text-sm font-semibold text-text-secondary hover:bg-bg-light rounded-xl transition-colors">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}

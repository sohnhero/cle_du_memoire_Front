'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, CheckCircle, Clock, CreditCard, ArrowRight, Star, WarningCircle as AlertCircle, CircleNotch as Loader2, X
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';

export default function PacksPage() {
    const [packs, setPacks] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [selectedSubForPay, setSelectedSubForPay] = useState<any>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [packsRes, subsRes] = await Promise.allSettled([
                api.getPacks(),
                api.getMySubscriptions(),
            ]);
            if (packsRes.status === 'fulfilled') setPacks(packsRes.value.packs);
            if (subsRes.status === 'fulfilled') setSubscriptions(subsRes.value.subscriptions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function getSubscriptionForPack(packId: string) {
        return subscriptions.find(s => s.packId === packId);
    }

    function getStatusBadge(status: string) {
        const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
            ACTIVE: { label: 'Actif', color: 'bg-success text-white shadow-sm', icon: <CheckCircle weight="bold" className="w-3.5 h-3.5" /> },
            PAID: { label: 'Payé', color: 'bg-success text-white shadow-sm', icon: <CheckCircle weight="bold" className="w-3.5 h-3.5" /> },
            PENDING: { label: 'En attente', color: 'bg-warning text-white shadow-sm', icon: <Clock weight="bold" className="w-3.5 h-3.5" /> },
            PARTIAL: { label: 'Partiel', color: 'bg-info text-white shadow-sm', icon: <CreditCard weight="bold" className="w-3.5 h-3.5" /> },
            EXPIRED: { label: 'Expiré', color: 'bg-error text-white shadow-sm', icon: <AlertCircle weight="bold" className="w-3.5 h-3.5" /> },
            DEACTIVATED: { label: 'Inactif', color: 'bg-text-secondary text-white shadow-sm', icon: <ArrowRight weight="bold" className="w-3.5 h-3.5" /> },
        };
        return map[status] || map.PENDING;
    }

    async function handleSubscribe(packId: string) {
        // Confirmation if switching
        const hasActiveOrPending = subscriptions.some(s => ['ACTIVE', 'PAID', 'PENDING', 'PARTIAL'].includes(s.status));
        if (hasActiveOrPending) {
            const confirmed = window.confirm("Le passage à ce nouveau pack remplacera votre abonnement actuel. Souhaitez-vous continuer ?");
            if (!confirmed) return;
        }

        setSubscribing(packId);
        try {
            await api.subscribePack(packId);
            setToast({ message: 'Demande de changement envoyée ! L\'admin l\'activera sous peu.', type: 'success' });
            await loadData();
        } catch (err: any) {
            setToast({ message: err.message || 'Erreur lors de la souscription', type: 'error' });
        } finally {
            setSubscribing(null);
            setTimeout(() => setToast(null), 4000);
        }
    }

    // Find active subscription to show at the top
    const activeSub = subscriptions.find(s => s.status === 'ACTIVE' || s.status === 'PAID');

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-primary">Mes Packs</h1>
                <p className="text-text-secondary mt-1">Gérez vos abonnements et découvrez nos formules</p>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Subscription Banner */}
            {activeSub && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-primary rounded-2xl p-6 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <BrandIcon icon={Package} size={56} className="ring-2 ring-white/20 shadow-xl" />
                            <div>
                                <div className="text-xl font-bold">{activeSub.pack?.name || 'Pack'}</div>
                                <div className="text-white/60 text-sm">
                                    Activé le {new Date(activeSub.activatedAt || activeSub.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        <span className="px-3 py-1.5 rounded-full bg-success text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
                            <CheckCircle weight="bold" className="w-3.5 h-3.5" /> Actif
                        </span>
                    </div>
                    {activeSub.pack && (
                        <div className="mt-4 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, (activeSub.amountPaid / activeSub.pack.price) * 100)}%` }} />
                        </div>
                    )}
                    {activeSub.pack && (
                        <div className="flex justify-between mt-2 text-xs text-white/50">
                            <span>{activeSub.amountPaid.toLocaleString()} FCFA payé</span>
                            <span>{activeSub.pack.price.toLocaleString()} FCFA total</span>
                        </div>
                    )}
                </motion.div>
            )}

            {/* All Packs */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {packs.map((pack, index) => {
                    const sub = getSubscriptionForPack(pack.id);
                    const isActive = sub && (sub.status === 'ACTIVE' || sub.status === 'PAID');
                    const isPending = sub && (sub.status === 'PENDING' || sub.status === 'PARTIAL');
                    const features: string[] = (() => {
                        try { return JSON.parse(pack.features); } catch { return []; }
                    })();

                    return (
                        <motion.div
                            key={pack.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`card-premium p-5 relative flex flex-col ${isActive ? 'ring-2 ring-accent' : ''}`}
                        >
                            {/* Status badge */}
                            {sub && (
                                <div className="absolute -top-3 right-4">
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${getStatusBadge(sub.status).color}`}>
                                        {getStatusBadge(sub.status).icon}
                                        {sub.status === 'PARTIAL' ? 'Paiement Partiel' : getStatusBadge(sub.status).label}
                                    </span>
                                </div>
                            )}

                            <BrandIcon icon={Package} size={36} className="mb-3 shadow-md" />

                            <h3 className="text-base font-bold text-primary">{pack.name}</h3>
                            <p className="text-xs text-text-secondary mt-0.5 mb-3 line-clamp-2">{pack.description}</p>
                            <div className="text-xl font-extrabold text-primary mb-1">{pack.price.toLocaleString()} FCFA</div>

                            {/* Installments Info */}
                            {pack.installment1 && pack.installment2 && (
                                <p className="text-[11px] font-medium text-info mb-4">En 2x : {pack.installment1.toLocaleString()} puis {pack.installment2.toLocaleString()} FCFA</p>
                            )}

                            {/* Partial Payment Progress */}
                            {sub && sub.status === 'PARTIAL' && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-success">{sub.amountPaid.toLocaleString()} FCFA payé</span>
                                        <span className="text-error">Reste: {(pack.price - sub.amountPaid).toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-border-light rounded-full overflow-hidden">
                                        <div className="h-full bg-success rounded-full" style={{ width: `${Math.min(100, (sub.amountPaid / pack.price) * 100)}%` }} />
                                    </div>
                                </div>
                            )}

                            <ul className="space-y-1.5 mb-5 flex-1">
                                {features.map((f: string) => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-text-primary">
                                        <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                                        <span className="leading-tight">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto">
                                {subscribing === pack.id ? (
                                    <div className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all bg-primary/10 text-primary flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Souscription...
                                    </div>
                                ) : isActive ? (
                                    <div className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all bg-success text-white flex items-center justify-center gap-2 cursor-default shadow-sm">
                                        <CheckCircle weight="bold" className="w-4 h-4" /> Pack Actif
                                    </div>
                                ) : sub?.status === 'PARTIAL' ? (
                                    <button
                                        onClick={() => { setSelectedSubForPay(sub); setPaymentModalOpen(true); }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-success text-white rounded-xl font-bold hover:bg-success/90 transition-all text-xs shadow-sm hover:shadow"
                                    >
                                        <CreditCard weight="bold" className="w-4 h-4" /> Finaliser le paiement
                                    </button>
                                ) : isPending ? (
                                    <button
                                        onClick={() => { setSelectedSubForPay(sub); setPaymentModalOpen(true); }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-warning text-white rounded-xl font-bold hover:bg-warning/90 transition-all text-xs shadow-sm hover:shadow"
                                    >
                                        <Clock weight="bold" className="w-4 h-4" /> Activer mon pack
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSubscribe(pack.id)}
                                        className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all bg-primary hover:bg-primary-dark text-white shadow hover:shadow-md flex items-center justify-center gap-2"
                                    >
                                        Souscrire <ArrowRight weight="bold" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {paymentModalOpen && selectedSubForPay && (
                    <PaymentNotificationModal
                        subscription={selectedSubForPay}
                        onClose={() => setPaymentModalOpen(false)}
                        onSuccess={() => {
                            setPaymentModalOpen(false);
                            setToast({ message: 'Paiement notifié avec succès !', type: 'success' });
                            loadData();
                        }}
                    />
                )}
            </AnimatePresence>

            {packs.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                    <BrandIcon icon={Package} size={64} className="mx-auto mb-4 opacity-30 grayscale" />
                    <p>Aucun pack disponible pour le moment.</p>
                </div>
            )}
        </div>
    );
}

function PaymentNotificationModal({ subscription, onClose, onSuccess }: { subscription: any, onClose: () => void, onSuccess: () => void }) {
    const [method, setMethod] = useState<'WAVE' | 'OM'>('WAVE');
    const [reference, setReference] = useState('');
    const [amount, setAmount] = useState<number>(subscription.pack.installment1 || subscription.pack.price);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.notifyPayment({ method, reference, amount });
            onSuccess();
        } catch (err) {
            alert('Erreur lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Notifier mon paiement</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-bg-light border border-border-light text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="text-text-secondary">Pack:</span>
                        <span className="font-bold text-primary">{subscription.pack.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Prix:</span>
                        <span className="font-bold text-accent">{subscription.pack.price.toLocaleString()} FCFA</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setMethod('WAVE')} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'WAVE' ? 'border-accent bg-accent/5' : 'border-border-light'}`}>
                            <span className="text-blue-500 font-black text-xs">WAVE</span>
                        </button>
                        <button type="button" onClick={() => setMethod('OM')} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'OM' ? 'border-orange-500 font-black text-xs' : 'border-border-light'}`}>
                            <span className="text-orange-500 font-black text-xs">Orange Money</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5">Référence de transaction</label>
                        <input type="text" value={reference} onChange={e => setReference(e.target.value)} required placeholder="Saisissez la référence..." className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-accent" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5">Montant envoyé (FCFA)</label>
                        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-accent font-bold" />
                    </div>

                    <button type="submit" disabled={loading || !reference} className="btn-primary w-full justify-center py-3.5 mt-4 disabled:opacity-50">
                        {loading ? 'Envoi...' : 'Confirmer le paiement'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

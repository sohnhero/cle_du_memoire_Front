'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, CheckCircle, Clock, CreditCard, ArrowRight, Star, WarningCircle as AlertCircle, CircleNotch as Loader2, CircleNotch, X
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PacksPage() {
    const [packs, setPacks] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [selectedSubForPay, setSelectedSubForPay] = useState<any>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [pendingPackSwitch, setPendingPackSwitch] = useState<string | null>(null);

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
            setPendingPackSwitch(packId);
            return;
        }
        await doSubscribe(packId);
    }

    async function doSubscribe(packId: string) {

        setSubscribing(packId);
        try {
            await api.subscribePack(packId);
            setLocalToast({ message: 'Demande de changement envoyée ! L\'admin l\'activera sous peu.', type: 'success' });
            await loadData();
        } catch (err: any) {
            setLocalToast({ message: err.message || 'Erreur lors de la souscription', type: 'error' });
        } finally {
            setSubscribing(null);
            setTimeout(() => setLocalToast(null), 4000);
        }
    }

    // Find active subscription to show at the top
    const activeSub = subscriptions.find(s => s.status === 'ACTIVE' || s.status === 'PAID');

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
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
                {localToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl text-sm font-medium ${localToast.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
                    >
                        {localToast.message}
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
                                        <LoadingSpinner size="sm" className="inline-block mr-2" /> Souscription...
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
                            toast.success('Paiement notifié avec succès ! Rechargez après confirmation admin.');
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
            <ConfirmModal
                isOpen={!!pendingPackSwitch}
                onClose={() => setPendingPackSwitch(null)}
                onConfirm={() => pendingPackSwitch && doSubscribe(pendingPackSwitch)}
                title="Changer de pack"
                message="Le passage à ce nouveau pack remplacera votre abonnement actuel. Souhaitez-vous continuer ?"
                confirmText="Changer de pack"
                variant="warning"
            />
        </div>
    );
}

function PaymentNotificationModal({ subscription, onClose, onSuccess }: { subscription: any, onClose: () => void, onSuccess: () => void }) {
    const [method, setMethod] = useState<'WAVE' | 'OM'>('WAVE');
    const [reference, setReference] = useState('');
    const [amount, setAmount] = useState<number>(subscription.pack.installment1 || subscription.pack.price);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.notifyPayment({ method, reference, amount });
            setSubmitted(true);
        } catch (err) {
            toast.error('Erreur lors de l\'envoi');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-primary backdrop-blur-sm overflow-x-hidden overflow-y-auto" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative bg-white sm:rounded-3xl shadow-2xl w-full h-full sm:h-auto sm:max-w-sm overflow-x-hidden overflow-y-hidden sm:overflow-hidden mx-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-5 sm:px-6 py-4 sm:py-5 text-white relative flex-shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-accent" weight="duotone" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold truncate">Notifier mon paiement</h3>
                            <p className="text-white/60 text-[10px] sm:text-xs truncate">{subscription.pack.name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {!submitted ? (
                        <div className="p-5 sm:p-6">
                            {/* Pack recap */}
                            <div className="flex items-center justify-between mb-5 p-3 rounded-xl bg-bg-light">
                                <span className="text-xs text-text-secondary font-medium">Montant total</span>
                                <span className="text-base font-extrabold text-primary">{subscription.pack.price.toLocaleString()} FCFA</span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Payment Method */}
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Mode de paiement</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setMethod('WAVE')}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all text-sm font-bold ${method === 'WAVE'
                                                ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                                : 'border-border-light text-text-muted hover:border-border'
                                                }`}
                                        >
                                            <img src="https://res.cloudinary.com/drxouwbms/image/upload/v1772797036/wave-logo_hbzxvn.png" alt="Wave" className="w-5 h-5 object-contain" /> Wave
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMethod('OM')}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all text-sm font-bold ${method === 'OM'
                                                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                                                : 'border-border-light text-text-muted hover:border-border'
                                                }`}
                                        >
                                            <img src="https://res.cloudinary.com/drxouwbms/image/upload/v1772797043/orange-logo_j6jc2f.png" alt="OM" className="w-5 h-5 object-contain" /> OM
                                        </button>
                                    </div>
                                </div>

                                {/* Reference */}
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Référence de transaction</label>
                                    <input
                                        type="text"
                                        value={reference}
                                        onChange={e => setReference(e.target.value)}
                                        required
                                        placeholder="Ex: TXN-12345678"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-bg-light/50 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 text-primary font-medium placeholder:text-text-muted/50 transition-all"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Montant envoyé (FCFA)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(Number(e.target.value))}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-bg-light/50 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 text-primary font-bold placeholder:text-text-muted/50 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !reference}
                                    className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-40 text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <LoadingSpinner size="sm" light className="mr-2" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <><CreditCard className="w-4 h-4" weight="bold" /> Confirmer le paiement</>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Success State with reload hint */
                        <div className="p-6 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center"
                            >
                                <CheckCircle className="w-8 h-8 text-success" weight="fill" />
                            </motion.div>
                            <h4 className="text-lg font-bold text-primary mb-2">Paiement notifié !</h4>
                            <p className="text-sm text-text-secondary leading-relaxed mb-5">
                                Votre notification a été envoyée à l’administrateur.
                                Il va vérifier et confirmer votre paiement.
                            </p>

                            <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 mb-5">
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="relative flex items-center justify-center">
                                        <span className="animate-ping absolute h-3 w-3 rounded-full bg-accent/40" />
                                        <Clock className="w-4 h-4 text-accent relative" weight="bold" />
                                    </div>
                                    <p className="text-xs font-bold text-accent">En attente de confirmation admin</p>
                                </div>
                                <p className="text-[11px] text-text-muted mt-1">Rechargez la page après confirmation pour voir votre pack activé.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-bg-light text-primary hover:bg-border/30 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                                    Recharger
                                </button>
                                <button
                                    onClick={() => { onSuccess(); }}
                                    className="flex-1 btn-primary py-2.5 text-sm justify-center"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Lock, CreditCard, CheckCircle, CircleNotch, ArrowRight, Clock, ArrowsClockwise, ShieldCheck, BookOpen, UserCircle
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import Logo from './Logo';
import toast from 'react-hot-toast';

interface PaymentGateProps {
    children: React.ReactNode;
    user: any;
}

export default function PaymentGate({ children, user }: PaymentGateProps) {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [method, setMethod] = useState<'WAVE' | 'OM'>('WAVE');
    const [reference, setReference] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');

    useEffect(() => {
        if (user?.role === 'STUDENT') {
            checkSubscription();
        } else {
            setLoading(false);
        }
    }, [user]);

    const checkSubscription = async () => {
        try {
            const res = await api.getMySubscriptions();
            const activeOrPartial = res.subscriptions.find((s: any) => s.status === 'ACTIVE' || s.status === 'PAID' || s.status === 'PARTIAL');
            const pending = res.subscriptions.find((s: any) => s.status === 'PENDING');

            const subToShow = activeOrPartial || pending || res.subscriptions[0];
            setSubscription(subToShow);
            if (subToShow) setAmount(subToShow.pack?.installment1 || subToShow.pack?.price || 0);
        } catch (err) {
            console.error('Failed to check subscription', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNotify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reference) return;

        setStatus('SENDING');
        try {
            await api.notifyPayment({ method, reference, amount });
            setStatus('SUCCESS');
        } catch (err) {
            setStatus('ERROR');
            toast.error("Erreur lors de l'envoi. Réessayez.");
        }
    };

    if (user?.role !== 'STUDENT') return <>{children}</>;
    if (loading) return null;

    const isAuthorized = subscription && (
        subscription.status === 'ACTIVE' ||
        subscription.status === 'PAID' ||
        (subscription.status === 'PARTIAL' && subscription.pack?.installment1)
    );

    if (isAuthorized) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-4 overflow-y-auto">
            {/* Subtle background glow */}
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-accent rounded-full blur-[140px]" />
                <div className="absolute bottom-1/3 right-1/3 w-60 h-60 bg-info rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-[92vw] sm:max-w-md mx-auto"
            >
                {/* Logo */}
                <div className="flex justify-center mb-6 sm:mb-8">
                    <Logo className="w-32 sm:w-48 h-auto" font-bold monochrome={true} />
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">

                    {status === 'SUCCESS' ? (
                        /* ── Success State ── */
                        <div className="p-6 sm:p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 rounded-full bg-success/10 flex items-center justify-center"
                            >
                                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-success" weight="fill" />
                            </motion.div>

                            <h3 className="text-base sm:text-lg font-black text-primary mb-2">Paiement notifié avec succès !</h3>
                            <p className="text-[11px] sm:text-sm text-text-secondary leading-relaxed mb-6">
                                Votre référence a bien été transmise à notre équipe.
                            </p>

                            {/* Admin wait indicator */}
                            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 mb-6">
                                <div className="flex items-center gap-2 justify-center mb-1.5">
                                    <div className="relative flex items-center justify-center">
                                        <span className="animate-ping absolute h-3 w-3 rounded-full bg-accent/40" />
                                        <Clock className="w-4 h-4 text-accent relative" weight="bold" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-black text-accent">En attente de confirmation</span>
                                </div>
                                <p className="text-[10px] sm:text-[11px] text-text-muted leading-tight">
                                    Généralement validé en moins d'une heure.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    <ArrowsClockwise className="w-4 h-4" weight="bold" />
                                    Recharger la page
                                </button>
                                <button
                                    onClick={() => setStatus('IDLE')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-bg-light text-primary font-bold text-sm hover:bg-border/30 transition-colors"
                                >
                                    Autre référence
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ── Payment Form ── */
                        <>
                            {/* Header */}
                            <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5 border-b border-border/50 bg-gradient-to-b from-bg-light/50 to-white text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                        <Lock className="w-3 h-3 text-accent-dark" weight="fill" />
                                    </div>
                                    <span className="text-[9px] sm:text-[11px] font-bold text-accent-dark uppercase tracking-widest">Activation requise</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-primary mb-1">Activez votre espace</h3>
                                <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed">
                                    Sélectionnez votre mode de paiement et saisissez la référence.
                                </p>
                            </div>

                            {/* Pack Info */}
                            {subscription && (
                                <div className="mx-4 sm:mx-6 p-4 rounded-2xl bg-primary text-white mb-5 shadow-lg shadow-primary/20">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Votre pack</div>
                                            <div className="text-sm font-bold mt-0.5 truncate">{subscription.pack?.name}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-lg sm:text-xl font-black">{subscription.pack?.price.toLocaleString()}</div>
                                            <div className="text-[10px] font-bold text-white/50">FCFA</div>
                                        </div>
                                    </div>
                                    {subscription.pack?.installment1 && (
                                        <div className="mt-3 pt-3 border-t border-white/10 text-[10px] sm:text-[11px] text-white/70">
                                            💡 Paiement en 2x : <strong className="text-white">{subscription.pack.installment1.toLocaleString()} FCFA</strong> min.
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleNotify} className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2 space-y-4 sm:space-y-5">
                                {/* Payment Method */}
                                <div>
                                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                                        Mode de paiement
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setMethod('WAVE')}
                                            className={`relative flex items-center justify-center gap-2.5 py-3 sm:py-3.5 rounded-xl border-2 transition-all text-sm font-bold ${method === 'WAVE'
                                                ? 'border-[#1cd4ff] bg-[#1cd4ff]/10 text-primary shadow-sm'
                                                : 'border-border-light text-text-secondary hover:border-[#1cd4ff]/50 hover:bg-[#1cd4ff]/5'
                                                }`}
                                        >
                                            <img src="https://res.cloudinary.com/drxouwbms/image/upload/v1772797036/wave-logo_hbzxvn.png" alt="Wave Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain rounded-md" />
                                            Wave
                                            {method === 'WAVE' && (
                                                <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#1cd4ff]" weight="fill" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMethod('OM')}
                                            className={`relative flex items-center justify-center gap-2.5 py-3 sm:py-3.5 rounded-xl border-2 transition-all text-sm font-bold ${method === 'OM'
                                                ? 'border-[#ff7900] bg-[#ff7900]/10 text-primary shadow-sm'
                                                : 'border-border-light text-text-secondary hover:border-[#ff7900]/50 hover:bg-[#ff7900]/5'
                                                }`}
                                        >
                                            <img src="https://res.cloudinary.com/drxouwbms/image/upload/v1772797043/orange-logo_j6jc2f.png" alt="Orange Money Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain rounded-md" />
                                            OM
                                            {method === 'OM' && (
                                                <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#ff7900]" weight="fill" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Reference */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                                            Référence de transaction
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: TXN-78451290"
                                            value={reference}
                                            onChange={e => setReference(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-bg-light/30 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm font-medium text-primary placeholder:text-text-muted/40"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                                            Montant payé (FCFA)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={amount}
                                            onChange={e => setAmount(Number(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-bg-light/30 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm font-bold text-primary"
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {status === 'ERROR' && (
                                    <p className="text-xs text-error font-medium text-center">
                                        Une erreur s'est produite.
                                    </p>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={status === 'SENDING' || !reference}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 transition-all disabled:opacity-40 shadow-lg shadow-accent/20"
                                >
                                    {status === 'SENDING' ? (
                                        <><CircleNotch className="w-4 h-4 animate-spin" weight="bold" /> Envoi...</>
                                    ) : (
                                        <>Débloquer mon accès <ArrowRight className="w-4 h-4" weight="bold" /></>
                                    )}
                                </button>

                                <p className="text-[10px] text-center text-text-muted leading-relaxed">
                                    Paiement sécurisé via réseau mobile.
                                </p>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-white/30 mt-4">
                    Besoin d'aide ? Contactez-nous via WhatsApp
                </p>
            </motion.div>
        </div>
    );
}

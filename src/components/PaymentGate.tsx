'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CreditCard, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import Logo from './Logo';

interface PaymentGateProps {
    children: React.ReactNode;
    user: any;
}

export default function PaymentGate({ children, user }: PaymentGateProps) {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
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
            // Re-check after a short delay
            setTimeout(checkSubscription, 2000);
        } catch (err) {
            setStatus('ERROR');
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
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
                {/* Visual Side */}
                <div className="md:w-5/12 bg-primary p-6 md:p-8 text-white flex flex-col justify-between">
                    <div>
                        <div className="mb-8">
                            <Logo className="w-24 h-auto" monochrome />
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-bold tracking-widest uppercase mb-4">
                            <Lock className="w-3 h-3" /> Accès Restreint
                        </div>
                        <h2 className="text-2xl font-black mb-4 leading-tight">
                            Commencez votre <span className="text-accent underline decoration-accent/30 underline-offset-8">aventure</span> vers l'excellence.
                        </h2>
                        <p className="text-white/60 text-xs leading-relaxed mb-6">
                            Activez votre pack pour débloquer votre espace de travail personnalisé.
                        </p>

                        <div className="space-y-3">
                            {[
                                "Accès complet au tableau de bord",
                                "Attribution d'un accompagnateur",
                                "Outils de rédaction assistée",
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                                    <CheckCircle className="w-3.5 h-3.5 text-accent" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 hidden md:block">
                        <p className="text-[10px] text-white/40 italic">
                            Besoin d'aide ? Contactez notre support via WhatsApp.
                        </p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-6 md:p-10 flex flex-col justify-center overflow-y-auto">
                    {status === 'SUCCESS' ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-4">Paiement notifié !</h3>
                            <p className="text-text-secondary mb-8">
                                Nous avons bien reçu vos informations. Un administrateur va valider votre accès dans les plus brefs délais (généralement moins d'une heure).
                            </p>
                            <button onClick={() => setStatus('IDLE')} className="btn-primary w-full justify-center py-4">
                                Envoyer une autre référence
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-primary mb-2">Activer mon compte</h3>
                                <p className="text-text-secondary text-sm">
                                    Effectuez votre paiement via {method} et renseignez la référence.
                                </p>
                            </div>

                            {subscription && (
                                <div className="mb-8 p-6 rounded-2xl bg-bg-light border border-border-light">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold text-text-muted uppercase">Pack Sélectionné</span>
                                        <span className="text-xs font-black text-accent">{subscription.pack?.name}</span>
                                    </div>
                                    <div className="text-2xl font-black text-primary mb-1">
                                        {subscription.pack?.price.toLocaleString()} FCFA
                                    </div>
                                    {subscription.pack?.installment1 && (
                                        <p className="text-xs text-info flex items-center gap-1.5 mt-2">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Vous pouvez payer par tranches. Minimum à payer : <b>{subscription.pack.installment1.toLocaleString()} FCFA</b>
                                        </p>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleNotify} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-4">Moyen de paiement</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'WAVE', label: 'Wave', color: 'bg-[#21b7ff]', logo: 'https://wave.com/static/wave-logo.svg' },
                                            { id: 'OM', label: 'Orange Money', color: 'bg-[#ff7900]', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg' }
                                        ].map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setMethod(m.id as any)}
                                                className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${method === m.id ? 'border-accent bg-accent/5' : 'border-border-light hover:border-accent/30'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden`}>
                                                    <span className={`font-black text-xs ${m.id === 'WAVE' ? 'text-blue-500' : 'text-orange-500'}`}>{m.label}</span>
                                                </div>
                                                <span className="text-xs font-bold text-primary">{m.label}</span>
                                                {method === m.id && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircle className="w-4 h-4 text-accent" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-primary mb-2">Référence de la transaction</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Saisissez la référence du message reçu"
                                                value={reference}
                                                onChange={e => setReference(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-primary mb-2">Montant payé (FCFA)</label>
                                        <input
                                            type="number"
                                            required
                                            value={amount}
                                            onChange={e => setAmount(Number(e.target.value))}
                                            className="w-full px-4 py-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm font-bold text-primary"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'SENDING' || !reference}
                                    className="btn-primary w-full justify-center py-4 shadow-xl shadow-accent/20 disabled:opacity-50"
                                >
                                    {status === 'SENDING' ? (
                                        <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</span>
                                    ) : (
                                        <span className="flex items-center gap-2">Débloquer mon accès <ArrowRight className="w-5 h-5" /></span>
                                    )}
                                </button>

                                <p className="text-[10px] text-center text-text-muted leading-relaxed max-w-xs mx-auto">
                                    En cliquant sur "Débloquer", vous confirmez avoir effectué le paiement manuel. Toute fausse déclaration entraînera la suspension définitive du compte.
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

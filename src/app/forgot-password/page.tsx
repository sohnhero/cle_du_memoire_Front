'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import Loader from '@/components/Loader';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await api.forgotPassword(email);
            setMessage(res.message);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Loader fullScreen show={loading} text="Envoi en cours..." />
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-primary/5">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-[100px]" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-info rounded-full blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl relative z-10 border border-border"
                >
                    <div className="flex justify-center mb-8">
                        <Logo className="w-48 h-auto" monochrome={false} />
                    </div>

                    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la connexion
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-primary mb-2">Mot de passe oublié</h1>
                        <p className="text-text-secondary text-sm">
                            Entrez votre adresse email pour recevoir un lien de réinitialisation.
                        </p>
                    </div>

                    {message ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                                {message}
                            </p>
                            <Link href="/login" className="btn-primary w-full justify-center">
                                Retourner à la page de connexion
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm border border-error/20">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre@email.com"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="btn-primary w-full justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Envoyer le lien
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </>
    );
}

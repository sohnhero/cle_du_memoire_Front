'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import Loader from '@/components/Loader';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Token de réinitialisation manquant.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.resetPassword({ token: token!, newPassword });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la réinitialisation.');
        } finally {
            setLoading(false);
        }
    };

    if (!token && !error) return null;

    return (
        <>
            <Loader fullScreen show={loading} text="Réinitialisation en cours..." />
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

                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-primary mb-2">Nouveau mot de passe</h1>
                        <p className="text-text-secondary text-sm">
                            Définissez votre nouveau mot de passe sécurisé.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary mb-2">Succès !</h3>
                            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                                Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
                            </p>
                            <Link href="/login" className="btn-primary w-full justify-center py-4">
                                Se connecter
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm border border-error/20 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">Nouveau mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 caractères"
                                        required
                                        className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Répétez le mot de passe"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="btn-primary w-full justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Réinitialiser le mot de passe
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>

                            <div className="text-center mt-6">
                                <Link href="/login" className="text-sm text-text-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour à la connexion
                                </Link>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </>
    );
}

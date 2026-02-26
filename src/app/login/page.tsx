'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Loader fullScreen show={loading} text="Connexion en cours..." />
            <div className="min-h-screen flex isolate perspective-[1000px]">
                {/* Left Panel - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-light to-primary-dark relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-[100px]" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-info rounded-full blur-[120px]" />
                    </div>
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }} />

                    <div className="relative flex flex-col justify-center items-center w-full p-16">
                        <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center opacity-0 translate-y-4 transform-gpu backface-hidden will-change-[opacity,transform]"
                        >
                            <div className="mx-auto mb-8 flex justify-center">
                                <Logo className="w-48 h-auto" monochrome />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Bon retour parmi nous !</h2>
                            <p className="text-white/60 max-w-md leading-relaxed">
                                Accédez à votre espace personnel pour suivre votre progression et communiquer avec votre accompagnateur.
                            </p>

                            <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
                                {[
                                    { emoji: '📊', text: 'Suivi en temps réel de votre mémoire' },
                                    { emoji: '💬', text: 'Messagerie directe avec votre accompagnateur' },
                                    { emoji: '📁', text: 'Gestion centralisée de vos documents' },
                                ].map((item) => (
                                    <div key={item.text} className="flex items-center gap-3 text-white/70 text-sm">
                                        <span className="text-lg">{item.emoji}</span>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <motion.div
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full max-w-md mx-auto opacity-0 translate-x-4 transform-gpu backface-hidden will-change-[opacity,transform]"
                    >
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Logo className="w-48 h-auto" monochrome={false} />
                        </div>

                        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-6">
                            <ArrowLeft className="w-4 h-4" />
                            Retour à l&apos;accueil
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-primary mb-2">Connexion</h1>
                            <p className="text-text-secondary">
                                Accédez à votre espace personnel
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm mb-6 border border-error/20 opacity-0 -translate-y-2 transform-gpu backface-hidden will-change-[opacity,transform]"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
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

                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Votre mot de passe"
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

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-border text-accent focus:ring-accent/30" />
                                    <span className="text-sm text-text-secondary">Se souvenir de moi</span>
                                </label>
                                <a href="#" className="text-sm text-accent hover:text-accent-dark font-medium">Mot de passe oublié ?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Se connecter
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </form>

                        {/* Demo accounts */}


                        <p className="text-center text-sm text-text-secondary mt-8">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="text-accent hover:text-accent-dark font-semibold">
                                S&apos;inscrire gratuitement
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

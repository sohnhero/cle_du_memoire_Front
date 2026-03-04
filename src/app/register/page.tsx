'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, User, Phone, Building, BookOpen, Eye, EyeOff, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { UserCirclePlus, Package, Handshake } from '@phosphor-icons/react';
import Logo from '@/components/Logo';
import { BrandIcon } from '@/components/BrandIcon';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
        phone: '', role: 'STUDENT', university: '', field: '', studyLevel: '', targetDefenseDate: '', packId: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const { register, config } = useAuth();
    const router = useRouter();

    const isRegistrationClosed = config.allowRegistrations === 'false' || config.maintenanceMode === 'true';

    const [packs, setPacks] = useState<any[]>([]);
    const [packsLoading, setPacksLoading] = useState(true);

    React.useEffect(() => {
        const fetchPacks = async () => {
            try {
                const res = await api.getPacks();
                setPacks(res.packs || []);
            } catch (err) {
                console.error('Failed to fetch packs', err);
            } finally {
                setPacksLoading(false);
            }
        };
        fetchPacks();
    }, []);

    const updateField = (field: string, value: string) =>
        setFormData({ ...formData, [field]: value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { confirmPassword, ...data } = formData;
            await register(data);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Loader fullScreen show={loading} text="Création de votre compte..." />
            <div className="min-h-screen flex">
                {/* Left Panel */}
                <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-[100px]" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-info rounded-full blur-[120px]" />
                    </div>

                    <div className="relative flex flex-col justify-center items-center w-full p-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                            <div className="mx-auto mb-8 flex justify-center">
                                <Logo className="w-48 h-auto" monochrome />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Rejoignez la communauté</h2>
                            <p className="text-white/60 max-w-md leading-relaxed">
                                Plus de 500 étudiants nous font confiance pour les accompagner vers la réussite de leur mémoire.
                            </p>

                            <div className="mt-12 space-y-5 text-left max-w-sm mx-auto">
                                {[
                                    { icon: UserCirclePlus, title: 'Inscription gratuite', desc: 'Créez votre compte en 2 minutes' },
                                    { icon: Package, title: 'Choix du pack', desc: 'Sélectionnez la formule adaptée' },
                                    { icon: Handshake, title: 'Accompagnement immédiat', desc: 'Un expert vous est assigné' },
                                ].map((item) => (
                                    <div key={item.title} className="flex items-start gap-3">
                                        <BrandIcon icon={item.icon} size={36} className="!bg-white mt-0.5" iconClassName="!text-primary" />
                                        <div>
                                            <div className="text-white font-semibold text-sm">{item.title}</div>
                                            <div className="text-white/40 text-xs">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`w-full transition-all duration-500 ${step === 3 ? 'max-w-5xl' : 'max-w-lg'}`}
                    >
                        <div className="lg:hidden flex justify-center mb-8">
                            <Logo className="w-48 h-auto" monochrome={false} />
                        </div>

                        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-6">
                            <ArrowLeft className="w-4 h-4" />
                            Retour à l&apos;accueil
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Créer un compte</h1>
                            <p className="text-text-secondary">Démarrez votre parcours vers la réussite</p>
                        </div>

                        {/* Step indicator */}
                        {!isRegistrationClosed && (
                            <div className="flex items-center gap-2 sm:gap-3 mb-8 flex-wrap">
                                {[1, 2, 3].map((s) => (
                                    <button key={s} onClick={() => s < step && setStep(s)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step === s ? 'bg-accent text-primary' : step > s ? 'bg-success/10 text-success' : 'bg-border-light text-text-muted'
                                            }`}>
                                        {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                                        {s === 1 ? ' - Infos' : s === 2 ? ' - Études' : ' - Pack'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isRegistrationClosed ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-bg-light border-2 border-dashed border-border rounded-2xl p-10 text-center">
                                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Lock className="w-8 h-8 text-error" />
                                </div>
                                <h2 className="text-xl font-bold text-primary mb-3">Inscriptions fermées</h2>
                                <p className="text-text-secondary mb-6 leading-relaxed">
                                    Les inscriptions sont temporairement suspendues sur la plateforme.
                                    Veuillez nous contacter pour plus d&apos;informations ou repasser ultérieurement.
                                </p>
                                <div className="flex flex-col gap-3 text-sm font-medium">
                                    <div className="flex items-center justify-center gap-2 text-text-muted">
                                        <Mail className="w-4 h-4" />
                                        contact@cledumemoire.sn
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-text-muted">
                                        <Phone className="w-4 h-4" />
                                        +221 77 000 00 00
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm mb-6 border border-error/20">
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {step === 1 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-primary mb-2">Prénom</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                        <input type="text" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="Prénom" required
                                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-primary mb-2">Nom</label>
                                                    <input type="text" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Nom" required
                                                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                    <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="votre@email.com" required
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">Téléphone</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                    <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+221 77 000 00 00"
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-primary mb-2">Mot de passe</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                        <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Min. 6 caractères" required
                                                            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-primary mb-2">Confirmer</label>
                                                    <input type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Confirmer" required
                                                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => { if (formData.firstName && formData.lastName && formData.email && formData.password) setStep(2); else setError('Veuillez remplir tous les champs obligatoires'); }}
                                                className="btn-primary w-full justify-center py-4">
                                                Continuer <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">Vous êtes</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { value: 'STUDENT', label: 'Étudiant', icon: GraduationCap },
                                                        { value: 'ACCOMPAGNATEUR', label: 'Accompagnateur', icon: BookOpen },
                                                    ].map((r) => (
                                                        <button key={r.value} type="button" onClick={() => updateField('role', r.value)}
                                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === r.value ? 'border-accent bg-accent/5 text-primary' : 'border-border text-text-secondary hover:border-accent/30'
                                                                }`}>
                                                            <r.icon className="w-6 h-6" />
                                                            <span className="text-sm font-medium">{r.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">Université / École</label>
                                                <div className="relative">
                                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                    <input type="text" value={formData.university} onChange={(e) => updateField('university', e.target.value)} placeholder="Ex: UCAD, ESP, UGB, ISM..."
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-primary mb-2">Filière / Spécialité</label>
                                                <div className="relative">
                                                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                    <input type="text" value={formData.field} onChange={(e) => updateField('field', e.target.value)} placeholder="Ex: Informatique, Marketing..."
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                </div>
                                            </div>

                                            {formData.role === 'STUDENT' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-primary mb-2">Niveau d'étude</label>
                                                        <div className="relative">
                                                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                            <select value={formData.studyLevel} onChange={(e) => updateField('studyLevel', e.target.value)} required
                                                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm appearance-none">
                                                                <option value="" disabled>Sélectionner...</option>
                                                                <option value="Licence 3">Licence 3</option>
                                                                <option value="Master 1">Master 1</option>
                                                                <option value="Master 2">Master 2</option>
                                                                <option value="Autre">Autre</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-primary mb-2">Date de soutenance prévue</label>
                                                        <input type="date" value={formData.targetDefenseDate} onChange={(e) => updateField('targetDefenseDate', e.target.value)} required
                                                            className="w-full px-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all text-sm" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border-2 border-border text-text-secondary font-semibold hover:bg-bg-light transition-all">
                                                    Retour
                                                </button>
                                                <button type="button" onClick={() => {
                                                    if (formData.role === 'ACCOMPAGNATEUR') {
                                                        handleSubmit({ preventDefault: () => { } } as any);
                                                    } else {
                                                        if (!formData.studyLevel || !formData.targetDefenseDate) {
                                                            setError("Veuillez renseigner votre niveau d'étude et la date de soutenance prévue");
                                                            return;
                                                        }
                                                        setError('');
                                                        setStep(3);
                                                    }
                                                }} className="btn-primary flex-1 justify-center py-4">
                                                    {formData.role === 'ACCOMPAGNATEUR' ? 'Créer mon compte' : 'Choisir mon Pack'} <ArrowRight className="w-5 h-5 ml-2" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 w-full">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {packsLoading ? (
                                                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-bg-light rounded-2xl border border-dashed border-border gap-4">
                                                        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                                                        <p className="text-sm text-text-muted">Chargement des packs...</p>
                                                    </div>
                                                ) : packs.length === 0 ? (
                                                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-bg-light rounded-2xl border border-dashed border-border gap-4">
                                                        <p className="text-sm text-text-muted">Aucun pack disponible pour le moment.</p>
                                                        <button type="button" onClick={() => window.location.reload()} className="text-accent underline text-xs font-bold">Réessayer</button>
                                                    </div>
                                                ) : (
                                                    packs.map((pack) => (
                                                        <button
                                                            key={pack.id}
                                                            type="button"
                                                            onClick={() => updateField('packId', pack.id)}
                                                            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col min-h-[160px] ${formData.packId === pack.id ? 'border-accent bg-accent/5 ring-2 ring-accent/10 shadow-lg shadow-accent/5' : 'border-border hover:border-accent/30 bg-white'}`}
                                                        >
                                                            <div className="flex flex-col gap-0.5 mb-2">
                                                                <div className="text-[10px] font-black text-accent uppercase tracking-widest">{pack.name}</div>
                                                                <div className="text-lg font-black text-primary tabular-nums">
                                                                    {pack.price.toLocaleString()}
                                                                    <span className="text-[10px] font-bold text-text-muted ml-1">FCFA</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-[10px] text-text-secondary leading-relaxed flex-1 mb-3 line-clamp-3">
                                                                {pack.description}
                                                            </div>
                                                            <div className="mt-auto pt-2 border-t border-border-light flex items-center justify-between">
                                                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">
                                                                    {formData.packId === pack.id ? 'Sélectionné' : 'Choisir'}
                                                                </span>
                                                                {formData.packId === pack.id && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>

                                            <div className="flex gap-3 max-w-sm mx-auto">
                                                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border-2 border-border text-text-secondary text-sm font-semibold hover:bg-bg-light transition-all">
                                                    Retour
                                                </button>
                                                <button type="submit" disabled={loading || !formData.packId}
                                                    className="btn-primary flex-1 justify-center py-3 text-sm disabled:opacity-50">
                                                    Terminer <ArrowRight className="w-4 h-4 ml-2" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </form>
                            </>
                        )}

                        <p className="text-center text-sm text-text-secondary mt-8">
                            Déjà inscrit ?{' '}
                            <Link href="/login" className="text-accent hover:text-accent-dark font-semibold">Se connecter</Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

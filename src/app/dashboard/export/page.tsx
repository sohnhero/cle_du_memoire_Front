'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilePdf, ArrowRight, ArrowLeft, CheckCircle, Student, Buildings, TextAa, DownloadSimple, Palette, ImageSquare } from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ExportPage() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [memoireTitle, setMemoireTitle] = useState('');

    // Design & Layout settings
    const [design, setDesign] = useState({
        themeColor: '#0F172A', // Slate 900
        hasBorder: true,
        pageNumberPosition: 'center', // 'center' | 'right'
        titleAlignment: 'center' // 'center' | 'left'
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // FormData
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        university: user?.university || '',
        faculty: '',
        academicYear: '2024-2025',
        intro: '',
        body: '',
        conclusion: ''
    });

    useEffect(() => {
        // Try to fetch memoire title if exists
        api.getMyMemoire().then(res => {
            if (res.memoire?.title) {
                setMemoireTitle(res.memoire.title);
                setFormData(prev => ({ ...prev, title: res.memoire.title }));
            }
        }).catch(() => {
            // Ignore error if no memoire found
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDesignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setDesign(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleExport = async () => {
        if (!formData.title.trim() || !formData.body.trim()) {
            toast.error("Le titre et le contenu (Développement) sont requis.");
            return;
        }

        setLoading(true);
        toast.loading("Génération de votre mémoire en cours...", { id: 'export' });

        try {
            // The backend export route currently expects 'title' and 'content'
            // We will format the content by combining Intro, Body, Conclusion securely
            const content = `
INTRODUCTION
${formData.intro}

DÉVELOPPEMENT
${formData.body}

CONCLUSION
${formData.conclusion}
            `.trim();

            const payload = {
                title: formData.title,
                subtitle: formData.subtitle,
                university: formData.university,
                faculty: formData.faculty,
                academicYear: formData.academicYear,
                content: content,
                logo: logoPreview,
                design: design
            };

            const response = await api.exportMemoireToPDF(payload);

            const url = window.URL.createObjectURL(response);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Memoire_${user?.lastName || 'Export'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Mémoire exporté avec succès !", { id: 'export' });
            // Optional: return to dashboard or show success message

        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la génération du PDF.", { id: 'export' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto min-h-[75vh] p-2 sm:p-4 lg:p-6">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-primary mb-2 flex items-center gap-3">
                    <FilePdf className="w-8 h-8 text-accent" weight="fill" />
                    Générateur de Mémoire
                </h1>
                <p className="text-text-secondary">Générez un document PDF professionnel et formaté selon les normes académiques.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full z-0" />
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent rounded-full z-0 transition-all duration-500"
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                />

                {[
                    { id: 1, label: 'Page de Garde', icon: Buildings },
                    { id: 2, label: 'Contenu', icon: TextAa },
                    { id: 3, label: 'Design', icon: Palette },
                    { id: 4, label: 'Génération', icon: DownloadSimple }
                ].map((s) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors border-4 border-bg-main ${step >= s.id ? 'bg-accent text-primary' : 'bg-bg-light text-text-muted'
                            }`}>
                            {step > s.id ? <CheckCircle className="w-6 h-6" weight="fill" /> : <s.icon className="w-6 h-6" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${step >= s.id ? 'text-primary' : 'text-text-muted'}`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="card-premium p-6 sm:p-8 bg-white shadow-xl">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm">1</span>
                                Informations de la Page de Garde
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-text-primary">Titre du Mémoire *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Ex: L'impact de l'IA sur..."
                                        className="w-full p-3 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-text-primary">Sous-titre (Optionnel)</label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleChange}
                                        placeholder="Optionnel..."
                                        className="w-full p-3 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Université / Établissement *</label>
                                    <input
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleChange}
                                        placeholder="Ex: Université Cheikh Anta Diop"
                                        className="w-full p-3 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Faculté / Département</label>
                                    <input
                                        type="text"
                                        name="faculty"
                                        value={formData.faculty}
                                        onChange={handleChange}
                                        placeholder="Ex: FASEG"
                                        className="w-full p-3 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Année Académique</label>
                                    <input
                                        type="text"
                                        name="academicYear"
                                        value={formData.academicYear}
                                        onChange={handleChange}
                                        placeholder="Ex: 2024-2025"
                                        className="w-full p-3 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-text-primary">Logo de l'Université (Image)</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-bg-light overflow-hidden flex-shrink-0">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <ImageSquare className="w-8 h-8 text-text-muted" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 transition-colors"
                                            />
                                            <p className="text-xs text-text-muted mt-1">Sera placé au centre en haut de la page de garde.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm">2</span>
                                    Corps du Mémoire
                                </h2>
                                <span className="text-xs text-text-muted bg-bg-light px-3 py-1 rounded-full">Collez votre texte brut ici</span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Introduction</label>
                                    <textarea
                                        name="intro"
                                        value={formData.intro}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Collez votre introduction..."
                                        className="w-full p-4 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all resize-y text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary flex items-center justify-between">
                                        <span>Développement (Corps) *</span>
                                    </label>
                                    <textarea
                                        name="body"
                                        value={formData.body}
                                        onChange={handleChange}
                                        rows={10}
                                        placeholder="Collez le développement de votre mémoire..."
                                        className="w-full p-4 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all resize-y text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Conclusion</label>
                                    <textarea
                                        name="conclusion"
                                        value={formData.conclusion}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Collez votre conclusion..."
                                        className="w-full p-4 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all resize-y text-sm"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm">3</span>
                                Mise en page & Design
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Couleur Thématique</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="themeColor"
                                            value={design.themeColor}
                                            onChange={handleDesignChange}
                                            className="w-14 h-14 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                                        />
                                        <span className="text-sm text-text-muted">Appliquée aux titres et bordures.</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Bordure de page</label>
                                    <div className="flex items-center gap-2 p-3 bg-bg-light border border-border-light rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="hasBorder"
                                            name="hasBorder"
                                            checked={design.hasBorder}
                                            onChange={handleDesignChange}
                                            className="w-5 h-5 rounded text-accent focus:ring-accent"
                                        />
                                        <label htmlFor="hasBorder" className="text-sm font-semibold cursor-pointer select-none">Encadrer la page de garde</label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Alignement des Titres (Intro, etc.)</label>
                                    <select
                                        name="titleAlignment"
                                        value={design.titleAlignment}
                                        onChange={handleDesignChange}
                                        className="w-full p-3 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all text-sm"
                                    >
                                        <option value="center">Centré</option>
                                        <option value="left">Aligné à gauche</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Position de la Numérotation</label>
                                    <select
                                        name="pageNumberPosition"
                                        value={design.pageNumberPosition}
                                        onChange={handleDesignChange}
                                        className="w-full p-3 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:ring-2 focus:ring-accent/50 outline-none transition-all text-sm"
                                    >
                                        <option value="center">Au centre (Bas)</option>
                                        <option value="right">À droite (Bas)</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8 text-center py-8"
                        >
                            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FilePdf className="w-12 h-12 text-accent" weight="fill" />
                            </div>

                            <h2 className="text-2xl font-black text-primary mb-2">Prêt pour l'exportation</h2>
                            <p className="text-text-secondary max-w-md mx-auto mb-8">
                                Votre mémoire <strong>"{formData.title || 'Sans titre'}"</strong> est prêt à être formaté. Le document PDF inclura une page de garde académique, un texte justifié et paginé.
                            </p>

                            <div className="max-w-sm mx-auto bg-bg-light p-4 rounded-xl text-left space-y-3 mb-8">
                                <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-2">Résumé des informations</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Auteur:</span>
                                    <span className="font-semibold text-text-primary">{user?.firstName} {user?.lastName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Établissement:</span>
                                    <span className="font-semibold text-text-primary">{formData.university || 'Non défini'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Contenu:</span>
                                    <span className="font-semibold text-text-primary">
                                        {[formData.intro, formData.body, formData.conclusion].filter(t => t.trim().length > 0).length} parties renseignées
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-light">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1 || loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-text-secondary hover:bg-bg-light hover:text-primary'
                            }`}
                    >
                        <ArrowLeft className="w-5 h-5" /> Retour
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl"
                        >
                            Suivant <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleExport}
                            disabled={loading || !formData.title || !formData.body}
                            className="bg-accent text-primary flex items-center gap-2 px-8 py-3 rounded-xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Génération...</>
                            ) : (
                                <><DownloadSimple className="w-5 h-5" weight="bold" /> Générer le PDF final</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

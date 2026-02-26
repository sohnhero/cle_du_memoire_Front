'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
    DownloadSimple as FileDown, BookOpen, WarningCircle as AlertCircle, FileText
} from '@phosphor-icons/react';

export default function ExportPage() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsExporting(true);
        setSuccess(false);

        try {
            const blob = await api.exportPdf(title, content);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Memoire_${user?.lastName?.replace(/\s+/g, '_') || 'Final'}.pdf`;
            a.target = '_blank';
            a.click();
            window.URL.revokeObjectURL(url);
            setSuccess(true);
        } catch (error) {
            console.error('Export error:', error);
            alert("Erreur lors de la génération du PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <FileDown className="w-6 h-6 text-accent" /> Export PDF
                </h1>
                <p className="text-text-secondary mt-1">Compilez votre mémoire complet avec mise en page automatique.</p>
            </div>

            <div className="card-premium p-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-accent mb-1">Comment ça marche ?</h3>
                        <p className="text-sm text-primary leading-relaxed">
                            Cet outil génère un document PDF aux normes académiques. Remplissez le titre final de votre mémoire et collez le contenu textuel complet de votre travail. Le système se chargera de créer la page de garde et de formater le texte avec une justification et une pagination appropriées.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleExport} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">Titre du mémoire</label>
                        <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: L'impact de l'IA sur..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2 flex justify-between items-center">
                            <span>Contenu intégral</span>
                            <span className="text-xs text-text-muted font-normal">Sera formaté automatiquement</span>
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 w-5 h-5 text-text-muted" />
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Collez le texte complet de votre mémoire ici..."
                                className="w-full pl-11 pr-4 py-3 min-h-[400px] rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm resize-y leading-relaxed"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-border-light">
                        {success ? (
                            <p className="text-sm text-success font-medium flex-1">✨ Document généré avec succès !</p>
                        ) : (
                            <p className="text-xs text-text-muted flex-1 hidden sm:block">Un format A4 justifié avec numérotation.</p>
                        )}
                        <button
                            type="submit"
                            disabled={isExporting || !title.trim() || !content.trim()}
                            className="btn-primary py-3 px-8 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                            {isExporting ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération...</>
                            ) : (
                                <><FileDown className="w-4 h-4" /> Générer le Document</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

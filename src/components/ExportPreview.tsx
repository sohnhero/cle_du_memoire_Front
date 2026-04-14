'use client';

import React from 'react';
import { User } from '@/types';
import { motion } from 'framer-motion';

interface PreviewProps {
    formData: {
        title: string;
        subtitle: string;
        university: string;
        faculty: string;
        academicYear: string;
        intro: string;
        body: string;
        conclusion: string;
    };
    design: {
        themeColor: string;
        hasBorder: boolean;
        pageNumberPosition: 'center' | 'right';
        titleAlignment: 'center' | 'left';
    };
    user: User | null;
    logoPreview: string | null;
}

export default function ExportPreview({ formData, design, user, logoPreview }: PreviewProps) {
    return (
        <div className="space-y-12">
            <div className="flex flex-col items-center mb-8">
                <span className="text-sm font-bold text-accent uppercase tracking-widest mb-2">Aperçu du document</span>
                <p className="text-text-secondary text-sm">Ceci est une simulation du rendu final (A4).</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                {/* --- COVER PAGE PREVIEW --- */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-xs font-bold text-text-muted uppercase">Page de Garde</span>
                    <div 
                        className="w-[300px] h-[424px] bg-white shadow-2xl rounded-sm overflow-hidden relative border border-border/20 flex flex-col p-6 text-[8px] sm:text-[10px]"
                        style={{ perspective: '1000px' }}
                    >
                        {/* Border */}
                        {design.hasBorder && (
                            <div 
                                className="absolute inset-2 border-[1.5px] pointer-events-none"
                                style={{ borderColor: design.themeColor }}
                            />
                        )}

                        {/* Top Section */}
                        <div className="flex flex-col items-center text-center mt-4">
                            {logoPreview && (
                                <img src={logoPreview} alt="Logo" className="w-10 h-10 object-contain mb-2" />
                            )}
                            <h3 className="font-bold uppercase tracking-tighter" style={{ color: design.themeColor }}>
                                {formData.university || user?.university || 'UNIVERSITÉ'}
                            </h3>
                            {formData.faculty && (
                                <p className="uppercase opacity-70 mt-0.5">{formData.faculty}</p>
                            )}
                            <p className="italic opacity-50 mt-1">Département de formation professionnelle</p>
                        </div>

                        {/* Middle Section */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                            <p className="font-bold tracking-[0.2em] mb-4" style={{ color: design.themeColor }}>MÉMOIRE DE FIN D'ÉTUDES</p>
                            <h2 className="text-[14px] font-black uppercase leading-tight mb-2">
                                {formData.title || 'TITRE DU MÉMOIRE'}
                            </h2>
                            {formData.subtitle && (
                                <p className="italic opacity-60 max-w-[80%]">{formData.subtitle}</p>
                            )}
                        </div>

                        {/* Bottom Section */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="italic opacity-60">Présenté par :</span>
                                <span className="font-bold uppercase">{user?.firstName} {user?.lastName}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 text-right">
                                <span className="italic opacity-60">Sous la direction de :</span>
                                <span className="font-bold uppercase">M. LE DIRECTEUR</span>
                            </div>
                        </div>

                        <div className="text-center pb-2 opacity-60">
                            Année Académique : {formData.academicYear}
                        </div>
                    </div>
                </div>

                {/* --- CONTENT PREVIEW --- */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-xs font-bold text-text-muted uppercase">Contenu (Page 1)</span>
                    <div className="w-[300px] h-[424px] bg-white shadow-2xl rounded-sm overflow-hidden relative border border-border/20 flex flex-col p-8 text-[6px] sm:text-[7px] leading-relaxed">
                        
                        {/* Section Title */}
                        <h3 
                            className="font-bold uppercase mb-3 text-[9px]"
                            style={{ 
                                color: design.themeColor,
                                textAlign: design.titleAlignment === 'center' ? 'center' : 'left' 
                            }}
                        >
                            INTRODUCTION
                        </h3>

                        {/* Fake Text Lines */}
                        <div className="space-y-1.5 opacity-60 text-justify">
                            {formData.intro ? (
                                <p>{formData.intro.substring(0, 400)}...</p>
                            ) : (
                                <>
                                    <div className="h-1 bg-border-light rounded w-full" />
                                    <div className="h-1 bg-border-light rounded w-full" />
                                    <div className="h-1 bg-border-light rounded w-[95%]" />
                                    <div className="h-1 bg-border-light rounded w-full" />
                                    <div className="h-1 bg-border-light rounded w-[98%]" />
                                    <div className="h-1 bg-border-light rounded w-[92%]" />
                                    <div className="h-1 bg-border-light rounded w-full" />
                                </>
                            )}
                        </div>

                        <h3 
                            className="font-bold uppercase mt-6 mb-3 text-[9px]"
                            style={{ 
                                color: design.themeColor,
                                textAlign: design.titleAlignment === 'center' ? 'center' : 'left' 
                            }}
                        >
                            DÉVELOPPEMENT
                        </h3>

                        <div className="space-y-1.5 opacity-60 text-justify">
                            {formData.body ? (
                                <p>{formData.body.substring(0, 600)}...</p>
                            ) : (
                                <>
                                    <div className="h-1 bg-border-light rounded w-full" />
                                    <div className="h-1 bg-border-light rounded w-[95%]" />
                                    <div className="h-1 bg-border-light rounded w-full" />
                                    <div className="h-1 bg-border-light rounded w-[98%]" />
                                    <div className="h-1 bg-border-light rounded w-full" />
                                </>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        <div 
                            className="absolute bottom-4 left-0 right-0 px-8 text-black opacity-30 text-[6px]"
                            style={{ textAlign: design.pageNumberPosition === 'center' ? 'center' : 'right' }}
                        >
                            1
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <div className="bg-accent/10 text-accent px-4 py-2 rounded-lg text-xs font-semibold border border-accent/20">
                    💡 Cliquez sur "Suivant" pour choisir le format d'exportation.
                </div>
            </div>
        </div>
    );
}

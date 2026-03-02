'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FilePdf, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { useRouter } from 'next/navigation';

export default function ExportComingSoonPage() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto min-h-[75vh] flex flex-col items-center justify-center p-6 lg:p-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                className="w-full max-w-2xl bg-white rounded-[2rem] p-10 md:p-14 shadow-2xl border border-border-light text-center relative overflow-hidden group"
            >
                {/* Decorative Background Elements */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700 ease-in-out" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-700 ease-in-out" />

                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 relative"
                    >
                        <BrandIcon icon={FilePdf} size={100} className="shadow-xl mx-auto ring-8 ring-accent/10" iconClassName="text-white" />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8, type: 'spring', bounce: 0.6 }}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1"
                        >
                            <Sparkle weight="fill" className="w-8 h-8 text-accent animate-pulse" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-lg mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-widest mb-6 border border-accent/20">
                            En Développement
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-6 leading-tight">
                            Génération Automatique <br />
                            <span className="text-transparent bg-clip-text bg-primary">de votre Mémoire</span>
                        </h1>
                        <p className="text-text-secondary leading-relaxed mb-10 text-lg">
                            Nous préparons un outil exceptionnel qui mettra en page votre mémoire selon les normes académiques strictes (page de garde, pagination, justification) en un seul clic.
                            <br className="hidden sm:block mt-2" />
                            <strong>Revenez très bientôt !</strong>
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => router.push('/dashboard')}
                        className="btn-primary py-4 px-8 text-base font-bold flex items-center gap-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        Retourner au tableau de bord <ArrowRight weight="bold" className="w-5 h-5" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

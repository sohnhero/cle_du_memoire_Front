'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, Envelope, Phone, Globe, ArrowRight } from '@phosphor-icons/react';
import Link from 'next/link';
import Logo from './Logo';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full card-premium p-12 flex flex-col items-center"
            >
                <Logo className="w-48 h-auto mb-10" />

                <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mb-6">
                    <Hammer className="w-10 h-10 text-warning" weight="fill" />
                </div>

                <h1 className="text-3xl font-bold text-primary mb-4">
                    Maintenance en cours
                </h1>

                <p className="text-text-secondary mb-8 leading-relaxed max-w-md mx-auto">
                    Nous mettons à jour la plateforme pour vous offrir une meilleure expérience.
                    Revenez d'ici quelques instants. Merci de votre patience !
                </p>

                <div className="w-full h-px bg-border mb-8" />

                <div className="grid sm:grid-cols-2 gap-6 w-full">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Envelope className="w-5 h-5 text-accent" />
                            Email de contact
                        </div>
                        <span className="text-sm text-text-muted">contact@cledumemoire.sn</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Phone className="w-5 h-5 text-accent" />
                            Téléphone urgence
                        </div>
                        <span className="text-sm text-text-muted">+221 77 000 00 00</span>
                    </div>
                </div>

                <div className="mt-10 w-full">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        Accès Administration
                        <ArrowRight className="w-4 h-4" weight="bold" />
                    </Link>
                </div>

                <div className="mt-10 pt-6 border-t border-border w-full flex justify-center gap-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        <Globe className="w-3.5 h-3.5" />
                        Clé du Mémoire v2.0
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

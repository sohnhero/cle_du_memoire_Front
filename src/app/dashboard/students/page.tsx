'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, MagnifyingGlass as Search, Faders as Filter, Eye, ChatCircle as MessageCircle, TrendUp as TrendingUp, Warning as AlertTriangle, CheckCircle
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';

const students = [
    { id: '1', name: 'Moussa Diop', email: 'moussa@test.sn', field: 'Master Informatique', university: 'UCAD', progress: 55, phase: 'Chapitre 2', pack: 'Pack Complet', status: 'active', lastActivity: 'Il y a 2h' },
    { id: '2', name: 'Aïssatou Ba', email: 'aissatou@test.sn', field: 'Master Marketing', university: 'ESP', progress: 15, phase: 'Plan détaillé', pack: 'Pack Démarrage', status: 'active', lastActivity: 'Il y a 5h' },
    { id: '3', name: 'Omar Seck', email: 'omar@test.sn', field: 'Master Finance', university: 'ISM', progress: 85, phase: 'Relecture', pack: 'Pack Rédaction', status: 'active', lastActivity: 'Hier' },
    { id: '4', name: 'Khady Diallo', email: 'khady@test.sn', field: 'Master Droit', university: 'UGB', progress: 30, phase: 'Introduction', pack: 'Pack Rédaction', status: 'delayed', lastActivity: 'Il y a 3j' },
    { id: '5', name: 'Mamadou Sy', email: 'mamadou@test.sn', field: 'Master Gestion', university: 'UCAD', progress: 70, phase: 'Chapitre 3', pack: 'Pack Complet', status: 'active', lastActivity: 'Il y a 1h' },
];

export default function StudentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Mes Étudiants</h1>
                    <p className="text-text-secondary mt-1">{students.length} étudiants suivis</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: 5, icon: Users, color: 'text-primary bg-primary/10' },
                    { label: 'En bonne voie', value: 3, icon: TrendingUp, color: 'text-success bg-success/10' },
                    { label: 'En retard', value: 1, icon: AlertTriangle, color: 'text-warning bg-warning/10' },
                    { label: 'Terminés', value: 0, icon: CheckCircle, color: 'text-info bg-info/10' },
                ].map((stat) => (
                    <div key={stat.label} className="card-premium p-4 flex items-center gap-3">
                        <BrandIcon icon={stat.icon} size={40} />
                        <div>
                            <div className="text-xl font-bold text-primary">{stat.value}</div>
                            <div className="text-xs text-text-muted">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-4 py-3">
                    <Search className="w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Rechercher un étudiant..." className="bg-transparent text-sm outline-none flex-1" />
                </div>
                <button className="p-3 rounded-xl border border-border bg-white hover:bg-bg-light transition-colors">
                    <Filter className="w-4 h-4 text-text-secondary" />
                </button>
            </div>

            {/* Student Cards */}
            <div className="space-y-4">
                {students.map((student, index) => (
                    <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="card-premium p-5 hover:shadow-lg transition-all"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-primary">{student.name}</h4>
                                    {student.status === 'delayed' && (
                                        <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">En retard</span>
                                    )}
                                    <span className="text-xs bg-bg-light text-text-muted px-2 py-0.5 rounded-full">{student.pack}</span>
                                </div>
                                <div className="text-xs text-text-muted mt-1">
                                    {student.field} — {student.university} · Phase: {student.phase} · {student.lastActivity}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary">{student.progress}%</div>
                                    <div className="w-20 h-2 bg-bg-light rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-gradient-to-r from-accent to-info rounded-full transition-all" style={{ width: `${student.progress}%` }} />
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-2 rounded-lg hover:bg-bg-light text-text-secondary transition-colors" title="Voir profil">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-bg-light text-text-secondary transition-colors" title="Message">
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

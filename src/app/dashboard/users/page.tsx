'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MagnifyingGlass as Search, Faders as Filter, Pencil as Edit, ShieldCheck as Shield, UserCheck, UserMinus as UserX, Plus, ArrowsClockwise as RefreshCw, X
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const roleBadge: Record<string, string> = {
    STUDENT: 'bg-info/10 text-info',
    ACCOMPAGNATEUR: 'bg-success/10 text-success',
    ADMIN: 'bg-accent/10 text-accent',
};
const roleLabel: Record<string, string> = { STUDENT: 'Étudiant', ACCOMPAGNATEUR: 'Accompagnateur', ADMIN: 'Admin' };

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state
    const [editingUser, setEditingUser] = useState<any>(null);
    const [assigningCoachFor, setAssigningCoachFor] = useState<any>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.getUsers();
            setUsers(res.users || []);
        } catch (error) {
            console.error("Erreur de chargement des utilisateurs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filtered = users.filter(u => {
        const matchesRole = filterRole === 'ALL' || u.role === filterRole;
        const searchTarget = (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase();
        const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const coaches = users.filter(u => u.role === 'ACCOMPAGNATEUR' && u.isActive);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary">Gestion des Utilisateurs</h1>
                    <p className="text-text-secondary mt-1">{users.length} utilisateurs enregistrés</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadUsers} className="p-3 rounded-xl border border-border bg-white hover:bg-bg-light transition-colors text-text-secondary shadow-sm">
                        {loading ? <LoadingSpinner size="sm" className="text-accent" /> : <RefreshCw className="w-4 h-4" />}
                    </button>
                    <button className="btn-primary py-3 px-6 text-sm">
                        <Plus className="w-4 h-4" /> Ajouter un utilisateur
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm hover:border-accent/30 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 transition-all">
                    <Search className="w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1 text-primary placeholder:text-text-muted"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['ALL', 'STUDENT', 'ACCOMPAGNATEUR', 'ADMIN'].map((role) => (
                        <button key={role} onClick={() => setFilterRole(role)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${filterRole === role ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:bg-bg-light'
                                }`}>
                            {role === 'ALL' ? 'Tous' : roleLabel[role]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-light bg-bg-light/50">
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Utilisateur</th>
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Rôle</th>
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4 hidden md:table-cell">Université</th>
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Inscription</th>
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4 hidden md:table-cell">Accompagnateur</th>
                                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Statut</th>
                                <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                                        <LoadingSpinner size="lg" className="mx-auto mb-4" />
                                        Chargement des données...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                                        <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : filtered.map((user, index) => {
                                const assignedCoach = user.memoiresAsStudent?.[0]?.accompagnateur;

                                return (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="border-b border-border-light/50 hover:bg-bg-light/30 transition-colors"
                                    >
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-primary">{user.firstName} {user.lastName}</div>
                                                    <div className="text-xs text-text-muted">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[user.role]}`}>
                                                {roleLabel[user.role]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary hidden md:table-cell">{user.university || '—'}</td>
                                        <td className="px-6 py-4 text-xs text-text-muted hidden lg:table-cell">
                                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {user.role === 'STUDENT' ? (
                                                assignedCoach ? (
                                                    <div className="text-sm font-medium text-primary">
                                                        {assignedCoach.firstName} {assignedCoach.lastName}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setAssigningCoachFor(user)}
                                                        className="text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Assigner
                                                    </button>
                                                )
                                            ) : (
                                                <span className="text-text-muted text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            {user.isActive ? (
                                                <span className="flex items-center gap-1.5 text-xs text-success font-medium"><UserCheck className="w-3.5 h-3.5" /> Actif</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs text-error font-medium"><UserX className="w-3.5 h-3.5" /> Inactif</span>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {user.role === 'STUDENT' && assignedCoach && (
                                                    <button
                                                        onClick={() => setAssigningCoachFor(user)}
                                                        className="p-2 rounded-lg hover:bg-bg-light text-text-secondary hover:text-accent transition-colors title='Changer de coach'"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-2 rounded-lg hover:bg-bg-light text-text-secondary hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {editingUser && (
                    <EditUserModal
                        user={editingUser}
                        onClose={() => setEditingUser(null)}
                        onSuccess={loadUsers}
                    />
                )}
                {assigningCoachFor && (
                    <AssignCoachModal
                        student={assigningCoachFor}
                        coaches={coaches}
                        onClose={() => setAssigningCoachFor(null)}
                        onSuccess={loadUsers}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function EditUserModal({ user, onClose, onSuccess }: { user: any, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        university: user.university || '',
        field: user.field || '',
        role: user.role,
        isActive: user.isActive
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.updateUser(user.id, formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la modification");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Modifier l'utilisateur</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Prénom</label>
                            <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Nom</label>
                            <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Téléphone</label>
                            <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Rôle</label>
                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all">
                                <option value="STUDENT">Étudiant</option>
                                <option value="ACCOMPAGNATEUR">Accompagnateur</option>
                                <option value="ADMIN">Administrateur</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Université</label>
                            <input type="text" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Filière</label>
                            <input type="text" value={formData.field} onChange={e => setFormData({ ...formData, field: e.target.value })} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="flex items-center mt-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                            <span className="ml-3 text-sm font-semibold text-text-primary">Compte actif</span>
                        </label>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border-light">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                            {isSaving ? <LoadingSpinner size="sm" light /> : <Edit className="w-4 h-4" />}
                            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function AssignCoachModal({ student, coaches, onClose, onSuccess }: { student: any, coaches: any[], onClose: () => void, onSuccess: () => void }) {
    const [selectedCoachId, setSelectedCoachId] = useState(student.memoiresAsStudent?.[0]?.accompagnateur?.id || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleAssign = async () => {
        if (!selectedCoachId) return;
        setIsSaving(true);
        try {
            await api.assignCoach(student.id, selectedCoachId);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'assignation");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Assigner un Accompagnateur</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-bg-light border border-border">
                    <div className="font-semibold text-primary">Étudiant : {student.firstName} {student.lastName}</div>
                    <div className="text-xs text-text-muted mt-1">{student.field || 'Filière non précisée'} - {student.university || 'Université non précisée'}</div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Choisir l'accompagnateur</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {coaches.map(coach => (
                            <label key={coach.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedCoachId === coach.id ? 'border-accent bg-accent/5' : 'border-border hover:bg-bg-light'}`}>
                                <input
                                    type="radio"
                                    name="coach"
                                    value={coach.id}
                                    checked={selectedCoachId === coach.id}
                                    onChange={() => setSelectedCoachId(coach.id)}
                                    className="text-accent focus:ring-accent"
                                />
                                <div>
                                    <div className="font-semibold text-sm text-primary">{coach.firstName} {coach.lastName}</div>
                                    <div className="text-xs text-text-muted">{coach.email}</div>
                                </div>
                            </label>
                        ))}
                        {coaches.length === 0 && (
                            <div className="text-sm text-text-muted p-4 text-center">Aucun accompagnateur actif disponible</div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border-light">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors">
                        Annuler
                    </button>
                    <button onClick={handleAssign} disabled={isSaving || !selectedCoachId} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                        {isSaving ? <LoadingSpinner size="sm" light /> : <Shield className="w-4 h-4" />}
                        {isSaving ? 'Assignation...' : 'Assigner'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

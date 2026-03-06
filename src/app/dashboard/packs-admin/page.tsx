'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, CheckCircle, MagnifyingGlass as Search, Faders as Filter, Plus, ShieldCheck as Shield, User, CreditCard, X, WarningCircle as AlertCircle, CircleNotch as Loader2, PencilSimple, Trash, Sparkle as SparkleIcon
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

import Pagination from '@/components/Pagination';
import ResponsiveTable from '@/components/ResponsiveTable';

const statusBadge: Record<string, string> = {
    PENDING: 'bg-warning/10 text-warning',
    ACTIVE: 'bg-success/10 text-success',
    EXPIRED: 'bg-error/10 text-error',
    PAID: 'bg-info/10 text-info',
    PARTIAL: 'bg-accent/10 text-accent',
    DEACTIVATED: 'bg-border text-text-muted',
};

const statusLabel: Record<string, string> = {
    PENDING: 'En attente',
    ACTIVE: 'Actif',
    EXPIRED: 'Expiré',
    PAID: 'Payé',
    PARTIAL: 'Avance',
    DEACTIVATED: 'Désactivé',
};

export default function AdminPacksPage() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [packs, setPacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState<'subs' | 'packs'>('subs');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [packToEdit, setPackToEdit] = useState<any>(null);
    const [packToDelete, setPackToDelete] = useState<any>(null);
    const [isSeeding, setIsSeeding] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSubs, setTotalSubs] = useState(0);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'subs') {
                const [subsRes, packsRes] = await Promise.all([
                    api.getAllSubscriptions(currentPage, 5, searchQuery, statusFilter),
                    api.getPacks()
                ]);
                setSubscriptions(subsRes.subscriptions || []);
                setTotalPages(subsRes.totalPages || 1);
                setTotalSubs(subsRes.total || 0);
                setPacks(packsRes.packs || []);
            } else {
                const packsRes = await api.getPacks();
                setPacks(packsRes.packs || []);
            }
        } catch (error) {
            console.error("Erreur de chargement", error);
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentPage, statusFilter, activeTab]);

    // Initial load for packs if needed
    useEffect(() => {
        if (activeTab === 'packs' && packs.length === 0) {
            loadData();
        }
    }, [activeTab]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else loadData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleOpenPayment = (sub: any) => {
        setSelectedSubscription(sub);
        setIsPaymentModalOpen(true);
    };

    const handleSeedPacks = async () => {
        setIsSeeding(true);
        const officialPacks = [
            {
                name: 'Pack Démarrage',
                description: 'Pour bien démarrer votre mémoire',
                price: 50000,
                installment1: null,
                installment2: null,
                features: ['Choix du sujet pertinent et adapté', 'Problématique claire et précise', 'Plan détaillé et cohérent', 'Rédaction du contexte et introduction', 'Formulation des objectifs'],
            },
            {
                name: 'Pack Rédaction',
                description: 'Pour une rédaction de qualité',
                price: 100000,
                installment1: 75000,
                installment2: 25000,
                features: ['Suivi de la rédaction chapitre par chapitre', 'Lecture approfondie et vérification de cohérence', 'Correction orthographe et grammaire'],
            },
            {
                name: 'Pack Soutenance',
                description: 'Pour une soutenance professionnelle et réussie',
                price: 65000,
                installment1: null,
                installment2: null,
                features: ['PowerPoint esthétique et structuré', '5 séances de simulation de soutenance', 'Préparation aux questions du jury'],
            },
            {
                name: 'Pack Complet',
                description: 'Pour un accompagnement de A à Z',
                price: 150000,
                installment1: 100000,
                installment2: 50000,
                features: ['Tout le Pack Démarrage inclus', 'Suivi complet de la rédaction', 'Lecture approfondie et corrections complètes', 'PowerPoint professionnel', '5 séances de simulation soutenance'],
            },
        ];
        try {
            for (const pack of officialPacks) {
                await api.createPack(pack);
            }
            toast.success('4 packs officiels créés avec succès !');
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la création des packs');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleDeletePack = async (pack: any) => {
        try {
            await api.deletePack(pack.id);
            toast.success(`Pack "${pack.name}" supprimé !`);
            setPackToDelete(null);
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary">Gestion des Packs &amp; Abonnements</h1>
                    <p className="text-text-secondary mt-1 text-sm">Supervisez les forfaits et paiements des étudiants</p>
                </div>
                {activeTab === 'packs' && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {packs.length === 0 && (
                            <button
                                onClick={handleSeedPacks}
                                disabled={isSeeding}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 text-primary border border-accent/20 text-sm font-semibold hover:bg-accent/20 transition-colors disabled:opacity-50"
                            >
                                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <SparkleIcon className="w-4 h-4 text-accent" weight="fill" />}
                                Pré-remplir les packs officiels
                            </button>
                        )}
                        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary py-2.5 px-5 text-sm">
                            <Plus className="w-4 h-4" /> Ajouter un Pack
                        </button>
                    </div>
                )}
            </div>

            {/* Sub/Packs Tabs */}
            <div className="flex bg-bg-light p-1 rounded-xl w-full sm:w-fit">
                <button
                    onClick={() => setActiveTab('subs')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'subs' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-primary'}`}
                >
                    Abonnements
                </button>
                <button
                    onClick={() => setActiveTab('packs')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'packs' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-primary'}`}
                >
                    Catalogue de Packs
                </button>
            </div>

            {activeTab === 'subs' && (
                <>
                    <>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm focus-within:ring-2 focus-within:ring-accent/10 focus-within:border-accent transition-all">
                                <Search className="w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un étudiant ou un pack..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent text-sm outline-none flex-1 text-primary placeholder:text-text-muted"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-border bg-white text-sm text-text-secondary shadow-sm outline-none hover:border-accent/30 appearance-none cursor-pointer min-w-[150px]"
                            >
                                <option value="ALL">Tous les statuts</option>
                                {Object.keys(statusLabel).map(status => (
                                    <option key={status} value={status}>{statusLabel[status]}</option>
                                ))}
                            </select>
                        </div>

                        <div className="card-premium overflow-hidden">
                            {loading ? (
                                <div className="px-6 py-20 text-center text-text-muted">
                                    <div className="w-10 h-10 border-4 border-accent/10 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-sm font-medium">Récupération des abonnements...</p>
                                </div>
                            ) : subscriptions.length === 0 ? (
                                <div className="px-6 py-20 text-center text-text-muted">
                                    <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                                    <p className="text-sm font-medium">Aucun abonnement trouvé</p>
                                </div>
                            ) : (
                                <>
                                    <ResponsiveTable
                                        loading={loading}
                                        data={subscriptions}
                                        primaryKey="id"
                                        columns={[
                                            { key: 'student', label: 'Étudiant' },
                                            { key: 'pack', label: 'Pack' },
                                            { key: 'date', label: 'Date Souscription', breakpoint: 'md' },
                                            { key: 'amount', label: 'Montant Payé', breakpoint: 'sm' },
                                            { key: 'status', label: 'Statut' },
                                        ]}
                                        renderDesktopRow={(sub) => (
                                            <>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-info/10 text-info flex items-center justify-center font-bold text-sm uppercase">
                                                            {sub.user?.firstName?.[0]}{sub.user?.lastName?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm text-primary">{sub.user?.firstName} {sub.user?.lastName}</div>
                                                            <div className="text-xs text-text-muted">{sub.user?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-sm text-primary">{sub.pack?.name}</div>
                                                    <div className="text-xs text-text-muted">{sub.pack?.price.toLocaleString()} FCFA</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-secondary hidden md:table-cell">
                                                    {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">
                                                    <span className="text-sm font-semibold text-primary">{sub.amountPaid?.toLocaleString()} FCFA</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg ${statusBadge[sub.status] || 'bg-border text-text-secondary'}`}>
                                                        {statusLabel[sub.status] || sub.status}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        renderMobileSummary={(sub) => ({
                                            label: 'Étudiant',
                                            value: (
                                                <div className="flex items-center gap-2">
                                                    <span>{sub.user?.firstName} {sub.user?.lastName}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${statusBadge[sub.status]}`}>{statusLabel[sub.status]}</span>
                                                </div>
                                            )
                                        })}
                                        renderMobileDetails={(sub) => [
                                            { label: 'Pack', value: `${sub.pack?.name} (${sub.pack?.price.toLocaleString()} FCFA)` },
                                            { label: 'Email', value: sub.user?.email },
                                            { label: 'Date', value: new Date(sub.createdAt).toLocaleDateString('fr-FR') },
                                            { label: 'Payé', value: `${sub.amountPaid?.toLocaleString()} FCFA` }
                                        ]}
                                        renderActions={(sub) => (
                                            (sub.status === 'PENDING' || sub.status === 'PARTIAL') && (
                                                <button
                                                    onClick={() => handleOpenPayment(sub)}
                                                    className="p-2 rounded-lg hover:bg-bg-light text-success transition-colors bg-white shadow-sm sm:shadow-none sm:bg-transparent"
                                                    title="Encaisser"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                </button>
                                            )
                                        )}
                                    />

                                    <div className="mt-4">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            totalItems={totalSubs}
                                            itemsPerPage={5}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                </>
            )}

            {activeTab === 'packs' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {loading ? (
                        <div className="col-span-full py-12 flex justify-center">
                            <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                        </div>
                    ) : packs.length === 0 ? (
                        <div className="col-span-full py-12 text-center card-premium">
                            <BrandIcon icon={Package} size={56} className="mx-auto mb-4 opacity-30 grayscale" />
                            <p className="text-sm font-semibold text-text-secondary mb-5">Aucun pack créé pour le moment.</p>
                            <button
                                onClick={handleSeedPacks}
                                disabled={isSeeding}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
                            >
                                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <SparkleIcon className="w-4 h-4" weight="fill" />}
                                Créer les 4 packs officiels
                            </button>
                        </div>
                    ) : packs.map((pack, idx) => {
                        let features: string[] = [];
                        try { features = JSON.parse(pack.features || '[]'); } catch { }
                        return (
                            <motion.div
                                key={pack.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="card-premium p-5 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <BrandIcon icon={Package} size={44} className="shadow-sm" />
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => { setPackToEdit(pack); setIsEditModalOpen(true); }}
                                            className="p-2 rounded-xl hover:bg-bg-light transition-colors text-text-muted hover:text-primary"
                                            title="Modifier"
                                        >
                                            <PencilSimple className="w-4 h-4" weight="bold" />
                                        </button>
                                        <button
                                            onClick={() => setPackToDelete(pack)}
                                            className="p-2 rounded-xl hover:bg-error/10 transition-colors text-text-muted hover:text-error"
                                            title="Supprimer"
                                        >
                                            <Trash className="w-4 h-4" weight="bold" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-primary">{pack.name}</h3>
                                <p className="text-xs text-text-secondary mt-0.5 mb-3">{pack.description}</p>
                                <div className="text-xl font-extrabold text-primary mb-1">{pack.price.toLocaleString()} CFA</div>
                                {pack.installment1 && pack.installment2 && (
                                    <p className="text-[11px] font-medium text-info mb-3">En 2x : {pack.installment1.toLocaleString()} + {pack.installment2.toLocaleString()} CFA</p>
                                )}

                                <ul className="space-y-1.5 mt-auto pt-3 border-t border-border/10">
                                    {features.map((f: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-text-primary">
                                            <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                                            <span className="leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {packToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setPackToDelete(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                                <Trash className="w-6 h-6 text-error" weight="bold" />
                            </div>
                            <h3 className="text-lg font-bold text-primary text-center mb-2">Supprimer le pack ?</h3>
                            <p className="text-sm text-text-secondary text-center mb-6">
                                Voulez-vous vraiment supprimer <strong>{packToDelete.name}</strong> ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setPackToDelete(null)} className="flex-1 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors text-sm">
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleDeletePack(packToDelete)}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-error text-white hover:bg-error/90 transition-colors shadow-sm"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreatePackModal onClose={() => setIsCreateModalOpen(false)} onSuccess={loadData} />
                )}
                {isEditModalOpen && packToEdit && (
                    <EditPackModal pack={packToEdit} onClose={() => { setIsEditModalOpen(false); setPackToEdit(null); }} onSuccess={loadData} />
                )}
                {isPaymentModalOpen && selectedSubscription && (
                    <PaymentModal
                        subscription={selectedSubscription}
                        onClose={() => { setIsPaymentModalOpen(false); setSelectedSubscription(null); }}
                        onSuccess={loadData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function CreatePackModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [paymentType, setPaymentType] = useState<'single' | 'two'>('single');
    const [formData, setFormData] = useState({
        name: '', description: '', price: 0,
        features: '',
        installment1: 0, installment2: 0,
    });
    const [isSaving, setIsSaving] = useState(false);

    const installmentSum = Number(formData.installment1) + Number(formData.installment2);
    const installmentMismatch = paymentType === 'two' && formData.price > 0 && installmentSum !== Number(formData.price);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSubmit = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                installment1: paymentType === 'two' ? Number(formData.installment1) || null : null,
                installment2: paymentType === 'two' ? Number(formData.installment2) || null : null,
                features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
            };
            await api.createPack(dataToSubmit);
            toast.success('Pack créé avec succès !');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la création');
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Créer un nouveau Pack</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Nom du Pack</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Ex: Pack Démarrage" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} resize-none min-h-[70px]`} placeholder="Ex: Pour bien démarrer votre mémoire" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Prix total (CFA)</label>
                        <input type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className={inputClass} placeholder="Ex: 50000" required min={1} />
                    </div>

                    {/* Payment type toggle */}
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Modalités de paiement</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentType('single')}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${paymentType === 'single' ? 'border-accent bg-accent/5 text-primary' : 'border-border text-text-muted hover:border-accent/30'}`}
                            >
                                <span className="text-base">💳</span>
                                Paiement unique
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentType('two')}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${paymentType === 'two' ? 'border-accent bg-accent/5 text-primary' : 'border-border text-text-muted hover:border-accent/30'}`}
                            >
                                <span className="text-base">✂️</span>
                                2 tranches
                            </button>
                        </div>
                    </div>

                    {/* Installment fields - shown only for 2-payment packs */}
                    {paymentType === 'two' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">1ère tranche (CFA)</label>
                                <input type="number" value={formData.installment1 || ''} onChange={e => setFormData({ ...formData, installment1: Number(e.target.value) })} className={inputClass} placeholder="Ex: 75000" required min={1} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">2ème tranche (CFA)</label>
                                <input type="number" value={formData.installment2 || ''} onChange={e => setFormData({ ...formData, installment2: Number(e.target.value) })} className={inputClass} placeholder="Ex: 25000" required min={1} />
                            </div>
                            {installmentMismatch && (
                                <p className="col-span-2 text-xs text-warning font-medium flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    Les tranches ({installmentSum.toLocaleString()} CFA) ne correspondent pas au prix total ({Number(formData.price).toLocaleString()} CFA)
                                </p>
                            )}
                        </motion.div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Caractéristiques <span className="text-text-muted font-normal">(une par ligne)</span></label>
                        <textarea
                            value={formData.features}
                            onChange={e => setFormData({ ...formData, features: e.target.value })}
                            placeholder={"Choix du sujet\nProblématique\nPlan détaillé"}
                            className={`${inputClass} resize-none min-h-[120px] leading-relaxed`}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors text-sm">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
                            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : 'Créer le Pack'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function EditPackModal({ pack, onClose, onSuccess }: { pack: any, onClose: () => void, onSuccess: () => void }) {
    let initialFeatures: string[] = [];
    try { initialFeatures = JSON.parse(pack.features || '[]'); } catch { }

    const [formData, setFormData] = useState({
        name: pack.name || '',
        description: pack.description || '',
        price: pack.price || 0,
        installment1: pack.installment1 || 0,
        installment2: pack.installment2 || 0,
        features: initialFeatures.join('\n'),
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSubmit = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                installment1: Number(formData.installment1) || null,
                installment2: Number(formData.installment2) || null,
                features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
            };
            await api.updatePack(pack.id, dataToSubmit);
            toast.success('Pack mis à jour !');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-primary">Modifier le Pack</h3>
                        <p className="text-xs text-text-muted mt-0.5">{pack.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Nom du Pack</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} resize-none min-h-[70px]`} required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3 sm:col-span-1">
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Prix (CFA)</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className={inputClass} required />
                        </div>
                        <div className="col-span-3 sm:col-span-1">
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">1ère tranche</label>
                            <input type="number" value={formData.installment1} onChange={e => setFormData({ ...formData, installment1: Number(e.target.value) })} placeholder="0 = non" className={inputClass} />
                        </div>
                        <div className="col-span-3 sm:col-span-1">
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">2ème tranche</label>
                            <input type="number" value={formData.installment2} onChange={e => setFormData({ ...formData, installment2: Number(e.target.value) })} placeholder="0 = non" className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Caractéristiques <span className="text-text-muted font-normal">(une par ligne)</span></label>
                        <textarea
                            value={formData.features}
                            onChange={e => setFormData({ ...formData, features: e.target.value })}
                            placeholder={"Choix du sujet\nProblématique\nPlan détaillé"}
                            className={`${inputClass} resize-none min-h-[130px] leading-relaxed`}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors text-sm">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
                            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</> : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function PaymentModal({ subscription, onClose, onSuccess }: { subscription: any, onClose: () => void, onSuccess: () => void }) {
    const remaining = subscription.pack.price - subscription.amountPaid;
    const [amount, setAmount] = useState<number>(remaining);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (amount <= 0) {
            setError("Le montant doit être supérieur à 0");
            return;
        }
        if (amount > remaining) {
            setError(`Le montant ne peut pas dépasser le reste à payer (${remaining} FCFA)`);
            return;
        }

        setIsSaving(true);
        try {
            await api.recordPayment(subscription.id, amount);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'enregistrement du paiement");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-primary">Encaisser un paiement</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-primary mb-2">Paiement Enregistré</h4>
                        <p className="text-sm text-text-secondary">L'abonnement a été mis à jour.</p>
                    </motion.div>
                ) : (
                    <>
                        <div className="mb-6 p-4 rounded-xl border border-border-light bg-bg-light space-y-2 text-sm text-primary">
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-medium">Étudiant:</span>
                                <span className="font-bold">{subscription.user.firstName} {subscription.user.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-medium">Pack:</span>
                                <span className="font-bold">{subscription.pack.name}</span>
                            </div>
                            <div className="flex justify-between border-t border-border/10 pt-2 mt-2 font-medium">
                                <span className="text-text-secondary">Total:</span>
                                <span className="text-primary">{subscription.pack.price.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-success">
                                <span>Déjà payé:</span>
                                <span className="font-bold">{subscription.amountPaid.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-error font-bold">
                                <span>Reste:</span>
                                <span>{remaining.toLocaleString()} FCFA</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Montant reçu (FCFA)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={remaining}
                                    value={amount}
                                    onChange={e => setAmount(Number(e.target.value))}
                                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-base font-bold text-primary outline-none focus:border-accent transition-all"
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-error font-medium flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                                </p>
                            )}

                            <div className="mt-8 flex flex-col gap-3">
                                <button type="submit" disabled={isSaving || amount <= 0 || amount > remaining} className="btn-success w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-success/20">
                                    {isSaving ? (
                                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Validation...</span>
                                    ) : (
                                        'Confirmer l\'encaissement'
                                    )}
                                </button>
                                <button type="button" onClick={onClose} className="w-full py-3 text-sm font-semibold text-text-secondary hover:bg-bg-light rounded-xl transition-colors">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}

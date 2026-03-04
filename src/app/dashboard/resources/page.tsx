'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    FileText, Download, Link as LinkIcon, Plus, Trash as Trash2, MagnifyingGlass as Search, BookOpen, ArrowSquareOut as ExternalLink, X, Upload, PencilSimple as Pencil
} from '@phosphor-icons/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BrandIcon } from '@/components/BrandIcon';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';

export default function ResourcesPage() {
    const { user } = useAuth();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const categories = [
        { id: 'ALL', label: 'Tout' },
        { id: 'GUIDES', label: 'Guides' },
        { id: 'TEMPLATES', label: 'Templates' },
        { id: 'EXEMPLES', label: 'Exemples' },
        { id: 'GENERAL', label: 'Général' }
    ];

    useEffect(() => {
        loadResources();
    }, [activeCategory]);

    const loadResources = async () => {
        setLoading(true);
        try {
            const res = await api.getResources(activeCategory);
            setResources(res.resources || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async (id: string) => {
        try {
            await api.deleteResource(id);
            setResources(resources.filter(r => r.id !== id));
            toast.success('Ressource supprimée');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const getIcon = (type: string) => {
        const icon = type === 'LINK' ? LinkIcon : FileText;
        return <BrandIcon icon={icon} size={36} className="shadow-sm" />;
    };

    const handlePreview = (url: string) => {
        if (!url) return;
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            window.open(url, '_blank');
            return;
        }
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
        window.open(viewerUrl, '_blank');
    };

    const filteredResources = resources.filter(res =>
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-primary flex items-center gap-2">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" /> Bibliothèque de Ressources
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Gabarits, guides et exemples pour vous aider dans votre rédaction.</p>
                </div>
                {user?.role === 'ADMIN' && (
                    <button onClick={() => setIsAddModalOpen(true)} className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Ajouter
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="w-full flex items-center gap-2 bg-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-border-light focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/10 transition-all shadow-sm">
                    <Search className="w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Rechercher une ressource..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1 text-text-primary"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'bg-accent text-primary shadow-sm'
                                : 'bg-white text-text-secondary border border-border-light hover:bg-bg-light'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="p-20 flex justify-center"><LoadingSpinner size="lg" /></div>
            ) : filteredResources.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-border-light">
                    <BrandIcon icon={BookOpen} size={64} className="mx-auto mb-3 opacity-30 grayscale" />
                    <p className="text-text-secondary font-medium">Aucune ressource trouvée</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-8">
                    {filteredResources.map(resource => (
                        <div key={resource.id} className="card-premium p-3 sm:p-5 flex flex-col group overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="group-hover:scale-105 transition-transform">
                                    {getIcon(resource.fileType)}
                                </div>
                                {user?.role === 'ADMIN' && (
                                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingResource(resource)} className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(resource.id)} className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 mb-4 sm:mb-6 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-accent/10 text-accent">
                                        {resource.category}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                                        {resource.fileType}
                                    </span>
                                </div>
                                <h3 className="font-bold text-primary text-sm sm:text-base mb-1.5 line-clamp-2 break-words">{resource.title}</h3>
                                {resource.description && (
                                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{resource.description}</p>
                                )}
                            </div>

                            <div className="mt-auto flex flex-col sm:flex-row gap-2">
                                {resource.fileType === 'LINK' ? (
                                    <a
                                        href={resource.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full btn-secondary py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm flex justify-center items-center gap-2 bg-bg-light border border-border-light text-primary hover:bg-primary hover:text-white transition-colors rounded-xl font-medium"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Ouvrir le lien
                                    </a>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handlePreview(resource.fileUrl)}
                                            className="flex-1 btn-secondary py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm flex justify-center items-center gap-1.5 sm:gap-2 bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white transition-colors rounded-xl font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4" /> Voir
                                        </button>
                                        <a
                                            href={resource.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 btn-secondary py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm flex justify-center items-center gap-1.5 sm:gap-2 bg-bg-light border border-border-light text-primary hover:bg-primary hover:text-white transition-colors rounded-xl font-medium"
                                        >
                                            <Download className="w-4 h-4" /> Télécharger
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isAddModalOpen && <AddResourceModal onClose={() => setIsAddModalOpen(false)} onAdd={loadResources} />}
                {editingResource && <EditResourceModal resource={editingResource} onClose={() => setEditingResource(null)} onUpdate={loadResources} />}
                <ConfirmModal
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                    title="Supprimer la ressource"
                    message="Voulez-vous vraiment supprimer cette ressource ? Cette action est irréversible."
                    confirmText="Supprimer"
                    variant="danger"
                />
            </AnimatePresence>
        </div>
    );
}

function EditResourceModal({ resource, onClose, onUpdate }: { resource: any, onClose: () => void, onUpdate: () => void }) {
    const [title, setTitle] = useState(resource.title);
    const [description, setDescription] = useState(resource.description || '');
    const [category, setCategory] = useState(resource.category);
    const [linkUrl, setLinkUrl] = useState(resource.fileUrl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        setIsSubmitting(true);
        try {
            await api.updateResource(resource.id, {
                title,
                description,
                category,
                linkUrl: resource.fileType === 'LINK' ? linkUrl : resource.fileUrl
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la modification");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Modifier la ressource</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Titre</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Catégorie</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm appearance-none cursor-pointer">
                            <option value="GENERAL">Général</option>
                            <option value="GUIDES">Guides méthodologiques</option>
                            <option value="TEMPLATES">Templates (Gabarits)</option>
                            <option value="EXEMPLES">Exemples de mémoire</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm resize-none" />
                    </div>

                    {resource.fileType === 'LINK' && (
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-1.5">URL du lien</label>
                            <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm" />
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:bg-bg-light rounded-xl transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSubmitting || !title} className="btn-primary px-6 py-2.5 text-sm">
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function AddResourceModal({ onClose, onAdd }: { onClose: () => void, onAdd: () => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('GENERAL');
    const [isLink, setIsLink] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || (!file && !linkUrl)) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            if (description) formData.append('description', description);
            formData.append('category', category);

            if (isLink) {
                formData.append('linkUrl', linkUrl);
            } else if (file) {
                formData.append('file', file);
            }

            await api.createResource(formData);
            onAdd();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'ajout");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Ajouter une ressource</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Titre</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Modèle de présentation" className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Catégorie</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm appearance-none cursor-pointer">
                            <option value="GENERAL">Général</option>
                            <option value="GUIDES">Guides méthodologiques</option>
                            <option value="TEMPLATES">Templates (Gabarits)</option>
                            <option value="EXEMPLES">Exemples de mémoire</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1.5">Description (optionnel)</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brève description..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm resize-none" />
                    </div>

                    <div className="pt-2">
                        <div className="flex bg-bg-light p-1 rounded-xl mb-4">
                            <button type="button" onClick={() => setIsLink(false)} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${!isLink ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-primary'}`}>Fichier</button>
                            <button type="button" onClick={() => setIsLink(true)} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${isLink ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-primary'}`}>Lien (URL)</button>
                        </div>

                        {isLink ? (
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-1.5">URL du lien</label>
                                <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} required placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-light focus:bg-white focus:border-accent outline-none transition-all text-sm" />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-1.5">Fichier</label>
                                <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} required className="hidden" />
                                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-2 border-dashed border-border-light bg-bg-light hover:bg-accent/5 hover:border-accent/30 transition-colors rounded-xl p-4 text-center">
                                    <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
                                    <p className="text-sm font-medium text-primary">{file ? file.name : 'Cliquez pour sélectionner un fichier'}</p>
                                    {!file && <p className="text-xs text-text-muted mt-1">PDF, DOCX, XLSX...</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:bg-bg-light rounded-xl transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSubmitting || !title || (!file && !linkUrl)} className="btn-primary px-6 py-2.5 text-sm">
                            {isSubmitting ? 'Ajout...' : 'Ajouter la ressource'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Upload, Download, Eye, Clock, CheckCircle, Warning as AlertTriangle, MagnifyingGlass as Search, Faders as Filter, DotsThreeVertical as MoreVertical, X, ClipboardText as ClipboardCheck, Sparkle as Sparkles, MagicWand as Wand2, ChatCircle as MessageCircle, CaretDown, CaretUp, Users, TrendUp
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';
import { StatsCard } from '@/components/StatsCard';
import { FilePreviewModal } from '@/components/FilePreview';

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
    UPLOADED: { label: 'Envoyé', color: 'bg-info/10 text-info', icon: Upload },
    UNDER_REVIEW: { label: 'En revue', color: 'bg-warning/10 text-warning', icon: Clock },
    APPROVED: { label: 'Approuvé', color: 'bg-success/10 text-success', icon: CheckCircle },
    REVISION_NEEDED: { label: 'À réviser', color: 'bg-error/10 text-error', icon: AlertTriangle },
};

const CATEGORIES = [
    { id: 'PLAN', label: 'Plan & Structure', icon: FileText },
    { id: 'INTRO', label: 'Introduction', icon: FileText },
    { id: 'CHAPTER_1', label: 'Chapitre 1', icon: FileText },
    { id: 'CHAPTER_2', label: 'Chapitre 2', icon: FileText },
    { id: 'CHAPTER_3', label: 'Chapitre 3', icon: FileText },
    { id: 'CONCLUSION', label: 'Conclusion', icon: FileText },
    { id: 'FINAL', label: 'Version Finale', icon: Sparkles },
    { id: 'GENERAL', label: 'Autre document', icon: FileText },
];

// Sub-component for individual document cards
function DocumentCard({ doc, isLatest, userRole, onPreview, onReview, getFileUrl }: any) {
    const status = statusConfig[doc.status] || statusConfig['UPLOADED'];
    const StatusIcon = status.icon;
    const isPdf = doc.filename.toLowerCase().endsWith('.pdf');

    return (
        <motion.div
            initial={{ opacity: 0, x: isLatest ? 0 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`card-premium transition-all ${isLatest ? 'p-4 shadow-sm border-l-4 border-l-primary' : 'p-3 bg-bg-light/40 border-dashed opacity-80 hover:opacity-100 hover:bg-white'}`}
        >
            <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20 ${isLatest ? 'w-11 h-11' : 'w-9 h-9'}`}>
                    <FileText className={isLatest ? 'w-6 h-6' : 'w-5 h-5'} weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-semibold text-primary truncate max-w-[200px] sm:max-w-none ${isLatest ? 'text-sm' : 'text-xs'}`}>{doc.filename}</h4>
                                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${isLatest ? 'bg-primary/10 text-primary' : 'bg-bg-light text-text-muted border border-border/50'}`}>
                                    v{doc.version}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] text-text-muted flex-wrap">
                                <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                                {userRole !== 'STUDENT' && doc.uploader && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="font-medium text-accent">Étudiant: {doc.uploader.firstName} {doc.uploader.lastName}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                            </span>
                        </div>
                    </div>
                    {doc.feedback && (
                        <div className={`mt-3 p-2.5 sm:p-3 rounded-lg text-[11px] leading-relaxed ${doc.status === 'REVISION_NEEDED' ? 'bg-error/5 text-error/80 border border-error/10 shadow-inner' : 'bg-success/5 text-success/80 border border-success/10 shadow-inner'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <MessageCircle className="w-3 h-3" />
                                <span className="font-bold uppercase tracking-wider text-[9px]">Retour Accompanateur</span>
                            </div>
                            {doc.feedback}
                        </div>
                    )}
                </div>
            </div>
            <div className={`flex items-center gap-2 mt-3 flex-wrap ${isLatest ? 'sm:pl-14' : 'sm:pl-12'}`}>
                <button onClick={() => onPreview(doc)} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/10 transition-colors border border-transparent">
                    <Eye className="w-3 h-3" /> Voir
                </button>
                <button onClick={() => window.open(getFileUrl(doc.filePath), '_blank')} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-info bg-info/5 hover:bg-info/10 transition-colors border border-transparent">
                    <Download className="w-3 h-3" /> Télécharger
                </button>
                {userRole !== 'STUDENT' && isLatest && (
                    <button
                        onClick={onReview}
                        className="sm:ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white bg-accent hover:bg-accent-light shadow-md hover:shadow-lg transition-all"
                    >
                        <ClipboardCheck className="w-3.5 h-3.5" /> Évaluer
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export default function DocumentsPage() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [reviewingDoc, setReviewingDoc] = useState<any>(null);
    const [previewFile, setPreviewFile] = useState<{ url: string, extension: string, fileName: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [activeStatus, setActiveStatus] = useState('ALL');
    const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);
    const [stats, setStats] = useState({ total: 0, approved: 0, underReview: 0, revision: 0 });

    const toggleHistory = (catId: string) => {
        setExpandedHistory(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    useEffect(() => {
        loadDocuments();
    }, [currentPage, activeCategory, activeStatus]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else loadDocuments();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const res = await api.getDocuments(currentPage, 5, searchQuery, activeCategory, activeStatus);
            setDocuments(res.documents || []);
            setTotalPages(res.totalPages || 1);
            setTotalDocs(res.total || 0);

            // Calculate stats from the current page/total if API doesn't provide them
            // In a real app, these would come from the backend
            setStats({
                total: res.total || 0,
                approved: (res.documents || []).filter((d: any) => d.status === 'APPROVED').length,
                underReview: (res.documents || []).filter((d: any) => d.status === 'UNDER_REVIEW').length,
                revision: (res.documents || []).filter((d: any) => d.status === 'REVISION_NEEDED').length,
            });
        } catch (error) {
            console.error("Failed to fetch documents", error);
            toast.error("Erreur de chargement des documents");
        } finally {
            setLoading(false);
        }
    };

    // Group documents by category, maintaining the most recent activity first globally
    const groupedDocs: Record<string, any[]> = {};
    const categoryOrder: string[] = [];

    // documents is already sorted by date descending from backend (api.getDocuments)
    documents.forEach(doc => {
        const catId = doc.category || 'OTHER';
        if (!groupedDocs[catId]) {
            groupedDocs[catId] = [];
            categoryOrder.push(catId); // First encounter = newest doc in this category
        }
        groupedDocs[catId].push(doc);
    });

    // Sort versions within each category just in case (though backend already handles date desc)
    Object.keys(groupedDocs).forEach(catId => {
        groupedDocs[catId].sort((a, b) => b.version - a.version);
    });

    const getFileUrl = (path: string) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const baseUrl = apiUrl.replace('/api', '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handlePreview = (doc: any) => {
        const fileUrl = getFileUrl(doc.filePath);
        // If it's a local development url, external viewers won't work, fallback to direct open
        if (fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1')) {
            window.open(fileUrl, '_blank');
            return;
        }
        const extension = doc.filePath.split('.').pop() || '';
        setPreviewFile({ url: fileUrl, extension, fileName: doc.filename });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">{user?.role === 'STUDENT' ? 'Mes Documents' : 'Documents Étudiants'}</h1>
                    <p className="text-text-secondary mt-1">Gérez vos fichiers et suivez les retours</p>
                </div>
                {user?.role === 'STUDENT' && (
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsAiModalOpen(true)} className="btn-secondary py-3 px-6 text-sm flex items-center gap-2 bg-white border border-border text-primary hover:bg-bg-light transition-colors rounded-xl font-medium shadow-sm">
                            <Sparkles className="w-4 h-4 text-accent" /> Assistant IA
                        </button>
                        <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary py-3 px-6 text-sm">
                            <Upload className="w-4 h-4" /> Envoyer un document
                        </button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatsCard label="Total" value={loading ? '…' : stats.total} icon={FileText} delay={0.1} />
                <StatsCard label="Approuvés" value={loading ? '…' : stats.approved} icon={CheckCircle} delay={0.2} valueColor="text-success" />
                <StatsCard label="En revue" value={loading ? '…' : stats.underReview} icon={Clock} delay={0.3} valueColor="text-warning" />
                <StatsCard label="À réviser" value={loading ? '…' : stats.revision} icon={AlertTriangle} delay={0.4} valueColor="text-error" />
            </div>

            {/* Formatting & Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-4 py-3 shadow-sm hover:border-accent/30 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
                    <Search className="w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Rechercher un document..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1 text-primary placeholder:text-text-muted"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-border bg-white text-sm text-text-secondary shadow-sm hover:border-accent/30 outline-none transition-all cursor-pointer appearance-none"
                    >
                        <option value="ALL">Toutes catégories</option>
                        {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                    </select>
                    <select
                        value={activeStatus}
                        onChange={(e) => setActiveStatus(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-border bg-white text-sm text-text-secondary shadow-sm hover:border-accent/30 outline-none transition-all cursor-pointer appearance-none"
                    >
                        <option value="ALL">Tous statuts</option>
                        {Object.entries(statusConfig).map(([id, cfg]) => <option key={id} value={id}>{cfg.label}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : Object.keys(groupedDocs).length === 0 ? (
                <div className="card-premium p-12 text-center text-text-secondary">
                    <BrandIcon icon={FileText} size={64} className="mx-auto mb-4 opacity-30 grayscale" />
                    <h3 className="text-xl font-bold text-primary mb-2">Aucun document trouvé</h3>
                    <p>{user?.role === 'STUDENT' ? 'Commencez par envoyer votre premier chapitre ou plan.' : 'Aucun document n\'a été soumis par vos étudiants.'}</p>
                </div>
            ) : (
                <div className="space-y-8 pb-20">
                    {categoryOrder.map((catId, groupIndex) => {
                        const docs = groupedDocs[catId];
                        const category = CATEGORIES.find(c => c.id === catId) || { label: 'Autres Documents', icon: FileText };
                        const latestDoc = docs[0];
                        const history = docs.slice(1);

                        return (
                            <div key={catId} className="bg-white rounded-2xl border border-border/60 shadow-sm p-4 transition-all hover:border-accent/20 group">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent ring-4 ring-accent/5 group-hover:scale-110 transition-transform">
                                            <category.icon className="w-5 h-5" weight="fill" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-primary text-sm uppercase tracking-tight">{category.label}</h3>
                                            <div className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-wider">{docs.length} document{docs.length > 1 ? 's' : ''} enregistré{docs.length > 1 ? 's' : ''}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-1">
                                    <DocumentCard
                                        doc={latestDoc}
                                        isLatest={true}
                                        userRole={user?.role}
                                        onPreview={handlePreview}
                                        onReview={() => setReviewingDoc(latestDoc)}
                                        getFileUrl={getFileUrl}
                                    />
                                </div>

                                {history.length > 0 && (
                                    <div className="mt-4 px-1">
                                        <button
                                            onClick={() => toggleHistory(catId)}
                                            className="ml-6 py-1.5 px-3 rounded-lg text-xs font-bold text-text-secondary hover:text-primary hover:bg-bg-light flex items-center gap-2 transition-colors border border-transparent hover:border-border"
                                        >
                                            {expandedHistory[catId] ? <CaretUp className="w-4 h-4" /> : <CaretDown className="w-4 h-4" />}
                                            {expandedHistory[catId] ? 'Masquer l\'historique des versions' : `Voir les anciennes versions (${history.length})`}
                                        </button>

                                        <AnimatePresence>
                                            {expandedHistory[catId] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="ml-7 space-y-3 pt-4 border-l-2 border-border/50 pl-5 mt-2 pb-2">
                                                        {history.map((doc: any) => (
                                                            <DocumentCard
                                                                key={doc.id}
                                                                doc={doc}
                                                                isLatest={false}
                                                                userRole={user?.role}
                                                                onPreview={handlePreview}
                                                                onReview={() => setReviewingDoc(doc)}
                                                                getFileUrl={getFileUrl}
                                                            />
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={totalDocs}
                        itemsPerPage={5}
                    />
                </div>
            )}

            <FilePreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                url={previewFile?.url || ''}
                extension={previewFile?.extension || ''}
                fileName={previewFile?.fileName}
            />

            <AnimatePresence>
                {isUploadModalOpen && (
                    <UploadModal onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={loadDocuments} />
                )}
                {isAiModalOpen && (
                    <AiAssistantModal onClose={() => setIsAiModalOpen(false)} />
                )}
                {reviewingDoc && (
                    <ReviewModal doc={reviewingDoc} onClose={() => setReviewingDoc(null)} onReviewSuccess={loadDocuments} />
                )}
            </AnimatePresence>
        </div>
    );
}

function ReviewModal({ doc, onClose, onReviewSuccess }: { doc: any, onClose: () => void, onReviewSuccess: () => void }) {
    const [status, setStatus] = useState(doc.status === 'UPLOADED' ? 'UNDER_REVIEW' : doc.status);
    const [feedback, setFeedback] = useState(doc.feedback || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.reviewDocument(doc.id, status, feedback);
            onReviewSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'enregistrement de l'évaluation.");
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Évaluation du document</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-bg-light border border-border">
                    <div className="font-semibold text-primary">{doc.filename}</div>
                    <div className="text-xs text-text-muted mt-1">Étudiant : {doc.uploader?.firstName} {doc.uploader?.lastName}</div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Statut de la revue</label>
                        <select
                            className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="UNDER_REVIEW">En revue</option>
                            <option value="REVISION_NEEDED">À réviser (Retourné à l'étudiant)</option>
                            <option value="APPROVED">Approuvé (Validé)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Feedback & Commentaires (Optionnel)</label>
                        <textarea
                            className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none min-h-[120px]"
                            placeholder="Saisissez vos remarques détaillées pour guider l'étudiant..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors">
                        Annuler
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                        {isSaving ? <LoadingSpinner size="sm" light /> : <ClipboardCheck className="w-4 h-4" />}
                        {isSaving ? 'Enregistrement...' : 'Valider l\'évaluation'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function UploadModal({ onClose, onUploadSuccess }: { onClose: () => void, onUploadSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('GENERAL');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);

            await api.uploadDocument(formData);
            onUploadSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'envoi");
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Envoyer un document</h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Catégorie du document</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left border transition-all ${category === cat.id
                                        ? 'bg-primary/5 border-primary text-primary ring-2 ring-primary/10'
                                        : 'bg-white border-border text-text-secondary hover:bg-bg-light'
                                        }`}
                                >
                                    <cat.icon className={`w-4 h-4 ${category === cat.id ? 'text-primary' : 'text-text-muted'}`} />
                                    <span className="text-xs font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-border-light rounded-2xl p-8 bg-primary/[0.01] hover:bg-accent/[0.02] hover:border-accent/30 transition-all group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        <BrandIcon icon={Upload} size={64} className="mb-4 group-hover:scale-110 shadow-md ring-4 ring-accent/10" />
                        {file ? (
                            <div className="text-center">
                                <p className="font-bold text-primary text-sm">{file.name}</p>
                                <p className="text-[10px] text-text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button className="text-accent text-xs font-bold mt-4 px-3 py-1 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Changer de fichier</button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="font-bold text-primary text-sm mb-1">Cliquez ou déposez le fichier</p>
                                <p className="text-[10px] text-text-muted">PDF, DOCX (Max: 10MB)</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-sm text-text-secondary hover:bg-bg-light transition-colors">
                        Annuler
                    </button>
                    <button onClick={handleUpload} disabled={!file || isUploading} className="btn-primary px-8 py-3 flex items-center gap-2 text-sm">
                        {isUploading ? <LoadingSpinner size="sm" light /> : <Upload className="w-4 h-4" />}
                        {isUploading ? 'Envoi...' : 'Envoyer maintenant'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function AiAssistantModal({ onClose }: { onClose: () => void }) {
    const [text, setText] = useState('');
    const [result, setResult] = useState<{ corrected: string, feedback: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setIsAnalyzing(true);
        try {
            const res = await api.aiCorrect(text) as any;
            setResult(res);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'analyse.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                        <BrandIcon icon={Sparkles} size={36} className="!bg-accent/10 shadow-sm" iconClassName="!text-accent" /> Assistant IA de Correction
                    </h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-light rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {!result ? (
                        <div className="flex flex-col h-full mb-4">
                            <p className="text-sm text-text-secondary mb-3">Collez ici un extrait de votre mémoire pour une vérification orthographique, grammaticale et stylistique.</p>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Collez votre texte ici..."
                                className="w-full flex-1 min-h-[300px] border border-border rounded-xl p-4 text-sm text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none bg-bg-light/30"
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                                <h4 className="font-semibold text-accent flex items-center gap-2 mb-2">
                                    <Wand2 className="w-4 h-4" /> Retour de l'IA
                                </h4>
                                <p className="text-sm text-primary leading-relaxed">{result.feedback}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-text-secondary mb-2">Texte original</h4>
                                <div className="p-4 rounded-xl bg-bg-light border border-border text-sm text-text-muted opacity-70 whitespace-pre-wrap">
                                    {text}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-primary mb-2">Texte corrigé</h4>
                                <div className="p-4 rounded-xl bg-white border border-border text-sm text-primary shadow-sm whitespace-pre-wrap">
                                    {result.corrected}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-border flex justify-end gap-3 flex-shrink-0">
                    {result ? (
                        <>
                            <button onClick={() => { setResult(null); setText(''); }} className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors">
                                Nouveau texte
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(result.corrected); onClose(); }} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                                <ClipboardCheck className="w-4 h-4" /> Copier la correction
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-light transition-colors">
                                Annuler
                            </button>
                            <button onClick={handleAnalyze} disabled={!text.trim() || isAnalyzing} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                                {isAnalyzing ? <LoadingSpinner size="sm" light /> : <Sparkles className="w-4 h-4" />}
                                {isAnalyzing ? 'Analyse en cours...' : 'Corriger le texte'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

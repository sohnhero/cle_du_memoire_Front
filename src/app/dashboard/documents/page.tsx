'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Upload, Download, Eye, Clock, CheckCircle, Warning as AlertTriangle, MagnifyingGlass as Search, Faders as Filter, DotsThreeVertical as MoreVertical, X, ClipboardText as ClipboardCheck, Sparkle as Sparkles, MagicWand as Wand2, ChatCircle as MessageCircle
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
            className={`card-premium transition-all ${isLatest ? 'p-5 shadow-sm border-l-4 border-l-primary' : 'p-4 bg-bg-light/40 border-dashed opacity-80 hover:opacity-100 hover:bg-white'}`}
        >
            <div className="flex items-start gap-4">
                <BrandIcon icon={FileText} size={isLatest ? 48 : 40} className="shadow-sm" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className={`font-semibold text-primary line-clamp-1 ${isLatest ? 'text-sm' : 'text-xs'}`}>{doc.filename}</h4>
                                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${isLatest ? 'bg-primary text-white' : 'bg-text-muted/10 text-text-muted'}`}>
                                    v{doc.version}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                                <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                                {userRole !== 'STUDENT' && doc.uploader && (
                                    <>
                                        <span>•</span>
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
                            <button className="p-1.5 rounded-lg hover:bg-bg-light text-text-muted transition-colors"><MoreVertical className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                    {doc.feedback && (
                        <div className={`mt-3 p-3 rounded-lg text-[11px] leading-relaxed ${doc.status === 'REVISION_NEEDED' ? 'bg-error/5 text-error/80 border border-error/10 shadow-inner' : 'bg-success/5 text-success/80 border border-success/10 shadow-inner'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <MessageCircle className="w-3 h-3" />
                                <span className="font-bold uppercase tracking-wider text-[9px]">Retour Accompanateur</span>
                            </div>
                            {doc.feedback}
                        </div>
                    )}
                </div>
            </div>
            <div className={`flex items-center gap-2 mt-4 ${isLatest ? 'pl-16' : 'pl-14'}`}>
                <button onClick={() => onPreview(doc.filePath)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/10">
                    <Eye className="w-3 h-3" /> Voir
                </button>
                <button onClick={() => window.open(getFileUrl(doc.filePath), '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-info bg-info/5 hover:bg-info/10 transition-colors border border-transparent hover:border-info/10">
                    <Download className="w-3 h-3" /> Télécharger
                </button>
                {userRole !== 'STUDENT' && isLatest && (
                    <button
                        onClick={onReview}
                        className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-bold text-white bg-accent hover:bg-accent-light shadow-md hover:shadow-lg transition-all"
                    >
                        <ClipboardCheck className="w-3 h-3" /> Évaluer {isLatest ? 'cette version' : ''}
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
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = () => {
        api.getDocuments()
            .then(res => {
                setDocuments(res.documents);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch documents", err);
                setLoading(false);
            });
    };

    const stats = {
        total: documents.length,
        approved: documents.filter(d => d.status === 'APPROVED').length,
        underReview: documents.filter(d => d.status === 'UNDER_REVIEW').length,
        revision: documents.filter(d => d.status === 'REVISION_NEEDED').length,
    };

    const filteredDocs = documents.filter(doc =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group documents by category
    const groupedDocs = CATEGORIES.reduce((acc: any, cat) => {
        const docsInCat = filteredDocs.filter(d => d.category === cat.id);
        if (docsInCat.length > 0) {
            // Sort by version descending
            acc[cat.id] = docsInCat.sort((a, b) => b.version - a.version);
        }
        return acc;
    }, {});

    // Also collect any that don't match our categories if they exist (though shouldn't happen with strict typing)
    const otherDocs = filteredDocs.filter(d => !CATEGORIES.find(c => c.id === d.category));
    if (otherDocs.length > 0) {
        groupedDocs['OTHER'] = otherDocs.sort((a, b) => b.version - a.version);
    }

    const getFileUrl = (path: string) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const baseUrl = apiUrl.replace('/api', '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handlePreview = (path: string) => {
        const fileUrl = getFileUrl(path);
        // If it's a local development url, external viewers won't work, fallback to direct open
        if (fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1')) {
            window.open(fileUrl, '_blank');
            return;
        }
        // Use Google Docs Viewer to render the file (PDF, DOCX) in the browser
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`;
        window.open(viewerUrl, '_blank');
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'text-primary' },
                    { label: 'Approuvés', value: stats.approved, color: 'text-success' },
                    { label: 'En revue', value: stats.underReview, color: 'text-warning' },
                    { label: 'À réviser', value: stats.revision, color: 'text-error' },
                ].map((stat) => (
                    <div key={stat.label} className="card-premium p-4 text-center">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Formatting & Controls */}
            <div className="flex items-center gap-3">
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
                <button className="p-3 rounded-xl border border-border bg-white hover:bg-bg-light transition-colors text-text-secondary shadow-sm">
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {/* Documents List - Grouped by Category */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
            ) : Object.keys(groupedDocs).length === 0 ? (
                <div className="card-premium p-12 text-center text-text-secondary">
                    <BrandIcon icon={FileText} size={64} className="mx-auto mb-4 opacity-30 grayscale" />
                    <h3 className="text-xl font-bold text-primary mb-2">Aucun document trouvé</h3>
                    <p>{user?.role === 'STUDENT' ? 'Commencez par envoyer votre premier chapitre ou plan.' : 'Aucun document n\'a été soumis par vos étudiants.'}</p>
                </div>
            ) : (
                <div className="space-y-8 pb-20">
                    {Object.entries(groupedDocs).map(([catId, docs]: [string, any], groupIndex) => {
                        const category = CATEGORIES.find(c => c.id === catId) || { label: 'Autres Documents', icon: FileText };
                        const latestDoc = docs[0];
                        const history = docs.slice(1);

                        return (
                            <div key={catId} className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                        <category.icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-primary">{category.label}</h3>
                                    <span className="text-xs text-text-muted bg-bg-light px-2 py-0.5 rounded-full">{docs.length} version{docs.length > 1 ? 's' : ''}</span>
                                </div>

                                <DocumentCard
                                    doc={latestDoc}
                                    isLatest={true}
                                    userRole={user?.role}
                                    onPreview={handlePreview}
                                    onReview={() => setReviewingDoc(latestDoc)}
                                    getFileUrl={getFileUrl}
                                />

                                {history.length > 0 && (
                                    <div className="ml-8 space-y-3 pt-2 border-l-2 border-border/40 pl-6">
                                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Historique des versions</div>
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
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

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
            alert("Erreur lors de l'enregistrement de l'évaluation.");
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
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
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
            alert("Erreur lors de l'envoi");
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
                        {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
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
            alert("Erreur lors de l'analyse.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" /> Assistant IA de Correction
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
                                {isAnalyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {isAnalyzing ? 'Analyse en cours...' : 'Corriger le texte'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

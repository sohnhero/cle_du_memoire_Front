'use client';

import React, { useState, useCallback } from 'react';
import { FilePdf, FileDoc, FileImage, DownloadSimple, XCircle, MagnifyingGlassPlus, MagnifyingGlassMinus, ArrowsOutSimple, ArrowsInSimple, ArrowCounterClockwise } from '@phosphor-icons/react';

interface FilePreviewProps {
    url: string;
    extension: string;
    fileName?: string;
    onClose?: () => void;
}

export default function FilePreview({ url, extension, fileName }: FilePreviewProps) {
    const ext = extension.toLowerCase().replace('.', '');

    const getIcon = () => {
        if (['pdf'].includes(ext)) return <FilePdf className="w-12 h-12 text-error mb-4" />;
        if (['doc', 'docx'].includes(ext)) return <FileDoc className="w-12 h-12 text-info mb-4" />;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FileImage className="w-12 h-12 text-success mb-4" />;
        return <DownloadSimple className="w-12 h-12 text-text-muted mb-4" />;
    };

    // Images: handled by the modal with zoom controls
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return (
            <div className="relative w-full h-full min-h-[300px] bg-[#f8fbfa] rounded-2xl overflow-hidden border border-border-light flex items-center justify-center">
                <img
                    src={url}
                    alt={fileName || "Aperçu de l'image"}
                    className="max-w-full max-h-full object-contain"
                />
            </div>
        );
    }

    // PDFs
    if (ext === 'pdf') {
        return (
            <div className="relative w-full h-full min-h-[300px] bg-white rounded-2xl overflow-hidden shadow-inner border border-border-light">
                <object
                    data={`${url}#view=FitH`}
                    type="application/pdf"
                    className="w-full h-full"
                >
                    <iframe
                        src={`${url}#view=FitH`}
                        className="w-full h-full border-none"
                        title={fileName || "Aperçu du PDF"}
                    >
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-bg-light">
                            <FilePdf className="w-16 h-16 text-error mb-4" />
                            <p className="text-primary font-bold mb-2">Impossible de lire le PDF</p>
                            <p className="text-sm text-text-secondary mb-4">Votre navigateur ne supporte pas la prévisualisation des PDF.</p>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary py-2 px-6">
                                Télécharger le PDF
                            </a>
                        </div>
                    </iframe>
                </object>
            </div>
        );
    }

    // Office files
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
        const encodedUrl = encodeURIComponent(url);
        const microsoftViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
        return (
            <div className="relative w-full h-full min-h-[300px] bg-white rounded-2xl overflow-hidden shadow-inner border border-border-light">
                <iframe
                    src={microsoftViewerUrl}
                    className="w-full h-full border-none"
                    title={fileName || "Aperçu du document Office"}
                />
            </div>
        );
    }

    // Fallback
    return (
        <div className="flex flex-col items-center justify-center p-16 bg-bg-light rounded-2xl border-2 border-dashed border-border-light text-center">
            {getIcon()}
            <h3 className="text-xl font-bold text-primary mb-2">Aperçu non disponible</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-sm">
                Le format {ext ? `.${ext.toUpperCase()}` : 'de ce fichier'} ne peut malheureusement pas être prévisualisé directement dans le navigateur.
            </p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary py-3 px-8 flex items-center gap-2 shadow-lg shadow-primary/20" download>
                <DownloadSimple className="w-5 h-5" />
                Télécharger le fichier
            </a>
        </div>
    );
}

// ─── File Preview Modal ───────────────────────────────────────────────
interface FilePreviewModalProps extends FilePreviewProps {
    isOpen: boolean;
}

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];

export function FilePreviewModal({ isOpen, onClose, ...previewProps }: FilePreviewModalProps) {
    const [zoomLevel, setZoomLevel] = useState(1);

    const ext = (previewProps.extension || '').toLowerCase().replace('.', '');
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    const isPdfOrOffice = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext);

    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => {
            const nextIdx = ZOOM_STEPS.findIndex(s => s > prev);
            return nextIdx !== -1 ? ZOOM_STEPS[nextIdx] : prev;
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => {
            const prevIdx = [...ZOOM_STEPS].reverse().findIndex(s => s < prev);
            return prevIdx !== -1 ? [...ZOOM_STEPS].reverse()[prevIdx] : prev;
        });
    }, []);

    const handleResetZoom = useCallback(() => {
        setZoomLevel(1);
    }, []);

    // Reset zoom when modal opens/closes
    React.useEffect(() => {
        if (isOpen) setZoomLevel(1);
    }, [isOpen]);

    // Keyboard shortcuts
    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose?.();
            if (e.key === '+' || e.key === '=') { e.preventDefault(); handleZoomIn(); }
            if (e.key === '-') { e.preventDefault(); handleZoomOut(); }
            if (e.key === '0') { e.preventDefault(); handleResetZoom(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleResetZoom]);

    if (!isOpen) return null;

    const zoomPercent = Math.round(zoomLevel * 100);

    return (
        <div className="fixed inset-0 z-[120] flex flex-col">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-primary/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Full-screen layout */}
            <div className="relative flex flex-col w-full h-full">
                {/* Header / Toolbar */}
                <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-b border-border-light shrink-0 z-10 shadow-sm">
                    {/* File name */}
                    <div className="flex-1 min-w-0 mr-3">
                        <h2 className="text-sm sm:text-lg font-bold text-primary truncate">
                            {previewProps.fileName || "Aperçu du document"}
                        </h2>
                        <span className="text-[9px] sm:text-xs font-semibold tracking-widest text-text-muted uppercase">
                            Prévisualisation
                        </span>
                    </div>

                    {/* Zoom controls - shown for images and as general controls */}
                    <div className="flex items-center gap-1 sm:gap-1.5 mr-2 sm:mr-4">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= ZOOM_STEPS[0]}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-bg-light text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Zoom arrière (−)"
                        >
                            <MagnifyingGlassMinus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <button
                            onClick={handleResetZoom}
                            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-bg-light text-xs sm:text-sm font-bold text-primary hover:bg-border-light transition-colors min-w-[48px] sm:min-w-[56px] text-center"
                            title="Réinitialiser le zoom (0)"
                        >
                            {zoomPercent}%
                        </button>

                        <button
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-bg-light text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Zoom avant (+)"
                        >
                            <MagnifyingGlassPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <div className="w-px h-6 bg-border-light mx-1 hidden sm:block" />

                        <button
                            onClick={handleResetZoom}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-bg-light text-text-secondary transition-colors"
                            title="Réinitialiser (0)"
                        >
                            <ArrowsInSimple className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <a
                            href={previewProps.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-bg-light text-text-secondary transition-colors"
                            title="Ouvrir dans un nouvel onglet"
                            download
                        >
                            <DownloadSimple className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                    </div>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-full transition-colors group flex-shrink-0"
                        title="Fermer (Échap)"
                    >
                        <XCircle className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-[#1a1a2e]/5">
                    {isImage ? (
                        /* ── Image viewer with zoom ── */
                        <div
                            className="w-full h-full overflow-auto flex items-center justify-center p-2 sm:p-4"
                            style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
                        >
                            <div
                                className="transition-transform duration-200 ease-out"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: 'center center',
                                }}
                            >
                                <img
                                    src={previewProps.url}
                                    alt={previewProps.fileName || "Aperçu"}
                                    className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-lg select-none"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    ) : isPdfOrOffice ? (
                        /* ── PDF / Office viewer with zoom via CSS transform ── */
                        <div className="w-full h-full overflow-auto relative">
                            <div
                                className="transition-transform duration-200 ease-out"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: 'top left',
                                    width: `${100 / zoomLevel}%`,
                                    height: `${100 / zoomLevel}%`,
                                }}
                            >
                                <div className="w-full h-full" style={{ minHeight: 'calc(100vh - 60px)' }}>
                                    <FilePreview {...previewProps} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Fallback ── */
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <FilePreview {...previewProps} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

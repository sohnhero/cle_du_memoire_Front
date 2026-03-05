import React from 'react';
import Image from 'next/image';
import { FilePdf, FileDoc, FileImage, DownloadSimple, XCircle } from '@phosphor-icons/react';

interface FilePreviewProps {
    url: string;
    extension: string; // e.g., 'pdf', 'docx', 'png', etc.
    fileName?: string;
    onClose?: () => void;
}

export default function FilePreview({ url, extension, fileName, onClose }: FilePreviewProps) {
    const ext = extension.toLowerCase().replace('.', '');

    // Helper: Determine file type icon
    const getIcon = () => {
        if (['pdf'].includes(ext)) return <FilePdf className="w-12 h-12 text-error mb-4" />;
        if (['doc', 'docx'].includes(ext)) return <FileDoc className="w-12 h-12 text-info mb-4" />;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FileImage className="w-12 h-12 text-success mb-4" />;
        return <DownloadSimple className="w-12 h-12 text-text-muted mb-4" />;
    };

    // 1. Images handled natively via next/image for fast rendering
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return (
            <div className="relative w-full h-[600px] bg-[#f8fbfa] rounded-2xl overflow-hidden border border-border-light flex items-center justify-center">
                <Image
                    src={url}
                    alt={fileName || "Aperçu de l'image"}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
        );
    }

    // 2. PDFs handled cleanly via native browser PDF viewer with object tag fallback
    if (ext === 'pdf') {
        return (
            <div className="relative w-full h-[700px] bg-white rounded-2xl overflow-hidden shadow-inner border border-border-light">
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

    // 3. Office Files (Word, Excel, PPT) via Microsoft Office Online Viewer
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
        // Must be a publicly accessible URL
        const encodedUrl = encodeURIComponent(url);
        const microsoftViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

        return (
            <div className="relative w-full h-[700px] bg-white rounded-2xl overflow-hidden shadow-inner border border-border-light">
                <iframe
                    src={microsoftViewerUrl}
                    className="w-full h-full border-none"
                    title={fileName || "Aperçu du document Office"}
                />
            </div>
        );
    }

    // 4. Default Fallback Pattern for unsupported files
    return (
        <div className="flex flex-col items-center justify-center p-16 bg-bg-light rounded-2xl border-2 border-dashed border-border-light text-center">
            {getIcon()}
            <h3 className="text-xl font-bold text-primary mb-2">Aperçu non disponible</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-sm">
                Le format {ext ? `.${ext.toUpperCase()}` : 'de ce fichier'} ne peut malheureusement pas être prévisualisé directement dans le navigateur.
            </p>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-3 px-8 flex items-center gap-2 shadow-lg shadow-primary/20"
                download
            >
                <DownloadSimple className="w-5 h-5" />
                Télécharger le fichier
            </a>
        </div>
    );
}

// -------------------------------------------------------------
// Helper Component: File Preview Modal Variant
// Useful for displaying the preview in a fixed popup overlay.
// -------------------------------------------------------------
interface FilePreviewModalProps extends FilePreviewProps {
    isOpen: boolean;
}

export function FilePreviewModal({ isOpen, onClose, ...previewProps }: FilePreviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-primary/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-light bg-bg-light shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-primary truncate max-w-[250px] sm:max-w-md lg:max-w-2xl">
                            {previewProps.fileName || "Aperçu du document"}
                        </h2>
                        <span className="text-xs font-semibold tracking-widest text-text-muted uppercase">
                            Prévisualisation
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 sm:p-3 text-text-muted hover:text-error hover:bg-error/10 rounded-full transition-colors group"
                        title="Fermer (Échap)"
                    >
                        <XCircle className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 bg-white w-full">
                    {/* Re-use the main core component but stretch to container */}
                    <div className="w-full h-full min-h-[500px]">
                        <FilePreview {...previewProps} />
                    </div>
                </div>
            </div>
        </div>
    );
}

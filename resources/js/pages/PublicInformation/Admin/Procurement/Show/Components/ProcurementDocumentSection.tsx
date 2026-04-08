import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, AlertTriangle, Download, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProcurementUploadDialog } from './ProcurementUploadDialog';

// Shadcn UI Imports (Make sure these paths match your project structure)
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import procurement from '@/routes/procurement';

// Define the exact props this section needs to survive
interface Props {
    procurementId: string | number;
    documents: any[]; // Replace 'any' with your actual Document type if you have it
    status: string;
    documentTypes: any[];
}

export default function ProcurementDocumentSection({ procurementId, documents, status, documentTypes }: Props) {
    const MAX_DOCUMENTS = 15;
    const { currentMunicipality } = useMunicipality();
    // UI States
    const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);

    // 🌟 1. State to track WHICH document is being deleted (null means dialog is closed)
    const [documentToDelete, setDocumentToDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Define the allowed upload statuses based on the Procurement Lifecycle
    const canUpload = ['draft', 'open', 'evaluating', 'awarded'].includes(status);

    const downloadDocument = async (url: string, fileName: string) => {
        try {
            const response = await axios.get(url, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 🌟 2. Placeholder for your API call
    const handleDeleteDocument = () => {
        if (!documentToDelete) return;

        setIsDeleting(true);
        try {
            // TODO: Add your axios/api call here
            // await api.delete(`/procurements/${procurementId}/documents/${documentToDelete.id}`);
            router.delete(procurement.document.delete.url({ procurementId: procurementId, documentId: documentToDelete.id }), {
                headers: {
                    'X-Municipality-Slug': currentMunicipality.slug,
                },
            });

            // Reload the data and close the dialog
            router.reload({ only: ['procurement'] });
            setDocumentToDelete(null);
        } catch (error) {
            console.error('Failed to delete document', error);
            // Error toast will be handled by your global interceptor
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <h3 className="font-bold text-slate-900">Bidding Documents</h3>
                </div>
                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">{documents.length}</span>
            </div>

            <div className="flex-1 p-4">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center text-slate-500">
                        <AlertCircle className="mb-2 h-8 w-8 text-slate-300" />
                        <p className="text-sm">No documents attached yet.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {documents.map((doc) => (
                            <li
                                key={doc.id}
                                className="group flex items-start gap-3 rounded-lg border p-3 transition hover:border-blue-300 hover:bg-blue-50"
                            >
                                <div className="mt-1 rounded bg-red-100 p-2 pt-1 text-red-600">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900" title={doc.file_name}>
                                        {doc.file_name}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                        <span className="font-medium tracking-wide uppercase">{doc.type.replace(/_/g, ' ')}</span>
                                        <span>•</span>
                                        <span>{formatBytes(doc.file_size)}</span>
                                    </div>
                                </div>

                                {/* Action Buttons Container */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                                        type="button"
                                        className="rounded-md p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-600"
                                        title="Download Document"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>

                                    {/* Strict Draft-Only Deletion */}
                                    {status === 'draft' && (
                                        <button
                                            // 🌟 3. Trigger the dialog by setting the state
                                            onClick={() => setDocumentToDelete(doc)}
                                            type="button"
                                            className="rounded-md p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                                            title="Delete Document"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {canUpload && (
                <div className="border-t bg-slate-50 p-4">
                    {documents.length < MAX_DOCUMENTS ? (
                        <button
                            onClick={() => setIsDocumentUploadOpen(true)}
                            className="w-full rounded-lg border-2 border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
                        >
                            + Attach New Document
                        </button>
                    ) : (
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 py-3 text-sm font-medium text-amber-700">
                            <AlertCircle className="h-4 w-4" />
                            Maximum limit of {MAX_DOCUMENTS} documents reached.
                        </div>
                    )}
                </div>
            )}

            {/* --- DIALOGS --- */}

            {/* Upload Dialog */}
            <ProcurementUploadDialog
                onSuccess={() => router.reload({ only: ['procurement'] })}
                isOpen={isDocumentUploadOpen}
                docTypes={documentTypes}
                onOpenChange={setIsDocumentUploadOpen}
                procurementId={procurementId}
            />

            {/* 🌟 4. Shadcn Delete Confirmation Dialog */}
            <Dialog
                // !! converts the object to true, or null to false
                open={!!documentToDelete}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setDocumentToDelete(null);
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Document
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete this document? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Display the selected file info inside the dialog */}
                    {documentToDelete && (
                        <div className="my-2 rounded-lg border bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-red-500">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900" title={documentToDelete.file_name}>
                                        {documentToDelete.file_name}
                                    </p>
                                    <p className="mt-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
                                        {documentToDelete.type.replace(/_/g, ' ')} • {formatBytes(documentToDelete.file_size)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setDocumentToDelete(null)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteDocument} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Yes, Delete Document'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}

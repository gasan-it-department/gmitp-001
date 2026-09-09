import ReplaceAssistanceAdditionalDocumentController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ReplaceAssistanceAdditionalDocumentController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAssistanceRequestAction } from '@/Core/Hooks/ActionCenter/useAssistanceRequestAction';
import { useOptimizedAssistanceDocuments } from '@/hooks/use-optimized-assistance-documents';
import { ExternalLink, FileText, Loader2, RotateCcw, RotateCw, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

interface ExistingDocument {
    id: string | number;
    url: string;
    file_name: string;
    mime_type: string | null;
    size: number;
}

interface Props {
    requestId: string;
    document: ExistingDocument;
    label: string;
    onClose: () => void;
}

const REPLACEMENT_KEY = 'additional_document_replacement';

export default function ReplaceAdditionalDocumentDialog({ requestId, document, label, onClose }: Props) {
    const { submit, processing, errors } = useAssistanceRequestAction();
    const [file, setFile] = useState<File | null>(null);
    const onFileReady = useCallback((_key: string, prepared: File | null) => setFile(prepared), []);
    const { prepareDocument, rotateDocument, isPreparing, notices } = useOptimizedAssistanceDocuments(onFileReady);
    const busy = processing || isPreparing;

    const save = async (event: FormEvent) => {
        event.preventDefault();
        if (!file || busy) return;

        const form = new FormData();
        form.append('document', file);

        if (
            await submit(
                ReplaceAssistanceAdditionalDocumentController({
                    assistanceRequestId: requestId,
                    mediaId: document.id,
                }),
                form,
            )
        ) {
            onClose();
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0] ?? null;
        event.target.value = '';
        void prepareDocument(REPLACEMENT_KEY, selected);
    };

    return (
        <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Replace supporting document</DialogTitle>
                    <DialogDescription>
                        Replace {label}. Its document type stays unchanged, and the correction will appear in the request audit trail.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={save} className="space-y-4">
                    <fieldset disabled={busy} className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Current file</p>
                            <ExistingFilePreview document={document} label={label} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additional-document-replacement">Replacement file</Label>
                            <input
                                id="additional-document-replacement"
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={handleFileChange}
                                className="sr-only"
                            />

                            {isPreparing ? (
                                <div className="flex min-h-36 flex-col items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <p className="mt-2 text-xs font-semibold">Preparing image...</p>
                                </div>
                            ) : file ? (
                                <div className="space-y-3">
                                    <SelectedFilePreview file={file} label={label} />
                                    {file.type.startsWith('image/') && (
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => void rotateDocument(REPLACEMENT_KEY, file, 'left')}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" /> Rotate left
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => void rotateDocument(REPLACEMENT_KEY, file, 'right')}
                                            >
                                                <RotateCw className="mr-2 h-4 w-4" /> Rotate right
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                                            <p className="text-xs text-slate-500">{formatBytes(file.size)} · Ready to upload</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0"
                                            onClick={() => void prepareDocument(REPLACEMENT_KEY, null)}
                                            aria-label="Remove selected replacement"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <label
                                    htmlFor="additional-document-replacement"
                                    className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-center transition hover:border-[#005088] hover:bg-blue-50"
                                >
                                    <Upload className="h-6 w-6 text-[#005088]" />
                                    <span className="mt-2 text-sm font-semibold text-slate-800">Choose replacement</span>
                                    <span className="mt-1 text-xs text-slate-500">JPG, PNG, or PDF up to 5 MB</span>
                                </label>
                            )}

                            {file && (
                                <label
                                    htmlFor="additional-document-replacement"
                                    className="inline-flex cursor-pointer text-xs font-semibold text-[#005088] hover:underline"
                                >
                                    Choose a different file
                                </label>
                            )}
                            {notices[REPLACEMENT_KEY] && <p className="text-xs text-slate-600">{notices[REPLACEMENT_KEY]?.message}</p>}
                            {Object.entries(errors).map(([field, message]) => (
                                <p key={field} role="alert" className="text-xs text-red-700">
                                    {message}
                                </p>
                            ))}
                        </div>
                    </fieldset>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!file || busy}>
                            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Replace file
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ExistingFilePreview({ document, label }: { document: ExistingDocument; label: string }) {
    const isImage = document.mime_type?.startsWith('image/');

    return (
        <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-32 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-900"
        >
            {isImage ? (
                <img src={document.url} alt={label} className="h-full w-full object-contain" />
            ) : (
                <FileText className="h-10 w-10 text-white/70" />
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/75 py-1.5 text-[11px] font-medium text-white">
                <ExternalLink className="h-3 w-3" /> View current file · {formatBytes(document.size)}
            </span>
        </a>
    );
}

function SelectedFilePreview({ file, label }: { file: File; label: string }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file.type.startsWith('image/')) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div className="flex h-36 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-900">
            {previewUrl ? (
                <img src={previewUrl} alt={`${label} replacement preview`} className="h-full w-full object-contain" />
            ) : (
                <FileText className="h-10 w-10 text-white/70" />
            )}
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

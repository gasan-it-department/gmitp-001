import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { DocumentPreparationNotice } from '@/hooks/use-optimized-assistance-documents';
import { formatUploadSize } from '@/lib/optimizeAssistanceDocument';
import { ExternalLink, FileText, Loader2, RotateCcw, RotateCw, Upload, X } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';

export interface ExistingAssistanceDocument {
    url: string;
    file_name: string;
    mime_type: string | null;
    size: number;
}

interface Props {
    documentKey: string;
    label: string;
    description?: string | null;
    required: boolean;
    requiredLabel?: string;
    physicalCopyLabel?: string | null;
    file?: File | null;
    existingFile?: ExistingAssistanceDocument;
    preparing?: boolean;
    notice?: DocumentPreparationNotice;
    errors?: string[];
    inputIdPrefix?: string;
    onSelect: (file: File | null) => void;
    onRotate?: (direction: 'left' | 'right') => void;
    onRemove: () => void;
}

export function AssistanceDocumentUploadField({
    documentKey,
    label,
    description,
    required,
    requiredLabel,
    physicalCopyLabel,
    file,
    existingFile,
    preparing = false,
    notice,
    errors = [],
    inputIdPrefix = 'assistance-document',
    onSelect,
    onRotate,
    onRemove,
}: Props) {
    const inputId = `${inputIdPrefix}-${documentKey}`;
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null;
        event.target.value = '';
        onSelect(selectedFile);
    };

    return (
        <div className={`flex min-w-0 flex-col rounded-md border bg-slate-50 p-4 ${errors.length ? 'border-red-300' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <Label htmlFor={inputId} className="text-sm font-semibold text-slate-900">
                        {label}
                    </Label>
                    {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
                    <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP, or PDF</p>
                    {physicalCopyLabel && <p className="mt-1 text-xs font-medium text-blue-700">Physical copy: {physicalCopyLabel}</p>}
                </div>
                <span className="shrink-0 text-[11px] font-medium text-slate-500">{required ? (requiredLabel ?? 'Required') : 'Optional'}</span>
            </div>

            <input
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={preparing}
                onChange={handleFileChange}
                className="sr-only"
            />

            {preparing ? (
                <div className="mt-4 flex min-h-36 flex-col items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-4 text-center text-blue-700">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="mt-2 text-xs font-semibold">Preparing image...</p>
                </div>
            ) : file ? (
                <div className="mt-4 space-y-3">
                    <SelectedDocumentPreview file={file} label={label} />
                    {file.type.startsWith('image/') && onRotate && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => onRotate('left')}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Rotate left
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => onRotate('right')}>
                                <RotateCw className="mr-2 h-4 w-4" />
                                Rotate right
                            </Button>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                            <p className="text-xs text-slate-500">{formatUploadSize(file.size)} · Ready to upload</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onRemove}
                            className="h-8 w-8 shrink-0 text-slate-500 hover:text-red-600"
                            aria-label={`Remove ${label}`}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : existingFile ? (
                <div className="mt-4 space-y-3">
                    <ExistingDocumentPreview file={existingFile} label={label} />
                    <div className="min-w-0 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <p className="truncate text-sm font-semibold text-emerald-900">{existingFile.file_name}</p>
                        <p className="text-xs text-emerald-700">Currently uploaded · {formatUploadSize(existingFile.size)}</p>
                    </div>
                </div>
            ) : (
                <label
                    htmlFor={inputId}
                    className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-4 py-5 text-center transition hover:border-[#005088] hover:bg-blue-50"
                >
                    <Upload className="h-6 w-6 text-[#005088]" />
                    <span className="mt-2 text-sm font-semibold text-slate-800">Choose file</span>
                    <span className="mt-1 text-xs text-slate-500">A preview will appear here</span>
                </label>
            )}

            {!preparing && (file || existingFile) && (
                <label htmlFor={inputId} className="mt-3 inline-flex cursor-pointer text-xs font-semibold text-[#005088] hover:underline">
                    {file ? 'Choose a different file' : 'Upload replacement'}
                </label>
            )}
            {notice && (
                <p className={`mt-2 text-xs font-medium ${notice.tone === 'warning' ? 'text-amber-700' : 'text-emerald-700'}`}>{notice.message}</p>
            )}
            {errors.map((error, index) => (
                <p key={`${documentKey}-${index}`} role="alert" className="mt-2 text-xs text-red-700">
                    {error}
                </p>
            ))}
        </div>
    );
}

function SelectedDocumentPreview({ file, label }: { file: File; label: string }) {
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
                <img src={previewUrl} alt={`${label} preview`} className="h-full w-full object-contain" />
            ) : (
                <FileText className="h-10 w-10 text-white/70" />
            )}
        </div>
    );
}

function ExistingDocumentPreview({ file, label }: { file: ExistingAssistanceDocument; label: string }) {
    const isImage = file.mime_type?.startsWith('image/');

    return (
        <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View current ${label}`}
            className="group relative flex h-36 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-900"
        >
            {isImage ? <img src={file.url} alt="" className="h-full w-full object-contain" /> : <FileText className="h-10 w-10 text-white/70" />}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/75 py-1.5 text-[11px] font-medium text-white">
                <ExternalLink className="h-3 w-3" /> View current file
            </span>
        </a>
    );
}

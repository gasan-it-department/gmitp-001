import { Button } from '@/components/ui/button';
import { FileText, Upload, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { ProfileSetupFormData, SectionProps } from '../types';

const ACCEPTED_ID_TYPES = '.jpg,.jpeg,.png,.pdf';

export function IdentityDocumentUploadSection({ data, setData, errors }: SectionProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DocumentUploadCard
                id="identity_id_front"
                label="ID front"
                required
                file={data.identity_id_front ?? null}
                error={errors.identity_id_front}
                onChange={(file) => setData('identity_id_front', file)}
            />

            <DocumentUploadCard
                id="identity_id_back"
                label="ID back"
                file={data.identity_id_back ?? null}
                error={errors.identity_id_back}
                onChange={(file) => setData('identity_id_back', file)}
            />
        </div>
    );
}

function DocumentUploadCard({
    id,
    label,
    required = false,
    file,
    error,
    onChange,
}: {
    id: keyof Pick<ProfileSetupFormData, 'identity_id_front' | 'identity_id_back'>;
    label: string;
    required?: boolean;
    file: File | null;
    error?: string;
    onChange: (file: File | null) => void;
}) {
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.files?.[0] ?? null);
        event.target.value = '';
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <label htmlFor={id} className="text-sm font-bold text-slate-800">
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">JPG, PNG, or PDF. Maximum 5 MB.</p>
                </div>
                <FileText className="h-5 w-5 shrink-0 text-slate-400" />
            </div>

            <input id={id} type="file" accept={ACCEPTED_ID_TYPES} onChange={handleFileChange} className="sr-only" />

            {file ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onChange(null)}
                        className="h-8 w-8 shrink-0 text-slate-500 hover:text-red-600"
                        aria-label={`Remove ${label}`}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <label
                    htmlFor={id}
                    className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-[#005088] hover:bg-blue-50"
                >
                    <Upload className="h-6 w-6 text-[#005088]" />
                    <span className="mt-2 text-sm font-bold text-slate-800">Choose file</span>
                    <span className="mt-1 text-xs text-slate-500">{required ? 'Required for verification review' : 'Optional'}</span>
                </label>
            )}

            {file && (
                <label
                    htmlFor={id}
                    className="mt-3 inline-flex cursor-pointer text-xs font-semibold text-[#005088] hover:text-[#003d66] hover:underline"
                >
                    Replace file
                </label>
            )}

            {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

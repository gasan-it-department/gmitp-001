import { AssistanceDocumentRequirement } from '@/Core/Types/ActionCenter/assistance';
import type { DocumentPreparationNotice } from '@/hooks/use-optimized-assistance-documents';
import { CheckCircle2, FileText, IdCard, Loader2, Upload } from 'lucide-react';

interface Props {
    documents: AssistanceDocumentRequirement[];
    files: Record<string, File | null>;
    onFileChange: (documentKey: string, file: File | null) => void;
    errors: Record<string, string | undefined>;
    preparingKeys?: ReadonlySet<string>;
    preparationNotices?: Record<string, DocumentPreparationNotice | undefined>;
}

interface IdentityPairProps extends Props {
    title: string;
    description: string;
    required?: boolean;
}

const FILER_ID_KEYS = ['valid_id_front', 'valid_id_back'];
const RECIPIENT_ID_KEYS = ['recipient_valid_id_front', 'recipient_valid_id_back'];

/**
 * Required documents remain driven by ac_assistance_type_documents. Identity
 * sides are grouped visually while retaining their independent document keys.
 */
export function DocumentUploadsGrid({ documents, files, onFileChange, errors, preparingKeys, preparationNotices }: Props) {
    if (documents.length === 0) {
        return null;
    }

    const filerIdDocuments = documents.filter((document) => FILER_ID_KEYS.includes(document.key));
    const standardDocuments = documents.filter((document) => !FILER_ID_KEYS.includes(document.key) && !RECIPIENT_ID_KEYS.includes(document.key));

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#005088]">
                    <Upload className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Upload supporting documents</h2>
            </div>

            <div className="space-y-6">
                {filerIdDocuments.length > 0 && (
                    <IdentityDocumentPair
                        title="Filer's valid government ID"
                        description="Upload the front and back of the ID belonging to the adult submitting this request."
                        documents={filerIdDocuments}
                        files={files}
                        onFileChange={onFileChange}
                        errors={errors}
                        preparingKeys={preparingKeys}
                        preparationNotices={preparationNotices}
                    />
                )}

                {standardDocuments.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {standardDocuments.map((document) => (
                            <DocumentUploadCard
                                key={document.id}
                                document={document}
                                file={files[document.key]}
                                error={errors[`documents.${document.key}`]}
                                preparing={preparingKeys?.has(document.key)}
                                preparationNotice={preparationNotices?.[document.key]}
                                onFileChange={onFileChange}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export function IdentityDocumentPair({
    title,
    description,
    documents,
    files,
    onFileChange,
    errors,
    required,
    preparingKeys,
    preparationNotices,
}: IdentityPairProps) {
    return (
        <div className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
            <div className="mb-4 flex items-start gap-3">
                <IdCard className="mt-0.5 h-5 w-5 shrink-0 text-[#005088]" />
                <div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {documents.map((document) => (
                    <DocumentUploadCard
                        key={document.id}
                        document={document}
                        file={files[document.key]}
                        error={errors[`documents.${document.key}`]}
                        required={required}
                        preparing={preparingKeys?.has(document.key)}
                        preparationNotice={preparationNotices?.[document.key]}
                        onFileChange={onFileChange}
                    />
                ))}
            </div>
        </div>
    );
}

function DocumentUploadCard({
    document,
    file,
    error,
    required,
    preparing = false,
    preparationNotice,
    onFileChange,
}: {
    document: AssistanceDocumentRequirement;
    file: File | null | undefined;
    error?: string;
    required?: boolean;
    preparing?: boolean;
    preparationNotice?: DocumentPreparationNotice;
    onFileChange: (documentKey: string, file: File | null) => void;
}) {
    const isRequired = required ?? document.is_required;

    return (
        <div
            className={`relative min-h-44 rounded-lg border border-dashed p-5 transition-colors ${
                error ? 'border-red-300 bg-red-50/30' : 'border-slate-300 bg-slate-50/40 hover:border-[#005088] hover:bg-blue-50/30'
            }`}
        >
            <div className="flex h-full flex-col items-center justify-center text-center">
                <FileText className="h-7 w-7 text-slate-400" />
                <p className="mt-3 text-sm font-bold text-slate-700">{document.name}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase">{isRequired ? 'Required' : 'Optional'}</p>

                <input
                    type="file"
                    aria-label={`Upload ${document.name}`}
                    accept=".jpg,.jpeg,.png,.pdf"
                    disabled={preparing}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(event) => onFileChange(document.key, event.target.files?.[0] ?? null)}
                />

                {preparing && (
                    <div className="mt-3 flex items-center gap-1.5 text-blue-700">
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        <span className="text-[11px] font-semibold">Preparing image...</span>
                    </div>
                )}

                {!preparing && file && (
                    <div className="mt-3 flex max-w-full items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="truncate text-[11px] font-semibold">{file.name}</span>
                    </div>
                )}

                {!preparing && preparationNotice && (
                    <p className={`mt-2 text-[11px] font-medium ${preparationNotice.tone === 'warning' ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {preparationNotice.message}
                    </p>
                )}

                {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}
            </div>
        </div>
    );
}

import { AssistanceDocumentRequirement } from '@/Core/Types/ActionCenter/assistance';
import { CheckCircle2, FileText, Upload } from 'lucide-react';

interface Props {
    documents: AssistanceDocumentRequirement[];
    files: Record<string, File | null>;
    onFileChange: (documentKey: string, file: File | null) => void;
    errors: Record<string, string | undefined>;
}

/**
 * Renders one upload card per row in ac_assistance_type_documents for the
 * selected program. The input name is document_key — matches the server-side
 * `documents.{key}` validation rule and Spatie Media collection name.
 *
 * Required vs optional is driven by the pivot's is_required flag.
 */
export function DocumentUploadsGrid({ documents, files, onFileChange, errors }: Props) {
    if (documents.length === 0) {
        return null;
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#005088]">
                    <Upload className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Upload supporting documents</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {documents.map((doc) => {
                    const file = files[doc.key];
                    const errorKey = `documents.${doc.key}`;
                    const error = errors[errorKey];

                    return (
                        <div
                            key={doc.id}
                            className={`group relative rounded-2xl border-2 border-dashed p-6 transition-all ${
                                error
                                    ? 'border-red-300 bg-red-50/30'
                                    : 'border-slate-200 hover:border-[#005088] hover:bg-blue-50/30'
                            }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-[#005088] group-hover:text-white">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <p className="mt-3 line-clamp-1 text-sm font-bold text-slate-700" title={doc.name}>
                                    {doc.name}
                                </p>
                                <p className="mt-1 text-[10px] font-black tracking-tighter text-slate-400 uppercase">
                                    {doc.is_required ? 'Required' : 'Optional'}
                                </p>
                                {doc.examples && (
                                    <p className="mt-2 line-clamp-2 text-[11px] text-slate-400">e.g. {doc.examples}</p>
                                )}

                                <input
                                    type="file"
                                    aria-label={`Upload ${doc.name}`}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={(e) => onFileChange(doc.key, e.target.files?.[0] ?? null)}
                                />

                                {file && (
                                    <div className="mt-3 flex items-center gap-1 text-emerald-600 animate-in fade-in">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="line-clamp-1 max-w-[180px] text-[10px] font-bold uppercase">
                                            {file.name}
                                        </span>
                                    </div>
                                )}

                                {error && <p className="mt-3 text-[11px] font-medium text-red-500">{error}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

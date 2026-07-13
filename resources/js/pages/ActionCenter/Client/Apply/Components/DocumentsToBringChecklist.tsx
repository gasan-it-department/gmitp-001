import { AssistanceDocumentRequirement } from '@/Core/Types/ActionCenter/assistance';
import { CheckCircle2, ClipboardList, MapPin } from 'lucide-react';

const RECIPIENT_ID_KEYS = ['recipient_valid_id_front', 'recipient_valid_id_back'];

interface Props {
    documents: AssistanceDocumentRequirement[];
    requireRecipientIdentity?: boolean;
    recordedDocumentKeys?: string[];
    showRecordingStatus?: boolean;
    compact?: boolean;
}

export function DocumentsToBringChecklist({
    documents,
    requireRecipientIdentity = false,
    recordedDocumentKeys = [],
    showRecordingStatus = false,
    compact = false,
}: Props) {
    const visibleDocuments = documents.filter((document) => !RECIPIENT_ID_KEYS.includes(document.key) || requireRecipientIdentity);
    const recordedKeys = new Set(recordedDocumentKeys);

    return (
        <section className="rounded-lg border border-amber-200 bg-white shadow-sm">
            <div className="border-b border-amber-100 bg-amber-50 px-4 py-4 sm:px-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-amber-950">
                    <ClipboardList className="h-4 w-4 text-amber-700" />
                    Documents to bring to MSWD
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
                    Prepare these documents and bring the physical originals when you visit the MSWD office.
                </p>
            </div>

            <div className={compact ? 'p-4' : 'p-4 sm:p-5'}>
                {visibleDocuments.length === 0 ? (
                    <p className="text-sm text-slate-500">No supporting documents are configured for this program.</p>
                ) : (
                    <ol className="space-y-3">
                        {visibleDocuments.map((document, index) => {
                            const isRecipientIdentity = RECIPIENT_ID_KEYS.includes(document.key);
                            const isRequired = document.is_required || (isRecipientIdentity && requireRecipientIdentity);
                            const isRecorded = recordedKeys.has(document.key);

                            return (
                                <li key={document.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-start sm:gap-3">
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900">{document.name}</p>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                        isRequired ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {isRequired ? 'Required before approval' : 'If applicable'}
                                                </span>
                                            </div>
                                            {document.description && (
                                                <p className="mt-1 text-xs leading-relaxed text-slate-600">{document.description}</p>
                                            )}
                                            {document.examples && <p className="mt-1 text-xs text-slate-500">Examples: {document.examples}</p>}
                                        </div>
                                    </div>
                                    {showRecordingStatus && (
                                        <span
                                            className={`ml-9 flex shrink-0 items-center gap-1 text-[10px] font-bold sm:ml-0 ${
                                                isRecorded ? 'text-emerald-700' : 'text-amber-700'
                                            }`}
                                        >
                                            {isRecorded ? <CheckCircle2 className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                                            {isRecorded ? 'Recorded by MSWD' : 'Bring to MSWD'}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}

                <div className="mt-4 flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    Bring your transaction number with these documents. MSWD staff will inspect the originals and record the official copies.
                </div>
            </div>
        </section>
    );
}

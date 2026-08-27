import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AssistanceRequestFormDefinition, PhysicalCopyRequirement } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useOptimizedAssistanceDocuments } from '@/hooks/use-optimized-assistance-documents';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Loader2, Paperclip } from 'lucide-react';
import { FormEvent, useCallback } from 'react';

// ─── Types (mirror AssistanceRequestDetailsResource + RequiredDocumentResource) ──

interface UploadedDoc {
    id: number;
    name: string;
    file_name: string;
    size: number;
    custom_properties: { document_key?: string } & Record<string, unknown>;
}

interface RequestData {
    id: string;
    transaction_number: string;
    status: string;
    description: string | null;
    assistance_type: { name: string; slug: string; request_form: AssistanceRequestFormDefinition } | null;
    identity_snapshot: { full_name: string } | null;
    beneficiary_number: string | null;
    on_behalf: { date_of_death?: string | null; recipient_id_exception?: string | null } | null;
    documents: UploadedDoc[];
}

interface DocumentSlot {
    key: string;
    label: string;
    description: string | null;
    is_required: boolean;
    physical_copy_requirement: PhysicalCopyRequirement;
    physical_copy_requirement_label: string;
    sort_order: number;
}

interface Props {
    request: { data: RequestData } | RequestData;
    requiredDocuments: { data: DocumentSlot[] };
    submitUrl: string;
}

/** Explicit type so `documents` widens to a File map (not the literal {}). */
type EditFormData = {
    description: string;
    on_behalf_date_of_death: string;
    documents: Record<string, File | null>;
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Admin-only "correct an in-flight assistance request" form.
 *
 * Only the description and document scans are editable — identity/amount/status
 * are frozen COA evidence and never shown as inputs here. The server enforces
 * the pending/under_review gate too, so this page is reachable only while the
 * request is still editable. Replacing a slot swaps that document; untouched
 * slots keep their existing scan.
 */
export default function EditAssistanceRequest({ request, requiredDocuments, submitUrl }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const r: RequestData = 'data' in request ? request.data : request;
    const requiresDateOfDeath =
        r.assistance_type?.request_form.fields.some((field) => field.key === 'on_behalf_date_of_death' && field.required) ?? false;
    const isDeceasedRequest = r.assistance_type?.request_form.subject_type === 'deceased';
    const recipientIdIsRequired = r.on_behalf !== null && !isDeceasedRequest && !r.on_behalf.recipient_id_exception;
    const slots = requiredDocuments.data
        .filter((slot) => !slot.key.startsWith('recipient_valid_id_') || r.on_behalf !== null)
        .map((slot) => (slot.key.startsWith('recipient_valid_id_') && recipientIdIsRequired ? { ...slot, is_required: true } : slot));

    const { data, setData, post, processing, errors } = useForm<EditFormData>({
        description: r.description ?? '',
        on_behalf_date_of_death: r.on_behalf?.date_of_death ?? '',
        documents: {},
    });

    const fieldErrors = errors as Record<string, string | undefined>;
    const requestError = fieldErrors.request;

    const currentDocFor = (key: string): UploadedDoc | undefined => r.documents.find((d) => d.custom_properties?.document_key === key);

    const storePreparedDocument = useCallback(
        (key: string, file: File | null) => {
            setData((current) => ({
                ...current,
                documents: { ...current.documents, [key]: file },
            }));
        },
        [setData],
    );
    const {
        isPreparing: isPreparingDocuments,
        notices: documentPreparationNotices,
        prepareDocument: handleFileChange,
        preparingKeys: preparingDocumentKeys,
    } = useOptimizedAssistanceDocuments(storePreparedDocument);

    const detailUrl = ShowAssistanceRequestProfileController.url({
        municipality: currentMunicipality.slug,
        assistanceRequest: r.id,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isPreparingDocuments) return;

        post(submitUrl, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
        });
    };

    const canSubmit =
        data.description.trim().length >= 10 && (!requiresDateOfDeath || data.on_behalf_date_of_death !== '') && !isPreparingDocuments && !processing;

    return (
        <AdminLayout>
            <Head title={`Edit request — ${r.transaction_number}`} />
            <div className="bg-slate-50 pb-24">
                {/* Back nav */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-3xl px-6 py-4">
                        <Link
                            href={detailUrl}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to request
                        </Link>
                    </div>
                </div>

                <div className="container mx-auto mt-8 max-w-3xl px-6">
                    {/* Header */}
                    <div className="mb-8 flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                            <FileText className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">Edit Request Details</h1>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-slate-600">
                                    {r.transaction_number}
                                </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Correcting{' '}
                                <span className="font-semibold text-slate-700 capitalize">{r.assistance_type?.name ?? 'this request'}</span> for{' '}
                                <span className="font-semibold text-slate-700 capitalize">
                                    {r.identity_snapshot?.full_name?.toLowerCase() ?? 'the beneficiary'}
                                </span>
                                {r.beneficiary_number ? ` (${r.beneficiary_number})` : ''}. Only the reason and document scans can be changed — the
                                identity and amount on file stay frozen.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {requestError && (
                            <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {requestError}
                            </p>
                        )}

                        {/* Description */}
                        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <Label>
                                What is being requested / situation <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                rows={4}
                                placeholder="Describe the assistance the beneficiary is asking for and their situation…"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                        </section>

                        {requiresDateOfDeath && (
                            <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                <Label htmlFor="on_behalf_date_of_death">
                                    Date of Death <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="on_behalf_date_of_death"
                                    type="date"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={data.on_behalf_date_of_death}
                                    onChange={(event) => setData('on_behalf_date_of_death', event.target.value)}
                                />
                                <p className="text-xs leading-relaxed text-slate-500">
                                    Correct this value before approval. The change is recorded in the request audit trail.
                                </p>
                                {fieldErrors.on_behalf_date_of_death && <p className="text-xs text-red-500">{fieldErrors.on_behalf_date_of_death}</p>}
                            </section>
                        )}

                        {/* Document slots */}
                        {slots.length > 0 && (
                            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Paperclip className="h-4 w-4 text-[#005088]" /> Supporting documents
                                </h4>
                                <p className="mb-4 text-xs text-slate-500">
                                    Leave a slot empty to keep the current file. Choosing a file replaces that document.
                                </p>
                                {isPreparingDocuments && (
                                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
                                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                        Preparing and reducing document images before upload...
                                    </div>
                                )}
                                <div className="space-y-5">
                                    {slots.map((slot) => {
                                        const current = currentDocFor(slot.key);
                                        return (
                                            <div key={slot.key} className="space-y-1.5">
                                                <Label className="text-sm">
                                                    {slot.label}
                                                    {slot.is_required && (
                                                        <span className="ml-1 text-[10px] font-medium text-amber-600">(usually required)</span>
                                                    )}
                                                </Label>
                                                {slot.description && <p className="text-xs text-slate-500">{slot.description}</p>}
                                                {slot.physical_copy_requirement !== 'unspecified' && (
                                                    <p className="text-xs font-medium text-blue-700">
                                                        Physical copy: {slot.physical_copy_requirement_label}
                                                    </p>
                                                )}

                                                {current ? (
                                                    <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        On file: <span className="font-semibold">{current.name}</span>
                                                        <span className="text-slate-400">({formatBytes(current.size)})</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">No file on record for this slot.</p>
                                                )}

                                                <Input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    disabled={preparingDocumentKeys.has(slot.key)}
                                                    className="cursor-pointer bg-white file:font-medium file:text-blue-600"
                                                    onChange={(e) => void handleFileChange(slot.key, e.target.files?.[0] ?? null)}
                                                />
                                                {preparingDocumentKeys.has(slot.key) && (
                                                    <p className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing image...
                                                    </p>
                                                )}
                                                {data.documents[slot.key] && (
                                                    <p className="text-[11px] text-blue-600">Will replace with: {data.documents[slot.key]?.name}</p>
                                                )}
                                                {!preparingDocumentKeys.has(slot.key) && documentPreparationNotices[slot.key] && (
                                                    <p
                                                        className={`text-xs font-medium ${
                                                            documentPreparationNotices[slot.key]?.tone === 'warning'
                                                                ? 'text-amber-700'
                                                                : 'text-emerald-700'
                                                        }`}
                                                    >
                                                        {documentPreparationNotices[slot.key]?.message}
                                                    </p>
                                                )}
                                                {fieldErrors[`documents.${slot.key}`] && (
                                                    <p className="text-xs text-red-500">{fieldErrors[`documents.${slot.key}`]}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={detailUrl}
                                className="inline-flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className="h-12 rounded-2xl bg-slate-900 px-8 text-sm font-bold tracking-wide text-white uppercase shadow-lg transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
                            >
                                {isPreparingDocuments ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing images…
                                    </>
                                ) : processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving…
                                    </>
                                ) : (
                                    'Save changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

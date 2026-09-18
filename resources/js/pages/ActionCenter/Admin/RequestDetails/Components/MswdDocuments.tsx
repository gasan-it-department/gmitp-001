import CompleteAssistanceMswdVerificationController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/CompleteAssistanceMswdVerificationController';
import ReassignAssistanceMswdReviewerController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ReassignAssistanceMswdReviewerController';
import ReopenAssistanceMswdVerificationController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ReopenAssistanceMswdVerificationController';
import ReturnAssistanceForCorrectionController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ReturnAssistanceForCorrectionController';
import UpdateAssistanceDocumentCheckController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/UpdateAssistanceDocumentCheckController';
import UploadAssistanceRequestDocumentsController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/UploadAssistanceRequestDocumentsController';
import { AssistanceDocumentUploadField } from '@/components/ActionCenter/AssistanceDocumentUploadField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAssistanceRequestAction } from '@/Core/Hooks/ActionCenter/useAssistanceRequestAction';
import {
    PHYSICAL_COPY_REQUIREMENT_OPTIONS,
    type AssistanceDocumentCheck,
    type AssistanceMswdVerification,
    type AssistanceReviewActor,
    type PresentedCopyOption,
} from '@/Core/Types/ActionCenter/assistance';
import { useOptimizedAssistanceDocuments } from '@/hooks/use-optimized-assistance-documents';
import { AlertCircle, CheckCircle2, ClipboardCheck, ExternalLink, FileText, Loader2, RotateCcw, Upload, UserRoundCog } from 'lucide-react';
import { useCallback, useState, type FormEvent } from 'react';
import MswdVerificationBadge from './MswdVerificationBadge';

interface Props {
    requestId: string;
    verification: AssistanceMswdVerification;
    checks: AssistanceDocumentCheck[];
    documents: VerificationDocument[];
    reviewer: AssistanceReviewActor | null;
    reviewerOptions: AssistanceReviewActor[];
    presentedCopyOptions: PresentedCopyOption[];
    canReview: boolean;
    canCorrect: boolean;
    uploadOpen: boolean;
    onUploadOpenChange: (open: boolean) => void;
}

interface VerificationDocument {
    id: string | number;
    document_key: string;
    url: string;
    file_name: string;
    mime_type: string | null;
    size: number;
    uploaded_at: string | null;
}

type ReviewAction = 'complete' | 'return' | 'reopen' | 'reassign';
const ACTION_TITLES: Record<ReviewAction, string> = {
    complete: 'Complete MSWD verification',
    return: 'Return for correction',
    reopen: 'Reopen MSWD verification',
    reassign: 'Reassign MSWD reviewer',
};

export function ActionErrors({ errors }: { errors: Record<string, string> }) {
    return (
        <>
            {Object.entries(errors).map(([field, message]) => (
                <p key={field} role="alert" className="text-xs text-red-700">
                    {message}
                </p>
            ))}
        </>
    );
}

export default function MswdDocuments({
    requestId,
    verification,
    checks,
    documents,
    reviewer,
    reviewerOptions,
    presentedCopyOptions,
    canReview,
    canCorrect,
    uploadOpen,
    onUploadOpenChange,
}: Props) {
    const [selectedCheck, setSelectedCheck] = useState<AssistanceDocumentCheck | null>(null);
    const [action, setAction] = useState<ReviewAction | null>(null);
    const canComplete = canReview && verification.status === 'under_review' && verification.blockers.length === 0 && !!verification.fingerprint;
    const applicableChecks = checks.filter((check) => check.is_applicable);
    const verifiedChecks = applicableChecks.filter((check) => check.verification_status === 'verified').length;

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-base font-semibold">MSWD Verification</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <MswdVerificationBadge status={verification.status} isCurrent={verification.is_current} />
                        {applicableChecks.length > 0 && (
                            <span className="text-xs font-medium text-slate-600">
                                {verifiedChecks} of {applicableChecks.length} documents verified
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-600">
                        Assigned reviewer: <span className="font-medium text-slate-800">{reviewer?.name ?? 'Unassigned'}</span>
                    </p>
                    {verification.verified_at && (
                        <p className="text-xs text-slate-600">
                            Verified by {verification.verified_by?.name ?? 'MSWD'} on {new Date(verification.verified_at).toLocaleString()}
                        </p>
                    )}
                    {verification.notes && <p className="text-sm whitespace-pre-wrap text-slate-700">{verification.notes}</p>}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
                    {canReview && (
                        <>
                            <Button size="sm" disabled={!canComplete} onClick={() => setAction('complete')}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Complete verification
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setAction('return')}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Return for correction
                            </Button>
                        </>
                    )}
                    {canCorrect && verification.status === 'verified' && (
                        <Button variant="outline" size="sm" onClick={() => setAction('reopen')}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reopen verification
                        </Button>
                    )}
                    {canCorrect && verification.status !== 'verified' && (
                        <Button variant="outline" size="sm" onClick={() => setAction('reassign')}>
                            <UserRoundCog className="mr-2 h-4 w-4" />
                            Reassign reviewer
                        </Button>
                    )}
                </div>
            </div>
            {verification.blockers.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
                    <p className="font-medium">Verification blockers</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                        {verification.blockers.map((blocker, index) => (
                            <li key={index} className="break-words">
                                {blocker}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {checks.length > 0 && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">Document checklist</h3>
                    <p className="text-xs text-slate-500">Preview the file, then record the physical inspection.</p>
                </div>
            )}
            <ul className="space-y-3">
                {checks.map((check) => {
                    const file =
                        documents.find((document) => check.media_id !== null && String(document.id) === String(check.media_id)) ??
                        documents.find((document) => document.document_key === check.document_key);
                    const physical = PHYSICAL_COPY_REQUIREMENT_OPTIONS.find((option) => option.value === check.physical_copy_requirement)?.label;
                    const statusLabel = !check.is_applicable
                        ? 'Not applicable'
                        : check.verification_status === 'verified'
                          ? 'Verified'
                          : check.verification_status === 'needs_correction'
                            ? 'Needs correction'
                            : 'Pending review';
                    const statusClass = !check.is_applicable
                        ? 'bg-slate-100 text-slate-600'
                        : check.verification_status === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : check.verification_status === 'needs_correction'
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200';

                    return (
                        <li key={check.document_key} className="rounded-md border border-slate-200 bg-white p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <DocumentThumbnail file={file} label={check.label} />
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-semibold break-words">{check.label}</h3>
                                        <span className="text-xs text-slate-500">
                                            {!check.is_applicable ? 'Exempt' : check.is_required ? 'Required' : 'Optional'}
                                        </span>
                                        <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${statusClass}`}>{statusLabel}</span>
                                    </div>
                                    {check.description && <p className="text-xs text-slate-600">{check.description}</p>}
                                    {!check.is_applicable && (
                                        <p className="text-xs text-slate-600">{check.exemption_reason ?? 'Not applicable to this request.'}</p>
                                    )}
                                    {check.is_applicable && check.physical_copy_requirement !== 'unspecified' && (
                                        <p className="text-xs text-slate-600">
                                            Physical copy required: <span className="font-medium text-slate-800">{physical}</span>
                                        </p>
                                    )}
                                    {file ? (
                                        <>
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex max-w-full items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{file.file_name}</span>
                                            </a>
                                            <p className="text-[11px] text-slate-500">
                                                {formatDocumentSize(file.size)}
                                                {file.uploaded_at && ` · Uploaded ${new Date(file.uploaded_at).toLocaleDateString()}`}
                                            </p>
                                        </>
                                    ) : (
                                        check.is_applicable && (
                                            <p className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                No file uploaded
                                            </p>
                                        )
                                    )}
                                    {check.presented_copy_type && (
                                        <p className="text-xs text-slate-600">Presented: {check.presented_copy_type.replace(/_/g, ' ')}</p>
                                    )}
                                    {check.remarks && <p className="text-xs whitespace-pre-wrap text-slate-700">{check.remarks}</p>}
                                    {check.checked_by && (
                                        <p className="text-xs text-slate-500">
                                            Checked by {check.checked_by.name}
                                            {check.checked_at ? ` on ${new Date(check.checked_at).toLocaleString()}` : ''}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 gap-2 sm:flex-col">
                                    {canReview && check.is_applicable && file && (
                                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setSelectedCheck(check)}>
                                            <ClipboardCheck className="mr-2 h-4 w-4" />
                                            Review
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            {checks.length === 0 && <p className="text-sm text-slate-500">No document checks required.</p>}
            {selectedCheck && (
                <DocumentCheckDialog
                    requestId={requestId}
                    check={selectedCheck}
                    presentedCopyOptions={presentedCopyOptions}
                    onClose={() => setSelectedCheck(null)}
                />
            )}
            {action && (
                <VerificationActionDialog
                    requestId={requestId}
                    action={action}
                    verification={verification}
                    reviewerOptions={reviewerOptions.filter((option) => String(option.id) !== String(reviewer?.id))}
                    onClose={() => setAction(null)}
                />
            )}
            {uploadOpen && (
                <DocumentUploadDialog
                    requestId={requestId}
                    checks={checks.filter((check) => check.is_applicable)}
                    documents={documents}
                    onClose={() => onUploadOpenChange(false)}
                />
            )}
        </section>
    );
}

function DocumentThumbnail({ file, label }: { file?: VerificationDocument; label: string }) {
    if (!file) {
        return (
            <div className="flex h-20 w-full shrink-0 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-slate-400 sm:w-24">
                <FileText className="h-7 w-7" />
            </div>
        );
    }

    const isImage = file.mime_type?.startsWith('image/');

    return (
        <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${label}`}
            className="group relative flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50 sm:h-20 sm:w-24"
        >
            {isImage ? (
                <img src={file.url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            ) : (
                <FileText className="h-8 w-8 text-slate-400" />
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/75 py-1 text-[10px] font-medium text-white opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <ExternalLink className="h-3 w-3" /> View
            </span>
        </a>
    );
}

function formatDocumentSize(bytes: number): string {
    if (!bytes) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);

    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function DocumentCheckDialog({
    requestId,
    check,
    presentedCopyOptions,
    onClose,
}: {
    requestId: string;
    check: AssistanceDocumentCheck;
    presentedCopyOptions: PresentedCopyOption[];
    onClose: () => void;
}) {
    const { submit, processing, errors } = useAssistanceRequestAction();
    const [status, setStatus] = useState<AssistanceDocumentCheck['verification_status']>(check.verification_status);
    const [copyType, setCopyType] = useState(check.presented_copy_type ?? 'none');
    const [physicalInspected, setPhysicalInspected] = useState(false);
    const [remarks, setRemarks] = useState(check.remarks ?? '');
    const save = async (event: FormEvent) => {
        event.preventDefault();
        if (
            await submit(UpdateAssistanceDocumentCheckController({ assistanceRequestId: requestId, documentKey: check.document_key }), {
                status,
                media_id: check.media_id,
                media_version: check.media_version,
                presented_copy_type: copyType === 'none' ? null : copyType,
                physical_inspected: physicalInspected,
                remarks,
            })
        )
            onClose();
    };
    return (
        <Dialog open onOpenChange={(open) => !open && !processing && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{check.label}</DialogTitle>
                    <DialogDescription>MSWD document check</DialogDescription>
                </DialogHeader>
                <form onSubmit={save} className="space-y-4">
                    <fieldset disabled={processing} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="document-check-status">Status</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as AssistanceDocumentCheck['verification_status'])}>
                                <SelectTrigger id="document-check-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="needs_correction">Needs correction</SelectItem>
                                </SelectContent>
                            </Select>
                            <ActionErrors errors={errors.status ? { status: errors.status } : {}} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="document-copy-type">Presented copy</Label>
                            <Select value={copyType} onValueChange={(value) => setCopyType(value as typeof copyType)}>
                                <SelectTrigger id="document-copy-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Not presented</SelectItem>
                                    {presentedCopyOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <ActionErrors errors={errors.presented_copy_type ? { presented_copy_type: errors.presented_copy_type } : {}} />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-start gap-2">
                                <Checkbox checked={physicalInspected} onCheckedChange={(value) => setPhysicalInspected(value === true)} />I inspected
                                the physical document
                            </Label>
                            <ActionErrors errors={errors.physical_inspected ? { physical_inspected: errors.physical_inspected } : {}} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="document-check-remarks">Remarks</Label>
                            <Textarea
                                id="document-check-remarks"
                                rows={3}
                                value={remarks}
                                onChange={(event) => setRemarks(event.target.value)}
                                required={status === 'needs_correction'}
                            />
                            <ActionErrors errors={errors.remarks ? { remarks: errors.remarks } : {}} />
                        </div>
                    </fieldset>
                    <ActionErrors
                        errors={Object.fromEntries(
                            Object.entries(errors).filter(
                                ([field]) => !['status', 'presented_copy_type', 'physical_inspected', 'remarks'].includes(field),
                            ),
                        )}
                    />
                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={processing} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}Save check
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function VerificationActionDialog({
    requestId,
    action,
    verification,
    reviewerOptions,
    onClose,
}: {
    requestId: string;
    action: ReviewAction;
    verification: AssistanceMswdVerification;
    reviewerOptions: AssistanceReviewActor[];
    onClose: () => void;
}) {
    const { submit, processing, errors } = useAssistanceRequestAction();
    const [reason, setReason] = useState('');
    const [reviewerId, setReviewerId] = useState('');
    const [confirmations, setConfirmations] = useState({ identity_confirmed: false, household_confirmed: false, eligibility_confirmed: false });
    const confirmationLabels = {
        identity_confirmed: 'Identity confirmed',
        household_confirmed: 'Household assessment confirmed',
        eligibility_confirmed: 'Eligibility confirmed',
    };
    const complete = action === 'complete';
    const save = async (event: FormEvent) => {
        event.preventDefault();
        const params = { assistanceRequestId: requestId };
        const success = complete
            ? await submit(CompleteAssistanceMswdVerificationController(params), { expected_fingerprint: verification.fingerprint, ...confirmations })
            : action === 'return'
              ? await submit(ReturnAssistanceForCorrectionController(params), { reason })
              : action === 'reopen'
                ? await submit(ReopenAssistanceMswdVerificationController(params), { reason })
                : await submit(ReassignAssistanceMswdReviewerController(params), { reviewer_id: reviewerId, reason });
        if (success) onClose();
    };
    return (
        <Dialog open onOpenChange={(open) => !open && !processing && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{ACTION_TITLES[action]}</DialogTitle>
                    <DialogDescription>
                        {complete ? 'Confirm the current assessment and supporting documents.' : 'The approved amount remains unchanged.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={save} className="space-y-4">
                    <fieldset disabled={processing} className="space-y-4">
                        {complete ? (
                            (Object.keys(confirmations) as (keyof typeof confirmations)[]).map((field) => (
                                <div key={field} className="space-y-2">
                                    <Label className="flex items-start gap-2">
                                        <Checkbox
                                            checked={confirmations[field]}
                                            onCheckedChange={(value) => setConfirmations((current) => ({ ...current, [field]: value === true }))}
                                        />
                                        {confirmationLabels[field]}
                                    </Label>
                                    <ActionErrors errors={errors[field] ? { [field]: errors[field] } : {}} />
                                </div>
                            ))
                        ) : (
                            <>
                                {action === 'reassign' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="mswd-reviewer">Reviewer</Label>
                                        <Select value={reviewerId} onValueChange={setReviewerId}>
                                            <SelectTrigger id="mswd-reviewer">
                                                <SelectValue placeholder="Select reviewer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reviewerOptions.map((reviewer) => (
                                                    <SelectItem key={reviewer.id} value={String(reviewer.id)}>
                                                        {reviewer.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {reviewerOptions.length === 0 && (
                                            <p className="text-xs text-slate-600">No other eligible reviewers available.</p>
                                        )}
                                        <ActionErrors errors={errors.reviewer_id ? { reviewer_id: errors.reviewer_id } : {}} />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="mswd-action-reason">Reason</Label>
                                    <Textarea
                                        id="mswd-action-reason"
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        required
                                        rows={3}
                                    />
                                    <ActionErrors errors={errors.reason ? { reason: errors.reason } : {}} />
                                </div>
                            </>
                        )}
                    </fieldset>
                    <ActionErrors
                        errors={Object.fromEntries(
                            Object.entries(errors).filter(([field]) => !['reason', 'reviewer_id', ...Object.keys(confirmations)].includes(field)),
                        )}
                    />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                (complete
                                    ? verification.blockers.length > 0 || !verification.fingerprint || !Object.values(confirmations).every(Boolean)
                                    : !reason.trim() || (action === 'reassign' && !reviewerId))
                            }
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {ACTION_TITLES[action]}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DocumentUploadDialog({
    requestId,
    checks,
    documents,
    onClose,
}: {
    requestId: string;
    checks: AssistanceDocumentCheck[];
    documents: VerificationDocument[];
    onClose: () => void;
}) {
    const { submit, processing, errors } = useAssistanceRequestAction();
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const onFileReady = useCallback((key: string, file: File | null) => setFiles((current) => ({ ...current, [key]: file })), []);
    const { prepareDocument, rotateDocument, isPreparing, notices, preparingKeys } = useOptimizedAssistanceDocuments(onFileReady);
    const busy = processing || isPreparing;
    const save = async (event: FormEvent) => {
        event.preventDefault();
        if (busy) return;
        const form = new FormData();
        Object.entries(files).forEach(([key, file]) => {
            if (file) form.append(`documents[${key}]`, file);
        });
        if (await submit(UploadAssistanceRequestDocumentsController({ assistanceRequestId: requestId }), form)) onClose();
    };
    return (
        <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upload documents</DialogTitle>
                    <DialogDescription>Preview each selected file before uploading it for MSWD verification.</DialogDescription>
                </DialogHeader>
                <form onSubmit={save} className="space-y-4">
                    <fieldset disabled={busy} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {checks.map((check) => {
                            const existingFile =
                                documents.find((document) => check.media_id !== null && String(document.id) === String(check.media_id)) ??
                                documents.find((document) => document.document_key === check.document_key);

                            return (
                                <AssistanceDocumentUploadField
                                    key={check.document_key}
                                    documentKey={check.document_key}
                                    label={check.label}
                                    required={check.is_required}
                                    file={files[check.document_key]}
                                    existingFile={existingFile}
                                    preparing={preparingKeys.has(check.document_key)}
                                    notice={notices[check.document_key]}
                                    errors={Object.entries(errors)
                                        .filter(
                                            ([field]) =>
                                                field === `documents.${check.document_key}` || field.startsWith(`documents.${check.document_key}.`),
                                        )
                                        .map(([, message]) => message)}
                                    inputIdPrefix="mswd-upload"
                                    onSelect={(file) => void prepareDocument(check.document_key, file)}
                                    onRotate={(direction) => {
                                        const file = files[check.document_key];
                                        if (file) void rotateDocument(check.document_key, file, direction);
                                    }}
                                    onRemove={() => onFileReady(check.document_key, null)}
                                />
                            );
                        })}
                    </fieldset>
                    <ActionErrors
                        errors={Object.fromEntries(
                            Object.entries(errors).filter(
                                ([field]) =>
                                    !checks.some(
                                        (check) =>
                                            field === `documents.${check.document_key}` || field.startsWith(`documents.${check.document_key}.`),
                                    ),
                            ),
                        )}
                    />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={busy || !Object.values(files).some(Boolean)}>
                            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

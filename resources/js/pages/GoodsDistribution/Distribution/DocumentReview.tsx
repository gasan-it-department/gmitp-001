import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import { AlertCircle, ClipboardCheck, ExternalLink, FileText, Loader2, RefreshCw, Upload } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, useInventoryContext, useInventoryMutation } from '../Inventory/components';
import RequirementsUpdateDialog from './RequirementsUpdateDialog';
import type { DocumentCheck, GoodsRequest, Permissions, RequirementsUpdate } from './types';

const copyLabels: Record<string, string> = {
    unspecified: 'Not specified',
    original: 'Original',
    certified_true_copy: 'Certified true copy',
    original_or_certified_true_copy: 'Original or certified true copy',
    photocopy: 'Photocopy',
};
const evidenceLabels: Record<DocumentCheck['evidence_mode'], string> = {
    physical: 'Physical inspection',
    upload: 'Uploaded evidence',
    both: 'Upload and physical inspection',
};
const statusLabels: Record<DocumentCheck['status'], string> = {
    pending: 'Pending review',
    verified: 'Verified',
    rejected: 'Needs correction',
};
const statusClasses: Record<DocumentCheck['status'], string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    verified: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    rejected: 'border-rose-200 bg-rose-50 text-rose-800',
};
type Props = { request: GoodsRequest; permissions: Permissions };

export default function DocumentChecklist({ request, permissions, update }: Props & { update: RequirementsUpdate | null }) {
    const [updateOpen, setUpdateOpen] = useState(false);
    const documents = request.documents.filter((document) => document.is_active !== false);
    const removed = request.documents.filter((document) => document.is_active === false);
    const verified = documents.filter((document) => document.status === 'verified').length;
    const required = documents.filter((document) => document.is_required);
    const requiredVerified = required.filter((document) => document.status === 'verified').length;
    const locked = ['approved', 'released', 'cancelled'].includes(request.status);
    const canApply =
        request.status === 'under_review'
            ? permissions.process
            : request.status === 'draft'
              ? permissions.intake || permissions.process
              : ['pending', 'returned'].includes(request.status) && permissions.intake;
    return (
        <section aria-labelledby="goods-document-checklist" className="space-y-4">
            <header className="flex flex-col gap-2 border-b border-[#e8ede9] pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h2 id="goods-document-checklist" className="text-base font-semibold">
                        Document verification
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {verified} of {documents.length} documents verified
                    </p>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground sm:text-right">
                    <p>
                        {requiredVerified} of {required.length} required documents verified
                    </p>
                    <p>{locked ? 'Document checks locked' : request.status === 'under_review' ? 'Review in progress' : 'Awaiting review'}</p>
                </div>
            </header>
            {update?.error && <Errors errors={{ requirements: update.error }} />}
            {update?.changed && (
                <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1 text-sm text-amber-950">
                        <p className="font-medium">Program requirements have changed</p>
                        <p className="text-xs">
                            {update.changes.length} checklist change(s) available
                            {request.status === 'approved' ? '. Updates require return for correction.' : '.'}
                        </p>
                    </div>
                    {canApply && (
                        <Button variant="outline" size="sm" className="shrink-0" onClick={() => setUpdateOpen(true)}>
                            <RefreshCw className="size-4" />
                            Review changes
                        </Button>
                    )}
                </div>
            )}
            {documents.length ? (
                <ul className="space-y-3">
                    {documents.map((document) => (
                        <DocumentReview key={`${document.id}-${request.version}`} document={document} request={request} permissions={permissions} />
                    ))}
                </ul>
            ) : (
                <p className="py-6 text-sm text-muted-foreground">
                    {removed.length ? 'No active document requirements.' : 'No document requirements were configured when this request was filed.'}
                </p>
            )}
            {removed.length > 0 && (
                <details className="border-t border-[#e0e7e2] pt-4">
                    <summary className="cursor-pointer text-sm font-medium">Removed requirements ({removed.length})</summary>
                    <ul className="mt-3 space-y-3">
                        {removed.map((document) => (
                            <DocumentReview key={document.id} document={document} request={request} permissions={permissions} />
                        ))}
                    </ul>
                </details>
            )}
            {updateOpen && update && (
                <RequirementsUpdateDialog
                    key={`${request.version}-${update.fingerprint}`}
                    request={request}
                    preview={update}
                    onClose={() => setUpdateOpen(false)}
                />
            )}
        </section>
    );
}

function EvidenceLink({ url }: { url: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#245e4f] hover:underline"
        >
            <ExternalLink className="size-3" />
            View uploaded evidence
        </a>
    );
}

function DocumentReview({ document: d, request: r, permissions }: Props & { document: DocumentCheck }) {
    const { slug } = useInventoryContext();
    const [action, setAction] = useState<'review' | 'upload' | null>(null);
    const unlocked = d.is_active !== false && ['draft', 'pending', 'returned', 'under_review'].includes(r.status);
    const canUpload = unlocked && d.evidence_mode !== 'physical' && (permissions.intake || permissions.process);
    const canReview = d.is_active !== false && permissions.process && r.status === 'under_review';
    const evidenceUrl = d.current_media_id ? goodsDistribution.requests.document.url({ municipality: slug, requestId: r.id, checkId: d.id }) : null;
    return (
        <li className="rounded-md border border-[#e0e7e2] bg-white p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {evidenceUrl ? (
                    <a
                        href={evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${d.label}`}
                        className="flex h-20 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded border border-[#e0e7e2] bg-[#f8faf9] text-[#245e4f] hover:bg-[#eef4f0]"
                    >
                        <FileText className="size-7" />
                        <span className="inline-flex items-center gap-1 text-xs">
                            <ExternalLink className="size-3" />
                            View file
                        </span>
                    </a>
                ) : (
                    <div
                        aria-hidden="true"
                        className="flex h-20 w-24 shrink-0 items-center justify-center rounded border border-dashed border-[#d7e0da] bg-[#f8faf9] text-muted-foreground"
                    >
                        <FileText className="size-7" />
                    </div>
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold break-words">{d.label}</h3>
                        <span className="text-xs text-muted-foreground">
                            {d.is_active === false ? 'Removed requirement' : d.is_required ? 'Required' : 'Optional'}
                        </span>
                        <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${statusClasses[d.status]}`}>
                            {statusLabels[d.status]}
                        </span>
                    </div>
                    {d.description && <p className="text-xs break-words text-muted-foreground">{d.description}</p>}
                    <p className="text-xs text-muted-foreground">{evidenceLabels[d.evidence_mode]}</p>
                    {d.evidence_mode !== 'upload' && d.physical_copy_requirement !== 'unspecified' && (
                        <p className="text-xs text-muted-foreground">
                            Physical copy required:{' '}
                            <span className="font-medium text-foreground">
                                {copyLabels[d.physical_copy_requirement] ?? d.physical_copy_requirement}
                            </span>
                        </p>
                    )}
                    {evidenceUrl ? (
                        <EvidenceLink url={evidenceUrl} />
                    ) : d.evidence_mode !== 'physical' ? (
                        <p className="flex items-center gap-1 text-xs text-rose-700">
                            <AlertCircle className="size-3.5 shrink-0" />
                            No file uploaded
                        </p>
                    ) : null}
                    {d.presented_copy_type && (
                        <p className="text-xs text-muted-foreground">Presented: {copyLabels[d.presented_copy_type] ?? d.presented_copy_type}</p>
                    )}
                    {d.remarks && <p className="text-xs break-words whitespace-pre-wrap">{d.remarks}</p>}
                    {d.checked_at && <p className="text-xs text-muted-foreground">Inspected {new Date(d.checked_at).toLocaleString()}</p>}
                </div>
                {(canReview || canUpload) && (
                    <div className="flex flex-wrap gap-2 sm:shrink-0 sm:flex-col">
                        {canReview && (
                            <Button variant="outline" size="sm" onClick={() => setAction('review')}>
                                <ClipboardCheck className="size-4" />
                                Review
                            </Button>
                        )}
                        {canUpload && (
                            <Button variant="outline" size="sm" onClick={() => setAction('upload')}>
                                <Upload className="size-4" />
                                {d.current_media_id ? 'Replace evidence' : 'Upload evidence'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
            {action && <DocumentActionDialog action={action} document={d} request={r} onClose={() => setAction(null)} />}
        </li>
    );
}

function DocumentActionDialog({
    action,
    document: d,
    request: r,
    onClose,
}: {
    action: 'review' | 'upload';
    document: DocumentCheck;
    request: GoodsRequest;
    onClose: () => void;
}) {
    const mutation = useInventoryMutation();
    const { slug } = useInventoryContext();
    const [status, setStatus] = useState(d.status);
    const [copy, setCopy] = useState(d.presented_copy_type ?? '');
    const [remarks, setRemarks] = useState(d.remarks ?? '');
    const [file, setFile] = useState<File | null>(null);
    const upload = action === 'upload';
    const api = goodsDistribution.requests.api;
    return (
        <Dialog open onOpenChange={(open) => !open && !mutation.busy && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="break-words">{d.label}</DialogTitle>
                    <DialogDescription>
                        {upload
                            ? d.current_media_id
                                ? 'Replace uploaded evidence'
                                : 'Upload document evidence'
                            : 'Goods Distribution document check'}
                    </DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={async (event) => {
                        event.preventDefault();
                        if (mutation.busy) return;
                        let result;
                        if (upload) {
                            if (!file) return;
                            const data = new FormData();
                            data.set('version', String(r.version));
                            data.set('file', file);
                            result = await mutation.submit(api.upload.url({ requestId: r.id, checkId: d.id }), data);
                        } else {
                            result = await mutation.submit(
                                api.check.url({ requestId: r.id, checkId: d.id }),
                                { version: r.version, status, presented_copy_type: copy || null, remarks },
                                'patch',
                            );
                        }
                        if (result) {
                            onClose();
                            router.reload();
                        }
                    }}
                >
                    <fieldset disabled={mutation.busy} className="min-w-0 space-y-4">
                        {upload ? (
                            <>
                                {d.current_media_id && (
                                    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                        Replacing this file resets its inspection to pending review.
                                    </p>
                                )}
                                <Field label="PDF or image">
                                    <Input
                                        className="min-w-0"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                                    />
                                </Field>
                            </>
                        ) : (
                            <>
                                {d.current_media_id && (
                                    <EvidenceLink
                                        url={goodsDistribution.requests.document.url({ municipality: slug, requestId: r.id, checkId: d.id })}
                                    />
                                )}
                                <Field label="Inspection result">
                                    <select
                                        className={inputClass}
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value as DocumentCheck['status'])}
                                    >
                                        <option value="pending">Pending review</option>
                                        <option value="verified">Verified</option>
                                        <option value="rejected">Needs correction</option>
                                    </select>
                                </Field>
                                {d.evidence_mode !== 'upload' && (
                                    <Field label="Physical copy presented">
                                        <select className={inputClass} value={copy} onChange={(event) => setCopy(event.target.value)}>
                                            <option value="">Not presented</option>
                                            <option value="original">Original</option>
                                            <option value="certified_true_copy">Certified true copy</option>
                                            <option value="photocopy">Photocopy</option>
                                        </select>
                                    </Field>
                                )}
                                <Field label="Inspection remarks">
                                    <textarea
                                        className={`${inputClass} h-24 py-2`}
                                        value={remarks}
                                        required={status === 'rejected'}
                                        onChange={(event) => setRemarks(event.target.value)}
                                    />
                                </Field>
                            </>
                        )}
                    </fieldset>
                    <Errors errors={mutation.errors} />
                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={mutation.busy} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.busy || (upload && !file)}>
                            {mutation.busy ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : upload ? (
                                <Upload className="size-4" />
                            ) : (
                                <ClipboardCheck className="size-4" />
                            )}
                            {upload ? (d.current_media_id ? 'Replace evidence' : 'Upload evidence') : 'Save inspection'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

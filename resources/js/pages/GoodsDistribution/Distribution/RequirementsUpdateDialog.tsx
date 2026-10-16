import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Errors, useInventoryMutation } from '../Inventory/components';
import type { GoodsRequest, RequirementSnapshot, RequirementsUpdate } from './types';

const fields: (keyof Omit<RequirementSnapshot, 'document_key'>)[] = [
    'label',
    'description',
    'is_required',
    'evidence_mode',
    'physical_copy_requirement',
    'sort_order',
];
const fieldLabels = {
    label: 'Document',
    description: 'Description',
    is_required: 'Requirement',
    evidence_mode: 'Evidence',
    physical_copy_requirement: 'Physical copy',
    sort_order: 'Checklist order',
};
function display(field: (typeof fields)[number], value: RequirementSnapshot[(typeof fields)[number]]) {
    if (field === 'is_required') return value ? 'Required' : 'Optional';
    if (field === 'sort_order') return String(Number(value) + 1);
    if (field === 'evidence_mode')
        return { physical: 'Physical inspection', upload: 'Uploaded evidence', both: 'Upload and physical inspection' }[
            value as RequirementSnapshot['evidence_mode']
        ];
    return typeof value === 'string' ? value.replaceAll('_', ' ') : 'Not specified';
}

export default function RequirementsUpdateDialog({
    request,
    preview,
    onClose,
}: {
    request: GoodsRequest;
    preview: RequirementsUpdate;
    onClose: () => void;
}) {
    const mutation = useInventoryMutation();
    const [reviewed, setReviewed] = useState(false);
    const [operationKey] = useState(() => crypto.randomUUID());
    return (
        <Dialog open onOpenChange={(open) => !open && !mutation.busy && onClose()}>
            <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-2xl">
                <DialogHeader className="shrink-0 text-left">
                    <DialogTitle>Apply updated requirements</DialogTitle>
                    <DialogDescription className="break-words">{request.reference}</DialogDescription>
                </DialogHeader>
                <div className="min-h-0 space-y-4 overflow-y-auto">
                    <ul className="divide-y divide-[#e0e7e2]">
                        {preview.changes.map((change) => (
                            <li key={change.document_key} className="space-y-3 py-4 first:pt-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="min-w-0 text-sm font-semibold break-words">{change.label}</h3>
                                    <span className="rounded border bg-muted px-2 py-0.5 text-xs capitalize">{change.kind}</span>
                                </div>
                                {change.kind === 'removed' ? (
                                    <p className="text-sm text-muted-foreground">
                                        No longer part of the active checklist. Uploaded evidence and inspection history are retained.
                                    </p>
                                ) : (
                                    <dl className="space-y-2 text-sm">
                                        {fields
                                            .filter(
                                                (field) =>
                                                    !change.before || change.kind === 'restored' || change.before[field] !== change.after?.[field],
                                            )
                                            .map((field) => (
                                                <div
                                                    key={field}
                                                    className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]"
                                                >
                                                    <dt className="text-muted-foreground">{fieldLabels[field]}</dt>
                                                    <dd className="min-w-0 space-y-1 break-words">
                                                        {change.before && (
                                                            <p className="text-xs text-muted-foreground">
                                                                <span className="font-medium">Before: </span>
                                                                {display(field, change.before[field])}
                                                            </p>
                                                        )}
                                                        <p>
                                                            <span className="text-xs font-medium text-muted-foreground">
                                                                {change.before ? 'After: ' : ''}
                                                            </span>
                                                            {display(field, change.after?.[field] ?? null)}
                                                        </p>
                                                    </dd>
                                                </div>
                                            ))}
                                    </dl>
                                )}
                                {change.resets_inspection && (
                                    <p className="text-xs font-medium text-amber-800">
                                        Inspection will reset to pending review. Existing uploads are retained.
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <Errors errors={mutation.errors} />
                </div>
                <div className="shrink-0 space-y-4 border-t pt-4">
                    <label className="flex items-start gap-2 text-sm">
                        <Checkbox disabled={mutation.busy} checked={reviewed} onCheckedChange={(value) => setReviewed(value === true)} />I reviewed
                        the changes to this request's document checklist.
                    </label>
                    <DialogFooter>
                        <Button variant="outline" disabled={mutation.busy} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            disabled={mutation.busy || !reviewed || !preview.fingerprint}
                            onClick={async () => {
                                if (mutation.busy) return;
                                const result = await mutation.submit(
                                    goodsDistribution.requests.api.applyRequirements.url({ requestId: request.id }),
                                    {
                                        version: request.version,
                                        operation_key: operationKey,
                                        requirements_fingerprint: preview.fingerprint,
                                        changes_reviewed: reviewed,
                                    },
                                );
                                if (result) {
                                    onClose();
                                    router.reload();
                                }
                            }}
                        >
                            {mutation.busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                            Apply updated requirements
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

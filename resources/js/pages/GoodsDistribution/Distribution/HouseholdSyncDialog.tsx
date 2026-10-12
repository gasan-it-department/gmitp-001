import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Errors, useInventoryMutation } from '../Inventory/components';
import type { GoodsRequest, HouseholdSyncPreview } from './types';

function birthDate(value?: string | null): string {
    const date = value ? new Date(`${value}T00:00:00`) : null;
    return date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
        : value || 'Not recorded';
}

export default function HouseholdSyncDialog({
    request,
    preview,
    onClose,
}: {
    request: GoodsRequest;
    preview: HouseholdSyncPreview;
    onClose: () => void;
}) {
    const mutation = useInventoryMutation();
    const [operationKey] = useState(() => crypto.randomUUID());
    const household = preview.snapshot;
    const submit = async () => {
        const result = await mutation.submit(goodsDistribution.requests.api.syncHousehold.url({ requestId: request.id }), {
            version: request.version,
            operation_key: operationKey,
            registry_fingerprint: preview.fingerprint,
            household_reviewed: true,
        });
        if (result) {
            onClose();
            router.reload();
        }
    };
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !mutation.busy) onClose();
            }}
        >
            <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
                <DialogHeader className="shrink-0 border-b border-[#dfe6e1] px-5 py-5 pr-12 text-left sm:px-6">
                    <DialogTitle className="text-xl leading-7">Current household</DialogTitle>
                    <DialogDescription className="text-sm [overflow-wrap:anywhere] text-[#52665b]">{request.reference}</DialogDescription>
                </DialogHeader>
                <div className="min-h-0 overflow-y-auto px-5 text-[#33463c] sm:px-6">
                    <Errors errors={mutation.errors} />
                    {household && (
                        <>
                            <div className="space-y-3 py-4 text-sm leading-6">
                                <div>
                                    <p className="font-semibold text-[#223b30]">{household.household_code}</p>
                                    <p>{[household.street, household.barangay].filter(Boolean).join(', ') || 'Address not recorded'}</p>
                                </div>
                            </div>
                            <table aria-label="Current household members" className="w-full table-fixed border-collapse text-left text-sm leading-6">
                                <thead className="sticky top-0 z-10 bg-[#f6f8f7] text-[#33463c]">
                                    <tr className="border-y border-[#dfe6e1]">
                                        <th scope="col" className="w-[42%] px-2 py-3 font-semibold md:w-[30%]">
                                            Name
                                        </th>
                                        <th scope="col" className="w-[30%] px-2 py-3 font-semibold md:w-[22%]">
                                            Relationship to head
                                        </th>
                                        <th scope="col" className="hidden w-[20%] px-2 py-3 font-semibold md:table-cell">
                                            Birth date
                                        </th>
                                        <th scope="col" className="hidden w-[10%] px-2 py-3 font-semibold md:table-cell">
                                            Sex
                                        </th>
                                        <th scope="col" className="w-[28%] px-2 py-3 font-semibold md:w-[18%]">
                                            Profile
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2e8e4]">
                                    {household.roster.map((member) => (
                                        <tr key={member.id} className="align-top">
                                            <td className="px-2 py-4 [overflow-wrap:anywhere]">
                                                <p className="font-medium text-[#223b30]">{member.name}</p>
                                                <div className="flex flex-wrap gap-x-2 text-xs font-medium text-[#245e4f]">
                                                    {(member.id === household.filer.id || member.beneficiary_id === household.filer.id) && (
                                                        <span>Filer</span>
                                                    )}
                                                    {(member.id === household.subject.id ||
                                                        (!!member.beneficiary_id && member.beneficiary_id === household.subject.beneficiary_id)) && (
                                                        <span>Recipient</span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-[#52665b] md:hidden">{birthDate(member.birth_date)}</p>
                                                {member.sex && <p className="text-[#52665b] capitalize md:hidden">{member.sex}</p>}
                                            </td>
                                            <td className="px-2 py-4 [overflow-wrap:anywhere] capitalize">
                                                {member.relationship?.replaceAll('_', ' ') || 'Not recorded'}
                                            </td>
                                            <td className="hidden px-2 py-4 md:table-cell">{birthDate(member.birth_date)}</td>
                                            <td className="hidden px-2 py-4 capitalize md:table-cell">{member.sex || 'Not recorded'}</td>
                                            <td className="px-2 py-4 [overflow-wrap:anywhere]">{member.beneficiary_id ? 'Linked' : 'Unlinked'}</td>
                                        </tr>
                                    ))}
                                    {!household.roster.length && (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-[#52665b]">
                                                No active household members.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
                <div className="shrink-0 space-y-4 border-t border-[#dfe6e1] bg-[#fafcfb] px-5 py-4 sm:px-6">
                    {preview.identity_changed && (
                        <div className="flex items-start gap-3 border-l-2 border-amber-500 pl-3 text-sm leading-6 text-amber-950">
                            <AlertTriangle className="mt-1 size-4 shrink-0" aria-hidden="true" />
                            <p>
                                <strong className="font-semibold">Document inspections will be reset.</strong> Uploaded evidence will be kept.
                            </p>
                        </div>
                    )}
                    <DialogFooter className="flex-wrap">
                        {Object.keys(mutation.errors).length > 0 && (
                            <Button
                                variant="outline"
                                disabled={mutation.busy}
                                onClick={() => {
                                    onClose();
                                    router.reload();
                                }}
                            >
                                <RefreshCw className="size-4" /> Refresh preview
                            </Button>
                        )}
                        <Button variant="outline" disabled={mutation.busy} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#245e4f] text-white hover:bg-[#1d4d40]"
                            disabled={mutation.busy || !preview.changed || !household || !!preview.error}
                            onClick={() => void submit()}
                        >
                            <RefreshCw className="size-4" /> {mutation.busy ? 'Syncing' : 'Sync household'}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

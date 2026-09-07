import RefreshAssistanceHouseholdAssessmentController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/RefreshAssistanceHouseholdAssessmentController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { type FormEventHandler, useEffect } from 'react';

export interface HouseholdAssessmentPreview {
    fingerprint: string;
    previous_source: 'assessment' | 'filing' | 'none';
    added: Array<{ full_name: string; relationship: string | null }>;
    removed: Array<{ full_name: string; relationship: string | null }>;
    changed: Array<{ full_name: string; relationship: string | null; fields: string[] }>;
    current_member_count: number;
}

interface Props {
    requestId: string;
    transactionNumber: string;
    preview: HouseholdAssessmentPreview;
    isOpen: boolean;
    onClose: () => void;
}

function MemberList({ items, empty }: { items: Array<{ full_name: string; relationship: string | null }>; empty: string }) {
    if (items.length === 0) return <p className="text-xs text-slate-500">{empty}</p>;

    return (
        <ul className="max-h-28 space-y-1 overflow-y-auto pr-1 text-xs text-slate-700">
            {items.map((member, index) => (
                <li key={`${member.full_name}-${index}`} className="break-words">
                    {member.full_name}
                    {member.relationship ? <span className="text-slate-500"> · {member.relationship.replace(/_/g, ' ')}</span> : null}
                </li>
            ))}
        </ul>
    );
}

export default function SyncApprovedHouseholdDialog({ requestId, transactionNumber, preview, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        assessment_fingerprint: preview.fingerprint,
        correction_reason: '',
    });
    const fieldErrors = errors as Record<string, string | undefined>;

    useEffect(() => {
        if (isOpen) setData('assessment_fingerprint', preview.fingerprint);
    }, [isOpen, preview.fingerprint, setData]);

    const close = () => {
        if (processing) return;
        clearErrors();
        reset();
        onClose();
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(RefreshAssistanceHouseholdAssessmentController.url({ assistanceRequestId: requestId }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const baseline = preview.previous_source === 'assessment' ? 'the previous MSWD assessment' : preview.previous_source === 'filing' ? 'the filing-time household snapshot' : 'no prior household snapshot';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Synchronize approved household</DialogTitle>
                    <DialogDescription>
                        Review the live household against {baseline}. This changes only the assessed household for {transactionNumber}; approval and the original filing snapshot remain unchanged.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                            <p className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase">Added</p>
                            <div className="mt-2"><MemberList items={preview.added} empty="No new members" /></div>
                        </div>
                        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
                            <p className="text-[10px] font-bold tracking-widest text-rose-800 uppercase">Removed</p>
                            <div className="mt-2"><MemberList items={preview.removed} empty="No removed members" /></div>
                        </div>
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                            <p className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">Changed</p>
                            {preview.changed.length === 0 ? <p className="mt-2 text-xs text-slate-500">No changed details</p> : (
                                <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto pr-1 text-xs text-slate-700">
                                    {preview.changed.map((member, index) => <li key={`${member.full_name}-${index}`} className="break-words">{member.full_name}: {member.fields.join(', ')}</li>)}
                                </ul>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">Current active household roster: {preview.current_member_count} members.</p>

                    <div className="space-y-2">
                        <Label htmlFor="approved_household_correction_reason">Correction reason</Label>
                        <Textarea
                            id="approved_household_correction_reason"
                            value={data.correction_reason}
                            minLength={10}
                            maxLength={1000}
                            rows={4}
                            required
                            className="resize-none"
                            placeholder="e.g. MSWD interview identified a household member omitted during the original assessment."
                            onChange={(event) => setData('correction_reason', event.target.value)}
                        />
                        {fieldErrors.correction_reason && <p className="text-xs text-red-700">{fieldErrors.correction_reason}</p>}
                    </div>

                    {(fieldErrors.household_assessment || fieldErrors.assessment_fingerprint) && (
                        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {fieldErrors.household_assessment ?? fieldErrors.assessment_fingerprint}
                        </p>
                    )}

                    <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                        <p>Review and regenerate the affected intake sheet before release. A request with release data cannot be synchronized.</p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" disabled={processing} onClick={close}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-amber-700 text-white hover:bg-amber-800">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Confirm household correction
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

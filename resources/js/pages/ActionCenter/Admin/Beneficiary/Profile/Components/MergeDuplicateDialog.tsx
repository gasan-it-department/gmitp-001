import MergeBeneficiaryController from '@/actions/App/External/Api/Controllers/ActionCenter/Beneficiary/MergeBeneficiaryController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, GitMerge, Loader2, ShieldAlert } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    /** The DUPLICATE record being merged away. */
    beneficiaryId: string;
    beneficiaryName: string;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Admin "mark this record as a duplicate and merge it into the canonical" modal.
 *
 * Non-destructive: the duplicate is linked into the canonical (by beneficiary
 * number), its portal account is deactivated, and the canonical is flagged —
 * but no frozen request is moved or deleted. Eligibility + history then resolve
 * the two as one identity going forward, which is what stops the double-dip.
 *
 * The tenant is carried by the X-Municipality-Slug header (the API route has no
 * {municipality} segment). Domain errors come back under the `merge` key.
 */
export default function MergeDuplicateDialog({ beneficiaryId, beneficiaryName, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        canonical_beneficiary_number: '',
        was_improper_claim: false,
        notes: '',
    });

    const serverError = (errors as Record<string, string | undefined>).merge;

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(MergeBeneficiaryController.url({ beneficiaryId }), {
            headers: {
                'x-Municipality-Slug': currentMunicipality.slug,
            },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        clearErrors();
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-50">
                        <GitMerge className="h-6 w-6 text-amber-600" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Merge into canonical record</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Mark <span className="font-medium text-slate-700">{beneficiaryName}</span> as a duplicate and link it into the record
                        you want to keep. Their history is preserved and shown on the canonical; nothing is deleted.
                    </DialogDescription>
                </DialogHeader>

                {/* ID-verification reminder — same human control the link flow leans on */}
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Confirm both records are the same person against their government ID. The duplicate's portal account will be deactivated.</span>
                </div>

                {/* Domain error banner (no such number, already merged, self, etc.) */}
                {serverError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 pt-1">
                    <div className="space-y-2">
                        <Label htmlFor="canonical_beneficiary_number" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Keep this record (beneficiary number)
                        </Label>
                        <Input
                            id="canonical_beneficiary_number"
                            autoFocus
                            placeholder="e.g. GAS-000123"
                            value={data.canonical_beneficiary_number}
                            onChange={(e) => setData('canonical_beneficiary_number', e.target.value)}
                        />
                        {errors.canonical_beneficiary_number && (
                            <p className="text-xs font-medium text-red-500">{errors.canonical_beneficiary_number}</p>
                        )}
                        <p className="text-[11px] text-slate-400">The canonical record this duplicate will be merged into.</p>
                    </div>

                    <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                            checked={data.was_improper_claim}
                            onChange={(e) => setData('was_improper_claim', e.target.checked)}
                        />
                        <span className="text-xs text-slate-700">
                            <span className="font-semibold text-slate-900">An improper second payout already happened</span> on this
                            duplicate. Places a blacklist hold so self-service is blocked until an admin lifts it.
                        </span>
                    </label>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Notes <span className="text-slate-400">(optional)</span>
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Context for the audit record…"
                            className="resize-none"
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        {errors.notes && <p className="text-xs font-medium text-red-500">{errors.notes}</p>}
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-amber-600 text-white hover:bg-amber-700">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitMerge className="mr-2 h-4 w-4" />}
                            Merge record
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

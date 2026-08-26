import CancelApprovedAssistanceRequestController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/CancelApprovedAssistanceRequestController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { Ban, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    requestId: string;
    transactionNumber: string;
    amountApproved: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CancelApprovedRequestDialog({ requestId, transactionNumber, amountApproved, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        reason: '',
        confirm_not_released: false as boolean,
        confirm_papers_handled: false as boolean,
    });
    const fieldErrors = errors as Record<string, string | undefined>;

    const formattedAmount =
        amountApproved !== null ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amountApproved) : 'Not recorded';

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        post(CancelApprovedAssistanceRequestController.url({ assistanceRequestId: requestId }), {
            headers: { 'x-Municipality-Slug': currentMunicipality.slug },
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 ring-4 ring-rose-50">
                        <Ban className="h-6 w-6 text-rose-700" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Cancel Approved Request</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Use this only for an administrative correction before physical release. The approval remains in the audit history, while its
                        cooldown is ended so a corrected request can be filed.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2 sm:space-y-6 sm:pt-4">
                    <div className="grid grid-cols-1 gap-3 rounded-lg border border-rose-100 bg-rose-50/60 px-4 py-3 sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] font-bold tracking-widest text-rose-700 uppercase">Transaction</p>
                            <p className="mt-1 font-mono text-sm font-semibold break-all text-rose-950">{transactionNumber}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold tracking-widest text-rose-700 uppercase">Previously Approved</p>
                            <p className="mt-1 text-sm font-semibold text-rose-950">{formattedAmount}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="approved_cancellation_reason" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Administrative Correction Reason
                        </Label>
                        <Textarea
                            id="approved_cancellation_reason"
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            placeholder="e.g. Incorrectly encoded as filed for self. Burial assistance must be filed on behalf of the deceased household member."
                            rows={4}
                            className="resize-none"
                        />
                        {errors.reason && <p className="text-xs font-medium text-red-600">{errors.reason}</p>}
                        <p className="text-[11px] leading-4 text-slate-500">This reason becomes part of the restricted MSWD case record.</p>
                    </div>

                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="confirm_not_released"
                                checked={data.confirm_not_released}
                                onCheckedChange={(checked) => setData('confirm_not_released', checked === true)}
                                className="mt-0.5"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="confirm_not_released" className="text-sm leading-5 font-medium text-slate-800">
                                    I confirm no funds were physically released
                                </Label>
                                <p className="text-xs leading-5 text-slate-500">Released assistance cannot use this correction workflow.</p>
                                {errors.confirm_not_released && <p className="text-xs font-medium text-red-600">{errors.confirm_not_released}</p>}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                            <Checkbox
                                id="confirm_papers_handled"
                                checked={data.confirm_papers_handled}
                                onCheckedChange={(checked) => setData('confirm_papers_handled', checked === true)}
                                className="mt-0.5"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="confirm_papers_handled" className="text-sm leading-5 font-medium text-slate-800">
                                    Printed financial documents will be marked cancelled or destroyed
                                </Label>
                                <p className="text-xs leading-5 text-slate-500">
                                    Generated ObR, DV, and certificate files are stateless and cannot be recalled by the system.
                                </p>
                                {errors.confirm_papers_handled && <p className="text-xs font-medium text-red-600">{errors.confirm_papers_handled}</p>}
                            </div>
                        </div>
                    </div>

                    {fieldErrors.cancel_approved && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                            {fieldErrors.cancel_approved}
                        </p>
                    )}

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
                            Keep Approved
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing}
                            className="w-full bg-rose-700 text-white hover:bg-rose-800 sm:w-auto"
                        >
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

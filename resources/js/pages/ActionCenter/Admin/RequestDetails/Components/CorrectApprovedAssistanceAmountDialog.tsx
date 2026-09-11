import CorrectApprovedAssistanceAmountController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/CorrectApprovedAssistanceAmountController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { CircleDollarSign, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    requestId: string;
    transactionNumber: string;
    currentAmount: number;
    minAmount?: number | null;
    maxAmount?: number | null;
    isOpen: boolean;
    onClose: () => void;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);

export default function CorrectApprovedAssistanceAmountDialog({
    requestId,
    transactionNumber,
    currentAmount,
    minAmount,
    maxAmount,
    isOpen,
    onClose,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount_approved: currentAmount.toFixed(2),
        reason: '',
        confirm: false as boolean,
    });
    const fieldErrors = errors as Record<string, string | undefined>;

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        post(CorrectApprovedAssistanceAmountController.url({ assistanceRequestId: requestId }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
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
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-50">
                        <CircleDollarSign className="h-6 w-6 text-amber-700" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Correct Approved Amount</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Correct an encoding mistake in an approved, unreleased request. The original approval remains recorded and this correction is
                        added to Audit Trails.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2 sm:space-y-6 sm:pt-4">
                    <div className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">Request</p>
                            <p className="mt-1 font-mono text-sm font-semibold break-all text-amber-950">{transactionNumber}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">Current Amount</p>
                            <p className="mt-1 text-sm font-bold text-amber-950">{formatCurrency(currentAmount)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="correct_amount_approved" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Corrected Approved Amount (PHP)
                        </Label>
                        <div className="relative">
                            <span className="absolute top-2.5 left-3 font-semibold text-slate-400">₱</span>
                            <Input
                                id="correct_amount_approved"
                                type="number"
                                min={minAmount ?? 0.01}
                                max={maxAmount ?? 99999999.99}
                                step="0.01"
                                className="pl-7"
                                value={data.amount_approved}
                                onChange={(event) => setData('amount_approved', event.target.value)}
                            />
                        </div>
                        {minAmount != null && maxAmount != null && (
                            <p className="text-[11px] text-slate-500">
                                Program limits: {formatCurrency(minAmount)} - {formatCurrency(maxAmount)}
                            </p>
                        )}
                        {fieldErrors.amount_approved && <p className="text-xs font-medium text-red-600">{fieldErrors.amount_approved}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="approved_amount_correction_reason" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Administrative Correction Reason
                        </Label>
                        <Textarea
                            id="approved_amount_correction_reason"
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            placeholder="State the authorized source document and why the recorded amount was incorrect."
                            rows={4}
                            className="resize-none"
                        />
                        {fieldErrors.reason && <p className="text-xs font-medium text-red-600">{fieldErrors.reason}</p>}
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <Checkbox
                            id="confirm_amount_correction"
                            checked={data.confirm}
                            onCheckedChange={(checked) => setData('confirm', checked === true)}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1.5">
                            <Label htmlFor="confirm_amount_correction" className="text-sm leading-5 font-medium text-slate-800">
                                I confirmed the corrected amount against the authorized source document.
                            </Label>
                            <p className="text-xs leading-5 text-slate-500">
                                Previously generated Certificate, ObR, DV, packet, and Acknowledgement Receipt must be regenerated before printing or
                                release.
                            </p>
                            {fieldErrors.confirm && <p className="text-xs font-medium text-red-600">{fieldErrors.confirm}</p>}
                        </div>
                    </div>

                    {fieldErrors.correct_approved_amount && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                            {fieldErrors.correct_approved_amount}
                        </p>
                    )}

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="w-full bg-amber-700 text-white hover:bg-amber-800 sm:w-auto">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CircleDollarSign className="mr-2 h-4 w-4" />}
                            Correct Amount
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

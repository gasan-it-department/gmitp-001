import ReleaseAssistanceRequestController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ReleaseAssistanceRequestController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { Banknote, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    requestId: string;
    amountApproved?: number | null;
    isOpen: boolean;
    onClose: () => void;
}

function todayDateInputValue(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Mark-as-Released modal — the cashier event.
 *
 * Captures the OR / voucher number from the cashier's manual receipt book
 * so the digital record can be tied back to the physical paper trail at
 * audit time. The reference number is UNIQUE per municipality (enforced
 * by both the action and a DB index) so a duplicate raises a clear error.
 *
 * The confirm checkbox is here for the same reason it's on Approve:
 * Released is the COA-immutable terminal state. Once committed, the row
 * cannot be edited — corrections must be a new entry. The checkbox forces
 * the cashier to acknowledge that gravity before submitting.
 */
export default function ReleaseRequestDialog({ requestId, amountApproved, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        release_reference_number: '',
        release_date: todayDateInputValue(),
        release_notes: '',
        confirm: false as boolean,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(ReleaseAssistanceRequestController.url({ assistanceRequestId: requestId }), {
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

    const formattedAmount =
        amountApproved != null ? new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountApproved) : null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 ring-4 ring-blue-50">
                        <Banknote className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Mark as Released</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Record the physical disbursement. Use the actual release date and the reference number from the supporting paper trail. This
                        entry is COA-immutable once submitted.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2 sm:space-y-6 sm:pt-4">
                    {formattedAmount && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                            <p className="text-[10px] font-bold tracking-widest text-blue-700 uppercase">Approved Amount Being Released</p>
                            <p className="mt-1 text-2xl font-bold text-blue-900">₱{formattedAmount}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="release_date" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Actual Release Date
                        </Label>
                        <Input
                            id="release_date"
                            type="date"
                            value={data.release_date}
                            max={todayDateInputValue()}
                            onChange={(e) => setData('release_date', e.target.value)}
                        />
                        {errors.release_date && <p className="text-xs font-medium text-red-500">{errors.release_date}</p>}
                        <p className="text-[11px] text-slate-400">
                            Use the date the beneficiary actually received the assistance, even if you encode it later.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="release_reference_number" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Release Reference No.
                        </Label>
                        <Input
                            id="release_reference_number"
                            type="text"
                            placeholder="e.g. OR-2026-001234, voucher, payroll, or receipt no."
                            value={data.release_reference_number}
                            onChange={(e) => setData('release_reference_number', e.target.value)}
                            autoComplete="off"
                        />
                        {errors.release_reference_number && <p className="text-xs font-medium text-red-500">{errors.release_reference_number}</p>}
                        <p className="text-[11px] text-slate-400">
                            Must match the physical OR, voucher, payroll, disbursement, or receipt reference. Cannot be reused across cases in this
                            municipality.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="release_notes" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Release Notes (Optional)
                        </Label>
                        <Textarea
                            id="release_notes"
                            placeholder="e.g. Released to beneficiary in person. Or: Released to spouse Juan Dela Cruz, SSS ID 1234..."
                            className="resize-none"
                            rows={3}
                            value={data.release_notes}
                            onChange={(e) => setData('release_notes', e.target.value)}
                        />
                        {errors.release_notes && <p className="text-xs font-medium text-red-500">{errors.release_notes}</p>}
                    </div>

                    <div className="flex items-start space-x-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <Checkbox
                            id="release_confirm"
                            checked={data.confirm}
                            onCheckedChange={(checked) => setData('confirm', checked === true)}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="release_confirm"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I confirm the funds have been physically released
                            </Label>
                            <p className="text-xs text-slate-500">
                                This entry will be COA-immutable. Any future correction will require a new adjustment entry.
                            </p>
                            {errors.confirm && <p className="text-xs font-medium text-red-500">{errors.confirm}</p>}
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="w-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Banknote className="mr-2 h-4 w-4" />}
                            Confirm Release
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

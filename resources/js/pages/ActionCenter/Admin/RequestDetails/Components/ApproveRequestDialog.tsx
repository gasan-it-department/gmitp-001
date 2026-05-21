import ApproveAssistanceRequestController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ApproveAssistanceRequestController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    requestId: string;
    isOpen: boolean;
    onClose: () => void;
    minAmount?: number | null;
    maxAmount?: number | null;
}

export default function ApproveRequestDialog({ requestId, isOpen, onClose, minAmount, maxAmount }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount_approved: '',
        approval_notes: '',
        confirm: false as boolean,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(ApproveAssistanceRequestController.url({ assistanceRequestId: requestId }), {
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Approve Request</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Specify the approved amount and provide COA-required approval notes. This action will lock the amount and start the
                        applicant's cooldown period.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount_approved" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Approved Amount (PHP)
                        </Label>
                        <div className="relative">
                            <span className="absolute top-2.5 left-3 font-semibold text-slate-400">₱</span>
                            <Input
                                id="amount_approved"
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                className="pl-7"
                                value={data.amount_approved}
                                onChange={(e) => setData('amount_approved', e.target.value)}
                            />
                        </div>
                        {minAmount != null && maxAmount != null && (
                            <p className="text-[11px] text-slate-500">
                                Program limits: ₱{minAmount} - ₱{maxAmount}
                            </p>
                        )}
                        {errors.amount_approved && <p className="text-xs font-medium text-red-500">{errors.amount_approved}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="approval_notes" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Approval Notes (COA Basis)
                        </Label>
                        <Textarea
                            id="approval_notes"
                            placeholder="State the basis for approval (min. 10 chars)..."
                            className="resize-none"
                            rows={3}
                            value={data.approval_notes}
                            onChange={(e) => setData('approval_notes', e.target.value)}
                        />
                        {errors.approval_notes && <p className="text-xs font-medium text-red-500">{errors.approval_notes}</p>}
                    </div>

                    <div className="flex items-start space-x-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <Checkbox
                            id="confirm"
                            checked={data.confirm}
                            onCheckedChange={(checked) => setData('confirm', checked === true)}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="confirm"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I understand this is COA-immutable
                            </Label>
                            <p className="text-xs text-slate-500">This will commit the funds and enforce a cooldown for this household.</p>
                            {errors.confirm && <p className="text-xs font-medium text-red-500">{errors.confirm}</p>}
                        </div>
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
                        <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Confirm Approval
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

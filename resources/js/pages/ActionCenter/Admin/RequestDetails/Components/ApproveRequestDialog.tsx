import ApproveAssistanceRequestController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ApproveAssistanceRequestController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CooldownAdvisory } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    requestId: string;
    isOpen: boolean;
    onClose: () => void;
    minAmount?: number | null;
    maxAmount?: number | null;
    cooldownAdvisory: CooldownAdvisory;
}

export default function ApproveRequestDialog({ requestId, isOpen, onClose, minAmount, maxAmount, cooldownAdvisory }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount_approved: '',
        approval_notes: '',
        cooldown_context_fingerprint: cooldownAdvisory.context_fingerprint,
        cooldown_exception_reason: '',
        confirm: false as boolean,
    });

    useEffect(() => {
        setData('cooldown_context_fingerprint', cooldownAdvisory.context_fingerprint);
    }, [cooldownAdvisory.context_fingerprint, setData]);

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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <DialogHeader className="flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Record Authorized Amount</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Record the Mayor-authorized amount and provide the approval basis. The cooldown starts only when assistance is physically
                        released; MSWD verification remains a separate step.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2 sm:space-y-6 sm:pt-4">
                    {cooldownAdvisory.active && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                            <div className="flex items-start gap-2 font-semibold">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                                Timed cooldown exception required
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-amber-800">
                                {cooldownAdvisory.sources.length} prior release{cooldownAdvisory.sources.length === 1 ? '' : 's'} applies until{' '}
                                {cooldownAdvisory.effective_expires_at
                                    ? new Date(cooldownAdvisory.effective_expires_at).toLocaleDateString('en-PH')
                                    : 'a later date'}
                                .
                            </p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="amount_approved" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Authorized Amount (PHP)
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

                    {cooldownAdvisory.active && (
                        <div className="space-y-2">
                            <Label htmlFor="cooldown_exception_reason" className="text-xs font-bold tracking-widest text-amber-700 uppercase">
                                Cooldown Exception Reason
                            </Label>
                            <Textarea
                                id="cooldown_exception_reason"
                                placeholder="Explain why another grant is being authorized during the active cooldown..."
                                rows={3}
                                value={data.cooldown_exception_reason}
                                onChange={(e) => setData('cooldown_exception_reason', e.target.value)}
                            />
                            {errors.cooldown_exception_reason && (
                                <p className="text-xs font-medium text-red-500">{errors.cooldown_exception_reason}</p>
                            )}
                        </div>
                    )}

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
                                I understand this amount is locked after recording
                            </Label>
                            <p className="text-xs text-slate-500">
                                This records the amount decision. Any new cooldown begins only on physical release.
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
                        <Button type="submit" disabled={processing} className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Record Amount
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

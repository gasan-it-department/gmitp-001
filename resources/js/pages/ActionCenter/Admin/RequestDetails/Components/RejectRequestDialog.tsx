import RejectAssistanceRequestController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/RejectAssistanceRequestController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { Loader2, XCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    requestId: string;
    applicantName?: string;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Reject Assistance Request modal.
 *
 * Intentionally simpler than ApproveRequestDialog:
 *   - one required field (remarks) — the citizen-facing reason
 *   - no amount, no confirm checkbox
 *
 * The 10-char-min textarea IS the deliberate act; rejection is reversible
 * via the "Reopen" flow, so an extra checkbox would be friction without
 * compliance value.
 */
export default function RejectRequestDialog({ requestId, applicantName, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        remarks: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(RejectAssistanceRequestController.url({ assistanceRequestId: requestId }), {
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 ring-4 ring-rose-50">
                        <XCircle className="h-6 w-6 text-rose-600" />
                    </div>
                    <DialogTitle className="text-xl text-slate-900">Reject Request</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        {applicantName
                            ? `Provide the reason ${applicantName}'s request is being denied. `
                            : 'Provide the reason this request is being denied. '}
                        The reason is recorded on the case file and the applicant will be notified.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="remarks" className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                            Reason for Rejection
                        </Label>
                        <Textarea
                            id="remarks"
                            placeholder="e.g. Applicant did not meet the income threshold for this program (min. 5 chars)…"
                            className="resize-none"
                            rows={4}
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                        />
                        {errors.remarks && <p className="text-xs font-medium text-red-500">{errors.remarks}</p>}
                        <p className="text-[11px] text-slate-400">
                            Be specific — this text appears on the case record and is what the citizen will read.
                        </p>
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
                        <Button type="submit" disabled={processing} variant="destructive" className="bg-rose-600 text-white hover:bg-rose-700">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

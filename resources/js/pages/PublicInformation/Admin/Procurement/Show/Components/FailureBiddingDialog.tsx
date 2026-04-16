import { DatePicker } from '@/components/Shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Using Textarea because reasons can be long
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { ProcurementDetail } from '@/Core/Types/Procurement/procurement';
import procurementApi from '@/routes/procurement';
import { useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    procurement: ProcurementDetail;
}

export const FailureBiddingDialog = ({ isOpen, onClose, procurement }: Props) => {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    // 📦 Initialize Form with today's date pre-filled!
    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        failure_reason: '',
        // Format today's date as YYYY-MM-DD for the DatePicker default
        failed_date: new Date().toISOString().split('T')[0],
    });

    // 🛡️ Client-Side UX Guards
    const isFutureDate = data.failed_date && new Date(data.failed_date) > new Date();
    const isReasonTooShort = data.failure_reason.trim().length < 5;

    // Reset form when dialog closes/opens
    useEffect(() => {
        if (isOpen) {
            setData('failed_date', new Date().toISOString().split('T')[0]);
            setData('failure_reason', '');
            clearErrors();
        }
    }, [isOpen]);

    const handleClose = () => {
        clearErrors();
        reset();
        onClose();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        // Adjust this to match your actual named route for declaring failure
        put(procurementApi.fail.url(procurement.id), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => handleClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="border-red-100 sm:max-w-lg">
                <form onSubmit={submit}>
                    {/* HEADER: Warning Theme for Failure */}
                    <DialogHeader className="mb-4 flex flex-row items-center gap-4 space-y-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col text-left">
                            <DialogTitle className="text-lg font-bold text-slate-900">Declare Failure of Bidding</DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                                This will halt the procurement process. A valid reason must be provided for the BAC resolution.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* MAIN FORM BODY */}
                    <div className="space-y-5 py-2">
                        {/* 1. Date of Failure */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="failed_date" className="text-slate-700">
                                    Official Date of Failure <span className="text-red-500">*</span>
                                </Label>
                                <span className="text-xs font-medium text-slate-500">Must match BAC Resolution</span>
                            </div>
                            <DatePicker
                                label=""
                                value={data.failed_date}
                                onChange={(val) => setData('failed_date', val)}
                                error={errors.failed_date}
                                disableFuture={true} // 🌟 Utilizing your new DatePicker prop!
                            />
                            {errors.failed_date && <span className="block text-xs font-medium text-destructive">{errors.failed_date}</span>}
                            {isFutureDate && (
                                <span className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
                                    <AlertTriangle className="h-3 w-3" /> Date cannot be in the future!
                                </span>
                            )}
                        </div>

                        {/* 2. Reason for Failure */}
                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-slate-700">
                                Reason for Failure <span className="text-red-500">*</span>
                            </Label>
                            {/* Using Textarea instead of Input so they can write a full sentence */}
                            <Textarea
                                id="reason"
                                placeholder="e.g., No bids were received by the deadline, or all bidders failed the post-qualification."
                                value={data.failure_reason}
                                onChange={(e) => setData('failure_reason', e.target.value)}
                                className={`min-h-[100px] resize-none ${errors.failure_reason ? 'border-destructive' : ''}`}
                                required
                            />
                            {errors.failure_reason && <span className="text-xs font-medium text-destructive">{errors.failure_reason}</span>}
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <DialogFooter className="mt-6 gap-2 sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || isFutureDate || isReasonTooShort}
                            className="flex items-center gap-2 bg-red-600 font-bold text-white hover:bg-red-700"
                        >
                            {processing ? (
                                'Processing...'
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4" /> Confirm Failure
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

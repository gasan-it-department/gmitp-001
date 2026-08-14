import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import procurement from '@/routes/procurement';
import { useForm, usePage } from '@inertiajs/react';
import { Ban, Info } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    procurementId: string;
}

export function CancelProcurementDialog({ isOpen, onClose, procurementId }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({ cancellation_reason: '' });
    const reasonLength = data.cancellation_reason.trim().length;
    const actionError = (errors as Record<string, string>).procurement;

    useEffect(() => {
        if (isOpen) clearErrors();
    }, [clearErrors, isOpen]);

    const handleClose = () => {
        if (processing) return;
        clearErrors();
        reset();
        onClose();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        patch(procurement.cancel.url(procurementId), {
            preserveScroll: true,
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            onSuccess: handleClose,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit}>
                    <DialogHeader className="text-left">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                            <Ban className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <DialogTitle>Cancel procurement?</DialogTitle>
                        <DialogDescription>
                            Cancellation ends the active procurement. The official reason will be shown to citizens with the retained public record.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-5 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="cancellation_reason">Official cancellation reason</Label>
                            <span className="text-xs text-slate-500">{reasonLength}/1000</span>
                        </div>
                        <Textarea
                            id="cancellation_reason"
                            value={data.cancellation_reason}
                            onChange={(event) => setData('cancellation_reason', event.target.value.slice(0, 1000))}
                            aria-invalid={Boolean(errors.cancellation_reason)}
                            aria-describedby="cancellation-help"
                            placeholder="State the BAC resolution or plain-language reason for cancelling this procurement."
                            className={`min-h-28 resize-y ${errors.cancellation_reason ? 'border-destructive' : ''}`}
                            required
                        />
                        <p id="cancellation-help" className="flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Do not include private bidder information. Write this for a public audience.
                        </p>
                        {errors.cancellation_reason && (
                            <p role="alert" className="text-sm font-medium text-destructive">
                                {errors.cancellation_reason}
                            </p>
                        )}
                        {actionError && (
                            <p
                                role="alert"
                                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive"
                            >
                                {actionError}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Keep active
                        </Button>
                        <Button type="submit" variant="destructive" disabled={processing || reasonLength < 5}>
                            {processing ? 'Cancelling...' : 'Confirm cancellation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import procurement from '@/routes/procurement';
import { useForm, usePage } from '@inertiajs/react';
import { EyeOff, Info } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    procurementId: string;
    title: string;
}

export function UnpublishProcurementDialog({ isOpen, onClose, procurementId, title }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({ correction_reason: '' });
    const reasonLength = data.correction_reason.trim().length;
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
        patch(procurement.unpublish.url(procurementId), {
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
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <DialogTitle>Unpublish for correction?</DialogTitle>
                        <DialogDescription>
                            <span className="font-medium text-slate-700">{title}</span> and its documents will immediately disappear from the citizen
                            transparency portal. Its lifecycle status will not change.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-5 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="correction_reason">Reason for correction</Label>
                            <span className="text-xs text-slate-500">{reasonLength}/1000</span>
                        </div>
                        <Textarea
                            id="correction_reason"
                            value={data.correction_reason}
                            onChange={(event) => setData('correction_reason', event.target.value.slice(0, 1000))}
                            aria-invalid={Boolean(errors.correction_reason)}
                            aria-describedby="correction-help"
                            placeholder="Example: The attached bid document contained information that must be redacted."
                            className={`min-h-28 resize-y ${errors.correction_reason ? 'border-destructive' : ''}`}
                            required
                        />
                        <p id="correction-help" className="flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            This reason is saved in the activity log. After correcting the details or documents, publish the record again.
                        </p>
                        {errors.correction_reason && (
                            <p role="alert" className="text-sm font-medium text-destructive">
                                {errors.correction_reason}
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
                            Keep published
                        </Button>
                        <Button type="submit" className="bg-amber-700 text-white hover:bg-amber-800" disabled={processing || reasonLength < 5}>
                            {processing ? 'Unpublishing...' : 'Unpublish and correct'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

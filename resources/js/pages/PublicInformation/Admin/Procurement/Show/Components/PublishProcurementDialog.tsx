import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import procurement from '@/routes/procurement';
import { useForm, usePage } from '@inertiajs/react';
import { Globe2, ShieldAlert } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    procurementId: string;
    title: string;
    hasSupportingDocuments: boolean;
}

export function PublishProcurementDialog({ isOpen, onClose, procurementId, title, hasSupportingDocuments }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { patch, processing, errors, clearErrors } = useForm<Record<string, never>>({});
    const actionError = (errors as Record<string, string>).procurement;

    const handleClose = () => {
        if (processing) return;
        clearErrors();
        onClose();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        patch(procurement.publish.url(procurementId), {
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
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                            <Globe2 className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <DialogTitle>Publish procurement to citizens?</DialogTitle>
                        <DialogDescription>
                            This makes <span className="font-semibold text-slate-700">{title}</span> and any attached documents visible in the citizen
                            transparency portal. The current lifecycle status will not change.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <div className="flex items-start gap-2.5">
                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <p>
                                Review the funding source, public-purpose description, amounts, and outcome before publishing. Published records are
                                locked against ordinary editing and deletion to preserve the public record.
                            </p>
                        </div>
                    </div>

                    {!hasSupportingDocuments && (
                        <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                            No supporting PDF is attached yet. This does not block publication; documents may be uploaded later.
                        </div>
                    )}

                    {actionError ? (
                        <p role="alert" className="mb-4 text-sm font-medium text-destructive">
                            {actionError}
                        </p>
                    ) : (
                        errors &&
                        Object.keys(errors).length > 0 && (
                            <p role="alert" className="mb-4 text-sm font-medium text-destructive">
                                The record could not be published. Complete the missing required information and try again.
                            </p>
                        )
                    )}

                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Keep private
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-sky-700 text-white hover:bg-sky-800">
                            {processing ? 'Publishing...' : 'Publish to citizens'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

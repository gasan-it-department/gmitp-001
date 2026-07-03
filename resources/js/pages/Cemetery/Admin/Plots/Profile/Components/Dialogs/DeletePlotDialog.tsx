import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CemeterySiteListItem, DeletePlotForm, PlotProfile as PlotProfileType } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function DeletePlotDialog({
    municipality,
    site,
    plot,
    open: externalOpen,
    onOpenChange: setExternalOpen,
}: {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;
    const isApartment = plot.occupancy_mode === 'slotted';
    const isChildSlot = plot.parent_plot_id !== null;
    const form = useForm<DeletePlotForm>({
        reason: '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData('reason', '');
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.delete(`/api/cemetery-sites/${site.id}/plots/${plot.id}`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            {externalOpen === undefined && (
                <Button type="button" variant="outline" onClick={() => setOpen(true)} className="w-full justify-start text-left font-normal text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 size={16} className="mr-2" />
                    {isApartment ? 'Delete Apartment' : isChildSlot ? 'Delete Slot' : 'Delete Plot'}
                </Button>
            )}
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>{isApartment ? 'Delete Apartment?' : isChildSlot ? 'Delete Slot?' : 'Delete Plot?'}</DialogTitle>
                        <DialogDescription>
                            This is only for setup mistakes. The record will be permanently deleted and can only proceed when there is no interment or
                            lease history.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-5 space-y-4">
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <div className="flex gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>
                                    {isApartment
                                        ? 'Deleting this apartment also permanently deletes all unused child niches.'
                                        : isChildSlot
                                          ? 'Only this unused niche slot will be deleted. The parent apartment and other slots will remain.'
                                          : 'Used plots are preserved permanently and should be marked maintenance instead.'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delete-reason">Deletion reason</Label>
                            <Textarea
                                id="delete-reason"
                                value={form.data.reason}
                                maxLength={1000}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Explain why this setup record should be removed."
                                className="min-h-28"
                            />
                            {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                            {form.errors.plot && <p className="text-sm text-red-600">{form.errors.plot}</p>}
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={form.processing || form.data.reason.trim().length === 0}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isApartment ? 'Delete Apartment' : isChildSlot ? 'Delete Slot' : 'Delete Plot'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CemeterySiteListItem, ChangePlotOccupancyForm, PlotOccupancyModeValue, PlotProfile as PlotProfileType, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm } from '@inertiajs/react';
import { Loader2, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function ChangeOccupancyDialog({
    municipality,
    site,
    plot,
    occupancyModeOptions,
    open: externalOpen,
    onOpenChange: setExternalOpen,
}: {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    occupancyModeOptions: SelectOption<Extract<PlotOccupancyModeValue, 'single' | 'shared'>>[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;
    const form = useForm<ChangePlotOccupancyForm>({
        occupancy_mode: plot.occupancy_mode === 'shared' ? 'shared' : 'single',
        capacity: plot.capacity,
        reason: '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({
            occupancy_mode: plot.occupancy_mode === 'shared' ? 'shared' : 'single',
            capacity: plot.capacity,
            reason: '',
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/api/cemetery-sites/${site.id}/plots/${plot.id}/occupancy`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            {externalOpen === undefined && (
                <Button type="button" variant="outline" onClick={() => setOpen(true)} className="w-full justify-start text-left font-normal">
                    <Users size={16} className="mr-2" />
                    Change Occupancy
                </Button>
            )}
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Change Occupancy</DialogTitle>
                        <DialogDescription>
                            Shared occupancy means the same physical plot can hold more than one decedent up to its capacity.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 grid gap-4">
                        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                            Current active interments: <strong>{plot.active_interments_count}</strong>
                        </div>
                        <div className="space-y-2">
                            <Label>Occupancy mode</Label>
                            <Select
                                value={form.data.occupancy_mode}
                                onValueChange={(value) => form.setData('occupancy_mode', value as 'single' | 'shared')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select occupancy" />
                                </SelectTrigger>
                                <SelectContent>
                                    {occupancyModeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.occupancy_mode && <p className="text-sm text-red-600">{form.errors.occupancy_mode}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="plot-capacity">Capacity</Label>
                            <Input
                                id="plot-capacity"
                                type="number"
                                min={form.data.occupancy_mode === 'shared' ? 2 : 1}
                                max={50}
                                value={form.data.capacity}
                                onChange={(event) => form.setData('capacity', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                            {form.errors.capacity && <p className="text-sm text-red-600">{form.errors.capacity}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="occupancy-reason">Reason</Label>
                            <Textarea
                                id="occupancy-reason"
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Explain why this plot capacity or occupancy mode is being changed."
                                className="min-h-24"
                            />
                            {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Occupancy
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

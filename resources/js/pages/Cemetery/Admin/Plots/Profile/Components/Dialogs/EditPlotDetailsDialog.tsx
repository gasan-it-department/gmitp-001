import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CemeterySiteListItem, PlotProfile as PlotProfileType, PlotTypeValue, SelectOption, UpdatePlotDetailsForm } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm } from '@inertiajs/react';
import { Edit3, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function EditPlotDetailsDialog({
    municipality,
    site,
    plot,
    typeOptions,
}: {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    typeOptions: SelectOption<PlotTypeValue>[];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<UpdatePlotDetailsForm>({
        name: plot.name ?? '',
        type: plot.type ?? '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({ name: plot.name ?? '', type: plot.type ?? '' });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/api/cemetery-sites/${site.id}/plots/${plot.id}/details`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <Button type="button" variant="secondary" onClick={() => setOpen(true)} size="sm">
                <Edit3 size={14} className="mr-2" />
                Edit Details
            </Button>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Edit Plot Details</DialogTitle>
                        <DialogDescription>Only standard plot labels and standard plot types are editable in this version.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plot-name">Plot name</Label>
                            <Input
                                id="plot-name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder="e.g. LOT 737"
                            />
                            {form.errors.name && <p className="text-sm text-red-600">{form.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Plot type</Label>
                            <Select value={form.data.type} onValueChange={(value) => form.setData('type', value as PlotTypeValue)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.type && <p className="text-sm text-red-600">{form.errors.type}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Details
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AddApartmentNichesForm, CemeterySiteListItem, PlotProfile as PlotProfileType } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm } from '@inertiajs/react';
import { Boxes, Loader2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { buildApartmentSlotName, FormField } from '../Helpers';

export function AddNicheSlotsDialog({ plot, municipality, site }: { plot: PlotProfileType; municipality: MunicipalityType; site: CemeterySiteListItem }) {
    const [open, setOpen] = useState(false);
    const form = useForm<AddApartmentNichesForm>({
        start_floor: 1,
        floors: 1,
        start_row: 1,
        rows_per_floor: 1,
        start_niche: 1,
        niches_per_row: 1,
        row_prefix: 'R',
        niche_prefix: 'N',
        niche_padding: 2,
        capacity_per_niche: 1,
    });
    const apartmentName = plot.name ?? plot.slot_label;
    const totalSlots =
        typeof form.data.floors === 'number' && typeof form.data.rows_per_floor === 'number' && typeof form.data.niches_per_row === 'number'
            ? form.data.floors * form.data.rows_per_floor * form.data.niches_per_row
            : 0;

    const preview = useMemo(() => {
        if (
            typeof form.data.start_floor !== 'number' ||
            typeof form.data.start_row !== 'number' ||
            typeof form.data.start_niche !== 'number' ||
            typeof form.data.floors !== 'number' ||
            typeof form.data.rows_per_floor !== 'number' ||
            typeof form.data.niches_per_row !== 'number'
        ) {
            return [];
        }

        const slots: string[] = [];
        const visibleRows = Math.min(form.data.rows_per_floor, 2);
        const visibleNiches = Math.min(form.data.niches_per_row, 3);

        for (let row = form.data.start_row; row < form.data.start_row + visibleRows; row++) {
            for (let niche = form.data.start_niche; niche < form.data.start_niche + visibleNiches; niche++) {
                slots.push(
                    buildApartmentSlotName(
                        apartmentName,
                        form.data.start_floor,
                        form.data.row_prefix,
                        row,
                        form.data.niche_prefix,
                        niche,
                        form.data.niche_padding,
                    ),
                );
            }
        }

        return slots;
    }, [apartmentName, form.data]);

    const finalName = useMemo(() => {
        if (
            typeof form.data.start_floor !== 'number' ||
            typeof form.data.start_row !== 'number' ||
            typeof form.data.start_niche !== 'number' ||
            typeof form.data.floors !== 'number' ||
            typeof form.data.rows_per_floor !== 'number' ||
            typeof form.data.niches_per_row !== 'number'
        ) {
            return null;
        }

        return buildApartmentSlotName(
            apartmentName,
            form.data.start_floor + form.data.floors - 1,
            form.data.row_prefix,
            form.data.start_row + form.data.rows_per_floor - 1,
            form.data.niche_prefix,
            form.data.start_niche + form.data.niches_per_row - 1,
            form.data.niche_padding,
        );
    }, [apartmentName, form.data]);

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/api/cemetery-sites/${site.id}/plots/${plot.id}/niches`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <Button type="button" variant="outline" onClick={() => setOpen(true)} size="sm">
                <Boxes size={14} className="mr-2" />
                Add Niche Slots
            </Button>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={submit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>Add Niche Slots</DialogTitle>
                        <DialogDescription>
                            Adding slots under {apartmentName}. Existing niche labels are protected from duplicates.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Start Floor" error={form.errors.start_floor}>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.start_floor}
                                onChange={(event) => form.setData('start_floor', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </FormField>
                        <FormField label="Floors To Add" error={form.errors.floors}>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.floors}
                                onChange={(event) => form.setData('floors', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </FormField>
                        <FormField label="Start Row Number" error={form.errors.start_row}>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.start_row}
                                onChange={(event) => form.setData('start_row', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </FormField>
                        <FormField label="Rows Per Floor To Add" error={form.errors.rows_per_floor}>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.rows_per_floor}
                                onChange={(event) => form.setData('rows_per_floor', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </FormField>
                        <FormField label="Start Niche Number" error={form.errors.start_niche}>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.start_niche}
                                onChange={(event) => form.setData('start_niche', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </FormField>
                        <FormField label="Niches Per Row To Add" error={form.errors.niches_per_row}>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.niches_per_row}
                                onChange={(event) => form.setData('niches_per_row', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </FormField>
                        <FormField label="Row Prefix" error={form.errors.row_prefix}>
                            <Input value={form.data.row_prefix} onChange={(event) => form.setData('row_prefix', event.target.value)} />
                        </FormField>
                        <FormField label="Niche Prefix" error={form.errors.niche_prefix}>
                            <Input value={form.data.niche_prefix} onChange={(event) => form.setData('niche_prefix', event.target.value)} />
                        </FormField>
                        <FormField label="Niche Padding" error={form.errors.niche_padding}>
                            <Input
                                type="number"
                                min={0}
                                value={form.data.niche_padding}
                                onChange={(event) => form.setData('niche_padding', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </FormField>
                        <FormField label="Capacity Per Niche" error={form.errors.capacity_per_niche}>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.capacity_per_niche}
                                onChange={(event) => form.setData('capacity_per_niche', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </FormField>
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                            <p className="font-semibold">Total Slots To Add</p>
                            <p className="mt-1 text-2xl font-bold tabular-nums">{totalSlots || 0}</p>
                            <p className="text-xs text-emerald-700">Maximum 500 slots per request.</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Preview</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {preview.length === 0 ? (
                                <span className="text-sm text-slate-500">Enter slot details to preview generated niche labels.</span>
                            ) : (
                                preview.map((name) => (
                                    <span
                                        key={name}
                                        className="rounded-md bg-white px-2.5 py-1 font-mono text-xs text-slate-700 ring-1 ring-slate-200"
                                    >
                                        {name}
                                    </span>
                                ))
                            )}
                            {finalName && preview[preview.length - 1] !== finalName && (
                                <>
                                    <span className="px-1 text-xs text-slate-400">...</span>
                                    <span className="rounded-md bg-white px-2.5 py-1 font-mono text-xs text-slate-700 ring-1 ring-slate-200">
                                        {finalName}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Niche Slots
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

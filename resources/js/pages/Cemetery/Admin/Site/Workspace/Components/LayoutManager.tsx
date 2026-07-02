import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    BulkGeneratePlotsForm,
    CemeteryBlockListItem,
    CemeterySectionListItem,
    CemeterySiteListItem,
    CreateCemeteryBlockForm,
    CreateCemeterySectionForm,
    GenerateApartmentNichesForm,
    PlotTypeValue,
    SelectOption,
} from '@/Core/Types/Cemetery/cemetery';
import { useForm } from '@inertiajs/react';
import { Boxes, Eye, Layers3, Plus, Rows3 } from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';

interface Props {
    site: CemeterySiteListItem;
    layout: CemeterySectionListItem[];
    municipalitySlug: string;
    typeOptions: SelectOption<PlotTypeValue>[];
    onViewPlots: () => void;
}

export function LayoutManager({ site, layout, municipalitySlug, typeOptions, onViewPlots }: Props) {
    const active = site.status === 'active';

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Cemetery Layout</h2>
                    <p className="text-sm text-slate-500">Build the site in the same order staff use on paper: Section, Block, then Lots.</p>
                </div>
                {active && <CreateSectionDialog siteId={site.id} municipalitySlug={municipalitySlug} />}
            </div>

            {layout.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <Layers3 className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-3 font-semibold text-slate-900">No sections yet</h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                        Start with a Section or Area such as NEW ANNEX, OLD AREA, PHASE 1, or any term the LGU actually uses.
                    </p>
                    {active && (
                        <div className="mt-4">
                            <CreateSectionDialog siteId={site.id} municipalitySlug={municipalitySlug} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {layout.map((section) => (
                        <div key={section.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-slate-50/80 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Layers3 className="h-4 w-4 text-emerald-700" />
                                            <h3 className="font-semibold text-slate-900">{section.name}</h3>
                                            <StatusPill status={section.status} />
                                        </div>
                                        {section.description && <p className="mt-1 text-sm text-slate-500">{section.description}</p>}
                                    </div>
                                    {active && section.status === 'active' && (
                                        <CreateBlockDialog siteId={site.id} section={section} municipalitySlug={municipalitySlug} />
                                    )}
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {section.blocks.length === 0 ? (
                                    <div className="p-5 text-sm text-slate-500">
                                        No blocks yet. If the cemetery does not use blocks, create one named GENERAL.
                                    </div>
                                ) : (
                                    section.blocks.map((block) => (
                                        <BlockRow
                                            key={block.id}
                                            site={site}
                                            section={section}
                                            block={block}
                                            municipalitySlug={municipalitySlug}
                                            typeOptions={typeOptions}
                                            active={active && section.status === 'active' && block.status === 'active'}
                                            onViewPlots={onViewPlots}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function BlockRow({
    site,
    section,
    block,
    municipalitySlug,
    typeOptions,
    active,
    onViewPlots,
}: {
    site: CemeterySiteListItem;
    section: CemeterySectionListItem;
    block: CemeteryBlockListItem;
    municipalitySlug: string;
    typeOptions: SelectOption<PlotTypeValue>[];
    active: boolean;
    onViewPlots: () => void;
}) {
    return (
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <Rows3 className="h-4 w-4 text-slate-500" />
                    <p className="font-medium text-slate-900">{block.name}</p>
                    <StatusPill status={block.status} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <CountPill label="Total" value={block.counts.total} />
                    <CountPill label="Available" value={block.counts.available} tone="emerald" />
                    <CountPill label="Occupied" value={block.counts.occupied} tone="rose" />
                    <CountPill label="Maintenance" value={block.counts.maintenance} tone="amber" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={onViewPlots}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Plots
                </Button>
                {active && (
                    <>
                        <BulkGeneratePlotsDialog
                            siteId={site.id}
                            section={section}
                            block={block}
                            municipalitySlug={municipalitySlug}
                            typeOptions={typeOptions}
                        />
                        <GenerateApartmentNichesDialog siteId={site.id} section={section} block={block} municipalitySlug={municipalitySlug} />
                    </>
                )}
            </div>
        </div>
    );
}

function CreateSectionDialog({ siteId, municipalitySlug }: { siteId: string; municipalitySlug: string }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<CreateCemeterySectionForm>({
        name: '',
        description: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(`/api/cemetery-sites/${siteId}/sections`, {
            headers: { 'X-Municipality-Slug': municipalitySlug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-700 hover:bg-emerald-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Section
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Section / Area</DialogTitle>
                    <DialogDescription>Use the cemetery's own wording, such as NEW ANNEX, OLD AREA, or PHASE 1.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Section Name" error={errors.name}>
                        <Input value={data.name} onChange={(event) => setData('name', event.target.value)} placeholder="e.g. NEW ANNEX" />
                    </Field>
                    <Field label="Description" error={errors.description}>
                        <Textarea
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            placeholder="Optional notes for staff"
                        />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-700 hover:bg-emerald-800">
                            {processing ? 'Saving...' : 'Save Section'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateBlockDialog({ siteId, section, municipalitySlug }: { siteId: string; section: CemeterySectionListItem; municipalitySlug: string }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<CreateCemeteryBlockForm>({
        name: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(`/api/cemetery-sites/${siteId}/sections/${section.id}/blocks`, {
            headers: { 'X-Municipality-Slug': municipalitySlug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Block
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Block / Row</DialogTitle>
                    <DialogDescription>Adding under {section.name}. Use GENERAL if this cemetery does not use blocks.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Block Name" error={errors.name}>
                        <Input value={data.name} onChange={(event) => setData('name', event.target.value)} placeholder="e.g. GENERAL" />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-700 hover:bg-emerald-800">
                            {processing ? 'Saving...' : 'Save Block'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function BulkGeneratePlotsDialog({
    siteId,
    section,
    block,
    municipalitySlug,
    typeOptions,
}: {
    siteId: string;
    section: CemeterySectionListItem;
    block: CemeteryBlockListItem;
    municipalitySlug: string;
    typeOptions: SelectOption<PlotTypeValue>[];
}) {
    const [open, setOpen] = useState(false);
    const standardPlotTypeOptions = useMemo(() => typeOptions.filter((option) => option.value !== 'apartment_niche'), [typeOptions]);
    const { data, setData, post, processing, errors, reset } = useForm<BulkGeneratePlotsForm>({
        label_prefix: 'LOT',
        start_number: '',
        quantity: 10,
        padding: 0,
        type: 'lawn_lot',
        capacity: 1,
    });

    const preview = useMemo(() => {
        if (!data.label_prefix.trim() || typeof data.quantity !== 'number' || typeof data.start_number !== 'number' || data.quantity < 1) {
            return [];
        }

        const quantity = data.quantity;
        const start = data.start_number;
        const padding = typeof data.padding === 'number' ? data.padding : 0;
        const visible = Math.min(quantity, 5);

        return Array.from({ length: visible }, (_, index) => buildPlotName(data.label_prefix, start + index, padding));
    }, [data.label_prefix, data.padding, data.quantity, data.start_number]);

    const finalName = useMemo(() => {
        if (typeof data.quantity !== 'number' || typeof data.start_number !== 'number' || data.quantity < 1) {
            return null;
        }

        return buildPlotName(data.label_prefix, data.start_number + data.quantity - 1, typeof data.padding === 'number' ? data.padding : 0);
    }, [data.label_prefix, data.padding, data.quantity, data.start_number]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(`/api/cemetery-sites/${siteId}/blocks/${block.id}/plots/bulk`, {
            headers: { 'X-Municipality-Slug': municipalitySlug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-700 hover:bg-emerald-800">
                    <Boxes className="mr-2 h-4 w-4" />
                    Generate Plots
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Generate Plots</DialogTitle>
                    <DialogDescription>
                        Creating standard plots in {section.name} / {block.name}. Use Generate Apartment Niches for apartment-style inventory.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Label Prefix" error={errors.label_prefix}>
                            <Input value={data.label_prefix} onChange={(event) => setData('label_prefix', event.target.value)} />
                        </Field>
                        <Field label="Start Number" error={errors.start_number}>
                            <Input
                                type="number"
                                value={data.start_number}
                                onChange={(event) => setData('start_number', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </Field>
                        <Field label="Quantity" error={errors.quantity}>
                            <Input
                                type="number"
                                value={data.quantity}
                                onChange={(event) => setData('quantity', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </Field>
                        <Field label="Padding" error={errors.padding}>
                            <Input
                                type="number"
                                value={data.padding}
                                onChange={(event) => setData('padding', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </Field>
                        <Field label="Plot Type" error={errors.type}>
                            <Select value={data.type} onValueChange={(value) => setData('type', value as PlotTypeValue)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select plot type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {standardPlotTypeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <span className="block text-xs text-slate-500">Apartment niches have their own generator.</span>
                        </Field>
                        <Field label="Capacity Per Plot" error={errors.capacity}>
                            <Input
                                type="number"
                                value={data.capacity}
                                onChange={(event) => setData('capacity', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                            <span className="block text-xs text-slate-500">Maximum decedents/remains this physical plot can hold.</span>
                        </Field>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Preview</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {preview.length === 0 ? (
                                <span className="text-sm text-slate-500">
                                    Enter a label prefix, start number, and quantity to preview generated plot names.
                                </span>
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
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-700 hover:bg-emerald-800">
                            {processing ? 'Generating...' : 'Generate Plots'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function GenerateApartmentNichesDialog({
    siteId,
    section,
    block,
    municipalitySlug,
}: {
    siteId: string;
    section: CemeterySectionListItem;
    block: CemeteryBlockListItem;
    municipalitySlug: string;
}) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<GenerateApartmentNichesForm>({
        apartment_name: 'APARTMENT A',
        start_floor: 1,
        floors: 4,
        start_row: 1,
        rows_per_floor: 3,
        start_niche: 1,
        niches_per_row: 10,
        row_prefix: 'R',
        niche_prefix: 'N',
        niche_padding: 2,
        capacity_per_niche: 1,
    });

    const totalSlots =
        typeof data.floors === 'number' && typeof data.rows_per_floor === 'number' && typeof data.niches_per_row === 'number'
            ? data.floors * data.rows_per_floor * data.niches_per_row
            : 0;

    const preview = useMemo(() => {
        if (
            !data.apartment_name.trim() ||
            typeof data.floors !== 'number' ||
            typeof data.rows_per_floor !== 'number' ||
            typeof data.niches_per_row !== 'number'
        ) {
            return [];
        }

        const slots: string[] = [];
        const visibleRows = Math.min(data.rows_per_floor, 2);
        const visibleNiches = Math.min(data.niches_per_row, 3);

        for (let row = 1; row <= visibleRows; row++) {
            for (let niche = 1; niche <= visibleNiches; niche++) {
                slots.push(buildApartmentSlotName(data.apartment_name, 1, data.row_prefix, row, data.niche_prefix, niche, data.niche_padding));
            }
        }

        return slots;
    }, [data.apartment_name, data.floors, data.niche_padding, data.niche_prefix, data.niches_per_row, data.row_prefix, data.rows_per_floor]);

    const finalName = useMemo(() => {
        if (
            !data.apartment_name.trim() ||
            typeof data.floors !== 'number' ||
            typeof data.rows_per_floor !== 'number' ||
            typeof data.niches_per_row !== 'number'
        ) {
            return null;
        }

        return buildApartmentSlotName(
            data.apartment_name,
            data.floors,
            data.row_prefix,
            data.rows_per_floor,
            data.niche_prefix,
            data.niches_per_row,
            data.niche_padding,
        );
    }, [data.apartment_name, data.floors, data.niche_padding, data.niche_prefix, data.niches_per_row, data.row_prefix, data.rows_per_floor]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(`/api/cemetery-sites/${siteId}/blocks/${block.id}/plots/apartment`, {
            headers: { 'X-Municipality-Slug': municipalitySlug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Boxes className="mr-2 h-4 w-4" />
                    Generate Apartment Niches
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Generate Apartment Niches</DialogTitle>
                    <DialogDescription>
                        Creating apartment slots in {section.name} / {block.name}. Each generated niche becomes an assignable plot slot.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Apartment Name" error={errors.apartment_name}>
                            <Input value={data.apartment_name} onChange={(event) => setData('apartment_name', event.target.value)} />
                        </Field>
                        <Field label="Floors" error={errors.floors}>
                            <Input
                                type="number"
                                min={1}
                                value={data.floors}
                                onChange={(event) => setData('floors', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </Field>
                        <Field label="Rows Per Floor" error={errors.rows_per_floor}>
                            <Input
                                type="number"
                                min={1}
                                value={data.rows_per_floor}
                                onChange={(event) => setData('rows_per_floor', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </Field>
                        <Field label="Niches Per Row" error={errors.niches_per_row}>
                            <Input
                                type="number"
                                min={1}
                                value={data.niches_per_row}
                                onChange={(event) => setData('niches_per_row', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </Field>
                        <Field label="Row Prefix" error={errors.row_prefix}>
                            <Input value={data.row_prefix} onChange={(event) => setData('row_prefix', event.target.value)} />
                        </Field>
                        <Field label="Niche Prefix" error={errors.niche_prefix}>
                            <Input value={data.niche_prefix} onChange={(event) => setData('niche_prefix', event.target.value)} />
                        </Field>
                        <Field label="Niche Padding" error={errors.niche_padding}>
                            <Input
                                type="number"
                                min={0}
                                value={data.niche_padding}
                                onChange={(event) => setData('niche_padding', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                        </Field>
                        <Field label="Capacity Per Niche" error={errors.capacity_per_niche}>
                            <Input
                                type="number"
                                min={1}
                                value={data.capacity_per_niche}
                                onChange={(event) => setData('capacity_per_niche', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                            <span className="block text-xs text-slate-500">Maximum decedents/remains each generated niche can hold.</span>
                        </Field>
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                            <p className="font-semibold">Total Slots</p>
                            <p className="mt-1 text-2xl font-bold tabular-nums">{totalSlots || 0}</p>
                            <p className="text-xs text-emerald-700">Maximum 500 slots per generation.</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Preview</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {preview.length === 0 ? (
                                <span className="text-sm text-slate-500">Enter apartment details to preview generated niche labels.</span>
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
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-700 hover:bg-emerald-800">
                            {processing ? 'Generating...' : 'Generate Apartment Niches'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            {children}
            {error && <span className="block text-xs text-red-600">{error}</span>}
        </label>
    );
}

function CountPill({ label, value, tone = 'slate' }: { label: string; value: number; tone?: 'slate' | 'emerald' | 'rose' | 'amber' }) {
    const classes = {
        slate: 'bg-slate-100 text-slate-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        rose: 'bg-rose-50 text-rose-700',
        amber: 'bg-amber-50 text-amber-700',
    };

    return (
        <span className={`rounded-full px-2 py-1 font-medium ${classes[tone]}`}>
            {label}: <span className="tabular-nums">{value}</span>
        </span>
    );
}

function StatusPill({ status }: { status: string }) {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">{status}</span>;
}

function buildPlotName(prefix: string, number: number, padding: number): string {
    const labelNumber = padding > 0 ? String(number).padStart(padding, '0') : String(number);

    return `${prefix.trim().toUpperCase()} ${labelNumber}`.trim();
}

function buildApartmentSlotName(
    apartmentName: string,
    floor: number,
    rowPrefix: string,
    row: number,
    nichePrefix: string,
    niche: number,
    nichePadding: number | '',
): string {
    const nicheNumber = typeof nichePadding === 'number' && nichePadding > 0 ? String(niche).padStart(nichePadding, '0') : String(niche);

    return `${apartmentName.trim().toUpperCase()}-F${floor}-${rowPrefix.trim().toUpperCase()}${row}-${nichePrefix.trim().toUpperCase()}${nicheNumber}`;
}

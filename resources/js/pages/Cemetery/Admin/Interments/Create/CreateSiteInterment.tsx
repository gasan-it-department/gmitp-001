import { DatePicker } from '@/components/Shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CemeterySiteListItem,
    CreateSiteIntermentForm,
    IntermentTypeValue,
    PlotListItem,
    PlotTypeValue,
    ReadyDecedentOption,
    SelectOption,
} from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, MapPin, Search, UserCheck } from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';

interface Props {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    decedents: ReadyDecedentOption[];
    available_plots: PlotListItem[];
    type_options: SelectOption<PlotTypeValue>[];
    preselected_decedent_id: string | null;
}

const isAssignableLeaf = (plot: PlotListItem): boolean => plot.parent_plot_id !== null || plot.capacity === 1;

export default function CreateSiteInterment({ municipality, site, decedents, available_plots, type_options, preselected_decedent_id }: Props) {
    const [decedentSearch, setDecedentSearch] = useState('');
    const [plotType, setPlotType] = useState<string>('all');

    const plots = useMemo(() => available_plots.filter(isAssignableLeaf), [available_plots]);
    const { data, setData, post, processing, errors } = useForm<CreateSiteIntermentForm>({
        cemetery_site_id: site.id,
        decedent_id: preselected_decedent_id ?? '',
        plot_id: '',
        interment_date: '',
        type: 'initial',
        notes: '',
        leaseholder_name: '',
        leaseholder_contact: '',
        leaseholder_address: '',
        leaseholder_relationship: '',
        lease_start: '',
        lease_end: '',
        amount_paid: '',
        or_number: '',
        lease_notes: '',
    });

    const filteredDecedents = useMemo(() => {
        const search = decedentSearch.trim().toLowerCase();
        if (!search) {
            return decedents;
        }

        return decedents.filter((decedent) =>
            [decedent.display_name, decedent.registry_number, decedent.date_of_death_label].filter(Boolean).join(' ').toLowerCase().includes(search),
        );
    }, [decedentSearch, decedents]);

    const filteredPlots = useMemo(() => (plotType === 'all' ? plots : plots.filter((plot) => plot.type === plotType)), [plotType, plots]);
    const selectedDecedent = decedents.find((decedent) => decedent.id === data.decedent_id) ?? null;
    const selectedPlot = plots.find((plot) => plot.id === data.plot_id) ?? null;

    const updateIntermentDate = (value: string) => {
        setData({
            ...data,
            interment_date: value,
            lease_start: data.lease_start || value,
            lease_end: data.lease_end || addYears(value, 5),
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/api/interments/store', {
            headers: { 'X-Municipality-Slug': municipality.slug },
        });
    };

    return (
        <AppLayout>
            <Head title={`Create Interment - ${site.name}`} />

            <div className="m-6 space-y-6">
                <Link
                    href={`${cemetery.admin.sites.workspace.page.url({ municipality: municipality.slug, cemetery_site_id: site.id })}?tab=interments`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to {site.name}
                </Link>

                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <span className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
                            <MapPin className="h-5 w-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Create Interment</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Assign a verified, ready, unassigned Decedent to an available plot in {site.name}.
                            </p>
                        </div>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 xl:grid-cols-2">
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                    <h2 className="font-semibold text-slate-900">Ready Decedents</h2>
                                    <p className="text-sm text-slate-500">Verified records with complete readiness or usable override.</p>
                                </div>
                                <UserCheck className="h-5 w-5 text-slate-400" />
                            </div>

                            <div className="relative mb-4">
                                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                                <Input
                                    value={decedentSearch}
                                    onChange={(event) => setDecedentSearch(event.target.value)}
                                    placeholder="Search by name, registry, or death date"
                                    className="pl-9"
                                />
                            </div>

                            <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                                {filteredDecedents.length === 0 ? (
                                    <EmptyState text="No ready, unassigned Decedents match this search." />
                                ) : (
                                    filteredDecedents.map((decedent) => {
                                        const selected = data.decedent_id === decedent.id;

                                        return (
                                            <button
                                                key={decedent.id}
                                                type="button"
                                                onClick={() => setData('decedent_id', decedent.id)}
                                                className={`w-full rounded-lg border p-4 text-left transition ${
                                                    selected
                                                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                <p className="font-medium text-slate-900">{decedent.display_name}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {decedent.vital_record_label} / {decedent.identity_status.toUpperCase()} / Died{' '}
                                                    {decedent.date_of_death_label ?? '-'}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">Registry: {decedent.registry_number ?? 'Not recorded'}</p>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                            {errors.decedent_id && <p className="mt-2 text-xs text-red-600">{errors.decedent_id}</p>}
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="font-semibold text-slate-900">Available Plots</h2>
                                    <p className="text-sm text-slate-500">Only assignable single plots or child slots in this Site.</p>
                                </div>
                                <Select value={plotType} onValueChange={setPlotType}>
                                    <SelectTrigger className="w-full sm:w-52">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {type_options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                                {filteredPlots.length === 0 ? (
                                    <EmptyState text="No available assignable plots are registered for this Site." />
                                ) : (
                                    filteredPlots.map((plot) => {
                                        const selected = data.plot_id === plot.id;

                                        return (
                                            <button
                                                key={plot.id}
                                                type="button"
                                                onClick={() => setData('plot_id', plot.id)}
                                                className={`w-full rounded-lg border p-4 text-left transition ${
                                                    selected
                                                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-mono font-semibold text-slate-900">{plot.slot_label}</p>
                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                        {plot.status_label}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    {plot.block?.section?.name ?? '-'} / {plot.block?.name ?? '-'}
                                                    {plot.row && <span className="ml-1">/ Row {plot.row}</span>}
                                                    {plot.level !== null && <span className="ml-1">/ Level {plot.level}</span>}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">{plot.type_label}</p>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                            {errors.plot_id && <p className="mt-2 text-xs text-red-600">{errors.plot_id}</p>}
                        </section>
                    </div>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 border-b border-slate-100 pb-3 font-semibold text-slate-900">Interment Details</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <DatePicker
                                label="Interment Date *"
                                disableFuture
                                value={data.interment_date}
                                onChange={updateIntermentDate}
                                error={errors.interment_date}
                            />

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Interment Type *</label>
                                <Select value={data.type} onValueChange={(value) => setData('type', value as IntermentTypeValue)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="initial">Initial Interment</SelectItem>
                                            <SelectItem value="transfer">Transfer From Another Cemetery/Slot</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                                <textarea
                                    rows={3}
                                    value={data.notes}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    placeholder="Optional operational notes."
                                    className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                            </div>
                        </div>

                        {(selectedDecedent || selectedPlot) && (
                            <div className="mt-5 grid gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide uppercase">Selected Decedent</p>
                                    <p className="mt-1 font-medium">{selectedDecedent?.display_name ?? 'None selected'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-wide uppercase">Selected Plot</p>
                                    <p className="mt-1 font-mono font-medium">{selectedPlot?.slot_label ?? 'None selected'}</p>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 border-b border-slate-100 pb-3">
                            <h2 className="font-semibold text-slate-900">Lease / Responsible Person</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Record the living contact responsible for the occupied plot. Payment details are manual for V1.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Leaseholder Name *" error={errors.leaseholder_name}>
                                <Input
                                    value={data.leaseholder_name}
                                    onChange={(event) => setData('leaseholder_name', event.target.value)}
                                    placeholder="e.g. JUAN DELA CRUZ"
                                />
                            </Field>

                            <Field label="Relationship to Decedent" error={errors.leaseholder_relationship}>
                                <Input
                                    value={data.leaseholder_relationship}
                                    onChange={(event) => setData('leaseholder_relationship', event.target.value)}
                                    placeholder="e.g. SPOUSE, CHILD, SIBLING"
                                />
                            </Field>

                            <Field label="Contact Number" error={errors.leaseholder_contact}>
                                <Input
                                    value={data.leaseholder_contact}
                                    onChange={(event) => setData('leaseholder_contact', event.target.value)}
                                    placeholder="Optional"
                                />
                            </Field>

                            <Field label="Address" error={errors.leaseholder_address}>
                                <Input
                                    value={data.leaseholder_address}
                                    onChange={(event) => setData('leaseholder_address', event.target.value)}
                                    placeholder="Optional"
                                />
                            </Field>

                            <DatePicker
                                label="Lease Start"
                                value={data.lease_start}
                                onChange={(value) =>
                                    setData({
                                        ...data,
                                        lease_start: value,
                                        lease_end: data.lease_end || addYears(value, 5),
                                    })
                                }
                                error={errors.lease_start}
                            />

                            <DatePicker
                                label="Lease End"
                                value={data.lease_end}
                                onChange={(value) => setData('lease_end', value)}
                                error={errors.lease_end}
                            />

                            <Field label="Amount Paid" error={errors.amount_paid}>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.amount_paid}
                                    onChange={(event) => setData('amount_paid', event.target.value === '' ? '' : Number(event.target.value))}
                                    placeholder="Optional"
                                />
                            </Field>

                            <Field label="OR Number" error={errors.or_number}>
                                <Input value={data.or_number} onChange={(event) => setData('or_number', event.target.value)} placeholder="Optional" />
                            </Field>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-slate-700">Lease Notes</label>
                                <textarea
                                    rows={3}
                                    value={data.lease_notes}
                                    onChange={(event) => setData('lease_notes', event.target.value)}
                                    placeholder="Optional lease or payment notes."
                                    className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.lease_notes && <p className="mt-1 text-xs text-red-600">{errors.lease_notes}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link
                                href={`${cemetery.admin.sites.workspace.page.url({ municipality: municipality.slug, cemetery_site_id: site.id })}?tab=interments`}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.decedent_id || !data.plot_id}
                            className="bg-indigo-700 hover:bg-indigo-800"
                        >
                            {processing ? 'Saving...' : 'Confirm Interment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function EmptyState({ text }: { text: string }) {
    return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">{text}</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function addYears(value: string, years: number): string {
    if (!value) {
        return '';
    }

    const date = new Date(`${value}T00:00:00`);
    date.setFullYear(date.getFullYear() + years);

    return date.toISOString().slice(0, 10);
}

import Interments from '@/actions/App/External/Api/Controllers/Cemetery/Interments';
import { DatePicker } from '@/components/Shared/DatePicker';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateIntermentForm, IntermentTypeValue, PlotListItem } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, UserCheck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface DecedentSummary {
    id: string;
    display_name: string;
    record_type: string | null;
    identity_status: string | null;
    date_of_death: string | null;
}

interface Props {
    decedent: DecedentSummary;
    available_plots: { data: PlotListItem[] };
}

/**
 * BR-4 — interments may NEVER attach to a parent container. The server-side
 * `GetAvailablePlotsAction` already filters to AVAILABLE leaves only, but this
 * client-side guard is the defense-in-depth: if the payload ever drifts (e.g.
 * a future caller swaps the action), the picker will still refuse containers.
 *
 * A leaf is either: a child slot (parent_plot_id IS NOT NULL), or a single-
 * capacity plot (capacity = 1, no children).
 */
const isAssignableLeaf = (plot: PlotListItem): boolean =>
    plot.parent_plot_id !== null || plot.capacity === 1;

export default function AssignDecedent({ decedent, available_plots }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    // Defensive filter — server already returns leaves only. See isAssignableLeaf().
    const plots = useMemo(
        () => (available_plots.data ?? []).filter(isAssignableLeaf),
        [available_plots.data],
    );

    const [typeFilter, setTypeFilter] = useState<string>('all');

    const { data, setData, post, processing, errors } = useForm<CreateIntermentForm>({
        decedent_id: decedent.id,
        plot_id: '',
        interment_date: '',
        type: 'initial',
        notes: '',
    });

    const filteredPlots = useMemo(
        () => (typeFilter === 'all' ? plots : plots.filter((p) => p.type === typeFilter)),
        [plots, typeFilter],
    );

    const selectedPlot = useMemo(
        () => plots.find((p) => p.id === data.plot_id) ?? null,
        [plots, data.plot_id],
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(Interments.StoreIntermentController.url(), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
        });
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <Link
                    href={cemetery.admin.decedents.profile.page.url([currentMunicipality.slug, decedent.id])}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to profile
                </Link>

                <header className="flex items-start gap-3 border-b border-slate-200 pb-5">
                    <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                        <MapPin size={20} />
                    </span>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Assign Decedent to Plot</h1>
                        <p className="text-sm text-slate-500">
                            Link this decedent to an available cemetery slot and record the interment. Only individual slots
                            (single-capacity plots or specific levels inside a container) are bookable.
                        </p>
                    </div>
                </header>

                {/* Decedent card */}
                <section className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <span className="rounded-full bg-slate-100 p-3 text-slate-600">
                        <UserCheck size={20} />
                    </span>
                    <div className="flex-1">
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Decedent</p>
                        <p className="text-base font-semibold text-slate-900">{decedent.display_name}</p>
                        <p className="text-xs text-slate-500">
                            {decedent.record_type?.replace('_', ' ').toUpperCase()} · {decedent.identity_status?.toUpperCase()} · Died {decedent.date_of_death ?? '—'}
                        </p>
                    </div>
                </section>

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
                                Choose an Available Slot
                            </h2>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-52">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="lawn_lot">Ground / Lawn Lot</SelectItem>
                                        <SelectItem value="apartment_niche">Apartment Niche</SelectItem>
                                        <SelectItem value="bone_ossuary">Bone Ossuary</SelectItem>
                                        <SelectItem value="mausoleum">Mausoleum</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {filteredPlots.length === 0 ? (
                            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                                No available slots match the current filter. Register a new plot or change the type filter.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredPlots.map((plot) => {
                                    const isSelected = plot.id === data.plot_id;
                                    return (
                                        <button
                                            key={plot.id}
                                            type="button"
                                            onClick={() => setData('plot_id', plot.id)}
                                            className={`group rounded-lg border p-4 text-left transition-all ${
                                                isSelected
                                                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                {/* Canonical slot identifier from the Plot::slotLabel accessor
                                                    (e.g. "A-12-L3", "A-12-L3-LEFT", or "L-100" for single-capacity). */}
                                                <span className="font-mono text-sm font-semibold text-slate-900">{plot.slot_label}</span>
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                    {plot.status_label}
                                                </span>
                                            </div>
                                            {/* Section / Block / Row are reached via the new hierarchy. */}
                                            <p className="mt-2 text-xs text-slate-500">
                                                {plot.block?.section?.name ?? '—'}
                                                <span className="mx-1 opacity-40">/</span>
                                                {plot.block?.name ?? '—'}
                                                {plot.row && <span className="ml-1 text-slate-400">· Row {plot.row}</span>}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">{plot.type_label}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {errors.plot_id && <p className="mt-2 text-xs text-red-600">{errors.plot_id}</p>}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 border-b border-slate-100 pb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                            Interment Details
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <DatePicker
                                label="Interment Date *"
                                disableFuture
                                value={data.interment_date}
                                onChange={(v) => setData('interment_date', v)}
                                error={errors.interment_date}
                            />

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Interment Type *</label>
                                <Select
                                    value={data.type}
                                    onValueChange={(v) => setData('type', v as IntermentTypeValue)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="initial">Initial Interment</SelectItem>
                                            <SelectItem value="transfer">Transfer From Another Slot</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p className="mt-1 text-xs text-slate-500">
                                    {/* Event-typed schema (Task 1): the existence of an active interment row
                                        flips the slot to OCCUPIED via RecordIntermentAction (BR-3). */}
                                    Confirming will flip the slot status to <span className="font-medium">Occupied</span>.
                                </p>
                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
                                <textarea
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add operational context (e.g. transfer origin, ceremony details, lease info)."
                                    className={`block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                                        errors.notes ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                />
                                {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                            </div>
                        </div>

                        {selectedPlot && (
                            <div className="mt-4 rounded-md border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                                <p className="font-semibold">Selected slot</p>
                                <p className="mt-1 font-mono">{selectedPlot.slot_label}</p>
                                <p className="text-xs text-indigo-700">
                                    {selectedPlot.block?.section?.name ?? '—'}
                                    <span className="mx-1 opacity-50">/</span>
                                    {selectedPlot.block?.name ?? '—'}
                                    {selectedPlot.row && <span className="ml-1">· Row {selectedPlot.row}</span>}
                                    {selectedPlot.level !== null && <span className="ml-1">· Level {selectedPlot.level}</span>}
                                </p>
                            </div>
                        )}
                    </section>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.plot_id}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Confirm Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

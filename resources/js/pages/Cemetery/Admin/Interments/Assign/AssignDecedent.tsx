import Interments from '@/actions/App/External/Api/Controllers/Cemetery/Interments';
import { DatePicker } from '@/components/Shared/DatePicker';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateIntermentForm, PlotListItem } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, UserCheck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface DecedentSummary {
    id: string;
    display_name: string;
    decedent_type: string | null;
    date_of_death: string | null;
}

interface Props {
    decedent: DecedentSummary;
    available_plots: { data: PlotListItem[] };
}

export default function AssignDecedent({ decedent, available_plots }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const plots = available_plots.data;
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const { data, setData, post, processing, errors } = useForm<CreateIntermentForm>({
        decedent_id: decedent.id,
        plot_id: '',
        interment_date: '',
        status: 'interred',
    });

    const filteredPlots = useMemo(
        () => (typeFilter === 'all' ? plots : plots.filter((p) => p.type === typeFilter)),
        [plots, typeFilter],
    );

    const selectedPlot = useMemo(() => plots.find((p) => p.id === data.plot_id) ?? null, [plots, data.plot_id]);

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
                        <p className="text-sm text-slate-500">Link this decedent to an available cemetery plot and record the interment.</p>
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
                            {decedent.decedent_type?.toUpperCase()} · Died {decedent.date_of_death ?? '—'}
                        </p>
                    </div>
                </section>

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">Choose an Available Plot</h2>
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
                                No available plots match the current filter. Register a new plot or change the type filter.
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
                                                <span className="font-mono text-sm font-semibold text-slate-900">{plot.plot_number}</span>
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                    {plot.status_label}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm font-medium text-slate-800">{plot.name ?? '—'}</p>
                                            <p className="text-xs text-slate-500">{plot.section?.name ?? '—'}</p>
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
                                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v as CreateIntermentForm['status'])}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="interred">Interred (Confirmed)</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p className="mt-1 text-xs text-slate-500">
                                    "Interred" will flip the plot status to <span className="font-medium">Occupied</span>.
                                </p>
                            </div>
                        </div>

                        {selectedPlot && (
                            <div className="mt-4 rounded-md border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                                <p className="font-semibold">Selected plot</p>
                                <p className="mt-1">
                                    {selectedPlot.plot_number} · {selectedPlot.name ?? '—'} · {selectedPlot.section?.name ?? '—'}
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

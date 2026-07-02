import { DatePicker } from '@/components/Shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CemeterySiteListItem, IntermentMoveContext, MoveIntermentForm, PlotListItem } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRightLeft, MapPin, Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface Props {
    municipality: MunicipalityType;
    interment: IntermentMoveContext;
    sites: CemeterySiteListItem[];
    available_plots: PlotListItem[];
}

export default function MoveInterment({ municipality, interment, sites, available_plots }: Props) {
    const [plotSearch, setPlotSearch] = useState('');
    const currentSiteId = interment.plot?.cemetery_site_id ?? sites[0]?.id ?? '';
    const { data, setData, post, processing, errors } = useForm<MoveIntermentForm>({
        destination_cemetery_site_id: currentSiteId,
        destination_plot_id: '',
        movement_date: '',
        reason: '',
        notes: '',
    });

    const destinationPlots = useMemo(() => {
        const search = plotSearch.trim().toLowerCase();

        return available_plots.filter((plot) => {
            if (plot.id === interment.plot?.id) return false;
            if (plot.cemetery_site_id !== data.destination_cemetery_site_id) return false;
            if (!search) return true;

            return [plot.slot_label, plot.type_label, plot.block?.section?.name, plot.block?.name]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(search);
        });
    }, [available_plots, data.destination_cemetery_site_id, interment.plot?.id, plotSearch]);

    const selectedPlot = destinationPlots.find((plot) => plot.id === data.destination_plot_id) ?? null;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(`/api/interments/${interment.id}/move`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
        });
    };

    const backUrl = interment.plot
        ? cemetery.admin.sites.plots.profile.page.url({
              municipality: municipality.slug,
              cemetery_site_id: interment.plot.cemetery_site_id,
              plot_id: interment.plot.id,
          })
        : cemetery.admin.sites.list.page.url({ municipality: municipality.slug });

    return (
        <AppLayout>
            <Head title={`Move Interment - ${interment.decedent_name}`} />

            <div className="m-6 space-y-6">
                <Link href={backUrl} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <ArrowLeft size={16} />
                    Back to current plot
                </Link>

                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <span className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
                            <ArrowRightLeft className="h-5 w-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Move Interment</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Move this active interment to another plot under the same municipality. The original interment will remain in the
                                timeline as ended history.
                            </p>
                        </div>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 font-semibold text-slate-900">Current Interment</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Detail label="Decedent" value={interment.decedent_name} />
                            <Detail label="Current Plot" value={interment.plot?.slot_label} />
                            <Detail label="Current Site" value={interment.plot?.cemetery_site?.name} />
                            <Detail
                                label="Section / Block"
                                value={[interment.plot?.section?.name, interment.plot?.block?.name].filter(Boolean).join(' / ')}
                            />
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <MapPin className="h-4 w-4 text-indigo-600" />
                            <h2 className="font-semibold text-slate-900">Destination Plot</h2>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Destination Cemetery Site</label>
                                <Select
                                    value={data.destination_cemetery_site_id}
                                    onValueChange={(value) => {
                                        setData({
                                            ...data,
                                            destination_cemetery_site_id: value,
                                            destination_plot_id: '',
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {sites.map((site) => (
                                                <SelectItem key={site.id} value={site.id}>
                                                    {site.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.destination_cemetery_site_id && <p className="text-xs text-red-600">{errors.destination_cemetery_site_id}</p>}
                            </div>

                            <div className="relative space-y-2 lg:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Search Destination Plots</label>
                                <Search className="absolute top-9 left-3 h-4 w-4 text-slate-400" />
                                <Input
                                    value={plotSearch}
                                    onChange={(event) => setPlotSearch(event.target.value)}
                                    placeholder="Search by plot, section, block, or type"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="mt-5 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                            {destinationPlots.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                    No available destination plots match this site/search.
                                </div>
                            ) : (
                                destinationPlots.map((plot) => {
                                    const selected = data.destination_plot_id === plot.id;

                                    return (
                                        <button
                                            key={plot.id}
                                            type="button"
                                            onClick={() => setData('destination_plot_id', plot.id)}
                                            className={`w-full rounded-lg border p-4 text-left transition ${
                                                selected
                                                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-mono font-semibold text-slate-900">{plot.slot_label}</p>
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    {plot.occupancy_label}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {plot.block?.section?.name ?? '-'} / {plot.block?.name ?? '-'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">{plot.type_label}</p>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        {errors.destination_plot_id && <p className="mt-2 text-xs text-red-600">{errors.destination_plot_id}</p>}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 border-b border-slate-100 pb-3 font-semibold text-slate-900">Movement Details</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <DatePicker
                                label="Movement Date *"
                                disableFuture
                                value={data.movement_date}
                                onChange={(value) => setData('movement_date', value)}
                                error={errors.movement_date}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Reason *</label>
                                <Input
                                    value={data.reason}
                                    onChange={(event) => setData('reason', event.target.value)}
                                    placeholder="e.g. Family requested relocation"
                                />
                                {errors.reason && <p className="text-xs text-red-600">{errors.reason}</p>}
                                {errors.interment && <p className="text-xs text-red-600">{errors.interment}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Notes</label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    placeholder="Optional operational notes."
                                    className="min-h-24"
                                />
                                {errors.notes && <p className="text-xs text-red-600">{errors.notes}</p>}
                            </div>
                        </div>

                        {selectedPlot && (
                            <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950">
                                Moving to <span className="font-mono font-semibold">{selectedPlot.slot_label}</span> in{' '}
                                {sites.find((site) => site.id === selectedPlot.cemetery_site_id)?.name ?? 'selected site'}.
                            </div>
                        )}
                    </section>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href={backUrl}>Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.destination_plot_id || !data.movement_date || !data.reason.trim()}
                            className="bg-indigo-700 hover:bg-indigo-800"
                        >
                            {processing ? 'Moving...' : 'Confirm Move'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{value || '-'}</p>
        </div>
    );
}

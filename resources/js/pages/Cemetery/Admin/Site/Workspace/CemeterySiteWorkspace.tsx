import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CemeterySiteListItem, PlotInventoryCounts, PlotListItem, PlotStatusOption } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Boxes, Building2, MapPin, Plus } from 'lucide-react';

interface Props {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plots: PaginatedResponse<PlotListItem>;
    filters: { status: string | null };
    status_options: PlotStatusOption[];
    inventory_counts: PlotInventoryCounts;
}

const STATUS_CLASSES: Record<CemeterySiteListItem['status'], string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    inactive: 'bg-amber-50 text-amber-700 ring-amber-200',
    closed: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const PLOT_TONE_CLASSES: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export default function CemeterySiteWorkspace({ municipality, site, plots, filters, status_options, inventory_counts }: Props) {
    const active = site.status === 'active';

    const onFilterChange = (status: string) => {
        router.get(
            cemetery.admin.sites.workspace.page.url({
                municipality: municipality.slug,
                cemetery_site_id: site.id,
            }),
            { status: status === 'all' ? undefined : status },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AppLayout>
            <Head title={site.name} />

            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <Link
                    href={cemetery.admin.sites.list.page.url(municipality.slug)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to cemetery sites
                </Link>

                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                <Building2 size={24} />
                            </span>
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{site.name}</h1>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_CLASSES[site.status]}`}
                                    >
                                        {site.status_label}
                                    </span>
                                </div>
                                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                    <MapPin className="h-4 w-4" />
                                    {formatAddress(site)}
                                </p>
                                {site.notes && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{site.notes}</p>}
                            </div>
                        </div>

                        {active && (
                            <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                                <Link
                                    href={cemetery.admin.sites.plots.create.page.url({
                                        municipality: municipality.slug,
                                        cemetery_site_id: site.id,
                                    })}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Register Plot
                                </Link>
                            </Button>
                        )}
                    </div>
                </header>

                {!active && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        This Site is {site.status}. Historical inventory remains visible, but new Plots cannot be registered.
                    </div>
                )}

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    <Stat label="Sections" value={site.sections_count} tone="slate" />
                    <Stat label="Total Slots" value={inventory_counts.total} tone="slate" />
                    <Stat label="Available" value={inventory_counts.available} tone="emerald" />
                    <Stat label="Occupied" value={inventory_counts.occupied} tone="rose" />
                    <Stat label="Reserved" value={inventory_counts.reserved} tone="indigo" />
                    <Stat label="Maintenance" value={inventory_counts.maintenance} tone="amber" />
                </section>

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">Plot Inventory</h2>
                        <p className="text-sm text-slate-500">Top-level plots and containers belonging to this Site.</p>
                    </div>
                    <Select value={filters.status ?? 'all'} onValueChange={onFilterChange}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {status_options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="max-h-[65vh] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur">
                                <TableRow>
                                    <TableHead>Slot Label</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Block</TableHead>
                                    <TableHead>Row</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plots.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-sm text-slate-500">
                                            No matching Plots are registered for this Site.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    plots.data.map((plot) => {
                                        const container = isContainer(plot);

                                        return (
                                            <TableRow key={plot.id}>
                                                <TableCell className="font-mono font-medium text-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        {plot.slot_label || '-'}
                                                        {container && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 uppercase ring-1 ring-indigo-200 ring-inset">
                                                                <Boxes size={10} />
                                                                Container
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{plot.block?.section?.name ?? '-'}</TableCell>
                                                <TableCell>{plot.block?.name ?? '-'}</TableCell>
                                                <TableCell>{plot.row ?? '-'}</TableCell>
                                                <TableCell>{plot.type_label ?? '-'}</TableCell>
                                                <TableCell>{plot.capacity}</TableCell>
                                                <TableCell>
                                                    {container ? (
                                                        <span className="text-slate-400">-</span>
                                                    ) : (
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                                PLOT_TONE_CLASSES[plot.status_tone ?? 'slate']
                                                            }`}
                                                        >
                                                            {plot.status_label ?? '-'}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Pagination links={plots.meta.links} />
            </div>
        </AppLayout>
    );
}

function isContainer(plot: PlotListItem): boolean {
    return plot.parent_plot_id === null && plot.capacity > 1;
}

function formatAddress(site: CemeterySiteListItem): string {
    const parts = [site.street_name, site.barangay_name].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No address recorded';
}

interface StatProps {
    label: string;
    value: number;
    tone: 'emerald' | 'rose' | 'amber' | 'indigo' | 'slate';
}

const STAT_CLASSES: Record<StatProps['tone'], string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
};

function Stat({ label, value, tone }: StatProps) {
    return (
        <div className={`rounded-xl p-4 ring-1 ring-inset ${STAT_CLASSES[tone]}`}>
            <p className="text-xs font-medium tracking-wide uppercase">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}

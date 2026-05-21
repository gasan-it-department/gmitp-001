import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlotListItem, PlotStatusOption, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, router, usePage } from '@inertiajs/react';
import { LandPlot, Plus } from 'lucide-react';

interface Props {
    plots: PaginatedResponse<PlotListItem>;
    filters: { status: string | null };
    status_options: PlotStatusOption[];
    type_options: SelectOption[];
}

const TONE_CLASSES: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export default function ListPlots({ plots, filters, status_options }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const rows = plots.data;

    const onFilterChange = (status: string) => {
        router.get(
            cemetery.admin.plots.list.page.url(currentMunicipality.slug),
            { status: status === 'all' ? undefined : status },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const counts = {
        total: plots.meta.total ?? rows.length,
        available: rows.filter((p) => p.status === 'available').length,
        occupied: rows.filter((p) => p.status === 'occupied').length,
        maintenance: rows.filter((p) => p.status === 'maintenance').length,
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                            <LandPlot size={20} />
                        </span>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Plots & Real Estate</h1>
                            <p className="text-sm text-slate-500">
                                Manage the physical inventory of cemetery plots under {currentMunicipality?.name ?? 'this municipality'}.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={cemetery.admin.plots.create.page.url(currentMunicipality.slug)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                    >
                        <Plus size={16} />
                        Register Plot
                    </Link>
                </header>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Total Plots" value={counts.total} tone="slate" />
                    <Stat label="Available" value={counts.available} tone="emerald" />
                    <Stat label="Occupied" value={counts.occupied} tone="rose" />
                    <Stat label="Maintenance" value={counts.maintenance} tone="amber" />
                </section>

                {/* Toolbar */}
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm font-medium text-slate-700">Filter by status</p>
                    <Select value={filters.status ?? 'all'} onValueChange={onFilterChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {status_options.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="max-h-[65vh] overflow-y-auto">
                        <Table className="w-full">
                            <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur">
                                <TableRow className="border-slate-200">
                                    <TableHead className="pl-4 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                        Plot Number
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Name</TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Section</TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Type</TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Capacity</TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Status</TableHead>
                                    <TableHead className="pr-4 text-right text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-sm text-slate-500">
                                            No plots registered yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((plot) => (
                                        <TableRow key={plot.id} className="border-slate-100 transition-colors hover:bg-slate-50">
                                            <TableCell className="pl-4 font-mono text-sm font-medium text-slate-900">
                                                {plot.plot_number ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-700">{plot.name ?? '—'}</TableCell>
                                            <TableCell className="text-sm text-slate-600">{plot.section?.name ?? '—'}</TableCell>
                                            <TableCell className="text-xs text-slate-600">{plot.type_label ?? '—'}</TableCell>
                                            <TableCell className="text-xs text-slate-600">{plot.total_capacity ?? 1}</TableCell>
                                            <TableCell className="text-xs">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                        TONE_CLASSES[plot.status_tone ?? 'slate']
                                                    }`}
                                                >
                                                    {plot.status_label ?? '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-4 text-right">
                                                <Button size="sm" variant="ghost" className="text-slate-600">
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="pt-2">
                    <Pagination links={plots.meta.links} />
                </div>
            </div>
        </AppLayout>
    );
}

interface StatProps {
    label: string;
    value: number;
    tone: 'emerald' | 'rose' | 'amber' | 'slate';
}

const STAT_TONES: Record<StatProps['tone'], string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
};

function Stat({ label, value, tone }: StatProps) {
    return (
        <div className={`rounded-lg p-4 ring-1 ring-inset ${STAT_TONES[tone]}`}>
            <p className="text-xs font-medium tracking-wide uppercase">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}

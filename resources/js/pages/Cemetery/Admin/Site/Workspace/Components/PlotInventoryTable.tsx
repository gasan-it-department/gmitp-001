import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CemeterySectionListItem,
    PlotInventoryScopeValue,
    PlotListFilters,
    PlotListItem,
    PlotStatusOption,
    PlotStatusValue,
    PlotTypeValue,
    SelectOption,
} from '@/Core/Types/Cemetery/cemetery';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import { cn } from '@/lib/utils';
import cemetery from '@/routes/cemetery';
import { router } from '@inertiajs/react';
import { Boxes, Layers3, Search, X } from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

interface Props {
    plots: PaginatedResponse<PlotListItem>;
    filters: PlotListFilters;
    statusOptions: PlotStatusOption[];
    typeOptions: SelectOption<PlotTypeValue>[];
    layout: CemeterySectionListItem[];
    municipalitySlug: string;
    siteId: string;
}

const PLOT_TONE_CLASSES: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const SCOPE_OPTIONS: SelectOption<PlotInventoryScopeValue>[] = [
    { value: 'top_level', label: 'Top-level plots' },
    { value: 'assignable', label: 'Assignable slots' },
    { value: 'all', label: 'All rows' },
];

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

export function PlotInventoryTable({ plots, filters, statusOptions, typeOptions, layout, municipalitySlug, siteId }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [row, setRow] = useState(filters.row ?? '');

    const sectionOptions = useMemo(
        () =>
            layout.map((section) => ({
                value: section.id,
                label: section.name,
            })),
        [layout],
    );

    const blockOptions = useMemo(() => {
        const selectedSections = filters.section_id ? layout.filter((section) => section.id === filters.section_id) : layout;

        return selectedSections.flatMap((section) =>
            section.blocks.map((block) => ({
                value: block.id,
                label: `${section.name} / ${block.name}`,
            })),
        );
    }, [filters.section_id, layout]);

    useEffect(() => {
        setSearch(filters.search ?? '');
        setRow(filters.row ?? '');
    }, [filters.search, filters.row]);

    const hasActiveFilters = Boolean(
        filters.search ||
            filters.status ||
            filters.type ||
            filters.section_id ||
            filters.block_id ||
            filters.row ||
            filters.scope !== 'top_level' ||
            filters.per_page !== 15,
    );

    const applyFilters = (patch: Partial<PlotListFilters>) => {
        const nextFilters = {
            ...filters,
            ...patch,
        };

        router.get(
            cemetery.admin.sites.workspace.page.url({
                municipality: municipalitySlug,
                cemetery_site_id: siteId,
            }),
            cleanQuery({
                tab: 'plots',
                search: nextFilters.search,
                status: nextFilters.status,
                type: nextFilters.type,
                section_id: nextFilters.section_id,
                block_id: nextFilters.block_id,
                row: nextFilters.row,
                scope: nextFilters.scope === 'top_level' ? null : nextFilters.scope,
                per_page: nextFilters.per_page === 15 ? null : nextFilters.per_page,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        applyFilters({
            search: search.trim() || null,
            row: row.trim() || null,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setRow('');

        router.get(
            cemetery.admin.sites.workspace.page.url({
                municipality: municipalitySlug,
                cemetery_site_id: siteId,
            }),
            { tab: 'plots' },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Plot Inventory</h2>
                        <p className="text-sm text-muted-foreground">
                            Search and filter plots, containers, and assignable apartment niche slots inside this Site.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <Layers3 className="h-4 w-4" />
                        Showing {plots.data.length} of {plots.meta.total ?? plots.data.length}
                    </div>
                </div>

                <form onSubmit={submitSearch} className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_160px_auto]">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search plot, niche, section, or block..."
                    />
                    <Input value={row} onChange={(event) => setRow(event.target.value)} placeholder="Row, e.g. R1" />
                    <Button type="submit" className="gap-2">
                        <Search className="h-4 w-4" />
                        Search
                    </Button>
                </form>

                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-[repeat(6,minmax(140px,1fr))_auto]">
                    <FilterSelect
                        value={filters.scope}
                        placeholder="Rows"
                        options={SCOPE_OPTIONS}
                        allLabel={null}
                        onChange={(value) => applyFilters({ scope: value ?? 'top_level' })}
                    />
                    <FilterSelect
                        value={filters.type}
                        placeholder="Type"
                        options={typeOptions}
                        onChange={(value) => applyFilters({ type: value as PlotTypeValue | null })}
                    />
                    <FilterSelect
                        value={filters.status}
                        placeholder="Status"
                        options={statusOptions}
                        onChange={(value) => applyFilters({ status: value as PlotStatusValue | null })}
                    />
                    <FilterSelect
                        value={filters.section_id}
                        placeholder="Section"
                        options={sectionOptions}
                        onChange={(value) => applyFilters({ section_id: value, block_id: null })}
                    />
                    <FilterSelect
                        value={filters.block_id}
                        placeholder="Block"
                        options={blockOptions}
                        onChange={(value) => applyFilters({ block_id: value })}
                    />
                    <FilterSelect
                        value={String(filters.per_page)}
                        placeholder="Per page"
                        options={PER_PAGE_OPTIONS.map((value) => ({ value: String(value), label: `${value} / page` }))}
                        allLabel={null}
                        onChange={(value) => applyFilters({ per_page: Number(value ?? 15) })}
                    />
                    <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasActiveFilters} className="gap-2">
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border bg-white">
                <div className="max-h-[65vh] overflow-y-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-white/95 backdrop-blur">
                            <TableRow>
                                <TableHead>Plot / Slot</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Block</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-center">Capacity</TableHead>
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
                                    const childSlot = plot.parent_plot_id !== null;

                                    return (
                                        <TableRow key={plot.id} className="transition-colors hover:bg-slate-50/80">
                                            <TableCell className="min-w-[220px]">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono font-medium text-slate-900">{plot.slot_label || '-'}</span>
                                                        {container && (
                                                            <RowBadge
                                                                icon={<Boxes size={10} />}
                                                                label="Container"
                                                                className="bg-indigo-50 text-indigo-700 ring-indigo-200"
                                                            />
                                                        )}
                                                        {childSlot && <RowBadge label="Slot" className="bg-sky-50 text-sky-700 ring-sky-200" />}
                                                    </div>
                                                    {plot.name && plot.name !== plot.slot_label && (
                                                        <span className="text-xs text-slate-500">Parent label: {plot.name}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{plot.block?.section?.name ?? '-'}</TableCell>
                                            <TableCell>{plot.block?.name ?? '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 text-xs text-slate-600">
                                                    <LocationPill label="Floor" value={plot.level ? `F${plot.level}` : null} />
                                                    <LocationPill label="Row" value={plot.row} />
                                                    <LocationPill label="Position" value={plot.position} />
                                                    {!plot.level && !plot.row && !plot.position && <span className="text-slate-400">-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{plot.type_label ?? '-'}</TableCell>
                                            <TableCell className="text-center tabular-nums">{plot.capacity}</TableCell>
                                            <TableCell>
                                                {container ? (
                                                    <span className="text-slate-400">-</span>
                                                ) : (
                                                    <span
                                                        className={cn(
                                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                                                            PLOT_TONE_CLASSES[plot.status_tone ?? 'slate'],
                                                        )}
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
    );
}

interface FilterSelectProps<T extends string> {
    value: T | null;
    placeholder: string;
    options: SelectOption<T>[];
    allLabel?: string | null;
    onChange: (value: T | null) => void;
}

function FilterSelect<T extends string>({ value, placeholder, options, allLabel, onChange }: FilterSelectProps<T>) {
    return (
        <Select value={value ?? 'all'} onValueChange={(nextValue) => onChange(nextValue === 'all' ? null : (nextValue as T))}>
            <SelectTrigger className="bg-white">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {allLabel !== null && <SelectItem value="all">{allLabel ?? `All ${placeholder}`}</SelectItem>}
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function LocationPill({ label, value }: { label: string; value: string | null }) {
    if (!value) {
        return null;
    }

    return (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            {label}: {value}
        </span>
    );
}

function RowBadge({ icon, label, className }: { icon?: ReactNode; label: string; className: string }) {
    return (
        <span
            className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-inset', className)}
        >
            {icon}
            {label}
        </span>
    );
}

function isContainer(plot: PlotListItem): boolean {
    return plot.parent_plot_id === null && plot.capacity > 1;
}

function cleanQuery(query: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== null && value !== undefined && value !== ''));
}

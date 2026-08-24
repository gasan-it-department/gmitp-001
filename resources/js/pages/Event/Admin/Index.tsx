import { Pagination } from '@/components/Shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, ChevronDown, Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type EnumOption = { value: string; label: string };

interface EventListItem {
    id: string;
    title: string;
    type: EnumOption;
    is_published: boolean;
    start_datetime: string | null;
    end_datetime: string | null;
    location_name: string | null;
    banner_url: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

interface AdminEventFilters {
    search: string | null;
    schedule: string | null;
    publication: string | null;
    type: string | null;
    date_from: string | null;
    date_to: string | null;
    sort: string;
}

interface Props {
    events: PaginatedResponse<EventListItem>;
    filters: AdminEventFilters;
    type_options: EnumOption[];
    schedule_options: EnumOption[];
    publication_options: EnumOption[];
    sort_options: EnumOption[];
}

const typeBadgeClasses = (type: string): string => {
    switch (type) {
        case 'festival':
            return 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300';
        case 'government':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'community':
            return 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-300';
        case 'holiday':
            return 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300';
        default:
            return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300';
    }
};

export default function EventAdminIndex({ events, filters, type_options, schedule_options, publication_options, sort_options }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const path = `/${slug}/admin/event`;
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [moreFiltersOpen, setMoreFiltersOpen] = useState(Boolean(filters.date_from || filters.date_to));
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const list = events?.data ?? [];
    const hasActiveFilters = Boolean(
        filters.search ||
            filters.schedule ||
            filters.publication ||
            filters.type ||
            filters.date_from ||
            filters.date_to ||
            filters.sort !== 'relevance',
    );

    useEffect(() => {
        setSearchValue(filters.search ?? '');
    }, [filters.search]);

    const applyFilters = (patch: Partial<AdminEventFilters>) => {
        const nextFilters = { ...filters, ...patch };

        router.get(
            path,
            cleanQuery({
                search: nextFilters.search,
                schedule: nextFilters.schedule,
                publication: nextFilters.publication,
                type: nextFilters.type,
                date_from: nextFilters.date_from,
                date_to: nextFilters.date_to,
                sort: nextFilters.sort === 'relevance' ? null : nextFilters.sort,
                page: 1,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters({ search: searchValue.trim() || null });
    };

    const clearFilters = () => {
        setSearchValue('');
        setMoreFiltersOpen(false);
        router.get(path, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const removeFilter = (key: keyof AdminEventFilters) => {
        if (key === 'search') setSearchValue('');
        applyFilters({ [key]: key === 'sort' ? 'relevance' : null });
    };

    const handleDateFromChange = (dateFrom: string | null) => {
        applyFilters({
            date_from: dateFrom,
            date_to: dateFrom && filters.date_to && dateFrom > filters.date_to ? null : filters.date_to,
        });
    };

    const handleTogglePublish = (id: string) => {
        setTogglingId(id);
        router.patch(
            `/api/event/${id}/publish`,
            {},
            {
                headers: { 'X-Municipality-Slug': slug },
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    const handleDelete = (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This will move it to the trash.`)) return;

        setDeletingId(id);
        router.delete(`/api/event/${id}`, {
            headers: { 'X-Municipality-Slug': slug },
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const activeFilterChips = [
        filters.search ? { key: 'search' as const, label: `Search: ${filters.search}` } : null,
        optionChip('schedule', filters.schedule, schedule_options),
        optionChip('publication', filters.publication, publication_options),
        optionChip('type', filters.type, type_options),
        filters.date_from ? { key: 'date_from' as const, label: `From: ${filters.date_from}` } : null,
        filters.date_to ? { key: 'date_to' as const, label: `To: ${filters.date_to}` } : null,
        filters.sort !== 'relevance' ? optionChip('sort', filters.sort, sort_options) : null,
    ].filter((chip): chip is { key: keyof AdminEventFilters; label: string } => chip !== null);

    return (
        <AppLayout>
            <Head title="Events" />

            <div className="m-6 space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
                        <p className="text-sm text-muted-foreground">Schedule and publish municipal events for your citizens.</p>
                    </div>

                    <Link href={`/${slug}/admin/event/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Event
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search event title or location..."
                            aria-label="Search event title or location"
                            className="min-w-0 flex-1"
                        />
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                    </form>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(150px,1fr))_auto_auto]">
                        <FilterSelect
                            value={filters.schedule}
                            placeholder="Schedule"
                            options={schedule_options}
                            onChange={(schedule) => applyFilters({ schedule })}
                        />
                        <FilterSelect
                            value={filters.publication}
                            placeholder="Publication"
                            options={publication_options}
                            onChange={(publication) => applyFilters({ publication })}
                        />
                        <FilterSelect value={filters.type} placeholder="Type" options={type_options} onChange={(type) => applyFilters({ type })} />
                        <FilterSelect
                            value={filters.sort}
                            placeholder="Sort"
                            options={sort_options}
                            allLabel={null}
                            onChange={(sort) => applyFilters({ sort: sort ?? 'relevance' })}
                        />

                        <Collapsible open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen} className="contents">
                            <CollapsibleTrigger asChild>
                                <Button type="button" variant="outline" className="gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    More filters
                                    <ChevronDown className={`h-4 w-4 transition-transform ${moreFiltersOpen ? 'rotate-180' : ''}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasActiveFilters} className="gap-2">
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                            <CollapsibleContent className="sm:col-span-2 xl:col-span-6">
                                <div className="mt-1 grid gap-2 rounded-md border bg-slate-50 p-3 sm:grid-cols-2">
                                    <label className="space-y-1 text-xs font-medium text-slate-600">
                                        Event date from
                                        <Input
                                            type="date"
                                            value={filters.date_from ?? ''}
                                            max={filters.date_to ?? undefined}
                                            onChange={(event) => handleDateFromChange(event.target.value || null)}
                                        />
                                    </label>
                                    <label className="space-y-1 text-xs font-medium text-slate-600">
                                        Event date to
                                        <Input
                                            type="date"
                                            value={filters.date_to ?? ''}
                                            min={filters.date_from ?? undefined}
                                            onChange={(event) => applyFilters({ date_to: event.target.value || null })}
                                        />
                                    </label>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    {activeFilterChips.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                            <span className="text-xs font-medium text-slate-500">Active filters:</span>
                            {activeFilterChips.map((chip) => (
                                <button
                                    key={chip.key}
                                    type="button"
                                    onClick={() => removeFilter(chip.key)}
                                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                                >
                                    {chip.label}
                                    <X className="h-3 w-3" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarDays className="h-8 w-8 opacity-40" />
                                                <span>{hasActiveFilters ? 'No events match the current filters.' : 'No events scheduled yet.'}</span>
                                                {hasActiveFilters && (
                                                    <Button type="button" variant="link" size="sm" onClick={clearFilters}>
                                                        Clear filters
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {list.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="max-w-[20rem]">
                                            <div className="flex items-center gap-3">
                                                {event.banner_url ? (
                                                    <img
                                                        src={event.banner_url}
                                                        alt={event.title}
                                                        className="h-10 w-14 shrink-0 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400">
                                                        <CalendarDays className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <span className="line-clamp-2 font-medium">{event.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClasses(
                                                    event.type.value,
                                                )}`}
                                            >
                                                {event.type.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            <div>{event.start_datetime ?? '—'}</div>
                                            <div className="opacity-70">
                                                {event.end_datetime ? `to ${event.end_datetime}` : 'No end time specified'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">
                                            {event.location_name ?? <span className="text-slate-400">No venue specified</span>}
                                        </TableCell>
                                        <TableCell>
                                            {event.is_published ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                    Draft
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/${slug}/admin/event/${event.id}`}>
                                                    <Button size="sm" variant="ghost" title="View">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/${slug}/admin/event/${event.id}/edit`}>
                                                    <Button size="sm" variant="ghost" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant={event.is_published ? 'outline' : 'default'}
                                                    onClick={() => handleTogglePublish(event.id)}
                                                    disabled={togglingId === event.id}
                                                >
                                                    {event.is_published ? 'Unpublish' : 'Publish'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(event.id, event.title)}
                                                    disabled={deletingId === event.id}
                                                    title="Delete"
                                                    className="text-destructive hover:bg-red-50 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        {events.meta.total === 0 ? 'No events' : `Showing ${events.meta.from}–${events.meta.to} of ${events.meta.total} events`}
                    </p>
                    <Pagination links={events.meta.links} />
                </div>
            </div>
        </AppLayout>
    );
}

interface FilterSelectProps {
    value: string | null;
    placeholder: string;
    options: EnumOption[];
    allLabel?: string | null;
    onChange: (value: string | null) => void;
}

function FilterSelect({ value, placeholder, options, allLabel, onChange }: FilterSelectProps) {
    return (
        <Select value={value ?? 'all'} onValueChange={(nextValue) => onChange(nextValue === 'all' ? null : nextValue)}>
            <SelectTrigger className="w-full bg-white">
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

function optionChip(key: keyof AdminEventFilters, value: string | null, options: EnumOption[]) {
    if (!value) return null;

    const label = options.find((option) => option.value === value)?.label ?? value;

    return { key, label };
}

function cleanQuery(query: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== null && value !== undefined && value !== ''));
}

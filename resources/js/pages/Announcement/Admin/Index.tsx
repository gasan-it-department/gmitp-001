import { Pagination } from '@/components/Shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Megaphone, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type EnumOption = { value: string; label: string };

interface AnnouncementListItem {
    id: string;
    title: string;
    type: EnumOption;
    is_published: boolean;
    images_count: number;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

interface AdminAnnouncementFilters {
    search: string | null;
    publication: string | null;
    type: string | null;
    sort: string;
}

interface Props {
    announcements: PaginatedResponse<AnnouncementListItem>;
    filters: AdminAnnouncementFilters;
    type_options: EnumOption[];
    publication_options: EnumOption[];
    sort_options: EnumOption[];
}

const typeBadgeClasses = (type: string): string => {
    switch (type) {
        case 'emergency':
            return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300';
        case 'advisory':
            return 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300';
        case 'utility_interruption':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'roadwork':
            return 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300';
        default:
            return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300';
    }
};

export default function AnnouncementAdminIndex({ announcements, filters, type_options, publication_options, sort_options }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const path = `/${slug}/admin/announcement`;

    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const list = announcements?.data ?? [];
    const hasActiveFilters = Boolean(filters.search || filters.publication || filters.type || filters.sort !== 'created_desc');

    useEffect(() => {
        setSearchValue(filters.search ?? '');
    }, [filters.search]);

    const applyFilters = (patch: Partial<AdminAnnouncementFilters>) => {
        const nextFilters = { ...filters, ...patch };

        router.get(
            path,
            cleanQuery({
                search: nextFilters.search,
                publication: nextFilters.publication,
                type: nextFilters.type,
                sort: nextFilters.sort === 'created_desc' ? null : nextFilters.sort,
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
        router.get(path, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const removeFilter = (key: keyof AdminAnnouncementFilters) => {
        if (key === 'search') setSearchValue('');
        applyFilters({ [key]: key === 'sort' ? 'created_desc' : null });
    };

    const activeFilterChips = [
        filters.search ? { key: 'search' as const, label: `Search: ${filters.search}` } : null,
        optionChip('publication', filters.publication, publication_options),
        optionChip('type', filters.type, type_options),
        filters.sort !== 'created_desc' ? optionChip('sort', filters.sort, sort_options) : null,
    ].filter((chip): chip is { key: keyof AdminAnnouncementFilters; label: string } => chip !== null);

    const handleTogglePublish = (id: string) => {
        setTogglingId(id);
        router.patch(
            `/api/announcement/${id}/publish`,
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
        router.delete(`/api/announcement/${id}`, {
            headers: { 'X-Municipality-Slug': slug },
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Announcements" />

            <div className="m-6 space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
                        <p className="text-sm text-muted-foreground">Publish public-facing bulletins to your municipality.</p>
                    </div>

                    <Link href={`/${slug}/admin/announcement/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Announcement
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search announcement titles..."
                            aria-label="Search announcement titles"
                            className="min-w-0 flex-1"
                        />
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                    </form>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(150px,1fr))_auto]">
                        <FilterSelect
                            value={filters.publication}
                            placeholder="Status"
                            options={publication_options}
                            onChange={(publication) => applyFilters({ publication })}
                        />
                        <FilterSelect value={filters.type} placeholder="Type" options={type_options} onChange={(type) => applyFilters({ type })} />
                        <FilterSelect
                            value={filters.sort}
                            placeholder="Sort"
                            options={sort_options}
                            allLabel={null}
                            onChange={(sort) => applyFilters({ sort: sort ?? 'created_desc' })}
                        />
                        <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasActiveFilters} className="gap-2">
                            <X className="h-4 w-4" />
                            Clear
                        </Button>
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
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Images</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                                <Megaphone className="h-8 w-8 opacity-40" />
                                                <span>
                                                    {hasActiveFilters ? 'No announcements match the current filters.' : 'No announcements yet.'}
                                                </span>
                                                {hasActiveFilters && (
                                                    <Button type="button" variant="link" size="sm" onClick={clearFilters}>
                                                        Clear filters
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {list.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="max-w-[28rem] font-medium">
                                            <span className="line-clamp-2">{a.title}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClasses(
                                                    a.type.value,
                                                )}`}
                                            >
                                                {a.type.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm tabular-nums">{a.images_count}</TableCell>
                                        <TableCell>
                                            {a.is_published ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                    Draft
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{a.created_at ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/${slug}/admin/announcement/${a.id}`}>
                                                    <Button size="sm" variant="ghost" title="View">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/${slug}/admin/announcement/${a.id}/edit`}>
                                                    <Button size="sm" variant="ghost" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant={a.is_published ? 'outline' : 'default'}
                                                    onClick={() => handleTogglePublish(a.id)}
                                                    disabled={togglingId === a.id}
                                                >
                                                    {a.is_published ? 'Unpublish' : 'Publish'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(a.id, a.title)}
                                                    disabled={deletingId === a.id}
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

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        {announcements.meta.total === 0
                            ? 'No announcements'
                            : `Showing ${announcements.meta.from}–${announcements.meta.to} of ${announcements.meta.total} announcements`}
                    </p>
                    <Pagination links={announcements.meta.links} />
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

function optionChip(key: keyof AdminAnnouncementFilters, value: string | null, options: EnumOption[]) {
    if (!value) return null;

    const label = options.find((option) => option.value === value)?.label ?? value;

    return { key, label };
}

function cleanQuery(query: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== null && value !== undefined && value !== ''));
}

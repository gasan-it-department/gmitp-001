import { Pagination } from '@/components/Shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DepartmentListItem } from '@/Core/Types/Department/department';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, Eye, Pencil, Plus, Power, PowerOff, Search, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type FilterOption = { value: string; label: string };

interface DepartmentFilters {
    search: string | null;
    status: string | null;
    sort: string;
}

interface Props {
    departments: PaginatedResponse<DepartmentListItem>;
    filters: DepartmentFilters;
    status_options: FilterOption[];
    sort_options: FilterOption[];
}

export default function DepartmentIndex({ departments, filters, status_options, sort_options }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const path = `/${slug}/department`;

    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const list = departments?.data ?? [];
    const hasActiveFilters = Boolean(filters.search || filters.status || filters.sort !== 'name_asc');

    useEffect(() => {
        setSearchValue(filters.search ?? '');
    }, [filters.search]);

    const applyFilters = (patch: Partial<DepartmentFilters>) => {
        const nextFilters = { ...filters, ...patch };

        router.get(
            path,
            cleanQuery({
                search: nextFilters.search,
                status: nextFilters.status,
                sort: nextFilters.sort === 'name_asc' ? null : nextFilters.sort,
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

    const removeFilter = (key: keyof DepartmentFilters) => {
        if (key === 'search') setSearchValue('');
        applyFilters({ [key]: key === 'sort' ? 'name_asc' : null });
    };

    const activeFilterChips = [
        filters.search ? { key: 'search' as const, label: `Search: ${filters.search}` } : null,
        optionChip('status', filters.status, status_options),
        filters.sort !== 'name_asc' ? optionChip('sort', filters.sort, sort_options) : null,
    ].filter((chip): chip is { key: keyof DepartmentFilters; label: string } => chip !== null);

    const handleToggle = (dept: DepartmentListItem) => {
        setTogglingId(dept.id);

        router.patch(
            `/api/department/toggle-status/${dept.id}`,
            {},
            {
                headers: { 'X-Municipality-Slug': slug },
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Departments" />

            <div className="m-6 space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
                        <p className="text-sm text-muted-foreground">Manage the LGU's offices and their profiles.</p>
                    </div>

                    <Link href={`/${slug}/department/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Department
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search department name or code..."
                            aria-label="Search department name or code"
                            className="min-w-0 flex-1"
                        />
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                    </form>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(2,minmax(180px,1fr))_auto]">
                        <FilterSelect
                            value={filters.status}
                            placeholder="Status"
                            options={status_options}
                            onChange={(status) => applyFilters({ status })}
                        />
                        <FilterSelect
                            value={filters.sort}
                            placeholder="Sort"
                            options={sort_options}
                            allLabel={null}
                            onChange={(sort) => applyFilters({ sort: sort ?? 'name_asc' })}
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
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                                <Building2 className="h-8 w-8 opacity-40" />
                                                <span>
                                                    {hasActiveFilters
                                                        ? 'No departments match the current filters.'
                                                        : 'No departments yet. Add a department to get started.'}
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

                                {list.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="font-mono text-xs font-semibold">{dept.code}</TableCell>
                                        <TableCell className="font-medium">{dept.name}</TableCell>
                                        <TableCell>
                                            {dept.is_active ? (
                                                <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/${slug}/department/show/${dept.id}`}>
                                                    <Button size="sm" variant="ghost" title="View">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/${slug}/department/edit/${dept.id}`}>
                                                    <Button size="sm" variant="ghost" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant={dept.is_active ? 'outline' : 'default'}
                                                    onClick={() => handleToggle(dept)}
                                                    disabled={togglingId === dept.id}
                                                >
                                                    {dept.is_active ? (
                                                        <>
                                                            <PowerOff className="mr-1 h-4 w-4" /> Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="mr-1 h-4 w-4" /> Activate
                                                        </>
                                                    )}
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
                        {departments.meta.total === 0
                            ? 'No departments'
                            : `Showing ${departments.meta.from}–${departments.meta.to} of ${departments.meta.total} departments`}
                    </p>
                    <Pagination links={departments.meta.links} />
                </div>
            </div>
        </AppLayout>
    );
}

interface FilterSelectProps {
    value: string | null;
    placeholder: string;
    options: FilterOption[];
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

function optionChip(key: keyof DepartmentFilters, value: string | null, options: FilterOption[]) {
    if (!value) return null;

    const label = options.find((option) => option.value === value)?.label ?? value;

    return { key, label };
}

function cleanQuery(query: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== null && value !== undefined && value !== ''));
}

import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import communityReportApi from '@/routes/api/communityReport';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Archive, Eye, EyeOff, FileText, Inbox, RotateCcw, Search, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type EnumOption = { value: string; label: string };

type ReporterShape = { id: string; full_name: string } | null;

type AdminReportFilters = {
    search: string | null;
    status: string | null;
    category: string | null;
    visibility: string | null;
    date_from: string | null;
    date_to: string | null;
    sort: string;
    archive_status: string;
    per_page: number;
};

type AdminReportListItem = {
    id: string;
    category: EnumOption;
    status: EnumOption;
    location_text: string;
    is_anonymous: boolean;
    reporter: ReporterShape;
    is_archived: boolean;
    archived_at: string | null;
    created_at: string | null;
};

interface CommunityReportPageProps {
    reports: PaginatedResponse<AdminReportListItem>;
    filters: AdminReportFilters;
    status_options: EnumOption[];
    category_options: EnumOption[];
    visibility_options: EnumOption[];
    sort_options: EnumOption[];
    archive_status_options: EnumOption[];
    per_page_options: number[];
}

const statusBadgeClasses = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
        case 'in_progress':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'resolved':
            return 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-300';
        case 'rejected':
            return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300';
        default:
            return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
    }
};

export default function CommunityReportsPage({
    reports,
    filters,
    status_options,
    category_options,
    visibility_options,
    sort_options,
    archive_status_options,
    per_page_options,
}: CommunityReportPageProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const path = `/${slug}/admin/community-reports`;
    const hasNarrowingFilters = Boolean(
        filters.search || filters.status || filters.category || filters.visibility || filters.date_from || filters.date_to,
    );
    const hasActiveFilters = Boolean(
        hasNarrowingFilters || filters.sort !== 'newest' || filters.archive_status !== 'active' || filters.per_page !== 20,
    );

    useEffect(() => {
        setSearchValue(filters.search ?? '');
    }, [filters.search]);

    const applyFilters = (patch: Partial<AdminReportFilters>) => {
        const nextFilters = {
            ...filters,
            ...patch,
        };

        router.get(
            path,
            cleanQuery({
                search: nextFilters.search,
                status: nextFilters.status,
                category: nextFilters.category,
                visibility: nextFilters.visibility,
                date_from: nextFilters.date_from,
                date_to: nextFilters.date_to,
                sort: nextFilters.sort === 'newest' ? null : nextFilters.sort,
                archive_status: nextFilters.archive_status === 'active' ? null : nextFilters.archive_status,
                per_page: nextFilters.per_page === 20 ? null : nextFilters.per_page,
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

    const restoreReport = (reportId: string) => {
        setRestoringId(reportId);
        router.post(
            communityReportApi.restore.url(reportId),
            {},
            {
                headers: { 'X-Municipality-Slug': slug },
                preserveScroll: true,
                onFinish: () => setRestoringId(null),
            },
        );
    };

    const emptyTitle =
        filters.archive_status === 'archived' && !hasNarrowingFilters
            ? 'No archived reports.'
            : hasNarrowingFilters
              ? 'No reports match the current filters.'
              : 'No community reports yet.';

    return (
        <AppLayout>
            <Head title="Community Reports — Admin" />

            <div className="mx-auto min-h-screen w-full bg-slate-50/50 p-8">
                {/* 1. Page Header */}
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                            <FileText className="h-6 w-6 text-slate-500" />
                            Community Reports
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Manage and track all community reports for {currentMunicipality.name}.</p>
                    </div>
                    <div className="text-xs text-slate-500">
                        {reports.meta.total} total {reports.meta.total === 1 ? 'report' : 'reports'}
                    </div>
                </div>

                <Tabs value={filters.archive_status} onValueChange={(archiveStatus) => applyFilters({ archive_status: archiveStatus })}>
                    <TabsList className="mb-4 h-10 border border-slate-200 bg-white p-1">
                        {archive_status_options.map((option) => (
                            <TabsTrigger key={option.value} value={option.value} className="gap-2 px-4">
                                {option.value === 'archived' && <Archive className="h-4 w-4" />}
                                {option.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <form onSubmit={submitSearch} className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_auto]">
                        <Input
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search location, description, or reporter..."
                        />
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                    </form>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(6,minmax(130px,1fr))_auto]">
                        <FilterSelect
                            value={filters.status}
                            placeholder="Status"
                            options={status_options}
                            onChange={(status) => applyFilters({ status })}
                        />
                        <FilterSelect
                            value={filters.category}
                            placeholder="Category"
                            options={category_options}
                            onChange={(category) => applyFilters({ category })}
                        />
                        <FilterSelect
                            value={filters.visibility}
                            placeholder="Visibility"
                            options={visibility_options}
                            onChange={(visibility) => applyFilters({ visibility })}
                        />
                        <Input
                            type="date"
                            value={filters.date_from ?? ''}
                            onChange={(event) => applyFilters({ date_from: event.target.value || null })}
                            aria-label="From date"
                        />
                        <Input
                            type="date"
                            value={filters.date_to ?? ''}
                            onChange={(event) => applyFilters({ date_to: event.target.value || null })}
                            aria-label="To date"
                        />
                        <FilterSelect
                            value={filters.sort}
                            placeholder="Sort"
                            options={sort_options}
                            allLabel={null}
                            onChange={(sort) => applyFilters({ sort: sort ?? 'newest' })}
                        />
                        <div className="flex gap-2">
                            <FilterSelect
                                value={String(filters.per_page)}
                                placeholder="Per page"
                                options={per_page_options.map((value) => ({ value: String(value), label: `${value} / page` }))}
                                allLabel={null}
                                onChange={(perPage) => applyFilters({ per_page: Number(perPage ?? 20) })}
                            />
                            <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasActiveFilters} className="shrink-0 gap-2">
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. Data Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {reports.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <Inbox className="mb-3 h-10 w-10 text-slate-400" />
                            <p className="text-base font-semibold text-slate-900">{emptyTitle}</p>
                            <p className="mt-1 text-sm text-slate-500">
                                {hasNarrowingFilters
                                    ? 'Adjust or clear the filters to see more community reports.'
                                    : filters.archive_status === 'archived'
                                      ? 'Resolved or rejected reports will appear here after they are archived.'
                                      : `When citizens file reports for ${currentMunicipality.name}, they'll appear here.`}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">Reporter</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {reports.data.map((report) => (
                                        <tr
                                            key={report.id}
                                            className={`transition-colors hover:bg-slate-50/60 ${report.is_archived ? 'bg-slate-50/50' : ''}`}
                                        >
                                            <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-700">
                                                <div>{report.created_at ?? '—'}</div>
                                                {report.archived_at && (
                                                    <div className="mt-1 text-xs text-slate-400">Archived {report.archived_at}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">{report.reporter?.full_name ?? 'Unknown'}</span>
                                                    {report.is_anonymous && (
                                                        <span
                                                            title="Citizen requested anonymity — do not publish this name."
                                                            className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 ring-1 ring-purple-300 ring-inset"
                                                        >
                                                            <EyeOff className="h-3 w-3" />
                                                            Anonymous to Public
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{report.category.label}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                <span className="line-clamp-1 max-w-xs">{report.location_text}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClasses(
                                                            report.status.value,
                                                        )}`}
                                                    >
                                                        {report.status.label}
                                                    </span>
                                                    {report.is_archived && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                                                            <Archive className="h-3 w-3" />
                                                            Archived
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {report.is_archived && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={restoringId === report.id}
                                                            onClick={() => restoreReport(report.id)}
                                                        >
                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                            Restore
                                                        </Button>
                                                    )}
                                                    <Link href={`/${slug}/admin/community-reports/${report.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 3. Pagination */}
                <div className="mt-4 flex justify-end">
                    <Pagination links={reports.meta.links} />
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

function cleanQuery(query: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== null && value !== undefined && value !== ''));
}

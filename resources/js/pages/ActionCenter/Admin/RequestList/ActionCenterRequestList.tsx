import ListAssistanceRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ListAssistanceRequestController';
import ListMyAssistanceRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ListMyAssistanceRequestController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Inbox, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AssistanceRequestRegistryItem from './Components/AssistanceRequestRegistryItem';
import { AssistanceRequestListItem, AssistanceRequestPaginator, AssistanceRequestTable } from './Components/AssistanceRequestTable';

interface AssistanceTypeOption {
    id: string;
    name: string;
}

interface Filters {
    status?: string | null;
    assistance_type_id?: string | null;
    search?: string | null;
    date_from?: string | null;
    date_to?: string | null;
    per_page?: number | null;
}

type ViewMode = 'all' | 'mine';

interface Props {
    requests: AssistanceRequestPaginator;
    filters: Filters;
    assistanceTypes: AssistanceTypeOption[];
    viewMode?: ViewMode;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'released', label: 'Released' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
];

// Radix Select does not accept an empty string as an item value.
const ALL = '__all__';

export default function ActionCenterRequestList({ requests, filters, assistanceTypes, viewMode = 'all' }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const isMine = viewMode === 'mine';
    const baseListUrl = isMine
        ? ListMyAssistanceRequestController.url({ municipality: currentMunicipality.slug })
        : ListAssistanceRequestController.url({ municipality: currentMunicipality.slug });

    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [status, setStatus] = useState<string>(filters.status ?? ALL);
    const [assistanceTypeId, setAssistanceTypeId] = useState<string>(filters.assistance_type_id ?? ALL);
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to ?? '');
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    const isFirstSearchRender = useRef(true);

    useEffect(() => {
        if (isFirstSearchRender.current) {
            isFirstSearchRender.current = false;
            return;
        }

        const handle = setTimeout(() => {
            applyFilters({ search });
        }, 400);

        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applyFilters = (overrides: Partial<Filters>) => {
        const next: Record<string, string | undefined> = {
            status: toQuery(status, overrides.status),
            assistance_type_id: toQuery(assistanceTypeId, overrides.assistance_type_id),
            search: firstDefined(overrides.search, search) || undefined,
            date_from: firstDefined(overrides.date_from, dateFrom) || undefined,
            date_to: firstDefined(overrides.date_to, dateTo) || undefined,
        };

        router.get(baseListUrl, stripEmpty(next), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus(ALL);
        setAssistanceTypeId(ALL);
        setDateFrom('');
        setDateTo('');

        router.get(baseListUrl, {}, { preserveState: false, preserveScroll: true, replace: true });
    };

    const rows = requests.data ?? [];
    const hasActiveFilters = Boolean(search.trim() || (!isMine && status !== ALL) || assistanceTypeId !== ALL || dateFrom || dateTo);
    const advancedFilterCount = [!isMine && status !== ALL, assistanceTypeId !== ALL, Boolean(dateFrom), Boolean(dateTo)].filter(Boolean).length;

    const handleView = (row: AssistanceRequestListItem) => {
        router.get(requestUrl(row));
    };

    const requestUrl = (row: AssistanceRequestListItem) =>
        ShowAssistanceRequestProfileController.url({
            municipality: currentMunicipality.slug,
            assistanceRequest: row.id,
        });

    return (
        <AdminLayout>
            <main className="space-y-4 px-3 py-4 sm:px-4 md:space-y-5 md:px-5 lg:px-6 lg:py-6">
                <nav className="grid w-full grid-cols-2 gap-1 rounded-md bg-slate-100 p-1 text-sm md:w-fit" aria-label="Assistance request views">
                    <Link
                        href={ListMyAssistanceRequestController.url({ municipality: currentMunicipality.slug })}
                        className={
                            isMine
                                ? 'rounded-md bg-slate-900 px-3 py-2 text-center font-semibold text-white'
                                : 'rounded-md px-3 py-2 text-center font-medium text-slate-500 hover:text-slate-900'
                        }
                    >
                        My Active
                    </Link>
                    <Link
                        href={ListAssistanceRequestController.url({ municipality: currentMunicipality.slug })}
                        className={
                            !isMine
                                ? 'rounded-md bg-slate-900 px-3 py-2 text-center font-semibold text-white'
                                : 'rounded-md px-3 py-2 text-center font-medium text-slate-500 hover:text-slate-900'
                        }
                    >
                        All Cases
                    </Link>
                </nav>

                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{isMine ? 'My Active Cases' : 'Assistance Requests'}</h1>
                        <p className="text-sm text-gray-500">
                            {isMine
                                ? `Cases currently assigned to you in ${currentMunicipality.name}.`
                                : `Review every assistance request filed in ${currentMunicipality.name}.`}
                        </p>
                    </div>
                    <p className="text-sm text-gray-500">{requests.meta?.total ?? rows.length} requests</p>
                </div>

                <div className="rounded-md border border-gray-200 bg-gray-50/60 p-3 md:p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 md:block">
                        <div className="min-w-0">
                            <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Search</label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Transaction, filer, or assisted person"
                                    className="h-10 pl-9"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 px-3 md:hidden"
                            aria-expanded={advancedFiltersOpen}
                            aria-controls="assistance-request-advanced-filters"
                            onClick={() => setAdvancedFiltersOpen((open) => !open)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden min-[360px]:inline">Filters</span>
                            {advancedFilterCount > 0 && <span className="text-xs">({advancedFilterCount})</span>}
                            <ChevronDown className={`h-4 w-4 transition-transform ${advancedFiltersOpen ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>

                    <div
                        id="assistance-request-advanced-filters"
                        className={`${advancedFiltersOpen ? 'grid' : 'hidden'} mt-3 grid-cols-1 items-end gap-3 md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[minmax(160px,0.8fr)_minmax(220px,1fr)_minmax(150px,0.75fr)_minmax(150px,0.75fr)_auto]`}
                    >
                        {!isMine && (
                            <div className="min-w-0">
                                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Status</label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => {
                                        setStatus(value);
                                        applyFilters({ status: value });
                                    }}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All statuses</SelectItem>
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="min-w-0">
                            <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Program</label>
                            <Select
                                value={assistanceTypeId}
                                onValueChange={(value) => {
                                    setAssistanceTypeId(value);
                                    applyFilters({ assistance_type_id: value });
                                }}
                            >
                                <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="All programs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All programs</SelectItem>
                                    {assistanceTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-0">
                            <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">From</label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => {
                                    setDateFrom(event.target.value);
                                    applyFilters({ date_from: event.target.value });
                                }}
                                className="h-10 w-full"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">To</label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(event) => {
                                    setDateTo(event.target.value);
                                    applyFilters({ date_to: event.target.value });
                                }}
                                className="h-10 w-full"
                            />
                        </div>

                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-10 w-full text-xs text-gray-600 hover:text-gray-900 md:w-auto"
                                onClick={() => {
                                    clearFilters();
                                    setAdvancedFiltersOpen(false);
                                }}
                            >
                                <X className="h-4 w-4" /> Clear
                            </Button>
                        )}
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gray-200 bg-gray-50/40 px-6 py-12 text-center">
                        <Inbox className="h-8 w-8 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">
                            {isMine ? 'You have no active cases right now.' : 'No assistance requests match the selected filters.'}
                        </p>
                        {isMine && (
                            <p className="text-xs text-gray-500">
                                Pick one up from the{' '}
                                <Link
                                    href={`${ListAssistanceRequestController.url({ municipality: currentMunicipality.slug })}?status=pending`}
                                    className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                                >
                                    Pending Queue
                                </Link>{' '}
                                to get started.
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-2 md:gap-3 lg:grid-cols-2 2xl:hidden">
                            {rows.map((row) => (
                                <AssistanceRequestRegistryItem key={row.id} row={row} viewUrl={requestUrl(row)} />
                            ))}
                        </div>

                        <div className="hidden 2xl:block">
                            <AssistanceRequestTable paginator={requests} onView={handleView} getViewUrl={requestUrl} />
                        </div>
                        <Pagination links={requests.meta?.links ?? []} />
                    </>
                )}
            </main>
        </AdminLayout>
    );
}

function toQuery(stateValue: string, override?: string | null): string | undefined {
    const value = override !== undefined ? override : stateValue;

    if (!value || value === ALL) {
        return undefined;
    }

    return value;
}

function firstDefined<T>(...values: (T | null | undefined)[]): T | undefined {
    for (const value of values) {
        if (value !== undefined && value !== null) {
            return value;
        }
    }

    return undefined;
}

function stripEmpty(values: Record<string, string | undefined>): Record<string, string> {
    return Object.fromEntries(Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1])));
}

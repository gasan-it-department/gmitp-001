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
import { Inbox, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AssistanceRequestListItem, AssistanceRequestPaginator, AssistanceRequestTable } from './Components/AssistanceRequestTable';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
    /**
     * 'all'  → All Cases page (default). Status filter visible.
     * 'mine' → My Cases page. Status is server-pinned to under_review
     *          and the status filter dropdown is hidden.
     */
    viewMode?: ViewMode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static options
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'released', label: 'Released' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
];

// Sentinel value for "no filter" — Radix Select doesn't accept empty strings
// as item values, so we use a literal and translate it at the router boundary.
const ALL = '__all__';

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin queue for assistance requests.
 *
 * Responsibilities (page-level concerns):
 *   - Filter bar wiring → updates the query string via Inertia partial reloads
 *   - Search input debouncing (400ms) so typing doesn't spam the server
 *   - Pagination → renders LengthAwarePaginator links
 *   - View action → navigates to the request detail route
 *
 * Rendering of each row belongs to <AssistanceRequestTable />, which is kept
 * presentation-only so it can be reused from other listing contexts later.
 */
export default function ActionCenterRequestList({ requests, filters, assistanceTypes, viewMode = 'all' }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const isMine = viewMode === 'mine';

    // Filter submissions need to go to the SAME route the page is rendered
    // from — otherwise switching the Program dropdown on My Cases would
    // bounce the admin over to All Cases.
    const baseListUrl = isMine
        ? ListMyAssistanceRequestController.url({ municipality: currentMunicipality.slug })
        : ListAssistanceRequestController.url({ municipality: currentMunicipality.slug });
    // Local mirror of server-side filter state. Submitting these triggers an
    // Inertia partial reload — we don't track loading state here because the
    // page itself is a navigation target and Inertia handles the spinner.
    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [status, setStatus] = useState<string>(filters.status ?? ALL);
    const [assistanceTypeId, setAssistanceTypeId] = useState<string>(filters.assistance_type_id ?? ALL);
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to ?? '');

    // ─── Debounced search ────────────────────────────────────────────────────
    // Skip the initial run so the page doesn't trigger an immediate re-fetch
    // on every navigation. After mount, any change to `search` waits 400ms
    // before pushing to the server.
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

    // ─── Filter dispatch ─────────────────────────────────────────────────────
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

        router.get(
            baseListUrl,
            {},
            { preserveState: false, preserveScroll: true, replace: true },
        );
    };

    const hasActiveFilters =
        (filters.search ?? '') !== '' ||
        (filters.status ?? '') !== '' ||
        (filters.assistance_type_id ?? '') !== '' ||
        (filters.date_from ?? '') !== '' ||
        (filters.date_to ?? '') !== '';

    // ─── Row actions ─────────────────────────────────────────────────────────
    const handleView = (row: AssistanceRequestListItem) => {
        router.get(
            ShowAssistanceRequestProfileController.url({
                municipality:      currentMunicipality.slug,
                assistanceRequest: row.id,
            }),
        );
    };

    return (
        <AdminLayout>
            <div className="m-5 mt-0 grid grid-cols-1 bg-white">
                {/* ── View switcher ── */}
                <nav className="mt-5 mb-1 flex items-center gap-2 text-sm">
                    <Link
                        href={ListMyAssistanceRequestController.url({ municipality: currentMunicipality.slug })}
                        className={
                            isMine
                                ? 'rounded-md bg-slate-900 px-3 py-1.5 font-semibold text-white'
                                : 'rounded-md px-3 py-1.5 font-medium text-slate-500 hover:text-slate-900'
                        }
                    >
                        My Active
                    </Link>
                    <Link
                        href={ListAssistanceRequestController.url({ municipality: currentMunicipality.slug })}
                        className={
                            !isMine
                                ? 'rounded-md bg-slate-900 px-3 py-1.5 font-semibold text-white'
                                : 'rounded-md px-3 py-1.5 font-medium text-slate-500 hover:text-slate-900'
                        }
                    >
                        All Cases
                    </Link>
                </nav>

                {/* ── Header ── */}
                <div className="mt-2 mb-5 flex items-center justify-between">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isMine ? 'My Active Cases' : 'Assistance Requests'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isMine
                                ? `Cases currently assigned to you in ${currentMunicipality.name}.`
                                : `Review every assistance request filed in ${currentMunicipality.name}.`}
                        </p>
                    </div>
                </div>

                {/* ── Filter Bar ── */}
                <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                    {/* Search */}
                    <div className="min-w-[220px] flex-1">
                        <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Search</label>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Ref no., name, or family member…"
                                className="h-10 pl-9"
                            />
                        </div>
                    </div>

                    {/* Status — hidden on My Cases (status is server-pinned to under_review) */}
                    {!isMine && (
                        <div className="min-w-[160px]">
                            <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Status</label>
                            <Select
                                value={status}
                                onValueChange={(v) => {
                                    setStatus(v);
                                    applyFilters({ status: v });
                                }}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All statuses</SelectItem>
                                    {STATUS_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Program */}
                    <div className="min-w-[200px]">
                        <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Program</label>
                        <Select
                            value={assistanceTypeId}
                            onValueChange={(v) => {
                                setAssistanceTypeId(v);
                                applyFilters({ assistance_type_id: v });
                            }}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All programs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All programs</SelectItem>
                                {assistanceTypes.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date range */}
                    <div>
                        <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">From</label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                applyFilters({ date_from: e.target.value });
                            }}
                            className="h-10"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">To</label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                applyFilters({ date_to: e.target.value });
                            }}
                            className="h-10"
                        />
                    </div>

                    {/* Clear */}
                    {hasActiveFilters && (
                        <Button type="button" variant="ghost" className="h-10 text-xs text-gray-600 hover:text-gray-900" onClick={clearFilters}>
                            <X className="mr-1 h-4 w-4" /> Clear
                        </Button>
                    )}
                </div>

                {/* ── Empty-state copy for My Cases ── */}
                {isMine && (requests.data?.length ?? 0) === 0 && (
                    <div className="mb-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-6 py-10 text-center">
                        <Inbox className="h-8 w-8 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">You have no active cases right now.</p>
                        <p className="text-xs text-gray-500">
                            Pick one up from the{' '}
                            <Link
                                href={`${ListAssistanceRequestController.url({ municipality: currentMunicipality.slug })}?status=pending`}
                                className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                            >
                                Pending Queue
                            </Link>
                            {' '}to get started.
                        </p>
                    </div>
                )}

                {/* ── Table ── */}
                {(!isMine || (requests.data?.length ?? 0) > 0) && (
                    <>
                        <AssistanceRequestTable paginator={requests} onView={handleView} />
                        <Pagination links={requests.meta?.links ?? []} />
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Translate the local state's "ALL" sentinel into a query-string value (undefined = omit). */
function toQuery(stateValue: string, override?: string | null): string | undefined {
    const v = override !== undefined ? override : stateValue;
    if (!v || v === ALL) return undefined;
    return v;
}

/** Returns the first defined argument (treats `undefined` as "not provided"). */
function firstDefined<T>(...values: (T | null | undefined)[]): T | undefined {
    for (const v of values) {
        if (v !== undefined && v !== null) return v;
    }
    return undefined;
}

/** Drops keys whose values are empty / undefined — keeps URLs clean. */
function stripEmpty(obj: Record<string, string | undefined>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== '') {
            out[k] = v;
        }
    }
    return out;
}

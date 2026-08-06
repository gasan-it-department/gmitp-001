import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import ShowBeneficiarySearchController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiarySearchController';
import ShowCreateWalkInBeneficiaryController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Walkin/ShowCreateWalkInBeneficiaryController';
import { Pagination } from '@/components/Shared/Pagination';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Loader2, SearchX, ShieldCheck, UserPlus, UserSearch } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import BeneficiaryResultCard from './Components/BeneficiaryResultCard';
import SearchFilters from './Components/SearchFilters';

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror App\External\Api\Resources\ActionCenter\Beneficiary\BeneficiaryListResource
// ─────────────────────────────────────────────────────────────────────────────

export interface BeneficiaryRow {
    id: string;
    beneficiary_number: string | null;
    avatar_url: string | null;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string | null;
    sex_label: string | null;
    birth_date: string | null;
    age: number | null;
    civil_status: string | null;
    civil_status_label: string | null;
    occupation: string | null;
    monthly_income: number | null;
    barangay?: string | null;
    street?: string | null;
    has_account: boolean;
    account_email?: string | null;
    total_requests: number;
    released_count: number;
    last_released_at: string | null;
    last_request_at: string | null;
    identity_verified: boolean;
    identity_verified_at: string | null;
    intake_status: 'pending' | 'verified' | 'rejected';
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Meta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginatorLink[];
}

interface ResultsPaginator {
    data: BeneficiaryRow[];
    meta?: Meta;
}

interface Filters {
    search?: string | null;
    birth_date?: string | null;
    barangay?: string | null;
    sex?: string | null;
    verification?: string | null;
}

interface Props {
    results: ResultsPaginator;
    filters: Filters;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin beneficiary lookup — the interview screen.
 *
 * Search state lives in the URL (Inertia partial reloads, same pattern as the
 * assistance-request list), so a search is bookmarkable and survives a refresh.
 *
 * This is the system's primary duplicate-control point: the admin compares each
 * hit against the uploaded government ID. The server search is deliberately
 * fuzzy; on top of that we flag client-side when two results share the same
 * name + birthdate (a possible duplicate registration).
 */
export default function BeneficiarySearch({ results, filters }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { can } = usePermissions();
    const canManageBeneficiaries = can('action_center.beneficiaries.manage');
    const baseUrl = ShowBeneficiarySearchController.url({ municipality: currentMunicipality.slug });

    // Local mirror of the server-side filter state.
    const [search, setSearch] = useState(filters.search ?? '');
    const [birthDate, setBirthDate] = useState(filters.birth_date ?? '');
    const [barangay, setBarangay] = useState(filters.barangay ?? '');
    const [sex, setSex] = useState(filters.sex ?? '');
    const [verification, setVerification] = useState(filters.verification ?? '');
    const [searching, setSearching] = useState(false);

    const rows = useMemo(() => results.data ?? [], [results.data]);
    const meta = results.meta ?? null;
    const hasCriteria = Boolean(search.trim() || birthDate || barangay.trim() || sex || verification);

    // ── Debounced text filters (name + barangay) ─────────────────────────────
    // Skip the first run so navigating to the page doesn't re-fetch immediately.
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const handle = setTimeout(() => applyFilters({}), 350);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, barangay]);

    // ── Filter dispatch → Inertia partial reload (URL = state) ───────────────
    const applyFilters = (overrides: Partial<Filters>) => {
        const next = stripEmpty({
            search: firstDefined(overrides.search, search),
            birth_date: firstDefined(overrides.birth_date, birthDate),
            barangay: firstDefined(overrides.barangay, barangay),
            sex: firstDefined(overrides.sex, sex),
            verification: firstDefined(overrides.verification, verification),
        });

        router.get(baseUrl, next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setSearching(true),
            onFinish: () => setSearching(false),
        });
    };

    const clearFilters = () => {
        setSearch('');
        setBirthDate('');
        setBarangay('');
        setSex('');
        setVerification('');
        router.get(baseUrl, {}, { preserveState: false, preserveScroll: true, replace: true });
    };

    // ── Client-side duplicate flagging (same name + birthdate) ───────────────
    const duplicateKeys = useMemo(() => {
        const counts = new Map<string, number>();
        for (const r of rows) {
            counts.set(dupKey(r), (counts.get(dupKey(r)) ?? 0) + 1);
        }
        return new Set([...counts.entries()].filter(([, c]) => c > 1).map(([k]) => k));
    }, [rows]);

    return (
        <AdminLayout>
            <main className="space-y-4 px-3 py-4 sm:px-4 md:space-y-5 md:px-5 lg:px-6 lg:py-6">
                {/* ── Header ── */}
                <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-md bg-slate-900 p-2.5 text-white">
                        <UserSearch className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">Find a Beneficiary</h1>
                        <p className="text-sm text-gray-500">
                            Search the registry for {currentMunicipality.name} during the interview. Match every result against the applicant&rsquo;s
                            uploaded government ID before approving.
                        </p>
                    </div>
                </div>

                {/* ── ID-verification reminder ── */}
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 md:px-4">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        A new account does not mean a new person. Confirm identity against the uploaded ID — duplicates are caught here, by you.
                    </span>
                </div>

                {/* ── Filters ── */}
                <SearchFilters
                    search={search}
                    onSearch={setSearch}
                    birthDate={birthDate}
                    onBirthDate={(v) => {
                        setBirthDate(v);
                        applyFilters({ birth_date: v });
                    }}
                    barangay={barangay}
                    onBarangay={setBarangay}
                    sex={sex}
                    onSex={(v) => {
                        setSex(v);
                        applyFilters({ sex: v });
                    }}
                    verification={verification}
                    onVerification={(v) => {
                        setVerification(v);
                        applyFilters({ verification: v });
                    }}
                    onClear={clearFilters}
                    hasCriteria={hasCriteria}
                    loading={searching}
                    collapseOnMobile
                />

                {/* ── Result count / status line ── */}
                {hasCriteria && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        {searching ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                            </>
                        ) : meta ? (
                            <span>
                                {meta.total} {meta.total === 1 ? 'match' : 'matches'} found
                                {duplicateKeys.size > 0 && (
                                    <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                                        {duplicateKeys.size} possible duplicate{duplicateKeys.size === 1 ? '' : 's'}
                                    </span>
                                )}
                            </span>
                        ) : null}
                    </div>
                )}

                {/* ── Empty prompt (no criteria yet) ── */}
                {!hasCriteria && (
                    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gray-200 bg-gray-50/60 px-4 py-12 text-center md:px-6 md:py-16">
                        <UserSearch className="h-9 w-9 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">Start typing to search the beneficiary registry.</p>
                        <p className="max-w-md text-xs text-gray-500">
                            Try a last name, or narrow down with a birthdate — spelling can vary, but a birthdate rarely does.
                        </p>
                    </div>
                )}

                {/* ── No results ── */}
                {hasCriteria && !searching && rows.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gray-200 bg-gray-50/60 px-4 py-12 text-center md:px-6 md:py-16">
                        <SearchX className="h-9 w-9 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">No beneficiary matches these details.</p>
                        <p className="max-w-md text-xs text-gray-500">
                            Loosen the search (fewer words, drop the middle name) before concluding this is a first-time applicant.
                        </p>
                        {canManageBeneficiaries && (
                            <Link
                                href={ShowCreateWalkInBeneficiaryController.url({ municipality: currentMunicipality.slug })}
                                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
                            >
                                <UserPlus className="h-4 w-4" />
                                Register walk-in beneficiary
                            </Link>
                        )}
                    </div>
                )}

                {/* ── Results ── */}
                {rows.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 md:gap-3">
                        {rows.map((row) => (
                            <BeneficiaryResultCard
                                key={row.id}
                                row={row}
                                isPossibleDuplicate={duplicateKeys.has(dupKey(row))}
                                profileHref={ShowBeneficiaryProfileController.url({
                                    municipality: currentMunicipality.slug,
                                    beneficiaryId: row.id,
                                })}
                            />
                        ))}
                    </div>
                )}

                {/* ── Pagination (URL-param links, preserves filters) ── */}
                <Pagination links={meta?.links ?? []} />
            </main>
        </AdminLayout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Identity key used to flag two results as a possible duplicate registration. */
function dupKey(r: BeneficiaryRow): string {
    return `${r.last_name}|${r.first_name}|${r.middle_name ?? ''}|${r.birth_date ?? ''}`.toLowerCase().trim();
}

/** Returns the first defined argument (treats `undefined` as "not provided"). */
function firstDefined<T>(...values: (T | null | undefined)[]): T | undefined {
    for (const v of values) {
        if (v !== undefined && v !== null) return v;
    }
    return undefined;
}

/** Drops empty / undefined values so the URL stays clean. */
function stripEmpty(obj: Record<string, string | undefined>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v.trim() !== '') {
            out[k] = v;
        }
    }
    return out;
}

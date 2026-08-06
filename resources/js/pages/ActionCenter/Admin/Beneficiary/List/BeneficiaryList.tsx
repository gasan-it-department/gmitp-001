import ListBeneficiaryController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ListBeneficiaryController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import actionCenter from '@/routes/actionCenter';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Clock3, Loader2, OctagonX, Plus, UserCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { BeneficiaryRow } from '../BeneficiarySearch';
import SearchFilters from '../Components/SearchFilters';
import BeneficiaryRegistryItem from './Components/BeneficiaryRegistryItem';

interface Filters {
    search?: string | null;
    birth_date?: string | null;
    barangay?: string | null;
    sex?: string | null;
    verification?: string | null;
}

interface Props {
    beneficiaries: {
        data: BeneficiaryRow[];
        meta?: {
            total: number;
            from: number | null;
            to: number | null;
            links: { url: string | null; label: string; active: boolean }[];
        };
    };
    filters: Filters;
}

export default function BeneficiaryList({ beneficiaries, filters }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { can } = usePermissions();
    const canManageBeneficiaries = can('action_center.beneficiaries.manage');
    const baseUrl = ListBeneficiaryController.url({ municipality: currentMunicipality.slug });
    const [search, setSearch] = useState(filters.search ?? '');
    const [birthDate, setBirthDate] = useState(filters.birth_date ?? '');
    const [barangay, setBarangay] = useState(filters.barangay ?? '');
    const [sex, setSex] = useState(filters.sex ?? '');
    const [verification, setVerification] = useState(filters.verification ?? '');
    const [loading, setLoading] = useState(false);
    const firstRender = useRef(true);

    const rows = beneficiaries.data ?? [];
    const meta = beneficiaries.meta;
    const hasCriteria = Boolean(search.trim() || birthDate || barangay.trim() || sex || verification);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => applyFilters({}), 350);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, barangay]);

    const applyFilters = (overrides: Partial<Filters>) => {
        const query = stripEmpty({
            search: overrides.search ?? search,
            birth_date: overrides.birth_date ?? birthDate,
            barangay: overrides.barangay ?? barangay,
            sex: overrides.sex ?? sex,
            verification: overrides.verification ?? verification,
        });

        router.get(baseUrl, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    const clearFilters = () => {
        setSearch('');
        setBirthDate('');
        setBarangay('');
        setSex('');
        setVerification('');
        router.get(baseUrl, {}, { preserveState: false, replace: true });
    };

    return (
        <AdminLayout>
            <main className="space-y-4 px-3 py-4 sm:px-4 md:space-y-5 md:px-5 lg:px-6 lg:py-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Beneficiaries</h1>
                        <p className="text-sm text-muted-foreground">
                            Registry for {currentMunicipality.name}
                            <span className="sm:hidden"> / {meta?.total ?? 0} records</span>
                        </p>
                    </div>

                    <div className="flex w-full items-center gap-4 md:w-auto">
                        <div className="hidden flex-1 text-right text-sm text-muted-foreground sm:block">
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading
                                </span>
                            ) : (
                                <span>{meta?.total ?? 0} records</span>
                            )}
                        </div>
                        {canManageBeneficiaries && (
                            <Link
                                className="w-full md:w-auto"
                                href={actionCenter.admin.walkin.create.url({ municipality: currentMunicipality.slug })}
                            >
                                <Button type="button" className="w-full md:w-auto">
                                    <Plus className="h-4 w-4" /> Register Walk-in
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <SearchFilters
                    search={search}
                    onSearch={setSearch}
                    birthDate={birthDate}
                    onBirthDate={(value) => {
                        setBirthDate(value);
                        applyFilters({ birth_date: value });
                    }}
                    barangay={barangay}
                    onBarangay={setBarangay}
                    sex={sex}
                    onSex={(value) => {
                        setSex(value);
                        applyFilters({ sex: value });
                    }}
                    verification={verification}
                    onVerification={(value) => {
                        setVerification(value);
                        applyFilters({ verification: value });
                    }}
                    onClear={clearFilters}
                    hasCriteria={hasCriteria}
                    loading={loading}
                    collapseOnMobile
                />

                {rows.length === 0 ? (
                    <div className="mt-4 border border-dashed border-gray-200 px-6 py-14 text-center text-sm text-gray-500">
                        No beneficiaries match the selected filters.
                    </div>
                ) : (
                    <>
                        {/* Mobile and tablet registry items */}
                        <div className="mt-4 grid grid-cols-1 gap-2 md:gap-3 lg:grid-cols-2 xl:hidden">
                            {rows.map((row) => (
                                <BeneficiaryRegistryItem
                                    key={row.id}
                                    row={row}
                                    profileHref={ShowBeneficiaryProfileController.url({
                                        municipality: currentMunicipality.slug,
                                        beneficiaryId: row.id,
                                    })}
                                />
                            ))}
                        </div>

                        {/* Desktop registry table */}
                        <div className="hidden overflow-hidden rounded-md border bg-white xl:block">
                            <Table>
                                <TableHeader className="bg-slate-50/70">
                                    <TableRow>
                                        <TableHead className="w-[300px] text-xs font-semibold text-slate-600">Beneficiary</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Demographics & Address</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">History</TableHead>
                                        <TableHead className="text-right text-xs font-semibold text-slate-600">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => {
                                        const profileHref = ShowBeneficiaryProfileController.url({
                                            municipality: currentMunicipality.slug,
                                            beneficiaryId: row.id,
                                        });
                                        const releasedRecently = row.last_released_at
                                            ? Date.now() - new Date(row.last_released_at).getTime() <= 90 * 24 * 60 * 60 * 1000
                                            : false;

                                        return (
                                            <TableRow key={row.id} className="hover:bg-slate-50/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {row.avatar_url ? (
                                                            <img
                                                                src={row.avatar_url}
                                                                alt={row.full_name}
                                                                className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
                                                            />
                                                        ) : (
                                                            <UserCircle2 className="h-9 w-9 shrink-0 text-slate-400" />
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-900">{row.full_name}</span>
                                                            {row.beneficiary_number ? (
                                                                <span className="font-mono text-xs font-medium text-slate-500">
                                                                    {row.beneficiary_number}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">No ID</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5 text-xs">
                                                        <span className="text-slate-900">
                                                            {[row.sex_label, row.age !== null ? `${row.age} yrs` : null, row.civil_status_label]
                                                                .filter(Boolean)
                                                                .join(' • ') || '—'}
                                                        </span>
                                                        <span className="truncate text-slate-500">
                                                            {[row.street, row.barangay].filter(Boolean).join(', ') || '—'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-start gap-1.5">
                                                        {row.intake_status === 'verified' ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                                <BadgeCheck className="h-3 w-3" /> Identity verified
                                                            </span>
                                                        ) : row.intake_status === 'rejected' ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                                                                <OctagonX className="h-3 w-3" /> Intake rejected
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                                <Clock3 className="h-3 w-3" /> Pending intake
                                                            </span>
                                                        )}

                                                        {row.has_account ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                                                <BadgeCheck className="h-3 w-3" /> Has portal account
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                                                Walk-in
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5 text-xs">
                                                        <span className="text-slate-800">
                                                            {row.total_requests} requests <span className="mx-1 text-slate-400">•</span>{' '}
                                                            {row.released_count} released
                                                        </span>
                                                        {row.last_released_at ? (
                                                            <span className={releasedRecently ? 'font-medium text-red-600' : 'text-slate-500'}>
                                                                Last:{' '}
                                                                {new Date(row.last_released_at).toLocaleDateString('en-PH', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic">No releases</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={profileHref}
                                                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}

                <Pagination links={meta?.links ?? []} />
            </main>
        </AdminLayout>
    );
}

function stripEmpty(values: Record<string, string | null | undefined>): Record<string, string> {
    return Object.fromEntries(Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1]?.trim())));
}

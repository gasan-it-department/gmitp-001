import ListBeneficiaryController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ListBeneficiaryController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { Pagination } from '@/components/Shared/Pagination';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { Loader2, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { BeneficiaryRow } from './BeneficiarySearch';
import BeneficiaryResultCard from './Components/BeneficiaryResultCard';
import SearchFilters from './Components/SearchFilters';

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
            <main className="m-5 mt-0">
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-md bg-slate-900 p-2.5 text-white">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Beneficiaries</h1>
                            <p className="text-sm text-gray-500">Registry for {currentMunicipality.name}</p>
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading
                            </span>
                        ) : (
                            <span>{meta?.total ?? 0} records</span>
                        )}
                    </div>
                </header>

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
                />

                {rows.length === 0 ? (
                    <div className="mt-4 border border-dashed border-gray-200 px-6 py-14 text-center text-sm text-gray-500">
                        No beneficiaries match the selected filters.
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-1 gap-3">
                        {rows.map((row) => (
                            <BeneficiaryResultCard
                                key={row.id}
                                row={row}
                                isPossibleDuplicate={false}
                                profileHref={ShowBeneficiaryProfileController.url({
                                    municipality: currentMunicipality.slug,
                                    beneficiaryId: row.id,
                                })}
                            />
                        ))}
                    </div>
                )}

                <Pagination links={meta?.links ?? []} />
            </main>
        </AdminLayout>
    );
}

function stripEmpty(values: Record<string, string | null | undefined>): Record<string, string> {
    return Object.fromEntries(Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1]?.trim())));
}

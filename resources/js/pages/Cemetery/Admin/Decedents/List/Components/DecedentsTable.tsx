import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import {
    DecedentIntermentStatusFilterValue,
    DecedentListFilters,
    DecedentListItem,
    IdentityStatusValue,
    IntermentStatusValue,
    RegistrationStatusValue,
    SelectOption,
    VitalRecordTypeValue,
} from '@/Core/Types/Cemetery/cemetery';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import cemetery from '@/routes/cemetery';
import { router } from '@inertiajs/react';
import { EyeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import DecedentsTableHeader from './DecedentsTableHeader';

interface Props {
    decedents: PaginatedResponse<DecedentListItem>;
    filters: DecedentListFilters;
    registrationStatusOptions: SelectOption<RegistrationStatusValue>[];
    identityStatusOptions: SelectOption<IdentityStatusValue>[];
    vitalRecordTypeOptions: SelectOption<VitalRecordTypeValue>[];
    intermentStatusOptions: SelectOption<DecedentIntermentStatusFilterValue>[];
}

const STATUS_PILL: Record<IntermentStatusValue, string> = {
    interred: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    exhumed: 'bg-slate-100 text-slate-700 ring-slate-200',
    transferred_out: 'bg-sky-50 text-sky-700 ring-sky-200',
    unassigned: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const STATUS_LABEL: Record<IntermentStatusValue, string> = {
    interred: 'Interred',
    pending: 'Pending',
    exhumed: 'Exhumed',
    transferred_out: 'Transferred Out',
    unassigned: 'Unassigned',
};

export function DecedentsTable({
    decedents,
    filters,
    registrationStatusOptions,
    identityStatusOptions,
    vitalRecordTypeOptions,
    intermentStatusOptions,
}: Props) {
    const decedentList = decedents.data;
    const { currentMunicipality } = useMunicipality();

    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const meta = decedents.meta;
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        setCurrentPage(meta.current_page);
        setLastPage(meta.last_page);
        setPerPage(meta.per_page);
        setTotalItems(meta.total);
    }, [decedents.meta]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 200);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const visitList = (nextFilters: DecedentListFilters, page = 1) => {
        setIsLoading(true);

        router.get(
            cemetery.admin.decedents.list.page.url({
                municipality: currentMunicipality.slug,
            }),
            toQueryParams(nextFilters, page),
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > lastPage) return;

        visitList(filters, page);
    };

    const clearFilters = () => {
        visitList(
            {
                search: null,
                registration_status: null,
                identity_status: null,
                vital_record_type: null,
                interment_status: null,
                death_year: null,
                per_page: filters.per_page,
            },
            1,
        );
    };

    return (
        <div className="space-y-4">
            {/* TOOLBAR */}
            <DecedentsTableHeader
                filters={filters}
                registrationStatusOptions={registrationStatusOptions}
                identityStatusOptions={identityStatusOptions}
                vitalRecordTypeOptions={vitalRecordTypeOptions}
                intermentStatusOptions={intermentStatusOptions}
                onApply={(nextFilters) => visitList(nextFilters, 1)}
                onClear={clearFilters}
            />

            {/* TABLE */}
            <div className="rounded-lg border bg-white">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead className="w-[5%] text-center text-[12px] font-bold">No.</TableHead>
                                <TableHead className="text-[12px] font-bold">Full Name</TableHead>
                                <TableHead className="text-[12px] font-bold">Record / Identity</TableHead>
                                <TableHead className="text-[12px] font-bold">Registry No.</TableHead>
                                <TableHead className="text-[12px] font-bold">Date of Death</TableHead>
                                <TableHead className="text-[12px] font-bold">Plot</TableHead>
                                <TableHead className="text-[12px] font-bold">Status</TableHead>
                                <TableHead className="text-center text-[12px] font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {decedentList.length === 0 ? (
                                <AdminEmptyListItem colSpan={8} title="No Decedents yet." message="Decedent records will appear here." />
                            ) : (
                                decedentList.map((item, index) => (
                                    <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                        <TableCell className="text-center text-[13px] font-medium whitespace-nowrap">
                                            {index + 1 + (currentPage - 1) * perPage}
                                        </TableCell>
                                        <TableCell className="truncate text-[13px] font-medium whitespace-nowrap">{item.full_name}</TableCell>
                                        <TableCell className="text-[12px] whitespace-nowrap">
                                            <span className="block">{item.vital_record_label}</span>
                                            <span className="text-[10px] text-slate-400 uppercase">
                                                {item.identity_status} · {item.life_stage ?? 'age unknown'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-[12px] whitespace-nowrap">{item.registry_number}</TableCell>
                                        <TableCell className="text-[12px] whitespace-nowrap">{item.date_of_death}</TableCell>
                                        <TableCell className="text-[12px] whitespace-nowrap">{item.plot_label ?? '—'}</TableCell>
                                        <TableCell className="text-[12px]">
                                            <div className="space-y-1">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${item.registration_status_tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : item.registration_status_tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {item.registration_status_label}
                                                </span>
                                                <span
                                                    className={`block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${STATUS_PILL[item.interment_status]}`}
                                                >
                                                    {STATUS_LABEL[item.interment_status]}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        router.visit(cemetery.admin.decedents.profile.page.url([currentMunicipality.slug, item.id]));
                                                    }}
                                                    className="border-green-200 text-green-600 hover:bg-green-50"
                                                >
                                                    <EyeIcon size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {/* PAGINATION */}
            <div className="py-2">
                {lastPage > 1 && (
                    <PaginationView
                        currentPage={currentPage}
                        totalPages={lastPage}
                        totalItems={totalItems}
                        itemsPerPage={perPage}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <LoadingDialog isOpen={isLoading} />

            {showScrollTop && (
                <Button
                    size="icon"
                    onClick={scrollToTop}
                    className="fixed right-6 bottom-6 z-50 h-9 w-9 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800"
                    aria-label="Scroll to top"
                >
                    ↑
                </Button>
            )}
        </div>
    );
}

function toQueryParams(filters: DecedentListFilters, page: number): Record<string, string | number> {
    const params: Record<string, string | number> = {};

    if (page > 1) params.page = page;
    if (filters.search) params.search = filters.search;
    if (filters.registration_status) params.registration_status = filters.registration_status;
    if (filters.identity_status) params.identity_status = filters.identity_status;
    if (filters.vital_record_type) params.vital_record_type = filters.vital_record_type;
    if (filters.interment_status) params.interment_status = filters.interment_status;
    if (filters.death_year) params.death_year = filters.death_year;
    if (filters.per_page && filters.per_page !== 10) params.per_page = filters.per_page;

    return params;
}

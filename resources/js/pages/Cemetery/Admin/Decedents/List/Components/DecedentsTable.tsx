import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { DecedentListItem, IntermentStatusValue } from '@/Core/Types/Cemetery/cemetery';
import { FilterDialogData } from '@/Core/Types/Utility/FilterDialogTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import FilterDialog from '@/pages/BulletinBoard/Admin/Components/FilterDialog';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import cemetery from '@/routes/cemetery';
import { router } from '@inertiajs/react';
import { EyeIcon, MapPin, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import DecedentsTableHeader from './DecedentsTableHeader';

interface Props {
    decedents: PaginatedResponse<DecedentListItem>;
}

const STATUS_PILL: Record<IntermentStatusValue, string> = {
    interred: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    exhumed: 'bg-slate-100 text-slate-700 ring-slate-200',
    transferred: 'bg-sky-50 text-sky-700 ring-sky-200',
    unassigned: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const STATUS_LABEL: Record<IntermentStatusValue, string> = {
    interred: 'Interred',
    pending: 'Pending',
    exhumed: 'Exhumed',
    transferred: 'Transferred',
    unassigned: 'Unassigned',
};

export function DecedentsTable({ decedents }: Props) {
    const decedentList = decedents.data;
    const { currentMunicipality } = useMunicipality();

    const [isLoading, setIsLoading] = useState(false);
    const [isFilterOpened, setIsFilterOpened] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [currentFilter, setCurrentFilter] = useState<FilterDialogData | null>(null);
    const meta = decedents.meta;
    const [showScrollTop, setShowScrollTop] = useState(false);

    const handleSort = (currentSelectedSort: string | null) => {
        console.log('Decedents selected filter: ', currentSelectedSort);
        // Implement server-side filtering here if needed
    };

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

    const handlePageChange = (page: number) => {
        if (page < 1 || page > lastPage) return;

        setIsLoading(true);

        router.get(
            cemetery.admin.decedents.list.page.url({
                municipality: currentMunicipality.slug,
            }),
            {
                page,
                ...(currentFilter ? { sort: currentFilter.sub } : {}),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    return (
        <div>
            {/* TOOLBAR */}
            <div className="border-b border-gray-200 bg-white p-4">
                <div className="flex justify-end">
                    <DecedentsTableHeader
                        onSearch={() => {}}
                        onFilterButtonClicked={() => {
                            setIsFilterOpened(true);
                        }}
                        onExportButtonClicked={() => {}}
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-gray-50/50">
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
                            <AdminEmptyListItem title="No Decedents yet." message="Decedent records will appear here." />
                        ) : (
                            decedentList.map((item, index) => (
                                <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                    <TableCell className="text-center text-[13px] font-medium whitespace-nowrap">
                                        {index + 1 + (currentPage - 1) * perPage}
                                    </TableCell>
                                    <TableCell className="truncate text-[13px] font-medium whitespace-nowrap">
                                        {item.full_name}
                                    </TableCell>
                                    <TableCell className="text-[12px] whitespace-nowrap">
                                        <span className="block">{item.vital_record_label}</span>
                                        <span className="text-[10px] uppercase text-slate-400">{item.identity_status} · {item.life_stage ?? 'age unknown'}</span>
                                    </TableCell>
                                    <TableCell className="font-mono text-[12px] whitespace-nowrap">
                                        {item.registry_number}
                                    </TableCell>
                                    <TableCell className="text-[12px] whitespace-nowrap">
                                        {item.date_of_death}
                                    </TableCell>
                                    <TableCell className="text-[12px] whitespace-nowrap">
                                        {item.plot_label ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px]">
                                        <div className="space-y-1">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${item.registration_status_tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : item.registration_status_tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{item.registration_status_label}</span>
                                            <span className={`block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${STATUS_PILL[item.interment_status]}`}>{STATUS_LABEL[item.interment_status]}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    router.visit(
                                                        cemetery.admin.decedents.profile.page.url([currentMunicipality.slug, item.id]),
                                                    );
                                                }}
                                                className="border-green-200 text-green-600 hover:bg-green-50"
                                            >
                                                <EyeIcon size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    router.visit(
                                                        cemetery.admin.decedents.edit.page.url([currentMunicipality.slug, item.id]),
                                                    );
                                                }}
                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            {item.interment_status === 'unassigned' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        router.visit(
                                                            cemetery.admin.interments.assign.page.url([currentMunicipality.slug, item.id]),
                                                        );
                                                    }}
                                                    className="border-amber-200 text-amber-600 hover:bg-amber-50"
                                                >
                                                    <MapPin size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* PAGINATION */}
            <div className="border-t bg-white py-4">
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

            <FilterDialog
                isOpen={isFilterOpened}
                onClose={function (): void {
                    setIsFilterOpened(false);
                }}
                filters={[
                    { title: 'Name (a-z)', sub: 'full_name' },
                    { title: 'Date of Death (latest)', sub: 'date_of_death' },
                ]}
                currentFilter={currentFilter}
                onApply={(selectedFilter) => {
                    setCurrentFilter(selectedFilter);

                    if (selectedFilter) {
                        handleSort(selectedFilter?.sub);
                    }
                }}
            />

            <ClassicDialog title={''} message={''} open={false} />

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

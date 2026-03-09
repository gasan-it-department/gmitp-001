import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { FeedbackData } from '@/Core/Types/Feedback/FeedbackTypes';
import { FilterDialogData } from '@/Core/Types/Utility/FilterDialogTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import FilterDialog from '@/pages/BulletinBoard/Admin/Components/FilterDialog';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import feedback from '@/routes/feedback';
import { router } from '@inertiajs/react';
import { EyeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import FeedbackPageTableHeader from './FeedbackPageTableHeader';

interface Props {
    feedbacks: PaginatedResponse<FeedbackData>;
}

export default function FeedbackPageTable({ feedbacks }: Props) {
    const feebackList = feedbacks.data;
    const { currentMunicipality } = useMunicipality();

    const [isLoading, setIsLoading] = useState(false);
    const [isFilterOpened, setIsFilterOpened] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [currentFilter, setCurrentFilter] = useState<FilterDialogData | null>(null);
    const meta = feedbacks.meta;
    const [showScrollTop, setShowScrollTop] = useState(false);

    const handleSort = (currentSelectedSort: string | null) => {
        console.log('Feedback selected filter: ', currentSelectedSort);
        // Implement server-side filtering here in the future
    };

    useEffect(() => {
        setCurrentPage(meta.current_page);
        setLastPage(meta.last_page);
        setPerPage(meta.per_page);
        setTotalItems(meta.total);
    }, [feedbacks.meta]);

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
            feedback.admin.index.url({
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
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Community Feedback</h1>
                <FeedbackPageTableHeader
                    onSearch={() => {}}
                    onFilterButtonClicked={() => {
                        setIsFilterOpened(true);
                    }}
                    onExportButtonClicked={() => {}}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="min-w-full table-fixed">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[5%] text-center text-[12px] font-bold">No.</TableHead>
                            <TableHead className="text-[12px] font-bold">Target Party</TableHead>
                            <TableHead className="text-[12px] font-bold">Message</TableHead>
                            <TableHead className="text-[12px] font-bold">Date Reported</TableHead>
                            <TableHead className="text-center text-[12px] font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {feebackList.length === 0 ? (
                            <AdminEmptyListItem title="No Feedback yet." message="Feedback will appear here." />
                        ) : (
                            feebackList.map((item, index) => (
                                <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                    <TableCell className="text-center text-[13px] font-medium whitespace-nowrap">
                                        {index + 1 + (currentPage - 1) * perPage}
                                    </TableCell>
                                    <TableCell className="truncate text-[13px] font-medium whitespace-nowrap">{item.employee_name}</TableCell>

                                    <TableCell className="max-w-0 text-[12px]">
                                        <span className="block overflow-hidden">{item.message}</span>
                                    </TableCell>
                                    <TableCell className="text-[12px] whitespace-nowrap">
                                        {Utility().formatToReadableDate(item.created_at) ?? '—'}
                                    </TableCell>
                                    <TableCell className="flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                router.visit(
                                                    feedback.admin.show.url({
                                                        municipality: currentMunicipality.slug,
                                                        id: item.id,
                                                    }),
                                                );
                                            }}
                                            className="border-green-200 text-green-600 hover:bg-green-50"
                                        >
                                            <EyeIcon size={14} />
                                        </Button>
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
                    { title: 'Target Party (a-z)', sub: 'target_party' },
                    { title: 'Message', sub: 'message' },
                    { title: 'Date Reported (latest)', sub: 'date_reported' },
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

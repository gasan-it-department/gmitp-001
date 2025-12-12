import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FeedbackApi } from '@/Core/Api/Feedback/FeedbackApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { FeedbackFormData } from '@/Core/Types/Feedback/FeedbackTypes';
import { FilterDialogData } from '@/Core/Types/Utility/FilterDialogTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import { dummy_departments } from '@/pages/Utility/Offices';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import { EyeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import FilterDialog from '../../../BulletinBoard/Admin/Components/FilterDialog';
import ViewFeedbackDialog from '../../../BulletinBoard/Admin/Components/ViewFeedbackDialog';
import FeedbackPageTableHeader from './FeedbackPageTableHeader';

export default function FeedbackPageTable() {
    const { currentMunicipality } = useMunicipality();
    const [isLoading, setIsLoading] = useState(false);
    const [feedbacks, setFeedbacks] = useState<FeedbackFormData[]>([]);
    const [currentFilter, setCurrentFilter] = useState<FilterDialogData | null>(null);
    const [isFilterOpened, setIsFilterOpened] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [selectedFeedback, setSelectedFeedback] = useState<{ isOpen: boolean; data: FeedbackFormData | null }>({
        isOpen: false,
        data: null,
    });

    useEffect(() => {
        loadFeedbacks(currentPage);
    }, [currentPage]);

    const loadFeedbacks = async (page: number) => {
        try {
            setIsLoading(true);
            const response = await FeedbackApi.getAllFeedback(currentMunicipality.slug, page);
            const data = response.data;
            const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setFeedbacks(sorted);
            setCurrentPage(response.current_page);
            setLastPage(response.last_page);
            setPerPage(response.per_page);
            setTotalItems(response.total);
        } catch (error: any) {
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
        }
    };

    const handleSort = (selectedSort: string | null) => {
        // HANDLE SORT IN THE BACKEND
        console.log('Feedback filter ', selectedSort);
    };

    return (
        <div className="flex h-full flex-col">
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

            {/* TABLE WRAPPER */}
            <div className="flex w-full flex-1 flex-col overflow-hidden rounded-lg border">
                <Table className="min-w-full table-fixed">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[5%] text-[12px] font-bold">No.</TableHead>
                            <TableHead className="w-[15%] text-[12px] font-bold">Target Party</TableHead>
                            <TableHead className="text-[12px] font-bold">Message</TableHead>
                            <TableHead className="w-[15%] text-[12px] font-bold">Date Reported</TableHead>
                            <TableHead className="w-[10%] text-center text-[12px] font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {feedbacks.length === 0 ? (
                            <AdminEmptyListItem title="No Feedback yet." message="Feedback will appear here." />
                        ) : (
                            feedbacks.map((item, index) => (
                                <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                    <TableCell className="text-[13px] font-medium whitespace-nowrap">
                                        {index + 1 + (currentPage - 1) * perPage}
                                    </TableCell>
                                    <TableCell className="truncate text-[13px] font-medium whitespace-nowrap">
                                        {item.employee_name ?? dummy_departments.find((d) => d.id === item.department_id?.trim())?.name ?? '—'}
                                    </TableCell>

                                    <TableCell className="max-w-0 text-[12px]">
                                        <span
                                            className="block overflow-hidden"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 3,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: '1.4em',
                                                maxHeight: '4.2em',
                                            }}
                                        >
                                            {item.message}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-[12px] whitespace-nowrap">
                                        {Utility().formatToReadableDate(item.created_at) ?? '—'}
                                    </TableCell>
                                    <TableCell className="flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedFeedback({ isOpen: true, data: item })}
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

            <FilterDialog
                isOpen={isFilterOpened}
                onClose={() => {
                    setIsFilterOpened(false);
                }}
                filters={[
                    { title: 'Message', sub: 'message' },
                    { title: 'Date Reported', sub: 'created_at' },
                ]}
                currentFilter={currentFilter}
                onApply={(selectedFilter) => {
                    setCurrentFilter(selectedFilter);
                    if (selectedFilter) {
                        handleSort(selectedFilter?.sub);
                    }
                }}
            />

            {/* PAGINATION */}
            <div className="border-t bg-white py-4">
                <PaginationView
                    currentPage={currentPage}
                    totalPages={lastPage}
                    totalItems={totalItems}
                    itemsPerPage={perPage}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* DIALOGS */}
            <ViewFeedbackDialog
                isOpen={selectedFeedback.isOpen}
                data={selectedFeedback.data}
                onClose={() => setSelectedFeedback({ isOpen: false, data: null })}
            />

            <LoadingDialog isOpen={isLoading} />
        </div>
    );
}

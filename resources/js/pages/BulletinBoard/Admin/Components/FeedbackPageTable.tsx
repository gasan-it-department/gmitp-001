import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FeedbackApi } from '@/Core/Api/Feedback/FeedbackApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import Utility from '@/pages/Utility/Utility';
import { EyeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import FeedbackPageTableHeader from './FeedbackPageTableHeader';
import ViewFeedbackDialog from './ViewFeedbackDialog';
import PaginationView from '@/pages/Utility/PaginationView';

interface FeedbackFormValues {
    feedback_target: 'employee' | 'department';
    department_id?: string;
    employee_name: string;
    feedback_message: string;
    sender_name?: string;
    rating?: number;
    message: string;
    id: string;
    created_at: string;
}

export default function FeedbackPageTable() {
    const { currentMunicipality } = useMunicipality();
    const [feedbacks, setFeedbacks] = useState<FeedbackFormValues[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<{ isOpen: boolean, data: FeedbackFormValues | null }>({
        isOpen: false,
        data: null
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        loadFeedbacks(currentPage);
    }, [currentPage]);

    const loadFeedbacks = async (page: number) => {
        try {
            const response = await FeedbackApi.getAllFeedback(currentMunicipality.slug);
            const responseData = response.data.data;

            // Sort newest first
            const sorted = [...responseData].sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            setFeedbacks(sorted);
            setCurrentPage(responseData.current_page);
            setLastPage(responseData.last_page);
            setPerPage(responseData.per_page);
            setTotalItems(responseData.total);
        } catch (error: any) {
            console.error("Error loading feedbacks: ", error);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Cute Netizen Feedback</h1>
                <FeedbackPageTableHeader onSearch={() => { }} onFilterButtonClicked={() => { }} onExportButtonClicked={() => { }} />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">No.</TableHead>
                            <TableHead className="text-[12px] font-bold">Target Party</TableHead>
                            <TableHead className="text-[12px] font-bold">Message</TableHead>
                            <TableHead className="text-[12px] font-bold">Date Reported</TableHead>
                            <TableHead className="text-center text-[12px] font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {feedbacks.length === 0 ? (
                            <AdminEmptyListItem title="No Feedback yet." message="Feedback will appear here." />
                        ) : (
                            feedbacks.map((item, index) => (
                                <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                    <TableCell className="text-[13px] font-medium">
                                        {(index + 1).toString()}
                                    </TableCell>
                                    <TableCell className="text-[13px] font-medium text-red-500">
                                        {item.employee_name ?? item.department_id}
                                    </TableCell>
                                    <TableCell className="max-w-[300px] text-[12px]">
                                        <span
                                            className="block overflow-hidden text-ellipsis"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 3,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'normal',
                                                lineHeight: '1.4em',
                                                maxHeight: '4.2em',
                                            }}
                                        >
                                            {item.message}
                                        </span>
                                    </TableCell>
                                    <TableCell>{Utility().formatToReadableDate(item.created_at)}</TableCell>
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

                {/* View Feedback Dialog */}
                <ViewFeedbackDialog
                    isOpen={selectedFeedback.isOpen}
                    data={selectedFeedback.data}
                    onClose={() => setSelectedFeedback({ isOpen: false, data: null })}
                />
            </div>

            <PaginationView
                currentPage={currentPage}
                totalPages={lastPage}
                totalItems={totalItems}
                itemsPerPage={perPage}
                onPageChange={(page, total) => handlePageChange(page)}
            />

        </div>
    );
}

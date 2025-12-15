import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { FeedbackData } from '@/Core/Types/Feedback/FeedbackTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/PaginationTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import Utility from '@/pages/Utility/Utility';
import feedback from '@/routes/feedback';
import { router } from '@inertiajs/react';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';
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
                                    <TableCell className="truncate text-[13px] font-medium whitespace-nowrap">{item.feedback_target}</TableCell>

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
                {/* <PaginationView currentPage={currentPage} totalPages={lastPage} totalItems={totalItems} itemsPerPage={perPage} /> */}
            </div>

            <LoadingDialog isOpen={isLoading} />
        </div>
    );
}

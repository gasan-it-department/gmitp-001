import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/PaginationTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import { Eye } from 'lucide-react';

interface Props {
    reports: PaginatedResponse<CommunityReportData>;
}

export default function CommunityReportPageTable({ reports }: Props) {
    // 1. DERIVE DATA DIRECTLY (No useState needed)
    const reportList = reports.data;
    const meta = reports.meta;
    console.log(reportList);
    // 2. HANDLE PAGE CHANGES
    // Instead of setting state, we tell Inertia to visit the new URL.
    // This fetches the new data and re-renders this component automatically.
    const handlePageChange = (newPage: number) => {
        // router.get(
        //     reports.links.path || window.location.pathname,
        //     {
        //         page: newPage,
        //     },
        //     {
        //         preserveState: true, // Keeps your scroll position
        //         preserveScroll: true,
        //         only: ['reports'], // Optimization: only reload the reports prop
        //     },
        // );
    };

    return (
        <div className="flex h-full flex-col">
            {/* HEADER ... */}

            {/* TABLE */}
            <div className="overflow-auto rounded-2xl border border-gray-200 shadow-sm">
                <Table className="min-w-full table-auto">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">No.</TableHead>
                            <TableHead className="text-[12px] font-bold">Type</TableHead>
                            <TableHead className="text-[12px] font-bold">Location</TableHead>
                            <TableHead className="text-[12px] font-bold">Date Reported</TableHead>
                            <TableHead className="text-center text-[12px] font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportList.length === 0 ? (
                            <AdminEmptyListItem colSpan={7} title="No reports" message="..." />
                        ) : (
                            reportList.map((item, index) => (
                                <TableRow key={item.id} className="hover:bg-gray-50">
                                    {/* 3. CALCULATE ROW NUMBER USING META PROPS */}
                                    <TableCell>{meta.from + index}</TableCell>

                                    <TableCell>{item.type || 'Concerned Citizen'}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell>{Utility().formatToReadableDate(item.created_at)}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                onClick={() => {}}
                                            >
                                                <Eye size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 4. PAGINATION CONTROL */}
            {/* Pass the Meta directly. No state calculation needed. */}
            <div className="mt-2">
                <PaginationView
                    currentPage={meta.current_page}
                    totalPages={meta.last_page}
                    totalItems={meta.total}
                    itemsPerPage={meta.per_page}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}

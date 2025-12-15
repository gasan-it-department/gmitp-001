import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/PaginationTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import communityReport from '@/routes/communityReport';
import { router } from '@inertiajs/react';
import { EyeIcon } from 'lucide-react';

interface Props {
    reports: PaginatedResponse<CommunityReportData>;
}

export default function CommunityReportPageTable({ reports }: Props) {
    const reportList = reports.data;
    const meta = reports.meta;
    const { currentMunicipality } = useMunicipality();

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
                                    <TableCell className="flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                router.visit(
                                                    communityReport.show.url({
                                                        municipality: currentMunicipality.slug, // Matches {municipality} in route
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

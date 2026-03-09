import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import { router } from '@inertiajs/react';
import { CheckCircle, Clock, EyeIcon, XCircle } from 'lucide-react';
import { JSX, useState } from 'react';
import ReportDetails from '../../Details/ReportDetails';
import CommunityReportHeader from './CommunityReportHeader';

interface Props {
    reports: PaginatedResponse<CommunityReportData>;
}

export default function CommunityReportPageTable({ reports }: Props) {
    const reportList = reports.data;
    const meta = reports.meta;
    const [reportDetails, setReportDetails] = useState<{
        isVisible: boolean;
        data: CommunityReportData | null;
    }>({
        isVisible: false,
        data: null,
    });

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

    function StatusBadge(status?: string) {
        const normalized = status?.toLowerCase();

        // Normalize backend values → UI values
        const mappedStatus = normalized === 'resolve' ? 'resolved' : normalized === 'failed' ? 'failed' : 'pending';

        const config: Record<
            string,
            {
                label: string;
                icon: JSX.Element;
                className: string;
            }
        > = {
            resolved: {
                label: 'Resolved',
                icon: <CheckCircle className="h-3.5 w-3.5" />,
                className: 'border-emerald-300 bg-emerald-50 text-emerald-700',
            },
            failed: {
                label: 'Failed',
                icon: <XCircle className="h-3.5 w-3.5" />,
                className: 'border-red-300 bg-red-50 text-red-700',
            },
            pending: {
                label: 'Pending',
                icon: <Clock className="h-3.5 w-3.5" />,
                className: 'border-orange-300 bg-orange-50 text-orange-700',
            },
        };

        const current = config[mappedStatus];

        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${current.className} `}>
                {current.icon}
                {current.label}
            </span>
        );
    }

    if (reportDetails.isVisible) {
        return (
            <ReportDetails
                report={reportDetails.data}
                onClose={() => setReportDetails({ isVisible: false, data: null })}
                onUpdate={() => {
                    router.reload({ only: ['reports'] });
                }}
            />
        );
    }

    const handleSearch = (searchValue: string) => {
        console.log('Searching for ' + searchValue);
    };

    const handleSort = (sortValue: string) => {
        console.log('Sorting by ' + sortValue);
    };

    return (
        <div className="flex h-full flex-col">
            {/* HEADER ... */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Community Reports</h1>
                <CommunityReportHeader
                    onSearch={(searchValue) => handleSearch(searchValue)}
                    sortList={[
                        { label: 'Type', value: 'type' },
                        { label: 'Date Reported', value: 'created_at' },
                        { label: 'Status', value: 'status' },
                        { label: 'Location', value: 'location' },
                    ]}
                    onSortSelected={(sortValue) => handleSort(sortValue)}
                    onExportButtonClicked={() => {}}
                />
            </div>

            {!reportDetails.isVisible && !reportDetails.data && (
                <div className="overflow-auto rounded-2xl border border-gray-200 shadow-sm">
                    <Table className="min-w-full table-auto">
                        <TableHeader className="sticky top-0 z-10 bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[150px]">No.</TableHead>
                                <TableHead className="w-[200px]">Type</TableHead>
                                <TableHead className="w-[390px]">Location</TableHead>
                                <TableHead className="w-[200px]">Date Reported</TableHead>
                                <TableHead className="w-[180px]">Status</TableHead>
                                <TableHead className="w-[180px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {reportList.length === 0 ? (
                                <AdminEmptyListItem colSpan={7} title="No report yet" message="Community reports will appear here." />
                            ) : (
                                reportList.map((item, index) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                        {/* 3. CALCULATE ROW NUMBER USING META PROPS */}
                                        <TableCell>{meta.from + index}</TableCell>

                                        <TableCell>
                                            {item.type === 'street_light'
                                                ? 'STREET LIGHT'
                                                : item.type === 'road_damage'
                                                  ? 'ROAD DAMAGE'
                                                  : item.type === 'water_leak'
                                                    ? 'WATER LEAK'
                                                    : item.type.toUpperCase() || 'UNKNOWN'}
                                        </TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>{Utility().formatToReadableDate(item.created_at)}</TableCell>
                                        <TableCell>{StatusBadge(item.status)}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setReportDetails((prev) => ({
                                                        ...prev,
                                                        isVisible: true,
                                                        data: item,
                                                    }));
                                                    // router.visit(
                                                    //     communityReport.show.url({
                                                    //         municipality: currentMunicipality.slug,
                                                    //         id: item.id,
                                                    //     }),
                                                    // );
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
            )}

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

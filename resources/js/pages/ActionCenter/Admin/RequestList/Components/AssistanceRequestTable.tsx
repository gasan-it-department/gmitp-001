import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import FilterDialog from '@/pages/BulletinBoard/Admin/Components/FilterDialog';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import ToastProvider from '@/pages/Utility/ToastShower';
import { ToExcel } from '@/pages/Utility/ToExcel';
import Utility from '@/pages/Utility/Utility';
import ActionCenter from '@/routes/actionCenter/admin'; // ✅ Import Wayfinder Route Definition
import { router } from '@inertiajs/react';
import { Eye, Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AddEditRecordDialog from './AddEditRecordDialog';
import Header from './Header';
import PrintView from './PrintView';

// 1. Interfaces matching your API Resource
interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

// Export this so the parent page can use it for typing
export interface AssistanceApiResponse {
    data: AssistanceRequest[];
    meta: PaginationMeta;
    links: any;
}

interface Props {
    data: AssistanceApiResponse; // Data from Props
    filters?: any; // Filters from Props
}

export function AssistanceRequestTable({ data, filters }: Props) {
    const { currentMunicipality } = useMunicipality();

    // --- STATE ---
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState(false);
    const [isSortSelectionDialogOpen, setIsSortSelectionDialogOpen] = useState(false);

    const [printDialogState, setPrintDialogState] = useState<{
        isVisible: boolean;
        request: AssistanceRequest | null;
    }>({ isVisible: false, request: null });

    const [classicDialog, setClassicDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        positiveButtonText: string;
        negativeButtonText: string;
        isNegativeButtonHidden: boolean;
        action: string | null;
    }>({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: true,
        action: null,
    });

    // Extract data for easier access with Safe Defaults
    const requestList = data?.data || [];
    const meta = data?.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
    };

    // --- HANDLERS ---

    // 1. Pagination: Updates URL ?page=X
    const handlePageChange = (page: number) => {
        // ✅ FIX: Use Wayfinder for the index route instead of 'route()'
        const targetUrl = ActionCenter.index.url({
            municipality: currentMunicipality.slug,
        });

        router.get(
            targetUrl,
            { page: page, ...filters }, // Preserve existing filters
            {
                preserveState: true,
                preserveScroll: true,
                only: ['requests'],
            },
        );
    };

    // 2. Navigation
    const handleViewRequest = (id: string) => {
        const targetUrl = ActionCenter.show.url({
            municipality: currentMunicipality.slug,
            id: id,
        });
        console.log(targetUrl);
        router.visit(targetUrl);
    };

    // 3. Sorting / Searching
    const handleSearchOrSort = (params: object) => {
        // ✅ FIX: Use Wayfinder for the index route instead of 'route()'
        const targetUrl = ActionCenter.index.url({
            municipality: currentMunicipality.slug,
        });

        router.get(
            targetUrl,
            { ...filters, ...params, page: 1 }, // Reset to page 1 on new search/sort
            { preserveState: true, preserveScroll: true, only: ['requests', 'filters'] },
        );
    };

    // 4. Reload
    const handleReload = () => {
        router.reload({ only: ['requests'] });
    };

    // --- HELPERS ---
    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'in_review':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-emerald-100 text-emerald-700';
            default:
                return 'bg-yellow-100 text-yellow-700';
        }
    };

    // --- RENDER ---
    return (
        <div className="flex h-full flex-col">
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Request Records</h1>

                <Header
                    className="flex justify-end"
                    onAddNewButtonClicked={() => setIsAddNewRecordDialogOpen(true)}
                    onExportButtonClicked={() => {
                        if (requestList.length === 0) return toast('No data to export');
                        setClassicDialog({
                            isOpen: true,
                            title: 'Export File',
                            message: 'Export list as .xlsx?',
                            positiveButtonText: 'Export',
                            negativeButtonText: 'Cancel',
                            isNegativeButtonHidden: false,
                            action: 'file_export',
                        });
                    }}
                    onFilterButtonClicked={() => setIsSortSelectionDialogOpen(true)}
                    // onSearch={(query) => handleSearchOrSort({ search: query })}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                        <TableRow>
                            {/* Removed Checkbox Column */}
                            <TableHead className="w-16 pl-4 text-xs font-bold text-gray-700">No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Beneficiary</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Date</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Type</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Ref No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Amount</TableHead>
                            <TableHead className="text-center text-xs font-bold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {requestList.length === 0 ? (
                            <AdminEmptyListItem colSpan={8} title="No records found." message="Action center records will show here." />
                        ) : (
                            requestList.map((req, index) => {
                                const rowNumber = (meta.current_page - 1) * meta.per_page + (index + 1);

                                return (
                                    <TableRow key={req.id} className="group transition-colors hover:bg-gray-50">
                                        <TableCell className="pl-4 text-xs text-gray-500">{rowNumber}</TableCell>

                                        {/* Beneficiary Safe Access */}
                                        <TableCell className="text-xs font-medium text-gray-900 capitalize">
                                            {req.beneficiary ? (
                                                `${req.beneficiary.first_name} ${req.beneficiary.last_name}`
                                            ) : (
                                                <span className="text-gray-400 italic">No Beneficiary</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-xs text-gray-600">
                                            {Utility().formatToReadableDateNoTime(req.created_at)}
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-600">{req.assistance_type}</TableCell>
                                        <TableCell className="font-mono text-xs text-gray-500">{req.transaction_number}</TableCell>

                                        {/* Status Badge */}
                                        <TableCell>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getStatusBadgeColor(req.status)}`}
                                            >
                                                {req.status.replace('_', ' ')}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-xs font-semibold text-gray-700">{Utility().formatCurrency(req.amount)}</TableCell>

                                        {/* Actions */}
                                        <TableCell>
                                            <div className="flex justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleViewRequest(req.id)}
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={req.status === 'pending'}
                                                    className="h-8 w-8 border-green-200 text-green-600 hover:bg-green-50"
                                                    onClick={() => setPrintDialogState({ isVisible: true, request: req })}
                                                >
                                                    <Printer size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="mt-4">
                <PaginationView
                    currentPage={meta.current_page}
                    totalPages={meta.last_page}
                    totalItems={meta.total}
                    itemsPerPage={meta.per_page}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* --- DIALOGS --- */}
            <ToastProvider />

            <FilterDialog
                isOpen={isSortSelectionDialogOpen}
                currentFilter={null}
                onClose={() => setIsSortSelectionDialogOpen(false)}
                filters={[
                    { title: 'Name', sub: 'first_name' },
                    { title: 'Date', sub: 'created_at' },
                    { title: 'Transaction', sub: 'transaction_number' },
                    { title: 'Status', sub: 'status' },
                ]}
                onApply={(selectedFilter) => handleSearchOrSort({ sort: selectedFilter?.sub })}
            />

            <AddEditRecordDialog
                isOpen={isAddNewRecordDialogOpen}
                onClose={() => setIsAddNewRecordDialogOpen(false)}
                editData={null}
                onSuccess={() => handleReload()}
            />

            <ClassicDialog
                open={classicDialog.isOpen}
                title={classicDialog.title}
                message={classicDialog.message}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                onPositiveClick={() => {
                    if (classicDialog.action === 'file_export') {
                        ToExcel(requestList, `Assistance_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    }
                    if (classicDialog.action === 'delete_record') {
                        // Implement server side delete via router.delete() if needed
                        toast.info('Delete logic should be implemented on backend.');
                    }
                    setClassicDialog((prev) => ({ ...prev, isOpen: false }));
                }}
                onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isOpen: false }))}
            />

            <PrintView
                isOpen={printDialogState.isVisible}
                onClose={() => setPrintDialogState({ isVisible: false, request: null })}
                data={printDialogState.request}
            />
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import FilterDialog from '@/pages/BulletinBoard/Admin/Components/FilterDialog';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import ToastProvider from '@/pages/Utility/ToastShower';
import { ToExcel } from '@/pages/Utility/ToExcel';
import Utility from '@/pages/Utility/Utility';
import { router } from '@inertiajs/react';
import { Eye, Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
// Removed 'ziggy-js' import
import AddEditRecordDialog from './AddEditRecordDialog';
import Header from './Header';
import PrintView from './PrintView';

// Tell TypeScript that 'route' exists globally (provided by Wayfinder)
// declare var route: any; // Removed as requested

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
    // --- STATE ---
    // UI State Only (No data fetching state)
    const [selectedItems, setSelectedItems] = useState<AssistanceRequest[]>([]);
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
        action: string;
        payload: any;
    }>({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: 'Ok',
        negativeButtonText: 'Cancel',
        isNegativeButtonHidden: true,
        action: '',
        payload: '',
    });

    // Extract data for easier access with Safe Defaults to prevent crash
    const requestList = data?.data || [];
    const meta = data?.meta || {
        current_page: 1,
        from: 0,
        last_page: 1,
        per_page: 15,
        to: 0,
        total: 0,
    };

    // --- HANDLERS (The Inertia Way) ---

    // 1. Pagination: Just update the URL parameter
    const handlePageChange = (page: number) => {
        // Disabled for now to focus on display
        console.log('Page change requested:', page);
        /*
        router.get(
            route('admin.action-center.index'),
            { page: page, ...filters }, // Preserve existing filters
            { 
                preserveState: true, 
                preserveScroll: true, 
                only: ['requests'] // Partial reload for speed
            }
        );
        */
    };

    // 2. Navigation
    const handleViewRequest = (id: string) => {
        // Disabled for now
        console.log('View request:', id);
        // router.visit(route('admin.action-center.show', id));
    };

    // 3. Sorting / Searching
    const handleSearchOrSort = (params: object) => {
        // Disabled for now
        console.log('Search/Sort:', params);
        /*
        router.get(
            route('admin.action-center.index'),
            { ...filters, ...params, page: 1 }, // Reset to page 1 on new search/sort
            { preserveState: true, preserveScroll: true, only: ['requests', 'filters'] }
        );
        */
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

    const toggleSelectAll = (isChecked: boolean) => {
        if (isChecked) setSelectedItems(requestList);
        else setSelectedItems([]);
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
                            payload: null,
                        });
                    }}
                    onFilterButtonClicked={() => setIsSortSelectionDialogOpen(true)}
                    // Search triggers a URL update via Inertia
                    onSearch={(query) => handleSearchOrSort({ search: query })}
                />
            </div>

            {/* BULK ACTIONS */}
            <div className="mb-2 flex h-8 items-center justify-between">
                <div>
                    {selectedItems.length > 0 && (
                        <Button
                            size="sm"
                            className="border-none bg-red-600 text-white duration-200 animate-in fade-in zoom-in-95 hover:bg-red-700"
                            onClick={() =>
                                setClassicDialog({
                                    isOpen: true,
                                    title: 'Confirm Delete',
                                    message: `Delete ${selectedItems.length} selected records?`,
                                    positiveButtonText: 'Delete',
                                    negativeButtonText: 'Cancel',
                                    isNegativeButtonHidden: false,
                                    payload: selectedItems,
                                    action: 'delete_record',
                                })
                            }
                        >
                            Delete ({selectedItems.length}) items
                        </Button>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                        <TableRow>
                            <TableHead className="w-10">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={requestList.length > 0 && selectedItems.length === requestList.length}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">No.</TableHead>
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
                            <AdminEmptyListItem colSpan={9} title="No records found." message="Action center records will show here." />
                        ) : (
                            requestList.map((req, index) => {
                                // Calculate row number using Meta from props
                                const rowNumber = (meta.current_page - 1) * meta.per_page + (index + 1);

                                return (
                                    <ContextMenu key={req.id}>
                                        <ContextMenuTrigger asChild>
                                            <TableRow className="group transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100">
                                                {/* Checkbox */}
                                                <TableCell className="w-8">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={selectedItems.some((item) => item.id === req.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedItems((prev) => [...prev, req]);
                                                            else setSelectedItems((prev) => prev.filter((item) => item.id !== req.id));
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell className="text-xs text-gray-500">{rowNumber}</TableCell>

                                                {/* FIXED: Beneficiary Safe Access */}
                                                <TableCell className="text-xs font-medium text-gray-900 capitalize">
                                                    {req.beneficiary ? (
                                                        // We verified beneficiary exists above, so we can access properties directly
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

                                                <TableCell className="text-xs font-semibold text-gray-700">
                                                    {Utility().formatCurrency(req.amount)}
                                                </TableCell>

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
                                        </ContextMenuTrigger>
                                    </ContextMenu>
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

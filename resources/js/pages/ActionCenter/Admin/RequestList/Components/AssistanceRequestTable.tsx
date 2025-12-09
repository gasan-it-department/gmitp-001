import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import FilterDialog from '@/pages/BulletinBoard/Admin/Components/FilterDialog';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import ToastProvider from '@/pages/Utility/ToastShower';
import { ToExcel } from '@/pages/Utility/ToExcel';
import Utility from '@/pages/Utility/Utility';
import { Pencil, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddEditRecordDialog from './AddEditRecordDialog';
import Header from './Header';
import PrintView from './PrintView';

export function AssistanceRequestTable() {
    const { currentMunicipality } = useMunicipality();
    const [editingData, setEditingData] = useState<AssistanceRequest | null>(null);
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState(false);
    const [isSortSelectionDialogOpen, setIsSortSelectionDialogOpen] = useState(false);
    const [currentSelectedSortOption, setCurrentSelectedSortOption] = useState('');
    const [isLoadingDialogVisible, setIsLoadingDialogVisible] = useState(false);
    const [requestList, setRequestList] = useState<AssistanceRequest[]>([]);
    const [selectedItems, setSelectedItems] = useState<AssistanceRequest[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(30);
    const [totalItems, setTotalItems] = useState(0);

    const [printDialogState, setPrintDialogState] = useState<{
        isVisible: boolean;
        request: AssistanceRequest | null;
    }>({
        isVisible: false,
        request: null,
    });

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

    // --------------------------------------------------
    // LOAD TABLE DATA
    // --------------------------------------------------
    useEffect(() => {
        loadRequestList(currentPage);
    }, [currentPage]);

    const loadRequestList = async (currentPage: number = 1) => {
        try {
            setIsLoadingDialogVisible(true);
            const response = await ActionCenterApi.getAllRequest(currentMunicipality.slug, currentPage);
            const data = response.data ?? [];
            console.log('Response: ', data);
            data.sort(
                (a: { created_at: string | number | Date }, b: { created_at: string | number | Date }) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );

            setCurrentPage(response.meta.current_page);
            setLastPage(response.meta.last_page);
            setPerPage(response.meta.per_page);
            setTotalItems(response.meta.total);
            setRequestList(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load requests');
        } finally {
            setIsLoadingDialogVisible(false);
        }
    };

    // --------------------------------------------------
    // DELETE REQUEST
    // --------------------------------------------------
    const deleteRequest = async (requestId: string[]) => {
        try {
            if (requestId.length === 1) {
                // DELETE SINGLE RECORD
                console.log('Delete 1 recond only.');
            } else {
                // DDELETE MULTIPLE RECORD
                console.log(`Delete ${requestId.length} records.`);
            }
        } catch (error: any) {}
    };

    const addNewItem = (newItem: AssistanceRequest) => {
        setTotalItems((prev) => {
            const newTotal = prev + 1;
            const newLastPage = Math.ceil(newTotal / perPage);
            setLastPage(newLastPage);

            return newTotal;
        });

        if (currentPage === 1) {
            const updated = [newItem, ...requestList];
            if (updated.length > perPage) {
                updated.pop();
            }

            setRequestList(updated);
        }

        if (currentPage !== 1) {
            loadRequestList(1);
        }
    };

    const normalizeAssistance = (data: any) => {
        if (!data.assistance) return data;
        return {
            ...data.assistance,
            beneficiary: data.beneficiary,
        };
    };

    const handleSort = (currentSeletedSort: string | null) => {
        // SEND FILTER TO BACKEND
        console.log('Action center filter: ', currentSeletedSort);
    };

    // --------------------------------------------------
    // TABLE RENDER
    // --------------------------------------------------
    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Request Records</h1>

                <Header
                    className="flex justify-end"
                    onAddNewButtonClicked={() => {
                        setEditingData(null);
                        setIsAddNewRecordDialogOpen(true);
                    }}
                    onExportButtonClicked={() => {
                        if (requestList.length === 0) {
                            toast('No data to export');
                            return;
                        }

                        setClassicDialog((prev) => ({
                            ...prev,
                            title: 'Export File',
                            message: 'Are you sure you want to export the list as .xlsx?',
                            positiveButtonText: 'Export',
                            negativeButtonText: 'Cancel',
                            isNegativeButtonHidden: false,
                            action: 'file_export',
                            isOpen: true,
                        }));
                    }}
                    onFilterButtonClicked={() => setIsSortSelectionDialogOpen(true)}
                    onSearch={(query) => {}}
                />
            </div>

            <div className="mb-2 flex items-center justify-between">
                <div>
                    <Button
                        size="sm"
                        disabled={selectedItems.length <= 0}
                        className="border-none bg-red-600 text-white hover:bg-red-700"
                        onClick={() =>
                            setClassicDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                title: 'Confirm',
                                message: `Are you sure you want to delete ${selectedItems.length} selected records(s)? THIS CANNOT BE UNDONE.`,
                                positiveButtonText: 'Delete',
                                negativeButtonText: 'Cancel',
                                isNegativeButtonHidden: false,
                                payload: selectedItems,
                                action: 'delete_record',
                            }))
                        }
                    >
                        Delete ({selectedItems.length}) items
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="w-10 bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer"
                                    checked={selectedItems.length === requestList.length && requestList.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedItems(requestList);
                                        } else {
                                            setSelectedItems([]);
                                        }
                                    }}
                                />
                            </TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">No.</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Name</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Request Date</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Assistance Type</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Transaction Number</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Status</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Amount</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Due Date</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {requestList.length === 0 ? (
                            <AdminEmptyListItem colSpan={9} title="No records found." message="Action center records will show here." />
                        ) : (
                            requestList.map((req, index) => (
                                <ContextMenu key={req.id}>
                                    <ContextMenuTrigger asChild>
                                        <TableRow className="cursor-pointer transition-colors hover:bg-gray-50">
                                            <TableCell className="w-8 text-[12px]">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 cursor-pointer"
                                                    checked={selectedItems.some((item) => item.id === req.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItems((prev) => [...prev, req]);
                                                        } else {
                                                            setSelectedItems((prev) => prev.filter((item) => item.id !== req.id));
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="text-[12px]">{index + 1}</TableCell>
                                            <TableCell className="text-[12px] capitalize">
                                                {req.beneficiary!.first_name} {req.beneficiary!.last_name}
                                            </TableCell>
                                            <TableCell className="text-[12px]">{Utility().formatToReadableDateNoTime(req.created_at)}</TableCell>
                                            <TableCell className="text-[12px]">{req.assistance_type}</TableCell>
                                            <TableCell className="text-[12px]">{req.transaction_number}</TableCell>
                                            <TableCell className="text-[12px]">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                                                        req.status === 'approved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : req.status === 'rejected'
                                                              ? 'bg-red-100 text-red-700'
                                                              : req.status === 'in_review'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : req.status === 'completed'
                                                                  ? 'bg-emerald-100 text-emerald-700'
                                                                  : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                                >
                                                    {{
                                                        pending: 'Pending',
                                                        in_review: 'In Review',
                                                        approved: 'Approved',
                                                        rejected: 'Rejected',
                                                        completed: 'Completed',
                                                    }[req.status] || 'Unknown'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-[12px]">{Utility().formatCurrency(req.amount)}</TableCell>

                                            <TableCell className="text-[12px]">{Utility().formatAndAddDaysNoTime(req.created_at, 90)}</TableCell>

                                            {/* ACTION BUTTONS */}
                                            <TableCell className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingData(req);
                                                        setIsAddNewRecordDialogOpen(true);
                                                    }}
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil size={14} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={req.status === 'pending'}
                                                    onClick={() =>
                                                        setPrintDialogState({
                                                            isVisible: true,
                                                            request: req,
                                                        })
                                                    }
                                                    className="border-green-200 text-green-600 hover:bg-green-50"
                                                >
                                                    <Printer size={14} />
                                                </Button>

                                                {/* <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setClassicDialog({
                                                            ...classicDialog,
                                                            isOpen: true,
                                                            title: 'Delete Record',
                                                            message:
                                                                'Are you sure you want to delete this record? This cannot be undone.',
                                                            positiveButtonText: 'Delete',
                                                            negativeButtonText: 'Cancel',
                                                            isNegativeButtonHidden: false,
                                                            action: 'delete_record',
                                                            payload: req.id,
                                                        })
                                                    }
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </Button> */}
                                            </TableCell>
                                        </TableRow>
                                    </ContextMenuTrigger>
                                </ContextMenu>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-2">
                <PaginationView
                    currentPage={currentPage}
                    totalPages={lastPage}
                    totalItems={totalItems}
                    itemsPerPage={perPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* DIALOGS */}

            <ToastProvider />

            <FilterDialog
                isOpen={isSortSelectionDialogOpen}
                currentFilter={currentSelectedSortOption ? { title: currentSelectedSortOption, sub: currentSelectedSortOption } : null}
                onClose={() => setIsSortSelectionDialogOpen(false)}
                filters={[
                    { title: 'Name', sub: 'first_name' },
                    { title: 'Request Date', sub: 'created_at' },
                    { title: 'Transaction Number', sub: 'transaction_number' },
                    { title: 'Status', sub: 'status' },
                ]}
                onApply={(selectedFilter) => {
                    setCurrentSelectedSortOption(selectedFilter?.sub || '');
                    if (selectedFilter) {
                        handleSort(selectedFilter.sub);
                    }
                }}
            />

            <AddEditRecordDialog
                editData={editingData}
                isOpen={isAddNewRecordDialogOpen}
                onClose={() => setIsAddNewRecordDialogOpen(false)}
                onSuccess={(data, isEditMode) => {
                    if (isEditMode) {
                    } else {
                        const normalizedData = normalizeAssistance(data);
                        normalizedData.status = normalizedData.status ?? 'pending';
                        addNewItem(normalizedData);
                    }
                }}
            />

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                open={classicDialog.isOpen}
                onPositiveClick={() => {
                    if (classicDialog.action === 'delete_record') {
                        deleteRequest(classicDialog.payload);
                    }

                    if (classicDialog.action === 'file_export') {
                        ToExcel(requestList, `Assistance_Requests_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    }

                    setClassicDialog({
                        ...classicDialog,
                        isOpen: false,
                        action: '',
                        payload: '',
                    });
                }}
                onNegativeClick={() =>
                    setClassicDialog({
                        ...classicDialog,
                        isOpen: false,
                        action: '',
                        payload: '',
                    })
                }
            />

            <LoadingDialog title="Loading, please wait..." isOpen={isLoadingDialogVisible} />

            <PrintView
                isOpen={printDialogState.isVisible}
                onClose={() =>
                    setPrintDialogState({
                        isVisible: false,
                        request: null,
                    })
                }
                data={printDialogState.request}
            />
        </div>
    );
}

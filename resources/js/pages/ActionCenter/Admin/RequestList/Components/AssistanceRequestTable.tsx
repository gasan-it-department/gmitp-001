import { SpinnerCustom } from '@/components/SpinnerCustom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import Utility from '@/pages/Utility/Utility';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import AddEditRecordDialog from './AddEditRecordDialog';
import Header from './Header';
import SortSelectionDialog from './SortSelectionDialog';
import ViewDetailsDialog from './ViewDetailsDialog';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ToExcel } from '@/pages/Utility/ToExcel';
import ClassicDialog from '@/pages/Utility/ClassicDialog';

export function AssistanceRequestTable() {
    const [selectedItem, setSelectedItem] = useState<AssistanceRequest | null>(null);
    const [editingData, setEditingData] = useState<AssistanceRequest | null>(null);
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState(false);
    const [isSortSelectionDialogOpen, setIsSortSelectionDialogOpen] = useState(false);
    const [currentSelectedSortOption, setCurrentSelectedSortOption] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        positiveButtonText: "Ok",
        negativeButtonText: "Cancel",
        isNegativeButtonHidden: true,
        action: ""
    });

    const { data, isLoading, error } = useQuery<{ request: AssistanceRequest[] }>({
        queryKey: ['request-list'],
        queryFn: ActionCenterApi.getAllRequest,
        refetchOnWindowFocus: false,
    });

    function handleDeleteRequest(requestId: string) {
        console.log('Deleting request with ID:', requestId);
    }

    // ✅ Combine search + filter + sort logic
    const filteredRequests = useMemo(() => {
        if (!data?.request) return [];

        const query = searchQuery.toLowerCase().trim();

        // --- Filter by search ---
        let results = data.request.filter((req) => {
            const fullName = `${req.beneficiary.first_name} ${req.beneficiary.last_name}`.toLowerCase();
            const matchesSearch =
                !query ||
                fullName.includes(query) ||
                req.assistance_type?.toLowerCase().includes(query) ||
                req.transaction_number?.toLowerCase().includes(query);

            const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        // --- ✅ Sort results based on currentSelectedSortOption ---
        if (currentSelectedSortOption) {
            results = [...results].sort((a, b) => {
                switch (currentSelectedSortOption) {
                    case 'sort_name': {
                        const nameA = `${a.beneficiary.last_name} ${a.beneficiary.first_name}`.toLowerCase();
                        const nameB = `${b.beneficiary.last_name} ${b.beneficiary.first_name}`.toLowerCase();
                        return nameA.localeCompare(nameB);
                    }
                    case 'sort_request_date':
                        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    case 'sort_due_date':
                        return (
                            new Date(Utility().formatAndAddDays(a.created_at, 90)).getTime() -
                            new Date(Utility().formatAndAddDays(b.created_at, 90)).getTime()
                        );
                    case 'sort_transaction_id':
                        return (a.transaction_number || '').localeCompare(b.transaction_number || '');
                    case 'sort_status':
                        return (a.status || '').localeCompare(b.status || '');
                    case 'sort_title': // assuming assistance_type = title
                        return (a.assistance_type || '').localeCompare(b.assistance_type || '');
                    default:
                        return 0;
                }
            });
        }

        return results;
    }, [data, searchQuery, selectedStatus, currentSelectedSortOption]);

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Request List</h1>
                <Header
                    className="flex justify-end"
                    onAddNewButtonClicked={() => {
                        setEditingData(null);
                        setIsAddNewRecordDialogOpen(true);
                    }}
                    onExportButtonClicked={() => {
                        setClassicDialog((prev) => ({
                            ...prev,
                            title: "Export File",
                            message: "Are you sure you want to export the list as .xlsx",
                            positiveButtonText: "Export",
                            negativeButtonText: "Cancel",
                            isNegativeButtonHidden: false,
                            action: "file_export",
                            isOpen: true
                        }));
                    }}
                    onFilterButtonClicked={() => setIsSortSelectionDialogOpen(true)}
                    onSearch={(query) => setSearchQuery(query)}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">No.</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Name</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Request Date</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Assistance Type</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Transaction Number</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Status</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Due Date</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-[75vh] text-center">
                                    <div className="flex items-center justify-center">
                                        <SpinnerCustom />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-gray-500">
                                    Failed to load data. Please try again.
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <p className="text-lg font-medium">No matching requests found</p>
                                        <p className="text-sm text-gray-400">
                                            Try a different search term or clear filters
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map((req, index) => (
                                <ContextMenu key={req.id}>
                                    <ContextMenuTrigger asChild>
                                        <TableRow
                                            onClick={() => setSelectedItem(req)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <TableCell className="text-[12px]">{index + 1}</TableCell>

                                            <TableCell className="text-[12px] capitalize">
                                                {req.beneficiary.first_name} {req.beneficiary.last_name}
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                {Utility().formatToReadableDate(req.created_at)}
                                            </TableCell>

                                            <TableCell className="text-[12px]">{req.assistance_type}</TableCell>

                                            <TableCell className="text-[12px]">{req.transaction_number}</TableCell>

                                            <TableCell className="text-[12px]">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${req.status === 'approved'
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
                                                    {({
                                                        pending: 'Pending',
                                                        in_review: 'In Review',
                                                        approved: 'Approved',
                                                        rejected: 'Rejected',
                                                        completed: 'Completed',
                                                    }[req.status] || 'Unknown')}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                {Utility().formatAndAddDays(req.created_at, 90)}
                                            </TableCell>
                                        </TableRow>
                                    </ContextMenuTrigger>

                                    {/* Right-click menu */}
                                    <ContextMenuContent className="w-44">
                                        <ContextMenuItem inset onClick={() => setSelectedItem(req)}>
                                            View Details
                                        </ContextMenuItem>
                                        <ContextMenuItem inset onClick={() => setEditingData(req)}>
                                            Edit
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem
                                            inset
                                            onClick={() => handleDeleteRequest(req.id)}
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                        >
                                            Delete
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* DIALOGS */}
            <SortSelectionDialog
                currentSelected={currentSelectedSortOption}
                selectedSortOption={(value) => {
                    setCurrentSelectedSortOption(value);
                    setIsSortSelectionDialogOpen(false);
                }}
                isOpen={isSortSelectionDialogOpen}
                onClose={() => setIsSortSelectionDialogOpen(false)}
            />

            <AddEditRecordDialog
                editData={editingData}
                isOpen={isAddNewRecordDialogOpen}
                onClose={() => setIsAddNewRecordDialogOpen(false)}
            />

            {selectedItem && (
                <ViewDetailsDialog
                    onEditClicked={(editData) => {
                        setEditingData(editData);
                        setIsAddNewRecordDialogOpen(true);
                    }}
                    onDeleteClicked={(requestedId) => {
                        handleDeleteRequest(requestedId);
                        console.log('Delete clicked.');
                    }}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    details={selectedItem}
                />
            )}

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                open={classicDialog.isOpen}
                onPositiveClick={() => {
                    switch(classicDialog.action){
                        case "file_export":
                            ToExcel(filteredRequests, `Assistance_Requests_${new Date().toISOString().slice(0, 10)}.xlsx`)
                        break;
                    }

                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                        action: ""
                    }));
                }}

                onNegativeClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                        action: ""
                    }));

                }} />
        </div>
    );
}

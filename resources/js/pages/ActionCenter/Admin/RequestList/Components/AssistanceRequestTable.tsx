import { SpinnerCustom } from '@/components/SpinnerCustom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import type { AssistanceRequest, Beneficiary } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import Utility from '@/pages/Utility/Utility';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import AddEditRecordDialog from './AddEditRecordDialog';
import Header from './Header';
import SortSelectionDialog from './SortSelectionDialog';
import ViewDetailsDialog from './ViewDetailsDialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';

export function AssistanceRequestTable() {
    const [selectedItem, setSelectedItem] = useState<AssistanceRequest | null>(null);
    const [editingData, setEditingData] = useState<AssistanceRequest | null>(null)
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState(false);
    const [isSortSelectionDialogOpen, setIsSortSelectionDialogOpen] = useState(false);
    const [currentSelectedSortOption, setCurrentSelectedSortOption] = useState('');

    // const { data, isFetching, error } = useAssistanceRequests();

    const { data, isLoading, error } = useQuery<{ request: AssistanceRequest[] }>({
        queryKey: ['request-list'],
        queryFn: ActionCenterApi.getAllRequest,
        refetchOnWindowFocus: false,
    });

    function handleDeleteRequest(requestId: string) {
        console.log('Deleting request with ID:', requestId);
    }

    return (
        <div>
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Request List</h1>
                <Header
                    className="flex justify-end"
                    onAddNewButtonClicked={() => {
                        setEditingData(null);
                        setIsAddNewRecordDialogOpen(true);
                    }}
                    onExportButtonClicked={() => console.log('Export clicked!')}
                    onFilterButtonClicked={() => setIsSortSelectionDialogOpen(true)}
                    onSearch={(query) => console.log('Searching for:', query)}
                />
            </div>
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
                        ) : data?.request.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <p className="text-lg font-medium">No assistance requests found</p>
                                        <p className="text-sm text-gray-400">Get started by adding a new request</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.request.map((req, index) => (
                                <ContextMenu key={req.id}>
                                    {/* 👇 Right-click trigger wraps the row, but left-click still works */}
                                    <ContextMenuTrigger asChild>
                                        <TableRow
                                            onClick={() => {
                                                // ✅ Keep your existing click action
                                                setSelectedItem(req);
                                            }}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <TableCell className="text-[12px] capitalize">
                                                {(index + 1)}
                                            </TableCell>

                                            <TableCell className="text-[12px] capitalize">
                                                {req.beneficiary.first_name} {req.beneficiary.last_name}
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                {Utility().formatToReadableDate(req.created_at)}
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                {req.assistance_type}
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                {req.transaction_number}
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${req.status === "approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : req.status === "rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : req.status === "in_review"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : req.status === "completed"
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {({
                                                        pending: "Pending",
                                                        in_review: "In Review",
                                                        approved: "Approved",
                                                        rejected: "Rejected",
                                                        completed: "Completed",
                                                    }[req.status] || "Unknown")}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                {Utility().formatAndAddDays(req.created_at, 90)}
                                            </TableCell>
                                        </TableRow>
                                    </ContextMenuTrigger>

                                    {/* 👇 Right-click menu */}
                                    <ContextMenuContent className="w-44">
                                        <ContextMenuItem
                                            inset
                                            onClick={() => setSelectedItem(req)}
                                        >
                                            View Details
                                        </ContextMenuItem>

                                        <ContextMenuItem
                                            inset
                                            onClick={() => { }}
                                        >
                                            Edit
                                        </ContextMenuItem>

                                        <ContextMenuSeparator />

                                        <ContextMenuItem
                                            inset
                                            onClick={() => {
                                                console.log('Delete request with ID:', req.id);
                                                handleDeleteRequest(req.id);
                                            }}
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

                <SortSelectionDialog
                    currentSelected={currentSelectedSortOption}
                    selectedSortOption={(selectedSortOption) => {
                        setCurrentSelectedSortOption(selectedSortOption);
                    }}
                    isOpen={isSortSelectionDialogOpen}
                    onClose={() => setIsSortSelectionDialogOpen(false)}
                />
                
                <AddEditRecordDialog
                    editData={editingData}
                    isOpen={isAddNewRecordDialogOpen}
                    onClose={() => setIsAddNewRecordDialogOpen(false)} />

          
                {selectedItem && <ViewDetailsDialog
                    onEditClicked={(editData) => {
                        setEditingData(editData);
                        setIsAddNewRecordDialogOpen(true);
                    }}
                    onDeleteClicked={(requestedId) => {
                        handleDeleteRequest(requestedId);
                        console.log("Delete clicked.");
                    }}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    details={selectedItem} />}
            </div>
        </div>
    );
}

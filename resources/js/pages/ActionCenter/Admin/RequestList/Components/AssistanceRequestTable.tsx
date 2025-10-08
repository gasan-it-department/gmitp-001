import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRequest } from '@/Core/Statements/Data';
import type { AssistanceRequest, Beneficiary } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import Utility from '@/pages/Utility/Utility';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import AddEditRecordDialog from './AddEditRecordDialog';
import Header from './Header';
import SortSelectionDialog from './SortSelectionDialog';

export function AssistanceRequestTable() {
    const [selectedItem, setSelectedItem] = useState<Beneficiary | null>(null);
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState(false);
    const [isSortSelectionDialogOpen, setIsSortSelectionDialogOpen] = useState(false);
    const [filteringHolder, setFilteringHolder] = useState<any[]>([]);
    const [currentSelectedSortOption, setCurrentSelectedSortOption] = useState('');
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [isClassicDialogShowing, setIsClassicDialogShowing] = useState(false);
    const [editData, setEditData] = useState<Beneficiary | null>(null);

    const { data, isFetching } = useQuery<{ request: AssistanceRequest[] }>({
        queryKey: ['request-list'],
        queryFn: getRequest,
        refetchOnWindowFocus: false,
    });

    if (isFetching) {
        return <div className="p-4 text-sm text-gray-500">Loading...</div>;
    }

    if (!data?.request?.length) {
        return <div className="p-4 text-center text-sm text-gray-500">No data found.</div>;
    }

    return (
        <div>
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Request List</h1>
                <Header
                    className="flex justify-end"
                    onAddNewButtonClicked={() => {
                        setEditData(null); // new record, not edit
                        setIsAddNewRecordDialogOpen(true);
                    }}
                    onExportButtonClicked={() => console.log('Export clicked!')}
                    onFilterButtonClicked={() => setIsSortSelectionDialogOpen(true)}
                    onSearch={(query) => console.log('Searching for:', query)}
                />
            </div>
            <div className="h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    {/* 2. FIX APPLIED: Added z-10 to ensure the header stacks above the rows */}
                    <TableHeader className="z-10 bg-gray-50">
                        <TableRow className="">
                            {/* The individual TableHead cells also need the background color for seamless stickiness */}
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Name</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Request Date</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Assistance Type</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Transaction Number</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Status</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Due Date</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="">
                        {/* ... table rows (TableBody) ... */}
                        {data.request.map((req) => (
                            <TableRow
                                key={req.id}
                                className="cursor-pointer overflow-y-auto hover:bg-gray-50"
                                onClick={() => setSelectedItem(req.beneficiary)}
                            >
                                <TableCell className="text-[12px}">
                                    {req.beneficiary.first_name} {req.beneficiary.last_name}
                                </TableCell>
                                <TableCell className="text-[12px]">{Utility().formatToReadableDate(req.created_at)}</TableCell>
                                <TableCell className="text-[12px]">{req.assistance_type}</TableCell>
                                <TableCell className="text-[12px]">{req.transaction_number}</TableCell>
                                <TableCell className="text-[12px]">
                                    <span
                                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                                            req.status === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : req.status === 'rejected'
                                                  ? 'bg-red-100 text-red-700'
                                                  : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {req.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-[12px]">
                                    {/* Example: computed due date */}
                                    {Utility().formatAndAddDays(req.created_at, 90)}
                                </TableCell>
                            </TableRow>
                        ))}
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
                <AddEditRecordDialog isOpen={isAddNewRecordDialogOpen} onClose={() => setIsAddNewRecordDialogOpen(false)} />

                <ClassicDialog
                    title={dialogTitle}
                    message={dialogMessage}
                    negativeButtonText="Cancel"
                    positiveButtonText="Logout"
                    onNegativeClick={() => {
                        setIsClassicDialogShowing(false);
                    }}
                    onPositiveClick={() => {
                        setIsClassicDialogShowing(false);
                    }}
                    open={isClassicDialogShowing}
                    hideNegativeButton={false}
                />
                {/* Example: View Details Dialog placeholder */}
                {/* {selectedItem && <ViewDetailsDialog isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} details={selectedItem} />} */}
            </div>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BiddingData } from '@/Core/Types/Procurement/procurement';
import { FilterDialogData } from '@/Core/Types/Utility/FilterDialogTypes';
import SortDialog from '@/pages/BulletinBoard/Admin/Components/FilterDialog';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';

export default function ProcurementTable1() {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isAddEditDialogVisible, setIsAddEditDialogVisible] = useState(false);
    const [biddingList, setBiddingList] = useState<BiddingData[]>([]);
    const [isFilterDialogVisible, setIsFilterDialogVisible] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<FilterDialogData | null>(null);

    const handleSort = (currentSelectedSort: string | null) => {
        console.log('Announcement selected filter: ', currentSelectedSort);
        // Implement server filter logic here
    };

    return (
        <div className="flex h-full flex-col">
            <div className="overflow-auto rounded-2xl border border-gray-200 shadow-sm">
                <Table className="min-w-full table-auto">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            {/* <TableHead className="w-12">
                                <div className="flex items-center justify-center p-2">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={selectedItems.length === communityReportsList.length && communityReportsList.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                            </TableHead> */}
                            <TableHead className="w-20">No.</TableHead>
                            <TableHead className="w-64">Reference No.</TableHead>
                            <TableHead className="w-[300px]">Project Title & Category</TableHead>
                            <TableHead className="w-32">ABC (Budget)</TableHead>
                            <TableHead className="w-32">Closing Date</TableHead>
                            {/* <TableHead className="w-24 text-center">Status</TableHead> */}
                            <TableHead className="w-24 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {biddingList.length === 0 ? (
                            <AdminEmptyListItem colSpan={7} title="No biddings yet" message="Biddings will appear here once you create one." />
                        ) : (
                            biddingList.map((item, index) => (
                                <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                    <TableCell className="flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                // setViewCommunityReportDialog(() => ({
                                                //     isOpen: true,
                                                //     viewingData: item
                                                // }))
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

            <SortDialog
                isOpen={isFilterDialogVisible}
                currentFilter={currentFilter}
                onClose={() => setIsFilterDialogVisible(false)}
                filters={[
                    { title: 'Title', sub: 'title' },
                    { title: 'Date', sub: 'created_at' },
                ]}
                onApply={(selectedFilter: FilterDialogData | null) => {
                    setCurrentFilter(selectedFilter);
                    if (selectedFilter) {
                        handleSort(selectedFilter.sub);
                    }
                }}
            />
        </div>
    );
}

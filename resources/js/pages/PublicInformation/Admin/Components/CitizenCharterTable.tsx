import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BiddingData } from "@/Core/Types/PublicInformation/PublicInformationTypes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminEmptyListItem from "@/pages/Utility/AdminEmptyListItem";
import { EyeIcon } from "lucide-react";
import CitizenCharterHeader from "./CitizenCharterHeader";
import AddEditCitizenCharterDialog from "./AddEditCitizenCharterDialog";

export default function CitizenCharterTable() {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [biddingList, setBiddingList] = useState<BiddingData[]>([]);
    const [isAddEditDialogVisible, setIsAddEditDialogVisible] = useState(false);

    return (
        <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Citizen's Charter</h1>
                <CitizenCharterHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => { }}
                    onExportButtonClicked={() => { }}
                    onAddNewButtonClicked={() => { setIsAddEditDialogVisible(true) }}
                />
            </div>

            <div className="flex items-center justify-between mb-2">
                <div>
                    <Button
                        size="sm"
                        disabled={selectedItems.length <= 0}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                        onClick={() => { }
                            // setClassicDialog((prev) => ({
                            //     ...prev,
                            //     isOpen: true,
                            //     title: "Confirm",
                            //     message: `Are you sure you want to delete ${selectedItems.length} selected announcement(s)?`,
                            //     positiveButtonText: "Delete",
                            //     negativeButtonText: "Cancel",
                            //     payload: selectedItems,
                            // }))
                        }
                    >
                        Delete ({selectedItems.length}) items
                    </Button>
                </div>
            </div>

            {/* TABLE */}
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
                            <TableHead className="w-64">Sender Name</TableHead>
                            <TableHead className="w-[300px]">Location</TableHead>
                            <TableHead className="w-32">Contact</TableHead>
                            <TableHead className="w-32">Date</TableHead>
                            {/* <TableHead className="w-24 text-center">Status</TableHead> */}
                            <TableHead className="w-24 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {biddingList.length === 0 ? (
                            <AdminEmptyListItem
                                colSpan={7}
                                title='No charter yet'
                                message='Charters will appear here once you create one.' />
                        ) : (
                            biddingList.map((item, index) => (
                                <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                    {/* <TableCell>
                                        <div className="flex items-center justify-center p-2">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 cursor-pointer"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => toggleSelectItem(item.id)}
                                            />
                                        </div>
                                    </TableCell> */}
                                    {/* <TableCell>{index + 1 + (currentPage - 1) * perPage}</TableCell>
                                    <TableCell>{item.sender_name ? item.sender_name : "Concerned Citizen"}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell>{item.contact ? item.contact : "Not provided"}</TableCell>
                                    <TableCell>{Utility().formatToReadableDate(item.created_at)}</TableCell> */}
                                    {/* <TableCell>{item.status ? item.status : "N/A"}</TableCell> */}
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

                                        {/* <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {

                                            }}
                                            className="border-green-200 text-blue-600 hover:bg-green-50"
                                        >
                                            <Map size={14} />
                                        </Button> */}
                                        {/* <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setClassicDialog((prev) => ({
                                                    ...prev,
                                                    isOpen: true,
                                                    title: 'Confirm',
                                                    message: 'Are you sure you want to delete this announcement?',
                                                    positiveButtonText: 'Delete',
                                                    negativeButtonText: 'Cancel',
                                                    payload: item.id,
                                                }))
                                            }
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </Button> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddEditCitizenCharterDialog
                isOpen={isAddEditDialogVisible}
                onClose={() => setIsAddEditDialogVisible(false)}
                onSuccess={(data, isEditMode) => {

                }} />
        </div>
    );
}
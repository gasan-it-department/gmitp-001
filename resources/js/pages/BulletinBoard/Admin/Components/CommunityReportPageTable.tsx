import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CommunityReportHeader from "./CommunityReportHeader";
import AdminEmptyListItem from "@/pages/Utility/AdminEmptyListItem";
import { useEffect, useState } from "react";
import { CommunityReportData } from "@/Core/Types/CommunityReportPage/CommunityReportPageTypes";
import { CommunityReportApi } from "@/Core/Api/CommunityReport/CommunityReportApi";
import { useMunicipality } from "@/Core/Context/MunicipalityContext";
import LoadingDialog from "@/pages/Utility/LoadingDialog";
import ClassicDialog from "@/pages/Utility/ClassicDialog";
import ToastProvider from "@/pages/Utility/ToastShower";
import PaginationView from "@/pages/Utility/PaginationView";
import FilterDialog from "./FilterDialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeIcon, Map, Pencil } from "lucide-react";
import ViewCommunityReportDialog from "./ViewCommunityReportsDialog";
import Utility from "@/pages/Utility/Utility";
import { FilterDialogData } from "@/Core/Types/Utility/FilterDialogTypes";

export default function CommunityReportPageTable() {
    const [communityReportsList, setCommunityReportsList] = useState<CommunityReportData[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { currentMunicipality } = useMunicipality();
    const [loadigDialogVisible, setLoadingDialogVisible] = useState(false);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isFilteringDialogVisible, setIsFilteringDialogVisible] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<FilterDialogData | null>(null);

    const [viewCommunityReportDialog, setViewCommunityReportDialog] = useState<{
        isOpen: boolean;
        viewingData: CommunityReportData | null;
    }>({
        isOpen: false,
        viewingData: null
    });


    const toggleSelectAll = () => {
        if (communityReportsList.length === communityReportsList.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(communityReportsList.map(item => item.id));
        }
    };

    useEffect(() => {
        loadCommunityReports(currentPage);
    }, [currentPage]);

    const loadCommunityReports = async (page: number = 1) => {
        try {
            setLoadingDialogVisible(true);
            const response = await CommunityReportApi.getCommunityReport(currentMunicipality.slug);

            if (response.success) {
                const responseData = response.data;

                setCommunityReportsList(responseData.data);
                setCurrentPage(responseData.current_page);
                setLastPage(responseData.last_page);
                setPerPage(responseData.per_page);
                setTotalItems(responseData.total);
            }
        } catch (error: any) {
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: "An error occurred.",
                message: error.message || "Failed to load community reports",
                positiveButtonText: "Close",
                isNegativeButtonHidden: true,
            }));
        } finally {
            setLoadingDialogVisible(false);
        }
    };


    const [classicDialog, setClassicDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        positiveButtonText: string;
        negativeButtonText: string;
        isNegativeButtonHidden: boolean;
        payload: any;
    }>({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: 'Ok',
        negativeButtonText: 'Cancel',
        isNegativeButtonHidden: false,
        payload: null,
    });

    const handleDelete = (idList: string[]) => {
        // HANDLE BACKEND DELETE HERE
    }

    const handleSort = (currentSelectedSort: string | null) => {
        // HANDLE SORT IN BACKEND
        console.log("Selected sort: ", currentSelectedSort);
    }

    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Community Reports</h1>
                <CommunityReportHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => { }} />
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
                        {communityReportsList.length === 0 ? (
                            <AdminEmptyListItem
                                colSpan={7}
                                title='No community reports yet'
                                message='Community reports will appear here.' />
                        ) : (
                            communityReportsList.map((item, index) => (
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
                                    <TableCell>{index + 1 + (currentPage - 1) * perPage}</TableCell>
                                    <TableCell>{item.sender_name ? item.sender_name : "Concerned Citizen"}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell>{item.contact ? item.contact : "Not provided"}</TableCell>
                                    <TableCell>{Utility().formatToReadableDate(item.created_at)}</TableCell>
                                    {/* <TableCell>{item.status ? item.status : "N/A"}</TableCell> */}
                                    <TableCell className="flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setViewCommunityReportDialog(() => ({
                                                    isOpen: true,
                                                    viewingData: item
                                                }))
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

            <ToastProvider />

            <ViewCommunityReportDialog
                isOpen={viewCommunityReportDialog.isOpen}
                data={viewCommunityReportDialog.viewingData}
                onClose={function (): void {
                    setViewCommunityReportDialog(() => ({
                        isOpen: false,
                        viewingData: null
                    }));
                }} />

            {/* PAGINATION */}
            <div className="mt-2">
                <PaginationView
                    currentPage={currentPage}
                    totalPages={lastPage}
                    totalItems={totalItems}
                    itemsPerPage={perPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* CLASSIC DIALOG */}
            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                open={classicDialog.isOpen}
                onPositiveClick={() => {
                    if (classicDialog.payload) handleDelete(classicDialog.payload);
                    setClassicDialog((prev) => ({ ...prev, isOpen: false, payload: null }));
                }}
                onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isOpen: false }))}
            />

            <LoadingDialog title="Loading, please wait..." isOpen={loadigDialogVisible} />

            <FilterDialog
                isOpen={isFilteringDialogVisible}
                currentFilter={currentFilter}
                onClose={() => setIsFilteringDialogVisible(false)}
                filters={[
                    { title: "Title", sub: "title" },
                    { title: "Message", sub: "message" },
                    { title: "Date Posted", sub: "created_at" }
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
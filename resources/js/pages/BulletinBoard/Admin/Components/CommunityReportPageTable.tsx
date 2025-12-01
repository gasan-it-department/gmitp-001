import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    const [currentFilter, setCurrentFilter] = useState<string | null>(null);

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
            // FOUND AN ERROR HERE
            const response = await CommunityReportApi.getCommunityReport(currentMunicipality.slug);
            console.log("Response: ", response);
            setLoadingDialogVisible(false);
        } catch (error: any) {
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: "An error occurred.",
                message: error.message || "Failed to delete announcement",
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
    }

    return (
        <div>
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
                            <TableHead className="w-12">
                                <div className="flex items-center justify-center p-2">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={communityReportsList.length === communityReportsList.length && communityReportsList.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                            </TableHead>
                            <TableHead className="w-16">No.</TableHead>
                            <TableHead className="w-64">Sender Name</TableHead>
                            <TableHead className="w-[500px]">Location</TableHead>
                            <TableHead className="w-32">Contact</TableHead>
                            <TableHead className="w-24 text-center">Status</TableHead>
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

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <ToastProvider />

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
                    filters={["Title", "Message", "Date Posted"]}
                    selectedFilter={currentFilter}
                    onApply={(selectedFilter) => {
                        setCurrentFilter(selectedFilter);
                        handleSort(selectedFilter);
                    }}
                />
            </div>
        </div>
    );
}
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AnnouncementApi } from '@/Core/Api/BulletinBoard/AnnouncementApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import { FilterDialogData } from '@/Core/Types/Utility/FilterDialogTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import ToastProvider from '@/pages/Utility/ToastShower';
import Utility from '@/pages/Utility/Utility';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddEditAnnouncementDialog from './AddEditAnnouncementDialog';
import AnnouncementPageHeader from './AnnouncementPageHeader';
import FilterDialog from './FilterDialog';

// 1. Define Types matching the Laravel API Resource
interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface AnnouncementApiResponse {
    data: AnnouncementData[];
    meta: PaginationMeta;
    links: any;
    success: boolean;
}

export default function AnnouncementPageTable() {
    const { currentMunicipality } = useMunicipality();

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Dialogs & Filters
    const [isFilterDialogVisible, setIsFilterDialogVisible] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<FilterDialogData | null>(null);
    const [addEditDialog, setAddEditDialog] = useState<{ isOpened: boolean; editData: AnnouncementData | null }>({
        isOpened: false,
        editData: null,
    });

    const [classicDialog, setClassicDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        positiveButtonText: string;
        negativeButtonText: string;
        isNegativeButtonHidden: boolean;
        action: string;
        selectedItemId: string[] | null;
    }>({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: 'Ok',
        negativeButtonText: 'Cancel',
        isNegativeButtonHidden: false,
        action: '',
        selectedItemId: [],
    });

    useEffect(() => {
        loadAnnouncement(currentPage);
    }, [currentPage]);

    // 2. Refactored Load Logic to use Meta Data
    const loadAnnouncement = async (page: number = 1) => {
        setIsLoading(true);
        try {
            // Cast the response to our Interface
            const response = await AnnouncementApi.getAnnouncement(currentMunicipality.slug, page);
            const apiData = response as unknown as AnnouncementApiResponse;

            setAnnouncementList(apiData.data);

            // Set Pagination from Meta
            setCurrentPage(apiData.meta.current_page);
            setLastPage(apiData.meta.last_page);
            setPerPage(apiData.meta.per_page);
            setTotalItems(apiData.meta.total);

            // Clear selections on page change
            setSelectedItems([]);
        } catch (error: any) {
            console.error(error);
            setAnnouncementList([]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOCAL SUCCESS HANDLER (FIXED) ---
    const handleSuccess = (data: AnnouncementData, isEdit: boolean) => {
        setAddEditDialog({ isOpened: false, editData: null });

        if (isEdit) {
            // 1. EDIT: Find and replace the updated item in the current list
            setAnnouncementList(prevList => prevList.map(
                item => item.id === data.id ? data : item
            ));
            toast.success('Announcement updated successfully');
        } else {
            // 2. ADD: Insert the new item at the beginning of the list (Page 1 behavior)
            // This ensures the new total count and calculated total pages are correct.
            setTotalItems(prev => prev + 1);

            if (currentPage === 1) {
                setAnnouncementList(prevList => {
                    const newList = [data, ...prevList];
                    // Ensure the list doesn't exceed the items per page count (clipping the oldest)
                    return newList.slice(0, perPage);
                });
            }
            toast.success('Announcement created successfully');
        }
    };
    // 3. Simplified Delete Logic (FIXED to handle empty pages)
    const handleDelete = async (idList: string[] | null) => {
        if (!idList || idList.length === 0) return;

        setIsLoading(true);
        try {
            const response = await AnnouncementApi.deleteMultiple(idList, currentMunicipality.slug);

            if (response.success) {
                toast.success('Successfully deleted');

                // --- NEW LOGIC START ---
                const deletedCount = idList.length;
                const remainingOnPage = announcementList.length - deletedCount;

                let pageToLoad = currentPage;

                // Check if the current page will become empty and we are not on page 1
                // We use the total items count (simulated) to check if we are deleting the last item on the last page.
                if (remainingOnPage <= 0 && currentPage > 1 && totalItems - deletedCount <= (currentPage - 1) * perPage) {
                    pageToLoad = currentPage - 1;
                }

                // Reload the determined page
                loadAnnouncement(pageToLoad);
                // --- NEW LOGIC END ---

                setSelectedItems([]);
            } else {
                toast.error('An error occurred while deleting');
            }
        } catch (error: any) {
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: 'An error occurred.',
                message: error.message || 'Failed to delete announcement',
                positiveButtonText: 'Close',
                isNegativeButtonHidden: true,
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === announcementList.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(announcementList.map((item) => item.id));
        }
    };

    const handleSort = (currentSelectedSort: string | null) => {
        console.log('Announcement selected filter: ', currentSelectedSort);
        // Implement server filter logic here
    };

    return (
        <div className="flex h-full flex-col">
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Announcement List</h1>
                <AnnouncementPageHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => setIsFilterDialogVisible(true)}
                    onExportButtonClicked={() => { }}
                    onAddNewButtonClicked={() => setAddEditDialog({ isOpened: true, editData: null })}
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
                                message: `Are you sure you want to delete ${selectedItems.length} selected announcement(s)?`,
                                positiveButtonText: 'Delete',
                                negativeButtonText: 'Cancel',
                                payload: selectedItems, // Payload kept for compatibility
                                action: 'delete',
                                selectedItemId: selectedItems,
                            }))
                        }
                    >
                        Delete ({selectedItems.length}) items
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-auto rounded-2xl border border-gray-200 shadow-sm">
                <Table className="min-w-full table-auto">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="w-12">
                                <div className="flex items-center justify-center p-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 cursor-pointer"
                                        checked={selectedItems.length === announcementList.length && announcementList.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                            </TableHead>
                            <TableHead className="w-16 text-center">No.</TableHead>
                            <TableHead className="w-64">Title</TableHead>
                            <TableHead className="w-[500px]">Message</TableHead>
                            <TableHead className="w-32">Date Posted</TableHead>
                            <TableHead className="w-24 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {announcementList.length === 0 && !isLoading ? (
                            <AdminEmptyListItem colSpan={6} title="No announcement yet" message="Your posted announcement will appear here." />
                        ) : (
                            announcementList.map((item, index) => {
                                // 4. Correct Row Number Calculation
                                const rowNumber = (currentPage - 1) * perPage + (index + 1);

                                return (
                                    <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                        <TableCell>
                                            <div className="flex items-center justify-center p-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 cursor-pointer"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleSelectItem(item.id)}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{rowNumber}</TableCell>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell className="max-w-[500px]">
                                            <span
                                                className="block overflow-hidden"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 3,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {item.message}
                                            </span>
                                        </TableCell>
                                        <TableCell>{Utility().formatToReadableDate(item.created_at) || '—'}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setAddEditDialog({ isOpened: true, editData: item })}
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                {/* <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() =>
                                                        setClassicDialog({
                                                            isOpen: true,
                                                            title: 'Confirm',
                                                            message: 'Delete this announcement?',
                                                            positiveButtonText: 'Delete',
                                                            negativeButtonText: 'Cancel',
                                                            isNegativeButtonHidden: false,
                                                            action: 'delete',
                                                            selectedItemId: [item.id],
                                                        })
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                </Button> */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

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

            {/* DIALOGS */}
            <AddEditAnnouncementDialog
                editData={addEditDialog.editData}
                isOpen={addEditDialog.isOpened}
                onClose={() => setAddEditDialog({ isOpened: false, editData: null })}
                onSuccess={handleSuccess}
            />

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                open={classicDialog.isOpen}
                onPositiveClick={() => {
                    if (classicDialog.action === 'delete') {
                        handleDelete(classicDialog.selectedItemId);
                    }
                    setClassicDialog((prev) => ({ ...prev, isOpen: false, payload: null }));
                }}
                onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isOpen: false }))}
            />

            <LoadingDialog title="Loading..." isOpen={isLoading} />

            <FilterDialog
                isOpen={isFilterDialogVisible}
                currentFilter={currentFilter}
                onClose={() => setIsFilterDialogVisible(false)}
                filters={[
                    { title: 'Title', sub: 'title' },
                    { title: 'Message', sub: 'message' },
                    { title: 'Date Posted', sub: 'created_at' },
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

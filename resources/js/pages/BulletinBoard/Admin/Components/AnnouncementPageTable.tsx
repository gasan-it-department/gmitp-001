import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AnnouncementApi } from '@/Core/Api/BulletinBoard/AnnouncementApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddEditAnnouncementDialog from './AddEditAnnouncementDialog';
import AnnouncementPageHeader from './AnnouncementPageHeader';
import FilterDialog from './FilterDialog';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';

export default function AnnouncementPageTable() {
    const { currentMunicipality } = useMunicipality();
    const [rawAnnouncementList, setRawAnnouncementList] = useState<AnnouncementData[]>([]);
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]); // Track selected IDs
    const [isLoadingDialogVisible, setIsLoadingDialogVisible] = useState(false);
    const [isFilterDialogVisible, setIsFilterDialogVisible] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<string | null>("Event title");
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
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

    useEffect(() => {
        loadAnnouncement(currentPage);
    }, [currentPage]);

    const loadAnnouncement = async (page: number = 1) => {
        setIsLoadingDialogVisible(true);
        try {
            const response = await AnnouncementApi.getAnnouncement(currentMunicipality.slug, page);
            const sorted = [...response.data].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setRawAnnouncementList(sorted);
            setAnnouncementList(sorted);
            setCurrentPage(response.current_page);
            setLastPage(response.last_page);
            setPerPage(response.per_page);
            setTotalItems(response.total);

            // Clear selected items when loading a new page
            setSelectedItems([]);
        } catch (error: any) {
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: 'An error occurred!',
                message: error.message || 'Failed to load announcements.',
                positiveButtonText: 'Close',
                isNegativeButtonHidden: true,
            }));
        } finally {
            setIsLoadingDialogVisible(false);
        }
    };

    const applyFilterWithData = (filter: string | null, list: AnnouncementData[]) => {
        if (!filter) {
            setAnnouncementList(list);
            return;
        }
        let filtered = [...list];
        switch (filter) {
            case "Title":
                filtered = filtered
                    .filter(item => item.title?.trim().length > 0)
                    .sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "Message":
                filtered = filtered
                    .filter(item => item.message?.trim().length > 0)
                    .sort((a, b) => a.message.localeCompare(b.message));
                break;
            case "Date Posted":
                filtered = filtered
                    .filter(item => item.created_at != null)
                    .sort((a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                break;
            default:
                filtered = list;
        }
        setAnnouncementList(filtered);
    };

    const handleSuccess = (data: AnnouncementData, isEdit: boolean) => {
        let updatedList: AnnouncementData[] = [];
        if (isEdit) {
            updatedList = rawAnnouncementList.map(item => item.id === data.id ? data : item);
        } else {
            updatedList = [data, ...rawAnnouncementList];
            setAnnouncementList(updatedList.slice(0, perPage));
            setTotalItems(prev => prev + 1);
            setCurrentPage(1);
            setRawAnnouncementList(updatedList);
            return;
        }
        setRawAnnouncementList(updatedList);
        applyFilterWithData(currentFilter, updatedList);
    };

    const handleDelete = async (idList: string[]) => {
        setIsLoadingDialogVisible(true);
        try {
            if (idList.length == 1) {
                const response = await AnnouncementApi.deleteAnnouncement(idList[0], currentMunicipality.slug);
                if (response.success) {
                    const isLastItemOnPage = announcementList.length === 1;
                    const newPage = isLastItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;
                    loadAnnouncement(newPage);
                } else {
                    console.error(response.message || "Failed to delete announcement");
                }
            } else {
                console.log("Multiple delete detected.");
            }
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
            setIsLoadingDialogVisible(false);
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === announcementList.length) {
            setSelectedItems([]); // deselect all
        } else {
            setSelectedItems(announcementList.map(item => item.id)); // select all
        }
    };

    const deleteMultiple = (idList: string[]) => {

    }


    return (
        <div className="flex flex-col h-full">

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

            <div className="flex items-center justify-between mb-2">
                <div>
                    <Button
                        size="sm"
                        disabled={selectedItems.length <= 0}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                        onClick={() =>
                            setClassicDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                title: "Confirm",
                                message: `Are you sure you want to delete ${selectedItems.length} selected announcement(s)?`,
                                positiveButtonText: "Delete",
                                negativeButtonText: "Cancel",
                                payload: selectedItems,
                            }))
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
                            <TableHead className="w-12">
                                <div className="flex items-center justify-center p-2">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={selectedItems.length === announcementList.length && announcementList.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </div>
                            </TableHead>
                            <TableHead className="w-16">No.</TableHead>
                            <TableHead className="w-64">Title</TableHead>
                            <TableHead className="w-[500px]">Message</TableHead>
                            <TableHead className="w-32">Date Posted</TableHead>
                            <TableHead className="w-24 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {announcementList.length === 0 ? (
                            <AdminEmptyListItem
                                colSpan={6}
                                title='No announcement yet'
                                message='Your posted announcement will appear here.' />
                        ) : (
                            announcementList.map((item, index) => (
                                <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex items-center justify-center p-2">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 cursor-pointer"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => toggleSelectItem(item.id)}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>{index + 1 + (currentPage - 1) * perPage}</TableCell>
                                    <TableCell>{item.title}</TableCell>
                                    <TableCell className="truncate max-w-[500px]">
                                        <span
                                            className="block overflow-hidden"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 3,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: '1.4em',
                                                maxHeight: '4.2em',
                                            }}
                                        >
                                            {item.message}
                                        </span>
                                    </TableCell>
                                    <TableCell>{Utility().formatToReadableDate(item.created_at) || '—'}</TableCell>
                                    <TableCell className="flex justify-center gap-2">
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
                    if (classicDialog.payload) handleDelete(classicDialog.payload);
                    setClassicDialog((prev) => ({ ...prev, isOpen: false }));
                }}
                onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isOpen: false }))}
            />

            <LoadingDialog title="Loading, please wait..." isOpen={isLoadingDialogVisible} />

            <FilterDialog
                isOpen={isFilterDialogVisible}
                currentFilter={currentFilter}
                onClose={() => setIsFilterDialogVisible(false)}
                filters={["Title", "Message", "Date Posted"]}
                selectedFilter={currentFilter}
                onApply={(selectedFilter) => {
                    setCurrentFilter(selectedFilter);
                    // BACKEND FILTERING
                }}
            />
        </div>
    );
}

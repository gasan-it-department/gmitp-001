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
import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddEditAnnouncementDialog from './AddEditAnnouncementDialog';
import AnnouncementPageHeader from './AnnouncementPageHeader';
import FilterDialog from './FilterDialog';

/* ================= TYPES ================= */

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

/* ================= COMPONENT ================= */

export default function AnnouncementPageTable() {
    const { currentMunicipality } = useMunicipality();

    /* ========= STATE ========= */
    const [isLoading, setIsLoading] = useState(false);
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    /* ========= PAGINATION ========= */
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    /* ✅ FIX: keep pagination in sync when adding/deleting locally */
    useEffect(() => {
        setLastPage(Math.ceil(totalItems / perPage) || 1);
    }, [totalItems, perPage]);

    /* ========= DIALOGS ========= */
    const [isFilterDialogVisible, setIsFilterDialogVisible] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<FilterDialogData | null>(null);

    const [addEditDialog, setAddEditDialog] = useState<{
        isOpened: boolean;
        editData: AnnouncementData | null;
    }>({
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

    /* ========= LOAD ========= */

    useEffect(() => {
        loadAnnouncement(currentPage);
    }, [currentPage]);

    const loadAnnouncement = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await AnnouncementApi.getAnnouncement(
                currentMunicipality.slug,
                page
            );

            const apiData = response as unknown as AnnouncementApiResponse;

            setAnnouncementList(apiData.data);
            setCurrentPage(apiData.meta.current_page);
            setLastPage(apiData.meta.last_page);
            setPerPage(apiData.meta.per_page);
            setTotalItems(apiData.meta.total);
            setSelectedItems([]);
        } catch (e) {
            console.error(e);
            setAnnouncementList([]);
        } finally {
            setIsLoading(false);
        }
    };

    /* ========= ADD / EDIT ========= */

    const handleSuccess = (data: AnnouncementData, isEdit: boolean) => {
        setAddEditDialog({ isOpened: false, editData: null });

        if (isEdit) {
            setAnnouncementList(prev =>
                prev.map(item => (item.id === data.id ? data : item))
            );
            toast.success('Announcement updated successfully');
        } else {
            setTotalItems(prev => prev + 1);

            if (currentPage === 1) {
                setAnnouncementList(prev =>
                    [data, ...prev].slice(0, perPage)
                );
            }
            toast.success('Announcement created successfully');
        }
    };

    /* ========= BULK DELETE ========= */

    const handleDelete = async (ids: string[] | null) => {
        if (!ids || ids.length === 0) return;

        setIsLoading(true);
        try {
            const response = await AnnouncementApi.deleteMultiple(
                ids,
                currentMunicipality.slug
            );

            if (response.success) {
                toast.success('Successfully deleted');

                const remaining = announcementList.length - ids.length;
                let pageToLoad = currentPage;

                if (
                    remaining <= 0 &&
                    currentPage > 1 &&
                    totalItems - ids.length <=
                    (currentPage - 1) * perPage
                ) {
                    pageToLoad = currentPage - 1;
                }

                loadAnnouncement(pageToLoad);
                setSelectedItems([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    /* ========= SELECT ========= */

    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === announcementList.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(announcementList.map(i => i.id));
        }
    };

    /* ================= RENDER ================= */

    return (
        <div className="flex h-full flex-col">
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Announcement List
                </h1>
                <AnnouncementPageHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() =>
                        setIsFilterDialogVisible(true)
                    }
                    onExportButtonClicked={() => { }}
                    onAddNewButtonClicked={() =>
                        setAddEditDialog({
                            isOpened: true,
                            editData: null,
                        })
                    }
                />
            </div>

            {/* BULK DELETE */}
            <div className="mb-2">
                <Button
                    size="sm"
                    disabled={selectedItems.length === 0}
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() =>
                        setClassicDialog(prev => ({
                            ...prev,
                            isOpen: true,
                            title: 'Confirm',
                            message: `Delete ${selectedItems.length} selected announcement(s)?`,
                            positiveButtonText: 'Delete',
                            negativeButtonText: 'Cancel',
                            action: 'delete',
                            selectedItemId: selectedItems,
                        }))
                    }
                >
                    Delete ({selectedItems.length})
                </Button>
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-auto rounded-2xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8">
                                <input
                                    type="checkbox"
                                    disabled={announcementList.length === 0}
                                    checked={
                                        selectedItems.length ===
                                        announcementList.length &&
                                        announcementList.length > 0
                                    }
                                    onChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>No.</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date Posted</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {announcementList.length === 0 &&
                            !isLoading ? (
                            <AdminEmptyListItem
                                colSpan={6}
                                title="No announcement yet"
                                message="Your announcements will appear here."
                            />
                        ) : (
                            announcementList.map((item, index) => {
                                const rowNumber =
                                    (currentPage - 1) * perPage +
                                    index +
                                    1;

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(
                                                    item.id
                                                )}
                                                onChange={() =>
                                                    toggleSelectItem(
                                                        item.id
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {rowNumber}
                                        </TableCell>
                                        <TableCell>
                                            {item.title}
                                        </TableCell>
                                        <TableCell className="max-w-[500px] truncate">
                                            {item.message}
                                        </TableCell>
                                        <TableCell>
                                            {Utility().formatToReadableDate(
                                                item.created_at
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setAddEditDialog({
                                                        isOpened:
                                                            true,
                                                        editData:
                                                            item,
                                                    })
                                                }
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <PaginationView
                currentPage={currentPage}
                totalPages={lastPage}
                totalItems={totalItems}
                itemsPerPage={perPage}
                onPageChange={setCurrentPage}
            />

            <ToastProvider />

            {/* DIALOGS */}
            <AddEditAnnouncementDialog
                editData={addEditDialog.editData}
                isOpen={addEditDialog.isOpened}
                onClose={() =>
                    setAddEditDialog({
                        isOpened: false,
                        editData: null,
                    })
                }
                onSuccess={handleSuccess}
            />

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                open={classicDialog.isOpen}
                onPositiveClick={() => {
                    if (classicDialog.action === 'delete') {
                        handleDelete(
                            classicDialog.selectedItemId
                        );
                    }
                    setClassicDialog(prev => ({
                        ...prev,
                        isOpen: false,
                    }));
                }}
                onNegativeClick={() =>
                    setClassicDialog(prev => ({
                        ...prev,
                        isOpen: false,
                    }))
                }
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
                onApply={setCurrentFilter}
            />
        </div>
    );
}

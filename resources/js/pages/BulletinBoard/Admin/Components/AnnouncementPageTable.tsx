import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AnnouncementApi } from '@/Core/Api/BulletinBoard/AnnouncementApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import axios from '@/lib/axios';
import AddminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import Utility from '@/pages/Utility/Utility';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddEditAnnouncementDialog from './AddEditAnnouncementDialog';
import BulletinHeader from './BulletinHeader';

export default function AnnouncementPageTable() {
    const [announcementList, setAnnouncementList] = useState<AnnouncementData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(announcementList.length / itemsPerPage);
    const [isLoadingDialogVisible, setIsLoadingDialogVisible] = useState(false);
    const { currentMunicipality } = useMunicipality();
    const [addEditDialog, setAddEditDialog] = useState<{
        isOpened: boolean;
        editData: AnnouncementData | null;
    }>({
        isOpened: false,
        editData: null,
    });

    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: 'Ok',
        negativeButtonText: 'Cancel',
        isNegativeButtonHidden: false,
        payload: '',
    });

    // const renderStatusBadge = (isPublished?: boolean) => {
    //     const published = !!isPublished;
    //     return published ? (
    //         <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-[11px] font-semibold">
    //             <CheckCircle2 size={13} className="text-green-600" />
    //             Published
    //         </span>
    //     ) : (
    //         <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 px-2.5 py-1 text-[11px] font-semibold">
    //             <XCircle size={13} className="text-gray-500" />
    //             Unpublished
    //         </span>
    //     );
    // };

    const handleDelete = async (id: string) => {
        try {
            setIsLoadingDialogVisible(true);
            const response = await axios.delete(`/bulletin-board/announcement/${id}`);
            if (response.data.success) {
                setAnnouncementList((prev) => {
                    const updated = prev.filter((item) => item.id !== id);
                    if ((currentPage - 1) * itemsPerPage >= updated.length && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    }

                    return updated;
                });
                setIsLoadingDialogVisible(false);
            } else {
                console.error(response.data.message || 'Failed to delete announcement');
            }
            setIsLoadingDialogVisible(false);
        } catch (error: any) {
            setIsLoadingDialogVisible(false);
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: "An error occurred.",
                message: error,
                positiveButtonText: "Close",
                isNegativeButtonHidden: true,
            }));
        }
    };

    useEffect(() => {
        loadAnnouncement();
    }, []);

    async function loadAnnouncement() {
        try {
            setIsLoadingDialogVisible(true);
            const response = await AnnouncementApi.getAnnouncement(currentMunicipality.slug);
            setIsLoadingDialogVisible(false);
            if (response.success) {
                const sorted = [...response.data].sort((a, b) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                setAnnouncementList(sorted);
            } else {
                setClassicDialog((prev) => ({
                    ...prev,
                    isOpen: true,
                    title: "An error occurred!",
                    message: "Failed to load announcement. Please check your Internet connection and try again.",
                    positiveButtonText: "Close",
                    isNegativeButtonHidden: true,
                }));
            }
        } catch (error: any) {
            setIsLoadingDialogVisible(false);
            console.error('Error fetching announcements:', error);
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: "An error occurred!",
                message: error,
                positiveButtonText: "Close",
                isNegativeButtonHidden: true,
            }));
        }
    }

    const handleSuccess = (data: AnnouncementData, isEdit: boolean) => {
        if (isEdit) {
            setAnnouncementList((prev) => prev.map((item) => (item.id === data.id ? data : item)));
        } else {
            setAnnouncementList((prev) => [data, ...prev]);
        }
    };

    const handlePageChange = (page: number, totalPages: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Announcement List</h1>
                <BulletinHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => { }}
                    onExportButtonClicked={() => { }}
                    onAddNewButtonClicked={() => {
                        setAddEditDialog({
                            isOpened: true,
                            editData: null,
                        });
                    }}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">No.</TableHead>
                            <TableHead className="text-[12px] font-bold">Title</TableHead>
                            <TableHead className="text-[12px] font-bold">Message</TableHead>
                            <TableHead className="text-[12px] font-bold">Date Posted</TableHead>
                            {/* <TableHead className="text-[12px] font-bold">Status</TableHead> */}
                            <TableHead className="w-[90px] text-center text-[12px] font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {announcementList.length === 0 ? (
                            <AddminEmptyListItem title="No Announcement yet." message="Announcement you add will appear here." />
                        ) : (
                            announcementList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                                <TableRow key={index} className="cursor-pointer transition-colors hover:bg-gray-50">
                                    <TableCell className="text-[12px] font-medium">{index + 1}</TableCell>
                                    <TableCell className="text-[12px] font-medium">{item.title}</TableCell>
                                    <TableCell className="max-w-[300px] overflow-hidden p-5 text-[12px]">
                                        <span
                                            className="block overflow-hidden text-ellipsis"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 3,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'normal',
                                                lineHeight: '1.4em',
                                                maxHeight: '4.2em',
                                            }}
                                        >
                                            {item.message}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-[12px]">{Utility().formatToReadableDate(item.created_at) || '—'}</TableCell>
                                    {/* <TableCell className="text-[12px]">
                                            {renderStatusBadge(item.is_published)}
                                        </TableCell> */}

                                    {/* ACTION BUTTONS */}
                                    <TableCell className="flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setAddEditDialog({
                                                    isOpened: true,
                                                    editData: item,
                                                })
                                            }
                                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setClassicDialog((prev) => ({
                                                    ...prev,
                                                    isOpen: true,
                                                    title: 'Confirm',
                                                    message: 'Are you sure you want to delete this announcement?',
                                                    positiveButtonText: 'Delete',
                                                    negativeButtonText: 'Cancel',
                                                    payload: item.id,
                                                }));
                                            }}
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            {announcementList.length > itemsPerPage && (
                <div className="mt-6">
                    <PaginationView
                        maxVisible={4}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={announcementList.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* ADD/EDIT DIALOG */}
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

            {/* CONFIRMATION DIALOG */}
            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                open={classicDialog.isOpen}
                onPositiveClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));
                    handleDelete(classicDialog.payload);
                }}
                onNegativeClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));
                }}
            />

            <LoadingDialog title="Loading, please wait..." isOpen={isLoadingDialogVisible} />
        </div>
    );
}

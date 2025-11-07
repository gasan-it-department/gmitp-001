import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BulletinHeader from "./BulletinHeader";
import AddEditAnnouncementDialog from "./AddEditAnnouncementDialog";
import { useEffect, useState } from "react";
import { AnnouncementFormData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import { CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassicDialog from "@/pages/Utility/ClassicDialog";
import { usePage } from "@inertiajs/react";
import axios from "@/lib/axios";
import Utility from "@/pages/Utility/Utility";
import AddminEmptyListItem from "@/pages/Utility/AdminEmptyListItem";

export default function AnnouncementPageTable() {
    const [announcementList, setAnnouncementList] = useState<AnnouncementFormData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { announcement } = usePage().props;
    console.log("AAAA", announcement);
    const [addEditDialog, setAddEditDialog] = useState<{
        isOpened: boolean;
        editData: AnnouncementFormData | null;
    }>({
        isOpened: false,
        editData: null,
    });
    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        positiveButtonText: "Ok",
        negativeButtonText: "Cancel",
        isNegativeButtonHidded: false,
        payload: ""
    });

    const renderStatusBadge = (isPublished?: boolean) => {
        const published = !!isPublished;
        return published ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-[11px] font-semibold">
                <CheckCircle2 size={13} className="text-green-600" />
                Published
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 px-2.5 py-1 text-[11px] font-semibold">
                <XCircle size={13} className="text-gray-500" />
                Unpublished
            </span>
        );
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await axios.delete(`/bulletin-board/announcement/${id}`);
            if (response.data.success) {
                setAnnouncementList((prev) => prev.filter((item) => item.id !== id));
            } else {
                console.error(response.data.message || "Failed to delete announcement");
            }
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    };

    useEffect(() => {
        loadAnnouncement();
    }, []);

    async function loadAnnouncement() {
        try {
            const response = await axios.get("/bulletin-board/announcement");
            if (response.data.success) {
                setAnnouncementList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
        }
    }

    const handleSuccess = (data: AnnouncementFormData, isEdit: boolean) => {
        if (isEdit) {
            // Update existing
            setAnnouncementList((prev) =>
                prev.map((item) => (item.id === data.id ? data : item))
            );
        } else {
            // Add new
            setAnnouncementList((prev) => [data, ...prev]);
        }
    }

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
                            <TableHead className="text-[12px] font-bold">Title</TableHead>
                            <TableHead className="text-[12px] font-bold">Message</TableHead>
                            <TableHead className="text-[12px] font-bold">Date Posted</TableHead>
                            <TableHead className="text-[12px] font-bold">Status</TableHead>
                            <TableHead className="text-[12px] font-bold text-center w-[90px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {announcementList.length === 0 ? (
                            <AddminEmptyListItem 
                            title="No Announcement yet."
                            message="Announcement you add will appear here."/>
                        ) : (
                            announcementList.map((item, index) => (
                                <TableRow
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <TableCell className="text-[12px] font-medium">{item.title}</TableCell>
                                    <TableCell className="text-[12px] max-w-[300px] p-5 overflow-hidden">
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
                                    <TableCell className="text-[12px]">
                                        {Utility().formatToReadableDate(item.created_at) || '—'}
                                    </TableCell>
                                    <TableCell className="text-[12px]">
                                        {renderStatusBadge(item.is_published)}
                                    </TableCell>

                                    {/* ACTION BUTTONS */}
                                    <TableCell className="flex gap-2 justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setAddEditDialog({
                                                    isOpened: true,
                                                    editData: item,
                                                })
                                            }
                                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
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
                                            className="text-red-600 border-red-200 hover:bg-red-50"
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

            {/* ADD/EDIT DIALOG */}
            <AddEditAnnouncementDialog
                editData={addEditDialog.editData}
                isOpen={addEditDialog.isOpened}
                onClose={() => setAddEditDialog({
                    isOpened: false,
                    editData: null,
                })}
                onSuccess={handleSuccess} />

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidded}
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
                }} />
        </div>
    );
}

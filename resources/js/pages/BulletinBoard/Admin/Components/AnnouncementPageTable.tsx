import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BulletinHeader from "./BulletinHeader";
import AddEditAnnouncementDialog from "./AddEditAnnouncementDialog";
import { useState } from "react";
import { AnnouncementFormData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import { CheckCircle2, XCircle } from "lucide-react";

export default function AnnouncementPageTable() {
    const [addEditDialog, setAddEditDialog] = useState<{
        isOpened: boolean;
        editData: AnnouncementFormData | null;
    }>({
        isOpened: false,
        editData: null,
    });

    const dummy = [
        {
            title: "System Maintenance Scheduled on November 2",
            message: "Our servers will undergo scheduled maintenance on November 2 from 12:00 AM to 4:00 AM. Please save your work beforehand to avoid interruptions.",
            id: "A001",
            date_posted: "2025-10-31",
            is_published: false
        },
        {
            title: "New Policy Update: Data Privacy Guidelines",
            message: "We have updated our data privacy policy to enhance protection of user information. Please review the full document in your account settings.",
            id: "A002",
            date_posted: "2025-10-30",
            is_published: false
        },
        {
            title: "Office Closure for All Saints’ Day",
            message: "In observance of All Saints’ Day, our offices will be closed on November 1. Regular operations will resume on November 2.",
            id: "A003",
            date_posted: "2025-10-29",
            is_published: false
        },
        {
            title: "New Feature: Announcement Board",
            message: "We’re excited to introduce the Announcement Board feature! Stay updated with the latest organizational news, system changes, and upcoming events.",
            id: "A004",
            date_posted: "2025-10-28",
            is_published: true
        },
        {
            title: "Important Security Notice",
            message: "We’ve detected phishing attempts targeting staff emails. Do not click on suspicious links and report any unusual messages to IT support immediately.",
            id: "A008",
            date_posted: "2025-10-24",
            is_published: true
        }
    ];

    const renderStatusBadge = (isPublished: boolean) => {
        return isPublished ? (
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
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {dummy.map((item, index) => (
                            <TableRow
                                key={index}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() =>
                                    setAddEditDialog({
                                        isOpened: true,
                                        editData: item,
                                    })
                                }
                            >
                                <TableCell className="text-[12px] font-medium">{item.title}</TableCell>
                                <TableCell className="text-[12px] max-w-[300px] line-clamp-2">{item.message}</TableCell>
                                <TableCell className="text-[12px]">{item.date_posted || "—"}</TableCell>
                                <TableCell className="text-[12px]">{renderStatusBadge(item.is_published)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AddEditAnnouncementDialog
                editData={addEditDialog.editData}
                isOpen={addEditDialog.isOpened}
                onClose={() =>
                    setAddEditDialog({
                        isOpened: false,
                        editData: null,
                    })
                }
            />
        </div>
    );
}

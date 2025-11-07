import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BulletinHeader from "./BulletinHeader";
import { CalendarDays, CheckCircle2, Clock, XCircle, Pencil, Trash2 } from "lucide-react";
import AddEditEventsDialog from "./AddEditEventsDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { EventFormData } from "@/Core/Types/BulletinBoard/Events";
import ClassicDialog from "@/pages/Utility/ClassicDialog";

export default function EventPageTable() {
    const [events, setEvents] = useState<EventFormData[]>([
        {
            id: "E001",
            title: "Municipal Sports Festival 2025",
            description: "A week-long celebration featuring various sports competitions among local barangays.",
            event_date: "2025-11-15",
        },
        {
            id: "E002",
            title: "Cultural Heritage Parade",
            description: "A colorful parade showcasing traditional costumes, music, and dances from our municipality.",
            event_date: "2025-10-25",
        },
        {
            id: "E003",
            title: "Coastal Cleanup Drive",
            description: "Join the community effort to clean our beaches and promote environmental awareness.",
            event_date: "2025-11-06",
        },
        {
            id: "E004",
            title: "Christmas Tree Lighting Ceremony",
            description: "Kick off the holiday season with music, lights, and community fun in front of the municipal hall.",
            event_date: "2025-12-01",
        },
        {
            id: "E005",
            title: "Public Health Awareness Seminar",
            description: "A free educational seminar on preventive health care and nutrition led by local health experts.",
            event_date: "2025-10-30",
        },
    ]);

    const [addEventDialog, setAddEventDialog] = useState<{
        isOpen: boolean;
        editData: EventFormData | null;
    }>({
        isOpen: false,
        editData: null,
    });

    // 🧮 Determine event status
    const getEventStatus = (eventDate: string): "Upcoming" | "Ongoing" | "Completed" => {
        const today = new Date();
        const event = new Date(eventDate);
        const todayStr = today.toISOString().split("T")[0];
        const eventStr = event.toISOString().split("T")[0];
        if (eventStr === todayStr) return "Ongoing";
        if (event > today) return "Upcoming";
        return "Completed";
    };

    // 📅 Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // 🎨 Status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Upcoming":
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                        <Clock size={14} /> Upcoming
                    </span>
                );
            case "Ongoing":
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <CheckCircle2 size={14} /> Ongoing
                    </span>
                );
            case "Completed":
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                        <XCircle size={14} /> Completed
                    </span>
                );
            default:
                return null;
        }
    };

    const handleDelete = (id: string) => {
        setClassicDialog((prev) => ({
            ...prev,
            isOpen: true,
            title: "Confirm",
            message: "Are you sure you want to delete this event?",
            positiveButtonText: "Delete",
            negativeButtonText: "Cancel",
            isNegativeButtonHidden: false
        }));
    };

    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        positiveButtonText: "",
        negativeButtonText: "",
        isNegativeButtonHidden: false
    });

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Event List</h1>
                <BulletinHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => { }}
                    onExportButtonClicked={() => { }}
                    onAddNewButtonClicked={() =>
                        setAddEventDialog({ isOpen: true, editData: null })
                    }
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">Event Title</TableHead>
                            <TableHead className="text-[12px] font-bold">Description</TableHead>
                            <TableHead className="text-[12px] font-bold">Event Date</TableHead>
                            <TableHead className="text-[12px] font-bold">Status</TableHead>
                            <TableHead className="text-[12px] font-bold text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {events.map((item) => {
                            const status = getEventStatus(item.event_date);
                            return (
                                <TableRow
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <TableCell className="text-[13px] font-medium">
                                        {item.title}
                                    </TableCell>
                                    <TableCell className="text-[12px] max-w-[300px]">
                                        <span
                                            className="block overflow-hidden text-ellipsis"
                                            style={{
                                                display: "-webkit-box",
                                                WebkitBoxOrient: "vertical",
                                                WebkitLineClamp: 3,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "normal",
                                                lineHeight: "1.4em",
                                                maxHeight: "4.2em",
                                            }}
                                        >
                                            {item.description}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(item.event_date)}</TableCell>
                                    <TableCell className="text-[12px]">
                                        {getStatusBadge(status)}
                                    </TableCell>
                                    <TableCell className="flex gap-2 justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setAddEventDialog({
                                                    isOpen: true,
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
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* ADD/EDIT DIALOG */}
            <AddEditEventsDialog
                isOpen={addEventDialog.isOpen}
                editData={addEventDialog.editData}
                onClose={() => setAddEventDialog({ isOpen: false, editData: null })}
            />

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                open={classicDialog.isOpen}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                onPositiveClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false
                    }));
                }}
                onNegativeClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false
                    }));
                }}
            />
        </div>
    );
}

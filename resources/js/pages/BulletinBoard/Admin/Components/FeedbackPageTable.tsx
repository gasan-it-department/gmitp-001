import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FeedbackPageTableHeader from "./FeedbackPageTableHeader";
import AdminEmptyListItem from "@/pages/Utility/AdminEmptyListItem";
import { Button } from "@/components/ui/button";
import { EyeIcon, Pencil, Trash2 } from "lucide-react";
import Utility from "@/pages/Utility/Utility";

export default function FeedbackPageTable() {
    const feedbacks = [
        {
            message: "Great service!",
            department_id: null,
            municipal_id: "A12345",
            sender_name: "John Doe",
            employee_name: "Jane Smith",
            feedback_target: "employee",
            rating: null,
            id: "fb1",
            created_at: "2025-11-18 14:00:34"
        },

        {
            message: "WORST EXPERIENCE EVER!",
            department_id: 1,
            municipal_id: "A12345",
            sender_name: null,
            employee_name: null,
            feedback_target: "department",
            rating: 1,
            id: "fb1",
            created_at: "2025-11-18 15:00:34"
        }
    ];

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Cute Netizen Feedback</h1>
                <FeedbackPageTableHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => { }}
                    onExportButtonClicked={() => { }}

                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">Reported Party</TableHead>
                            <TableHead className="text-[12px] font-bold">Reported By</TableHead>
                            <TableHead className="text-[12px] font-bold">Message</TableHead>
                            <TableHead className="text-[12px] font-bold">Date Reported</TableHead>

                            <TableHead className="text-[12px] font-bold text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {feedbacks.length === 0 ? (
                            <AdminEmptyListItem
                                title="No Events yet."
                                message="Events you created will appear here." />
                        ) : (
                            feedbacks.map((item) => {

                                return (
                                    <TableRow
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <TableCell className="text-[13px] font-medium text-red-500">
                                            {item.employee_name ?? item.department_id}
                                        </TableCell>

                                        <TableCell className="text-[13px] font-medium">
                                            {item.sender_name ?? "Anonymous"}
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
                                                {item.message}
                                            </span>
                                        </TableCell>
                                        <TableCell>{Utility().formatToReadableDate(item.created_at)}</TableCell>
                                        <TableCell className="flex gap-2 justify-center">
                                            
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => { }}
                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                            >
                                                <EyeIcon size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
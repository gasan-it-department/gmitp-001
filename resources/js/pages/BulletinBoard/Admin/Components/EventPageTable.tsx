import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BulletinHeader from "./BulletinHeader";
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function EventPageTable() {
   
    const dummyEvents = [
        {
            id: "E001",
            title: "Municipal Sports Festival 2025",
            description: "A week-long celebration featuring various sports competitions among local barangays.",
            start_date: "2025-11-15",
            end_date: "2025-11-21",
            status: "Upcoming"
        },
        {
            id: "E002",
            title: "Cultural Heritage Parade",
            description: "A colorful parade showcasing traditional costumes, music, and dances from our municipality.",
            start_date: "2025-10-25",
            end_date: "2025-10-25",
            status: "Completed"
        },
        {
            id: "E003",
            title: "Coastal Cleanup Drive",
            description: "Join the community effort to clean our beaches and promote environmental awareness.",
            start_date: "2025-11-05",
            end_date: "2025-11-05",
            status: "Ongoing"
        },
        {
            id: "E004",
            title: "Christmas Tree Lighting Ceremony",
            description: "Kick off the holiday season with music, lights, and community fun in front of the municipal hall.",
            start_date: "2025-12-01",
            end_date: "2025-12-01",
            status: "Upcoming"
        },
        {
            id: "E005",
            title: "Public Health Awareness Seminar",
            description: "A free educational seminar on preventive health care and nutrition led by local health experts.",
            start_date: "2025-10-30",
            end_date: "2025-10-30",
            status: "Completed"
        }
    ];

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

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Event List</h1>
                <BulletinHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => { }}
                    onExportButtonClicked={() => { }}
                    onAddNewButtonClicked={() => {
                        
                    }}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">Event Title</TableHead>
                            <TableHead className="text-[12px] font-bold">Description</TableHead>
                            <TableHead className="text-[12px] font-bold">Start Date</TableHead>
                            <TableHead className="text-[12px] font-bold">End Date</TableHead>
                            <TableHead className="text-[12px] font-bold">Status</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {dummyEvents.map((item, index) => (
                            <TableRow
                                key={index}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => {
                                    
                                }}
                            >
                                <TableCell className="text-[13px] font-medium">{item.title}</TableCell>
                                <TableCell className="text-[12px] max-w-[300px] line-clamp-2">{item.description}</TableCell>
                                <TableCell className="text-[12px]">{item.start_date}</TableCell>
                                <TableCell className="text-[12px]">{item.end_date}</TableCell>
                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            
        </div>
    );
}

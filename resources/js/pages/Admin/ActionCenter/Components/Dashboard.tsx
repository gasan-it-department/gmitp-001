import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import Utility from '@/pages/Utility/Utility';

interface RequestData {
    name: string,
    title: string;
    status: string;
    dateApproved: string;
    transactionNumber: string;
}

interface DashboardProps {
    data: RequestData[];
}

export default function Dashboard({ data }: DashboardProps) {
    const [dashboardList, setDashboardList] = useState<RequestData[]>([]);

    useEffect(() => {
        const sorted = [...data].sort((a, b) =>
            a.name.localeCompare(b.name)
        );
        setDashboardList(sorted);
    })

    return (
        <div className="max-h-[570px] overflow-y-auto ">
            <Table className="w-full relative">
                <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow>
                        <TableHead className="text-[12px] font-bold">Name</TableHead>
                        <TableHead className="text-[12px] font-bold">Request Date</TableHead>
                        <TableHead className="text-[12px] font-bold">Title</TableHead>
                        <TableHead className="text-[12px] font-bold">Transaction ID</TableHead>
                        <TableHead className="text-[12px] font-bold">Due Date</TableHead>
                        <TableHead className="text-[12px] font-bold">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="relative overflow-y-auto mt-10">
                    {dashboardList.length > 0 ? (
                        dashboardList.map((item) => (
                            <TableRow key={item.transactionNumber}>
                                <TableCell className="text-[12px]">{item.name}</TableCell>
                                <TableCell className="text-[12px]">
                                    {item.dateApproved === ""
                                        ? "Not yet approved"
                                        : Utility().formatToReadableDate(item.dateApproved)}
                                </TableCell>
                                <TableCell className="text-[12px]">{item.title}</TableCell>
                                <TableCell className="text-[12px]">{item.transactionNumber}</TableCell>
                                <TableCell className="text-[12px]">
                                    {item.dateApproved === ""
                                        ? "Not yet approved"
                                        : Utility().formatAndAddDays(item.dateApproved, 160)}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`p-1 rounded-full text-[11px] font-medium ${item.status === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : item.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-[12px] py-4">
                                No matches found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
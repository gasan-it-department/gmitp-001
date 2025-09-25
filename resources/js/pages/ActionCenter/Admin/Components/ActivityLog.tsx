import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Utility from "@/pages/Utility/Utility";
import { useEffect, useState } from "react";

interface LogsData{
    title: string;
    description: string;
    date: string;
}

interface Data{
    data: LogsData[];
}


export default function ActivityLog({data}: Data) {
    const [activityLogsList, setActivityLogsList] = useState<LogsData[]>([]);

    useEffect(() => {
        setActivityLogsList(data);
        console.log(data);
    }, [data])

    return(
        <div className="max-h-[570px] overflow-y-auto ">
            <Table className="w-full relative">
                <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow>
                        <TableHead className="text-[12px] font-bold">Title</TableHead>
                        <TableHead className="text-[12px] font-bold">Description</TableHead>
                        <TableHead className="text-[12px] font-bold">Date</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="relative overflow-y-auto mt-10">
                    {activityLogsList.length > 0 ? (
                        activityLogsList.map((item) => (
                            <TableRow key={item.title}>
                                <TableCell className="text-[12px]">{item.title}</TableCell>
                                <TableCell className="text-[12px]">{item.description}</TableCell>
                                <TableCell className="text-[12px]">{Utility().formatToReadableDate(item.date)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-[12px] py-4">
                                No match found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
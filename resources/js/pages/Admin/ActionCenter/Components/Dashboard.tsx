import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import Utility from '@/pages/Utility/Utility';
import ViewDetailsDialog from "./ViewDetailsDialog";

interface ClientData {
    firstName: string;
    lastName: string;
    middleName?: string;
    contactNumber: string;
    service: string;
    transactionNumber: string;
    dateApproved: string;
    description: string;
    province: string;
    municipality: string;
    barangay: string;
}
interface DashboardProps {
    data: ClientData[];
    onViewDetailsEditButtonClicked: (clientData?: ClientData | null) => void;
    onViewDetialsDeleteButtonClicked: () => void;
}

export default function Dashboard({ data, onViewDetailsEditButtonClicked, onViewDetialsDeleteButtonClicked }: DashboardProps) {
    const [dashboardList, setDashboardList] = useState<ClientData[]>([]);
    const [isViewDetailsDialogShowing, setIsViewDetailsDialogShowing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ClientData | null>();

    useEffect(() => {
        setDashboardList(data);
    }, [data])

    return (
        <div className="max-h-[630px] overflow-y-auto ">
            <Table className="w-full relative">
                <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow>
                        <TableHead className="text-[12px] font-bold">Name</TableHead>
                        <TableHead className="text-[12px] font-bold">Request Date</TableHead>
                        <TableHead className="text-[12px] font-bold">Service</TableHead>
                        <TableHead className="text-[12px] font-bold">Transaction ID</TableHead>
                        <TableHead className="text-[12px] font-bold">Due Date</TableHead>
                        <TableHead className="text-[12px] font-bold">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="relative overflow-y-auto mt-10">
                    {dashboardList.length > 0 ? (
                        dashboardList.map((item) => (
                            <TableRow
                                key={item.transactionNumber}
                                onClick={() => {
                                    console.log(`Transaction id: ${item.transactionNumber}`);
                                    setIsViewDetailsDialogShowing(true);
                                    setSelectedItem(item);
                                }}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <TableCell className="text-[12px]">{item.firstName}</TableCell>
                                <TableCell className="text-[12px]">
                                    {item.dateApproved === ""
                                        ? "Not yet approved"
                                        : Utility().formatToReadableDate(item.dateApproved)}
                                </TableCell>
                                <TableCell className="text-[12px]">{item.service}</TableCell>
                                <TableCell className="text-[12px]">{item.transactionNumber}</TableCell>
                                <TableCell className="text-[12px]">
                                    {item.dateApproved === ""
                                        ? "Not yet approved"
                                        : Utility().formatAndAddDays(item.dateApproved, 160)}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`p-1 rounded-full text-[11px] font-medium ${Utility().calculateTotalDays(item.dateApproved) >= 92
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {Utility().calculateTotalDays(item.dateApproved) >= 92
                                            ? "Eligible"
                                            : "Not Eligible"}
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

            <ViewDetailsDialog
                isOpen={isViewDetailsDialogShowing}
                onClose={() => setIsViewDetailsDialogShowing(false)}
                details={selectedItem!}
                onDeleteClicked={() => {
                    console.log("Delete clicked");
                    onViewDetialsDeleteButtonClicked();
                }}
                onEditClicked={() => {
                    console.log("Edit clicked");
                    onViewDetailsEditButtonClicked(selectedItem);
                }}
            />
        </div>
    );
}
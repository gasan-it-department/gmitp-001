
import { Card } from "@/components/ui/card";
import PublicLayout from "@/layouts/Public/wrapper/PublicLayoutTemplate";
import { useEffect, useState } from "react";
import RequestStatusDialog from "./RequestStatusDialog";
import Utility from "@/pages/Utility/Utility";

interface RequestData {
  id: number;
  title: string;
  status: string;
  requestedDate: string;
  transactionNumber: string;
  vehicleRequested: string | null;
  documentUploaded: boolean;
  reviewComment: string | null;
  data: {
    clientName: string;
    clientAge: string;
    clientContactNumber: string;
    clientAddress: string;
  }[];
}

export default function RequestList() {
    const [requestStatusDialogVisible, setRequestStatusDialogVisible] = useState(false);
    const [loadedUserRequest, setLoadedUserReques] = useState<RequestData[]>([]);
    const [selectedUserRequest, setSelectedUserRequest] = useState<RequestData>();

    async function LoadUserRequestListData() {
        const requestData = [
            {
                id: 1,
                title: "Financial",
                status: "In-review",
                requestedDate: "1754876477",
                transactionNumber: "B-1323AVC34",
                vehicleRequested: null,
                documentUploaded: false,
                reviewComment: null,
                data: [
                    { clientName: "A", clientAge: "24", clientContactNumber: "09123456789", clientAddress: "Bryg. Di maalaman"},
                ]
            },
            {
                id: 2,
                title: "Burial",
                status: "Rejected",
                requestedDate: "1754876477",
                transactionNumber: "B-1323AVC34",
                vehicleRequested: null,
                documentUploaded: false,
                reviewComment: "The documents are incomplete. Please re-upload documents. HAHAHAHAH",
                data: [
                    { clientName: "B", clientAge: "24", clientContactNumber: "09123456789", clientAddress: "Bryg. Di maalaman"},
                ]
            },
            {
                id: 3,
                title: "Food",
                status: "Approved",
                requestedDate: "1754876089",
                transactionNumber: "B-1323AVC34",
                vehicleRequested: null,
                documentUploaded: false,
                reviewComment: null,
                data: [
                    { clientName: "C", clientAge: "24", clientContactNumber: "09123456789", clientAddress: "Bryg. Di maalaman"},
                ]
            },
            {
                id: 4,
                title: "Transport",
                status: "Document",
                requestedDate: "1754876097",
                transactionNumber: "B-1323AVC34",
                vehicleRequested: null,
                documentUploaded: true,
                reviewComment: "Please submit the following documents.",
                data: [
                    { clientName: "D", clientAge: "24", clientContactNumber: "09123456789", clientAddress: "Bryg. Di maalaman"},
                ]
            },
        ];

        setLoadedUserReques(requestData);
    }

    useEffect(() => {
        LoadUserRequestListData();
    }, []);

    function handleRequestOnClick(requestData: RequestData) {
        setSelectedUserRequest(requestData);
        setRequestStatusDialogVisible(true);
    }

    return (
        <PublicLayout title="Request List" description="">
            <div className="p-5">
                <span className="p-5 mt-5 mb-5 font-bold text-[24px]">Action Center Request</span>

                <div className="mt-5 mb-5" />

                <div className="hidden md:block">
                    <table className="table-auto border-collapse border border-gray-300 w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">Request Date</th>
                                <th className="border border-gray-300 px-4 py-2">Request</th>
                                <th className="border border-gray-300 px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadedUserRequest.map((t, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{t.requestedDate}</td>
                                    <td className="border border-gray-300 px-4 py-2">{t.title}</td>
                                    <td className="border border-gray-300 px-4 py-2">{t.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="block md:hidden space-y-4">
                    {loadedUserRequest.map((requestData, index) => (
                        <Card
                            key={requestData.id}
                            onClick={() => handleRequestOnClick(requestData)}
                            className="p-4 hover:shadow-md transition cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-[18px]">{requestData.title}</span>
                                <span
                                    className={`text-[11px] px-2 py-1 rounded ${requestData.status === 'In-review'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : requestData.status === 'Approved'
                                            ? 'bg-green-100 text-green-800'
                                            : requestData.status === 'Documents'
                                                ? 'bg-gray-100 text-red-800'
                                                : requestData.status === 'Rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    {requestData.status}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[13px] pt-1 pb-1">
                                    Submitted on {Utility().formatToReadableDate(requestData.requestedDate)}
                                </span>
                                <span className="text-[13px] pt-1 pb-1">Transaction No.: {requestData.transactionNumber}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <RequestStatusDialog isOpen={requestStatusDialogVisible} onClose={() => setRequestStatusDialogVisible(false)} selectedRequest={selectedUserRequest}/>
        </PublicLayout>
    );
}
import { Card } from '@/components/ui/card';
import PublicLayout from '@/layouts/Public/PublicLayout';
import SearchBar from '@/pages/Utility/SearchBar';
import Utility from '@/pages/Utility/Utility';
import { useEffect, useState } from 'react';
import RequestStatusDialog from './RequestStatusDialog';

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
    const [filteringUserRequest, setFilteringUserRequest] = useState<RequestData[]>([]);
    const [selectedUserRequest, setSelectedUserRequest] = useState<RequestData>();

    async function LoadUserRequestListData() {
        const requestData = [
            {
                id: 1,
                title: 'Financial',
                status: 'In-review',
                requestedDate: '1754876477',
                transactionNumber: 'A-1323AVC30',
                vehicleRequested: null,
                documentUploaded: false,
                reviewComment: null,
                data: [{ clientName: 'A', clientAge: '24', clientContactNumber: '09123456789', clientAddress: 'Bryg. Di maalaman' }],
            },
            {
                id: 2,
                title: 'Burial',
                status: 'Rejected',
                requestedDate: '1754876477',
                transactionNumber: 'B-1323AVC31',
                vehicleRequested: null,
                documentUploaded: false,
                reviewComment: 'The documents are incomplete. Please re-upload documents. HAHAHAHAH',
                data: [{ clientName: 'B', clientAge: '24', clientContactNumber: '09123456789', clientAddress: 'Bryg. Di maalaman' }],
            },
            {
                id: 3,
                title: 'Food',
                status: 'Approved',
                requestedDate: '1754876089',
                transactionNumber: 'C-1323AVC32',
                vehicleRequested: null,
                documentUploaded: false,
                reviewComment: null,
                data: [{ clientName: 'C', clientAge: '24', clientContactNumber: '09123456789', clientAddress: 'Bryg. Di maalaman' }],
            },
            {
                id: 4,
                title: 'Transport',
                status: 'Document',
                requestedDate: '1754876097',
                transactionNumber: 'D-1323AVC33',
                vehicleRequested: null,
                documentUploaded: true,
                reviewComment: 'Please submit the following documents.',
                data: [{ clientName: 'D', clientAge: '24', clientContactNumber: '09123456789', clientAddress: 'Bryg. Di maalaman' }],
            },
        ];

        setLoadedUserReques(requestData);
    }

    useEffect(() => {
        LoadUserRequestListData();
    }, []);

    useEffect(() => {
        setFilteringUserRequest(loadedUserRequest);
    }, [loadedUserRequest]);

    function handleRequestOnClick(requestData: RequestData) {
        setSelectedUserRequest(requestData);
        setRequestStatusDialogVisible(true);
    }

    async function search(keyword: string) {
        if (keyword === null || keyword === '') {
            setFilteringUserRequest(loadedUserRequest);
            return;
        }
        const filtered = loadedUserRequest.filter((req) => req.transactionNumber.toLowerCase().includes(keyword.toLowerCase()));

        setFilteringUserRequest(filtered);
    }

    return (
        <PublicLayout title="Request List" description="">
            <div className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <span className="p-2 text-center text-[20px] font-bold sm:p-5 sm:text-left sm:text-[24px]">Action Center Request</span>
                    <div className="w-full px-2 sm:mr-5 sm:w-auto">
                        <SearchBar
                            searchBarHint={'Transaction No.'}
                            onSearch={(e) => {
                                console.log(`Searched: ${e}`);
                                search(e);
                            }}
                        />
                    </div>
                </div>

                <div className="mt-5 mb-5" />

                <div className="hidden md:block">
                    <table className="w-full table-auto border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">Transaction No.</th>
                                <th className="border border-gray-300 px-4 py-2">Request Date</th>
                                <th className="border border-gray-300 px-4 py-2">Request</th>
                                <th className="border border-gray-300 px-4 py-2">Status</th>
                                <th className="border border-gray-300 px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteringUserRequest.length > 0 ? (
                                filteringUserRequest.map((t, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2 text-[12px]">{t.transactionNumber}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-[12px]">
                                            {Utility().formatToReadableDate(t.requestedDate)}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-[12px]">{t.title}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center align-middle font-medium">
                                            <span
                                                className={`rounded px-2 py-1 text-[12px] ${t.status === 'Approved' ? 'bg-green-100 text-green-800' : ''} ${t.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''} ${t.status === 'In-review' ? 'bg-yellow-100 text-yellow-800' : ''} ${t.status === 'Document' ? 'bg-gray-100 text-gray-800' : ''} `}
                                            >
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleRequestOnClick(t)}
                                                className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="border border-gray-300 px-4 py-2 text-center text-gray-500">
                                        No match found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="block space-y-4 md:hidden">
                    {filteringUserRequest.length > 0 ? (
                        filteringUserRequest.map((requestData, index) => (
                            <Card
                                key={requestData.id}
                                onClick={() => handleRequestOnClick(requestData)}
                                className="cursor-pointer p-4 transition hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[18px] font-bold">{requestData.title}</span>
                                    <span
                                        className={`rounded px-2 py-1 text-[11px] ${
                                            requestData.status === 'In-review'
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
                                    <span className="pt-1 pb-1 text-[13px]">
                                        Submitted on {Utility().formatToReadableDate(requestData.requestedDate)}
                                    </span>
                                    <span className="pt-1 pb-1 text-[13px]">Transaction No.: {requestData.transactionNumber}</span>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="flex items-center justify-center py-10">
                            <span className="text-[16px] font-medium text-gray-500">No match found</span>
                        </div>
                    )}
                </div>
            </div>

            <RequestStatusDialog
                isOpen={requestStatusDialogVisible}
                onClose={() => setRequestStatusDialogVisible(false)}
                selectedRequest={selectedUserRequest}
            />
        </PublicLayout>
    );
}

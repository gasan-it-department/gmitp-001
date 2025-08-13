import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Utility from "@/pages/Utility/Utility";
import { useEffect, useState } from "react";
import { InfoIcon, Clock, XCircle, CheckCircle, FileText } from "lucide-react";

interface Props {
    isOpen: boolean;
    selectedRequest: RequestData | null | undefined;
    onClose: () => void;
}

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

export default function RequestStatusDialog({ isOpen, selectedRequest, onClose }: Props) {
    const [clientName, setClientName] = useState("");
    const [clientAge, setClientAge] = useState("");
    const [clientContactMumber, setClientContactNumber] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [clientRequestedService, setClientRequestedService] = useState("");
    const [files, setFiles] = useState<{ files: File[] }>({ files: [] });
    const [totalFileSize, setTotalFileSize] = useState(0);

    useEffect(() => {
        initLogic();
    });

    async function initLogic() {
        setClientName(selectedRequest?.data[0]?.clientName ?? "");
        setClientAge(selectedRequest?.data[0]?.clientAge ?? "");
        setClientContactNumber(selectedRequest?.data[0]?.clientContactNumber ?? "");
        setClientAddress(selectedRequest?.data[0]?.clientAddress ?? "");
        setClientRequestedService(selectedRequest!.title);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length > 10) {
            alert("You can only select up to 10 files.");
            e.target.value = "";
            return;
        }

        const updatedFiles = [...files.files];

        let newTotalSize = totalFileSize;

        selectedFiles.forEach((file) => {
            if (!updatedFiles.some((f) => f.name === file.name && f.size === file.size)) {
                updatedFiles.push(file);
                newTotalSize += file.size;
            }
        });

        setFiles({ files: updatedFiles });
        setTotalFileSize(newTotalSize);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="
      w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
                sm:max-w-[700px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6">
                <DialogHeader>
                    <DialogTitle className="p-3 text-[21px] text-center">Request Status</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-6" onSubmit={(e) => {
                    e.preventDefault();
                }}>

                    <div
                        className={`text-[20px] px-2 py-1 rounded text-center flex flex-col items-center ${selectedRequest?.status === "In-review"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedRequest?.status === "Approved"
                                    ? "bg-green-100 text-green-800"
                                    : selectedRequest?.status === "Document"
                                        ? "bg-gray-100 text-gray-800"
                                        : selectedRequest?.status === "Rejected"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-200 text-gray-800"
                            }`}
                    >
                        {
                            selectedRequest?.status === "In-review" ? <Clock size={35} /> :
                                selectedRequest?.status === "Approved" ? <CheckCircle size={35} /> :
                                    selectedRequest?.status === "Document" ? <FileText size={35} /> :
                                        selectedRequest?.status === "Rejected" ? <XCircle size={35} /> :
                                            <Clock size={35} />
                        }

                        <span className="font-bold">
                            {selectedRequest?.status}
                        </span>

                        <span className="text-[14px] p-1">
                            {
                                selectedRequest?.status === "In-review"
                                    ? "Your application is being reviewed by Action Center."
                                    : selectedRequest?.status === "Approved"
                                        ? "Your application has been approved. Please check details below."
                                        : selectedRequest?.status === "Rejected"
                                            ? "Your application has been rejected. More details below."
                                            : selectedRequest?.status === "Document"
                                                ? "Your application is pending. Please submit the necessary documents. See more details below."
                                                : "Unknown status. Please report this to developers."
                            }
                        </span>
                    </div>


                    {(selectedRequest?.status === "Rejected" || selectedRequest?.status === "Document") && (
                        <div
                            className={`text-[20px] px-2 py-1 rounded text-center flex flex-row gap-1 ${selectedRequest?.status === 'Document'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                                }`}
                        >
                            <InfoIcon size={20} />
                            <span className="text-[12px] text-start self-start">{selectedRequest.reviewComment}</span>
                        </div>
                    )}



                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name/Pangalan:
                            </label>
                            <Input
                                id="clientName"
                                disabled={true}
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Age/Edad:
                            </label>
                            <Input
                                id="clientAge"
                                disabled={true}
                                value={clientAge}
                                onChange={(e) => setClientAge(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact number:
                            </label>
                            <Input
                                id="clientContactNumber"
                                disabled={true}
                                value={clientContactMumber}
                                onChange={(e) => setClientContactNumber(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address:
                            </label>
                            <Input
                                id="clientAddress"
                                disabled={true}
                                value={clientAddress}
                                onChange={(e) => setClientAddress(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assistance needed:
                            </label>
                            <Input
                                id="clientSelectedService"
                                value={clientRequestedService}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                                disabled={true}
                            />
                        </div>
                    </div>

                    {(selectedRequest?.status === 'Document') &&
                        <div className="flex flex-col">
                            <div
                                onClick={() => document.getElementById("file-upload")?.click()}
                                className="border border-gray-300 p-2 rounded cursor-pointer hover:bg-gray-100 w-auto"
                            >
                                <p className="text-gray-600">Select files</p>
                                <input
                                    type="file"
                                    multiple
                                    id="file-upload"
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                        handleFileChange(e);
                                    }}
                                />
                            </div>

                            <ul className="list-disc list-inside text-sm text-gray-700 max-h-32 overflow-y-auto mt-2">
                                {files.files.filter(file =>
                                    file.type.startsWith("image/") || file.type === "application/pdf"
                                ).length === 0 ? (
                                    <li>No files selected</li>
                                ) : (
                                    files.files
                                        .filter(file =>
                                            file.type.startsWith("image/") || file.type === "application/pdf"
                                        )
                                        .map((file, index) => (
                                            <li key={index} className="flex justify-between items-center">
                                                <span className="truncate">
                                                    {file.name.length > 25 ? file.name.slice(0, 25) + "..." : file.name}
                                                    {" "}
                                                    <span className="text-gray-500 text-xs">
                                                        (
                                                        {file.size >= 1048576
                                                            ? `${(file.size / 1048576).toFixed(2)} MB`
                                                            : `${(file.size / 1024).toFixed(2)} KB`}
                                                        )
                                                    </span>
                                                </span>

                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        const newFiles = [...files.files];
                                                        newFiles.splice(index, 1);
                                                        setFiles({ ...files, files: newFiles });
                                                        setTotalFileSize(totalFileSize - file.size);
                                                    }}
                                                    className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1"
                                                    aria-label="Remove file"
                                                >
                                                    Remove
                                                </Button>
                                            </li>
                                        ))
                                )}
                            </ul>
                        </div>}

                    <div className="bg-gray-100 rounded-md p-2 flex flex-col">
                        <span className="text-[13px] p-1">Submitted on {Utility().formatToReadableDate(selectedRequest?.requestedDate)}</span>
                        <span className="text-[13px] p-1">Transaction No. B-123456</span>
                    </div>

                    <div className="mt-5 mb-5 flex gap-2 flex-row sm:justify-end">
                        <Button
                            variant="outline"
                            className="basis-1/2 sm:basis-auto sm:w-auto"
                            onClick={onClose}
                        >
                            Close
                        </Button>

                        <Button
                            disabled={selectedRequest?.status !== "Document" && selectedRequest?.status !== "Rejected"}
                            className="basis-1/2 sm:basis-auto sm:w-auto"
                            onClick={() => {
                                console.log(`Client name: ${clientName}`);
                                console.log(`Client age: ${clientAge}`);
                                console.log(`Client contact number: ${clientContactMumber}`);
                                console.log(`Client address: ${clientAddress}`);
                            }}
                        >
                            {selectedRequest?.status === "Document" || selectedRequest?.status === "Rejected" ? "Submit" : 
                            selectedRequest?.status === "Approved" ? "Approved" : "Pending..."}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
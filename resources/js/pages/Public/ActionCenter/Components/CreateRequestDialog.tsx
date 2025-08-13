import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface FormState {
    message: string;
    files: File[];
}

interface Props {
    isOpen: boolean;
    selectedService: ActionCenterService | null;
    vehicleList: VehicleList[]
    onClose: () => void;
}

export interface ActionCenterService {
    id: number;
    serviceName: string;
    icon: any;
    requirements: string[];
}

export interface VehicleList {
    id: number;
    vehicleName: string;
    status: string;
}

export default function CreateRequestDialog({ isOpen, selectedService, vehicleList, onClose }: Props) {
    const [clientName, setClientName] = useState("");
    const [clientAge, setClientAge] = useState("");
    const [clientContactMumber, setClientContactNumber] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    
    // const [patientName, setPatientName] = useState("");
    // const [patientAge, setPatientAge] = useState("");
    // const [patientAddress, setPatientAddress] = useState("");
    // const [isSameAsClient, setSameAsClient] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState("");

    let totalFileSize = 0;

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const selectedFiles = Array.from(e.target.files || []);
    //     const updatedFiles = [...files.files];

    //     selectedFiles.forEach((file) => {
    //         let fileSize = 0;
    //         fileSize += file.size;
    //         totalFileSize = (fileSize / (1024 * 1024));
    //         console.log(`New file size: ${totalFileSize}`);

    //         if (!updatedFiles.some((f) => f.name === file.name && f.size === file.size)) {
    //             updatedFiles.push(file);
    //         }
    //     });

    //     setFiles({ ...files, files: updatedFiles });
    // };

    console.log(`Requirements: ${selectedService?.serviceName}`);
    console.log(`Vehicles: ${vehicleList}`);
    // const requirements = selectedService?.requirements;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="
      w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
                sm:max-w-[700px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6">
                <DialogHeader>
                    <DialogTitle className="p-3 text-[21px] text-center">Action Center Request Form</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-6" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <span className="text-[12px] text-gray-700">Submit requests for assistance related to Financial, Food, Medical, Burial, or Transport support to the local government for proper evaluation and immediate action.</span>

                    <span className="text-[18px] font-bold">CLIENT'S INFORMATION</span>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name/Pangalan:
                            </label>
                            <Input
                                id="clientName"
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
                                value={selectedService?.serviceName}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                                disabled
                            />
                        </div>

                        {selectedService?.serviceName.includes("Transport") && (
                            <div className="flex-1">
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select vehicle type:
                                </label>
                                <select
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => {
                                        console.log(`Selected vehicle: ${e.target.value}`);
                                        setSelectedVehicle(e.target.value);
                                    }}>
                                    {vehicleList.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.vehicleName}>
                                            {vehicle.vehicleName}
                                        </option>
                                    ))}

                                </select>
                            </div>
                        )}
                    </div>

                    {/* </div><div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={isSameAsClient}
                            id="agreeToTerms"
                            onChange={(e) => {
                                if (!e.target.checked) {
                                    setPatientName("");
                                    setPatientAge("");
                                    setPatientAddress("");
                                } else {
                                    setPatientName(clientName);
                                    setPatientAge(clientAge);
                                    setPatientAddress(clientAddress);
                                }
                                setSameAsClient(e.target.checked);
                            }}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-700 cursor-pointer">
                            I am also the patient
                        </label>
                    </div> */}

                    {/* <span className="text-[18px] font-bold">PATIENT'S INFORMATION</span> */}

                    {/* <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name/Pangalan:
                            </label>
                            <Input
                                id="patientName"
                                disabled={isSameAsClient}
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Age/Edad:
                            </label>
                            <Input
                                id="patientAge"
                                disabled={isSameAsClient}
                                value={patientAge}
                                onChange={(e) => setPatientAge(e.target.value)}
                                placeholder=" "
                                className="placeholder-transparent w-full"
                            />
                        </div>
                    </div> */}

                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address:
                        </label>
                        <Input
                            id="patientAddress"
                            disabled={isSameAsClient}
                            value={patientAddress}
                            onChange={(e) => setPatientAddress(e.target.value)}
                            placeholder=" "
                            className="placeholder-transparent w-full"
                        />
                    </div> */}

                    {/* <div>
                        <h2 className="font-bold">Requirements for {selectedService?.serviceName}</h2>
                        <ul>
                            {requirements?.map((item, index) => (
                                <li key={index}>{(index + 1)}. {item}</li>
                            ))}
                        </ul>
                    </div> */}

                    {/* <div>
                        <label className="block font-bold">Upload Requirements</label>
                        <span className="block text-xs mt-1 mb-2">
                            Upload all required documents. Max 5MB
                        </span>

                        <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />

                        <label
                            htmlFor="file-upload"
                            className="inline-block cursor-pointer px-4 py-2 text-sm text-black rounded border border-gray-300 hover:bg-gray-100 transition w-fit"
                        >
                            Choose Files
                        </label>

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
                                                    totalFileSize -= file.size;
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

                    </div> */}

                    <div className="mt-5 mb-5 flex gap-2 flex-row sm:justify-end">
                        <Button
                            variant="outline"
                            className="basis-1/2 sm:basis-auto sm:w-auto"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="basis-1/2 sm:basis-auto sm:w-auto"
                            onClick={() => {
                                console.log(`Client name: ${clientName}`);
                                console.log(`Client age: ${clientAge}`);
                                console.log(`Client contact number: ${clientContactMumber}`);
                                console.log(`Client address: ${clientAddress}`);
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
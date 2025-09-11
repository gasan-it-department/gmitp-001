import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Utility from "@/pages/Utility/Utility";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

interface ClientData {
    firstName: string;
    lastName: string;
    middleName?: string;
    contactNumber: string;
    service: string;
    transactionNumber: string;
    dateApproved?: string;
    description: string;
    province: string;
    municipality: string;
    barangay: string;
}

interface Props {
    details: ClientData;
    isOpen: boolean;
    onClose: () => void;
    onEditClicked: (clientData: ClientData | null) => void;
    onDeleteClicked: () => void;
}

export default function ViewDetailsDialog({ isOpen, onClose, details, onEditClicked, onDeleteClicked }: Props) {
    const [selectedClientData, setSelectedClientData] = useState<ClientData | null>(null);
    const { register, reset } = useForm<ClientData>();

    useEffect(() => {
        if (details) {
            reset(details);
        }
    }, [details, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={true}
                className="w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
             sm:max-w-[700px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6 flex flex-col"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-[21px] text-center">Client Information</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <form className="flex flex-col gap-6">
                        <div className="flex justify-center">
                            {details?.dateApproved ? (
                                <div
                                    className={`flex flex-col items-center justify-center w-[300px] rounded-md px-3 py-2 gap-1 ${Utility().calculateTotalDays(details.dateApproved) >= 92
                                        ? "bg-green-50"
                                        : "bg-red-50"
                                        }`}
                                >
                                    <span
                                        className={`text-[25px] font-semibold ${Utility().calculateTotalDays(details?.dateApproved) >= 92
                                            ? "text-green-700"
                                            : "text-red-700"
                                            }`}
                                    >
                                        {Utility().calculateTotalDays(details?.dateApproved) >= 92
                                            ? "Eligible"
                                            : "Not Eligible"}
                                    </span>

                                    <span
                                        className={`text-[13px] font-medium text-center ${Utility().calculateTotalDays(details?.dateApproved) >= 92
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {Utility().calculateTotalDays(details.dateApproved) >= 92
                                            ? "Client is eligible for assistance."
                                            : "Client is not yet eligible for assistance."}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm">No data available</div>
                            )}
                        </div>

                        <span className="text-[15px] font-bold">CLIENT'S INFORMATION</span>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name:
                                </label>
                                <Input
                                    {...register("lastName")}
                                    disabled
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name:
                                </label>
                                <Input
                                    {...register("firstName")}
                                    disabled
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Middle Name (optional):
                                </label>
                                <Input
                                    {...register("middleName")}
                                    disabled
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
                                    disabled={true}
                                    type="text"
                                    inputMode="numeric"
                                    {...register("contactNumber", {
                                        required: true,
                                        pattern: {
                                            value: /^[0-9]+$/,
                                            message: "Numbers only, no decimals."
                                        }
                                    })}
                                    placeholder=" "
                                    className="placeholder-transparent w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Province:
                                </label>
                                <Input
                                    {...register("province")}
                                    disabled
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Municipality:
                                </label>
                                <Input
                                    {...register("municipality")}
                                    disabled
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Barangay:
                                </label>
                                <Input
                                    {...register("barangay")}
                                    disabled
                                    className="placeholder-transparent w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service:
                                </label>
                                <Input
                                    {...register("service")}
                                    disabled
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Approved:
                                </label>
                                <Input
                                    value={Utility().formatToReadableDate(details?.dateApproved ?? "")}
                                    disabled
                                    className="placeholder-transparent w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date:
                                </label>
                                <Input
                                    value={Utility().formatAndAddDays(details?.dateApproved, 160)}
                                    disabled
                                    className="placeholder-transparent w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description:
                                </label>
                                <Textarea
                                    disabled={true}
                                    {...register("description")}
                                    placeholder="Description"
                                    className="placeholder-transparent w-full resize-y min-h-[80px] max-h-[300px]"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="sticky bottom-0 bg-white border-t pt-3 mt-4 flex gap-2 flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        className="basis-1/2 sm:basis-auto sm:w-auto"
                        onClick={() => {
                            onClose();
                            onEditClicked(selectedClientData);
                        }}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="outline"
                        className="basis-1/2 sm:basis-auto sm:w-auto"
                        onClick={() => {
                            onClose();
                            onDeleteClicked();
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

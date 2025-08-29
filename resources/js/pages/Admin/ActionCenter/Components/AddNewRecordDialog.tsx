import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const services = [
    { serviceName: "Medical Assistance" },
    { serviceName: "Food Assistance" },
    { serviceName: "Transportation Assistance" },
    { serviceName: "Financial Assistance" },
];

export default function AddNewRecordDialog({ isOpen, onClose }: Props) {
    const [selectedService, setSelectedService] = useState(services[0]);
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
             sm:max-w-[700px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6 flex flex-col"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-[21px] text-center">Add New Record</DialogTitle>
                </DialogHeader>

                {/* Scrollable form area */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <form
                        className="flex flex-col gap-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <span className="text-[15px] font-bold">CLIENT'S INFORMATION</span>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name/Pangalan:
                                </label>
                                <Input id="clientName" placeholder=" " className="placeholder-transparent w-full" />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Age/Edad:
                                </label>
                                <Input id="clientAge" placeholder=" " className="placeholder-transparent w-full" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact number:
                                </label>
                                <Input id="clientContactNumber" placeholder=" " className="placeholder-transparent w-full" />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address:
                                </label>
                                <Input id="clientAddress" placeholder=" " className="placeholder-transparent w-full" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-50">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Assistance needed:
                                </label>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between text-gray-700 border-gray-300 shadow-sm rounded-lg"
                                        >
                                            {selectedService.serviceName}
                                            <span className="ml-2 text-gray-500">▼</span>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    {/* Portal ensures dropdown is rendered outside the dialog */}
                                    <DropdownMenuPortal>
                                        <DropdownMenuContent
                                            className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                                            align="start"
                                            sideOffset={4}
                                        >
                                            {services.map((service, index) => (
                                                <DropdownMenuItem
                                                    key={index}
                                                    onClick={() => setSelectedService(service)}
                                                    className="cursor-pointer hover:bg-gray-100 p-2"
                                                >
                                                    {service.serviceName}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenuPortal>
                                </DropdownMenu>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 bg-white border-t pt-3 mt-4 flex gap-2 flex-row sm:justify-end">
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
                            // handle submit
                        }}
                    >
                        Submit
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Utility from "@/pages/Utility/Utility";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
    isOpen: boolean;
    editData?: ClientData | null;
    onClose: () => void;
}

interface ClientData {
    lastName: string;
    firstName: string;
    middleName?: string;
    contactNumber: string;
    province: string;
    municipality: string;
    barangay: string;
    service: string;
    description: string;
}

const services = [
    { serviceName: "Medical Assistance" },
    { serviceName: "Food Assistance" },
    { serviceName: "Transportation Assistance" },
    { serviceName: "Financial Assistance" },
];

export default function AddEditRecordDialog({ isOpen, onClose, editData }: Props) {
    const { getProvinces, getMunicipalities, getBarangays } = Utility();

    const [selectedService, setSelectedService] = useState(services[0]);
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
    const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClientData>();

    const onSubmit = async (data: ClientData) => {
        const payload = {
            ...data,
            province: selectedProvince,
            municipality: selectedMunicipality,
            barangay: selectedBarangay,
            service: selectedService.serviceName,
        };

        console.log("Submitting form:", payload);

        // POST TO SQL HERE //
        clearField();
    };

    function clearField() {
        reset();
        setSelectedProvince(null);
        setSelectedMunicipality(null);
        setSelectedBarangay(null);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="w-full h-screen max-w-none rounded-none m-0 p-4 overflow-y-auto scrollbar-hide
             sm:max-w-[700px] sm:h-auto sm:rounded-lg sm:m-auto lg:h-5/6 flex flex-col"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-[21px] text-center">{editData ? "Edit Record" : "Add New Record"}</DialogTitle>
                </DialogHeader>

                {/* Scrollable form area */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                        <span className="text-[15px] font-bold">CLIENT'S INFORMATION</span>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name:</label>
                                <Input {...register("lastName")} placeholder=" " className="placeholder-transparent w-full" />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name:</label>
                                <Input {...register("firstName")} placeholder=" " className="placeholder-transparent w-full" />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name (optional):</label>
                                <Input {...register("middleName")} placeholder=" " className="placeholder-transparent w-full" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact number:
                                </label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    {...register("contactNumber", {
                                        required: true,
                                        pattern: {
                                            value: /^[0-9]+$/,   // ✅ only digits allowed
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address:</label>
                                <div className="flex flex-col md:flex-row flex-wrap gap-4">
                                    {/* Province Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="justify-between w-64 text-gray-700 border-gray-300 shadow-sm rounded-lg"
                                            >
                                                {selectedProvince || "Select Province"}
                                                <span className="ml-2 text-gray-500">▼</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuContent
                                                className="max-h-[300px] w-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                                                align="start"
                                                side="bottom"
                                                sideOffset={4}
                                                avoidCollisions={true}
                                            >
                                                {getProvinces().map((province, index) => (
                                                    <DropdownMenuItem
                                                        key={index}
                                                        onClick={() => {
                                                            setSelectedProvince(province);
                                                            setSelectedMunicipality(null);
                                                            setSelectedBarangay(null);
                                                        }}
                                                        className="cursor-pointer hover:bg-gray-100 p-2"
                                                    >
                                                        {province}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenu>

                                    {/* Municipality Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild disabled={!selectedProvince}>
                                            <Button
                                                variant="outline"
                                                className="justify-between w-64 text-gray-700 border-gray-300 shadow-sm rounded-lg disabled:opacity-50"
                                            >
                                                {selectedMunicipality || "Select Municipality"}
                                                <span className="ml-2 text-gray-500">▼</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuContent
                                                className="max-h-[300px] w-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                                                align="start"
                                                side="bottom"
                                                sideOffset={4}
                                                avoidCollisions={true}
                                            >
                                                {selectedProvince &&
                                                    getMunicipalities().map((municipality, index) => (
                                                        <DropdownMenuItem
                                                            key={index}
                                                            onClick={() => {
                                                                setSelectedMunicipality(municipality);
                                                                setSelectedBarangay(null);
                                                            }}
                                                            className="cursor-pointer hover:bg-gray-100 p-2"
                                                        >
                                                            {municipality}
                                                        </DropdownMenuItem>
                                                    ))}
                                            </DropdownMenuContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenu>

                                    {/* Barangay Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild disabled={!selectedMunicipality}>
                                            <Button
                                                variant="outline"
                                                className="justify-between w-64 text-gray-700 border-gray-300 shadow-sm rounded-lg disabled:opacity-50"
                                            >
                                                {selectedBarangay || "Select Barangay"}
                                                <span className="ml-2 text-gray-500">▼</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuContent
                                                className="max-h-[300px] w-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                                                align="start"
                                                side="bottom"
                                                sideOffset={4}
                                                avoidCollisions={true}
                                            >
                                                {selectedMunicipality &&
                                                    getBarangays()[selectedMunicipality as keyof ReturnType<typeof getBarangays>]?.map(
                                                        (barangay, index) => (
                                                            <DropdownMenuItem
                                                                key={index}
                                                                onClick={() => setSelectedBarangay(barangay)}
                                                                className="cursor-pointer hover:bg-gray-100 p-2"
                                                            >
                                                                {barangay}
                                                            </DropdownMenuItem>
                                                        )
                                                    )}
                                            </DropdownMenuContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-50">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assistance needed:</label>

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

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description:
                                </label>
                                <Textarea
                                    {...register("description")}
                                    placeholder="Enter Description"
                                    className="placeholder-transparent w-full resize-y min-h-[80px] max-h-[300px]"
                                />
                            </div>
                        </div>

                        {/* Sticky footer inside form to allow submit */}
                        <div className="sticky bottom-0 bg-white border-t pt-3 mt-4 flex gap-2 flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="basis-1/2 sm:basis-auto sm:w-auto"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" className="basis-1/2 sm:basis-auto sm:w-auto">
                                {editData != null ? "Save" : "Add New"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

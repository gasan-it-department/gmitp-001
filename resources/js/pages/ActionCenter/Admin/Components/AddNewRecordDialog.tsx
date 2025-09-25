import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface FormValues {
    clientName: string;
    clientAge: string;
    clientContactNumber: string;
    clientAddress: string;
    assistanceNeeded: string;
}

const services = [
    { serviceName: 'Medical Assistance' },
    { serviceName: 'Food Assistance' },
    { serviceName: 'Transportation Assistance' },
    { serviceName: 'Financial Assistance' },
];

export default function AddNewRecordDialog({ isOpen, onClose }: Props) {
    const [selectedService, setSelectedService] = useState(services[0]);
    const { register, handleSubmit } = useForm<FormValues>();

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log({ ...data, assistanceNeeded: selectedService.serviceName });

        // const response = await axios.post('/admin/requests', )
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="scrollbar-hide m-0 flex h-screen w-full max-w-none flex-col rounded-none p-4 sm:m-auto sm:h-auto sm:max-w-[700px] sm:rounded-lg lg:h-5/6"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-center text-[21px]">Add New Record</DialogTitle>
                </DialogHeader>

                {/* Scrollable form area */}
                <div className="scrollbar-hide flex-1 overflow-y-auto">
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                        <span className="text-[15px] font-bold">CLIENT'S INFORMATION</span>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Name/Pangalan:</label>
                                <Input {...register('clientName')} placeholder=" " className="w-full placeholder-transparent" />
                            </div>

                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Age/Edad:</label>
                                <Input {...register('clientAge')} placeholder=" " className="w-full placeholder-transparent" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Contact number:</label>
                                <Input {...register('clientContactNumber')} placeholder=" " className="w-full placeholder-transparent" />
                            </div>

                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Address:</label>
                                <Input {...register('clientAddress')} placeholder=" " className="w-full placeholder-transparent" />
                            </div>
                        </div>

                        <div className="flex w-50 flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Assistance needed:</label>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between rounded-lg border-gray-300 text-gray-700 shadow-sm"
                                        >
                                            {selectedService.serviceName}
                                            <span className="ml-2 text-gray-500">▼</span>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuPortal>
                                        <DropdownMenuContent
                                            className="z-[9999] w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg border border-gray-200 bg-white shadow-lg"
                                            align="start"
                                            sideOffset={4}
                                        >
                                            {services.map((service, index) => (
                                                <DropdownMenuItem
                                                    key={index}
                                                    onClick={() => setSelectedService(service)}
                                                    className="cursor-pointer p-2 hover:bg-gray-100"
                                                >
                                                    {service.serviceName}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenuPortal>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Sticky footer */}
                        <div className="sticky bottom-0 mt-4 flex flex-row gap-2 border-t bg-white pt-3 sm:justify-end">
                            <Button variant="outline" className="basis-1/2 sm:w-auto sm:basis-auto" onClick={onClose}>
                                Cancel
                            </Button>

                            <Button type="submit" className="basis-1/2 sm:w-auto sm:basis-auto">
                                Submit
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

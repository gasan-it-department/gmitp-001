import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Beneficiary } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
    details: Beneficiary;
    isOpen: boolean;
    onClose: () => void;
    onEditClicked: (clientData: Beneficiary | null) => void;
    onDeleteClicked: () => void;
}

export default function ViewDetailsDialog({ isOpen, onClose, details, onEditClicked, onDeleteClicked }: Props) {
    const [selectedClientData, setSelectedClientData] = useState<Beneficiary | null>(null);
    const { register, reset } = useForm<Beneficiary>();

    useEffect(() => {
        if (details) {
            reset(details);
        }
    }, [details, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={true}
                className="scrollbar-hide m-0 flex h-screen w-full max-w-none flex-col overflow-y-auto rounded-none p-4 sm:m-auto sm:h-auto sm:max-w-[700px] sm:rounded-lg lg:h-5/6"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-center text-[21px]">Client Information</DialogTitle>
                </DialogHeader>

                <div className="scrollbar-hide flex-1 overflow-y-auto">
                    <form className="flex flex-col gap-6">
                        <div className="flex justify-center">
                            {/* {details?.dateApproved ? (
                                <div
                                    className={`flex w-[300px] flex-col items-center justify-center gap-1 rounded-md px-3 py-2 ${
                                        Utility().calculateTotalDays(details.dateApproved) >= 92 ? 'bg-green-50' : 'bg-red-50'
                                    }`}
                                ></div>
                            ) : (
                                <div className="text-sm text-gray-500">No data available</div>
                            )} */}
                        </div>

                        <span className="text-[15px] font-bold">CLIENT'S INFORMATION</span>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Last Name:</label>
                                <Input {...register('last_name')} disabled className="w-full placeholder-transparent" />
                            </div>

                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">First Name:</label>
                                <Input {...register('first_name')} disabled className="w-full placeholder-transparent" />
                            </div>

                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Middle Name (optional):</label>
                                <Input {...register('middle_name')} disabled className="w-full placeholder-transparent" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Contact number:</label>
                                <Input
                                    disabled={true}
                                    type="text"
                                    inputMode="numeric"
                                    {...register('contact_number', {
                                        required: true,
                                        pattern: {
                                            value: /^[0-9]+$/,
                                            message: 'Numbers only, no decimals.',
                                        },
                                    })}
                                    placeholder=" "
                                    className="w-full placeholder-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Province:</label>
                                <Input {...register('province')} disabled className="w-full placeholder-transparent" />
                            </div>

                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Municipality:</label>
                                <Input {...register('municipality')} disabled className="w-full placeholder-transparent" />
                            </div>

                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Barangay:</label>
                                <Input {...register('barangay')} disabled className="w-full placeholder-transparent" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Service:</label>
                                {/* <Input {...register('service')} disabled className="w-full placeholder-transparent" /> */}
                            </div>

                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Date Approved:</label>
                                {/* <Input
                                    value={Utility().formatToReadableDate(details?.dateApproved ?? '')}
                                    disabled
                                    className="w-full placeholder-transparent"
                                /> */}
                            </div>

                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Due Date:</label>
                                {/* <Input
                                    value={Utility().formatAndAddDays(details?.dateApproved, 160)}
                                    disabled
                                    className="w-full placeholder-transparent"
                                /> */}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description:</label>
                                <Textarea
                                    disabled={true}
                                    // {...register('description')}
                                    placeholder="Description"
                                    className="max-h-[300px] min-h-[80px] w-full resize-y placeholder-transparent"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="sticky bottom-0 mt-4 flex flex-row gap-2 border-t bg-white pt-3 sm:justify-end">
                    <Button
                        variant="outline"
                        className="basis-1/2 sm:w-auto sm:basis-auto"
                        onClick={() => {
                            onClose();
                            onEditClicked(selectedClientData);
                        }}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="outline"
                        className="basis-1/2 sm:w-auto sm:basis-auto"
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

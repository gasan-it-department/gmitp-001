import { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { geoGetter } from '@/pages/Utility/GeoGetter';

interface Props {
    details: AssistanceRequest;
    isOpen: boolean;
    onClose: () => void;
    onEditClicked: (clientData: AssistanceRequest | null) => void;
    onDeleteClicked: (requestId: string) => void;
}

export default function ViewDetailsDialog({
    isOpen,
    onClose,
    details,
    onEditClicked,
    onDeleteClicked,
}: Props) {
    const [requestId, setRequestId] = useState('');
    const { register, reset } = useForm<AssistanceRequest>();
    const [provinceName, setProvinceName] = useState('');
    const [municipalityName, setMunicipalityName] = useState('');
    const [barangayName, setBarangayName] = useState('');

    // 🔹 Load PSGC names
    useEffect(() => {
        if (details) {
            reset(details);

            const { province, municipality, barangay } = details.beneficiary;

            if (province) geoGetter(province, 'province').then(setProvinceName);
            if (municipality) geoGetter(municipality, 'municipality').then(setMunicipalityName);
            if (barangay) geoGetter(barangay, 'barangay').then(setBarangayName);
        }
    }, [details, reset]);

    useEffect(() => {
        setRequestId(details.id);
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton
                className="scrollbar-hide m-0 flex h-screen w-full max-w-none flex-col overflow-y-auto rounded-none p-6 sm:m-auto sm:h-auto sm:max-w-[750px] sm:rounded-2xl sm:shadow-xl lg:h-5/6 bg-gradient-to-br from-white via-gray-50 to-gray-100"
            >
                {/* HEADER */}
                <DialogHeader className="border-b border-gray-200 pb-4 mb-4">
                    <DialogTitle className="text-center text-[22px] font-semibold text-gray-800 tracking-tight">
                        Client Information
                    </DialogTitle>
                </DialogHeader>

                {/* CONTENT */}
                <div className="scrollbar-hide flex-1 overflow-y-auto space-y-8">
                    {/* CLIENT INFO */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Client’s Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                                <Input {...register('beneficiary.last_name')} disabled className="bg-gray-50 border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">First Name</label>
                                <Input {...register('beneficiary.first_name')} disabled className="bg-gray-50 border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Middle Name</label>
                                <Input {...register('beneficiary.middle_name')} disabled className="bg-gray-50 border-gray-200" />
                            </div>
                        </div>
                    </section>

                    {/* CONTACT INFO */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Contact & Address
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="sm:col-span-2">
                                <label className="block text-sm text-gray-500 mb-1">Contact Number</label>
                                <Input
                                    {...register('beneficiary.contact_number')}
                                    disabled
                                    className="bg-gray-50 border-gray-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Province</label>
                                <Input value={provinceName || 'Loading...'} disabled className="bg-gray-50 border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Municipality</label>
                                <Input value={municipalityName || 'Loading...'} disabled className="bg-gray-50 border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Barangay</label>
                                <Input value={barangayName || 'Loading...'} disabled className="bg-gray-50 border-gray-200" />
                            </div>
                        </div>
                    </section>

                    {/* DESCRIPTION */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Description
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <Textarea
                                {...register('description')}
                                disabled
                                placeholder="Description"
                                className="max-h-[300px] min-h-[100px] w-full resize-y bg-gray-50 border-gray-200"
                            />
                        </div>
                    </section>
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 mt-6 flex flex-col sm:flex-row gap-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white pt-4 sm:justify-end">
                    <Button
                        variant="outline"
                        className="basis-1/2 sm:w-auto sm:basis-auto border-gray-300 hover:bg-gray-100"
                        onClick={() => {
                            onClose();
                            onEditClicked(details);
                        }}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="destructive"
                        className="basis-1/2 sm:w-auto sm:basis-auto font-semibold text-white bg-red-500 hover:bg-red-600"
                        onClick={() => {
                            onClose();
                            onDeleteClicked(requestId);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

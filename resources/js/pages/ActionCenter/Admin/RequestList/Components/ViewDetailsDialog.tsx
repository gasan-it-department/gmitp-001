import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { geoGetter } from '@/pages/Utility/GeoGetter';
import Utility from '@/pages/Utility/Utility';

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
    }, [details]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton
                className="scrollbar-hide m-0 flex h-auto w-full max-w-none flex-col rounded-none p-4 shadow-xl sm:m-auto sm:h-auto sm:max-w-[720px] sm:rounded-2xl lg:h-[90vh]"
            >
                {/* HEADER */}
                <DialogHeader className="border-b border-gray-200 pb-4 mb-4">
                    <DialogTitle className="text-xl font-semibold text-gray-800 text-center">
                        Assistance Request Details
                    </DialogTitle>
                </DialogHeader>

                {/* SCROLLABLE CONTENT */}
                <div className="scrollbar-thin flex-1 overflow-y-auto space-y-6 pr-2">

                    {/* 🧍 Beneficiary Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Beneficiary Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <Input {...register('beneficiary.last_name')} disabled placeholder="Last Name" className="bg-gray-50 border-gray-200" />
                            <Input {...register('beneficiary.first_name')} disabled placeholder="First Name" className="bg-gray-50 border-gray-200" />
                            <Input {...register('beneficiary.middle_name')} disabled placeholder="Middle Name" className="bg-gray-50 border-gray-200" />
                            <Input {...register('beneficiary.suffix')} disabled placeholder="Suffix" className="bg-gray-50 border-gray-200" />
                        </div>
                    </section>

                    {/* 📞 Contact & Address */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Contact & Address
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="sm:col-span-2">
                                <Input {...register('beneficiary.contact_number')} disabled placeholder="Contact Number" className="bg-gray-50 border-gray-200" />
                            </div>
                            <Input value={provinceName || 'Loading...'} disabled placeholder="Province" className="bg-gray-50 border-gray-200" />
                            <Input value={municipalityName || 'Loading...'} disabled placeholder="Municipality" className="bg-gray-50 border-gray-200" />
                            <Input value={barangayName || 'Loading...'} disabled placeholder="Barangay" className="bg-gray-50 border-gray-200 sm:col-span-2 lg:col-span-1" />
                        </div>
                    </section>

                    {/* 🧾 Assistance Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Assistance Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <Input
                                {...register('assistance_type')}
                                disabled
                                placeholder="Assistance Type"
                                className="bg-gray-50 border-gray-200"
                            />
                            <Input
                                value={details.status || 'Pending'}
                                disabled
                                className={`bg-gray-50 border-gray-200 font-medium ${
                                    details.status === 'approved'
                                        ? 'text-green-600'
                                        : details.status === 'declined'
                                        ? 'text-red-500'
                                        : 'text-amber-600'
                                }`}
                            />
                            <Input
                                value={
                                    details.created_at
                                        ? Utility().formatToReadableDate(details.created_at)
                                        : ''
                                }
                                disabled
                                placeholder="Request Date"
                                className="bg-gray-50 border-gray-200"
                            />
                            <Input
                                value={
                                    details.created_at
                                        ? Utility().formatAndAddDays(details.created_at, 90)
                                        : ''
                                }
                                disabled
                                placeholder="Due Date"
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                    </section>

                    {/* 📝 Description */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Description
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <Textarea
                                {...register('description')}
                                disabled
                                placeholder="Description"
                                className="max-h-[250px] min-h-[80px] w-full resize-y bg-gray-50 border-gray-200"
                            />
                        </div>
                    </section>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white pt-4 mt-4">
                    <Button
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-100"
                        onClick={() => {
                            onClose();
                            onEditClicked(details);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        className="font-semibold text-white bg-red-500 hover:bg-red-600"
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

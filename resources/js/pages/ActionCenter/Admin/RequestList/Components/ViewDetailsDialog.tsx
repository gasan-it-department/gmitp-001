import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { geoGetter } from '@/pages/Utility/GeoGetter';
import Utility from '@/pages/Utility/Utility';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
    details: AssistanceRequest;
    isOpen: boolean;
    onClose: () => void;
    onEditClicked: (clientData: AssistanceRequest | null) => void;
    onDeleteClicked: (requestId: string) => void;
}

export default function ViewDetailsDialog({ isOpen, onClose, details, onEditClicked, onDeleteClicked }: Props) {
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
                <DialogHeader className="mb-4 border-b border-gray-200 pb-4">
                    <DialogTitle className="text-center text-xl font-semibold text-gray-800">Assistance Request Details</DialogTitle>
                </DialogHeader>

                {/* SCROLLABLE CONTENT */}
                <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto pr-2">
                    {/* 🧍 Beneficiary Info */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">Beneficiary Information</h3>
                        <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-4">
                            <Input {...register('beneficiary.last_name')} disabled placeholder="Last Name" className="border-gray-200 bg-gray-50" />
                            <Input {...register('beneficiary.first_name')} disabled placeholder="First Name" className="border-gray-200 bg-gray-50" />
                            <Input
                                {...register('beneficiary.middle_name')}
                                disabled
                                placeholder="Middle Name"
                                className="border-gray-200 bg-gray-50"
                            />
                            <Input {...register('beneficiary.suffix')} disabled placeholder="Suffix" className="border-gray-200 bg-gray-50" />
                        </div>
                    </section>

                    {/* 📞 Contact & Address */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">Contact & Address</h3>
                        <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div className="sm:col-span-2">
                                <Input
                                    {...register('beneficiary.contact_number')}
                                    disabled
                                    placeholder="Contact Number"
                                    className="border-gray-200 bg-gray-50"
                                />
                            </div>
                            <Input value={provinceName || 'Loading...'} disabled placeholder="Province" className="border-gray-200 bg-gray-50" />
                            <Input
                                value={municipalityName || 'Loading...'}
                                disabled
                                placeholder="Municipality"
                                className="border-gray-200 bg-gray-50"
                            />
                            <Input
                                value={barangayName || 'Loading...'}
                                disabled
                                placeholder="Barangay"
                                className="border-gray-200 bg-gray-50 sm:col-span-2 lg:col-span-1"
                            />
                        </div>
                    </section>

                    {/* 🧾 Assistance Info */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">Assistance Information</h3>
                        <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2">
                            <Input {...register('assistance_type')} disabled placeholder="Assistance Type" className="border-gray-200 bg-gray-50" />
                            <Input
                                value={details.status || 'Pending'}
                                disabled
                                className={`border-gray-200 bg-gray-50 font-medium ${
                                    details.status === 'approved'
                                        ? 'text-green-600'
                                        : details.status === 'declined'
                                          ? 'text-red-500'
                                          : 'text-amber-600'
                                }`}
                            />
                            <Input
                                value={details.created_at ? Utility().formatToReadableDate(details.created_at) : ''}
                                disabled
                                placeholder="Request Date"
                                className="border-gray-200 bg-gray-50"
                            />
                            <Input
                                value={details.created_at ? Utility().formatAndAddDays(details.created_at, 90) : ''}
                                disabled
                                placeholder="Due Date"
                                className="border-gray-200 bg-gray-50"
                            />
                        </div>
                    </section>

                    {/* 📝 Description */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">Description</h3>
                        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <Textarea
                                {...register('description')}
                                disabled
                                placeholder="Description"
                                className="max-h-[250px] min-h-[80px] w-full resize-y border-gray-200 bg-gray-50"
                            />
                        </div>
                    </section>
                </div>

                {/* FOOTER */}
                <div className="mt-4 flex justify-end gap-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white pt-4">
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
                        className="bg-red-500 font-semibold text-white hover:bg-red-600"
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

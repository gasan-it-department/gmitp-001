'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectItem,
    SelectContent,
} from '@/components/ui/select';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { AddressDropdown } from '@/components/Shared/AddressDropdown';

const assistanceOptions = [
    'Medical Assistance',
    'Food Assistance',
    'Transportation Assistance',
    'Financial Assistance',
    'Burial Assistance',
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    contact_number: string;
    assistance_type: string;
    description: string;
    province_code?: string;
    municipality_code?: string;
    barangay_code?: string;
}

export function ActionCenterForm({ isOpen, onClose }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            suffix: '',
            contact_number: '',
            assistance_type: '',
            description: '',
        },
    });

    // ✅ Memoized handler to prevent infinite loops
    const handleAddressChange = useCallback(
        (address: { provinceCode: string; municipalityCode: string; barangayCode: string } | null) => {
            if (!address) return;
            setValue('province_code', address.provinceCode);
            setValue('municipality_code', address.municipalityCode);
            setValue('barangay_code', address.barangayCode);
        },
        [setValue]
    );

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            console.log('Submitted data:', data);
            reset();
            setIsSubmitting(false);
            onClose();
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="max-h-[90vh] w-full overflow-y-auto p-0 sm:max-w-3xl rounded-2xl border border-orange-200"
            >
                {/* HEADER */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 sm:px-8 rounded-t-2xl sticky top-0 z-50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">
                            Assistance Request Form
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* PERSONAL INFORMATION */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-orange-600">
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <InputField label="Last Name *" id="last_name" register={register} errors={errors} required />
                                <InputField label="First Name *" id="first_name" register={register} errors={errors} required />
                                <InputField label="Middle Name" id="middle_name" register={register} errors={errors} />
                                <InputField label="Suffix" id="suffix" register={register} errors={errors} />
                                <InputField label="Contact Number *" id="contact_number" type="tel" register={register} errors={errors} required />
                            </div>
                        </div>

                        {/* ADDRESS DROPDOWN */}
                        <AddressDropdown onAddressChange={handleAddressChange} />

                        {/* ASSISTANCE TYPE */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                                Type of Assistance *
                            </Label>
                            <Controller
                                name="assistance_type"
                                control={control}
                                rules={{ required: 'Please select a type of assistance' }}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={`w-full text-sm ${errors.assistance_type ? 'border-red-500' : 'border-gray-300'}`}>
                                            <SelectValue placeholder="Select type of assistance" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assistanceOptions.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.assistance_type && <p className="text-sm text-red-500">{errors.assistance_type.message}</p>}
                        </div>

                        {/* DESCRIPTION */}
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Description / Reason *</Label>
                            <Textarea
                                {...register('description', { required: 'Description is required' })}
                                rows={4}
                                placeholder="Provide details about your request..."
                                className={errors.description ? 'border-red-500' : 'border-gray-300'}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-row gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    reset();
                                    onClose();
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 rounded-xl"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// HELPER INPUT FIELD
interface InputFieldProps {
    label: string;
    id: string;
    type?: string;
    register: any;
    errors: any;
    required?: boolean;
}
function InputField({ label, id, type = 'text', register, errors, required }: InputFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-semibold text-gray-700">
                {label}
            </Label>
            <Input
                id={id}
                type={type}
                autoComplete="off"
                {...register(id, required ? { required: `${label} is required` } : {})}
                className={`rounded-md border font-medium text-gray-600 focus:ring-orange-200 focus:border-orange-400 ${errors[id] ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors[id] && <p className="text-sm text-red-500">{errors[id]?.message}</p>}
        </div>
    );
}

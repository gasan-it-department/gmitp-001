import { AddressDropdown } from '@/components/Shared/AddressDropdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from '@/lib/axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DatePicker } from './DatePicker';

import { useQueryClient } from '@tanstack/react-query';

interface Props {
    isOpen: boolean;
    editData?: ClientData | null;
    onClose: () => void;
    onSubmit?: (data: ClientData) => void;
}

interface ClientData {
    last_name: string;
    first_name: string;
    middle_name?: string;
    suffix?: string;
    birth_date: string;
    contact_number: string;
    province: string;
    municipality: string;
    barangay: string;
    assistance_type: string;
    description: string;
}

const assistanceOptions = ['Medical Assistance', 'Food Assistance', 'Transportation Assistance', 'Financial Assistance', 'Burial Assistance'];

export default function AddEditRecordDialog({ isOpen, onClose, editData, onSubmit }: Props) {
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ClientData>({
        defaultValues: {
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix: '',
            birth_date: '',
            contact_number: '',
            province: '',
            municipality: '',
            barangay: '',
            assistance_type: '',
            description: '',
        },
    });

    const handleFormSubmit = async (data: ClientData) => {
        try {
            const response = await axios.post('/action-center/request', data);

            if (response.status !== 200) {
                setError('root', response.data);
                throw new Error(response.data);
            }
            await queryClient.invalidateQueries({
                queryKey: ['request-list'],
                refetchType: 'active',
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleReset = () => {
        reset();
        onClose();
    };

    useEffect(() => {
        if (editData) {
            Object.keys(editData).forEach((key) => {
                setValue(key as keyof ClientData, editData[key as keyof ClientData]);
            });
        } else {
            reset();
        }
    }, [editData, setValue, reset]);
    const handleAddressChange = (address: any) => {
        if (!address) {
            setValue('province', '');
            setValue('municipality', '');
            setValue('barangay', '');
            return;
        }

        setValue('province', address.provinceCode);
        setValue('municipality', address.municipalityCode);
        setValue('barangay', address.barangayCode);
    };
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => onClose()} modal={true}>
            <DialogContent
                showCloseButton={true}
                onInteractOutside={(e) => e.preventDefault()}
                className="scrollbar-hide m-0 flex h-screen w-full max-w-none flex-col rounded-none p-4 sm:m-auto sm:h-auto sm:max-w-[700px] sm:rounded-lg lg:h-5/6"
            >
                <DialogHeader>
                    <DialogTitle className="p-3 text-center text-[21px]">{editData ? 'Edit Record' : 'Add New Record'}</DialogTitle>
                </DialogHeader>

                {/* Scrollable form area */}
                <div className="scrollbar-hide flex-1 overflow-y-auto">
                    <Card className="rounded-lg bg-white shadow-lg">
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                                {/* Personal Information Section */}
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700">
                                            First Name *
                                        </Label>
                                        <Input
                                            autoComplete="off"
                                            id="first_name"
                                            type="text"
                                            {...register('first_name', { required: 'First name is required' })}
                                            className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                                errors.first_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            aria-label="First Name"
                                            aria-required="true"
                                            aria-invalid={!!errors.first_name}
                                        />
                                        {errors.first_name && (
                                            <p className="text-sm text-red-600" role="alert">
                                                {errors.first_name.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name" className="text-sm font-bold text-gray-700">
                                            Last Name *
                                        </Label>
                                        <Input
                                            autoComplete="off"
                                            id="last_name"
                                            type="text"
                                            {...register('last_name', { required: 'Last name is required' })}
                                            className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                                errors.last_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            aria-label="Last Name"
                                            aria-required="true"
                                            aria-invalid={!!errors.last_name}
                                        />
                                        {errors.last_name && (
                                            <p className="text-sm text-red-600" role="alert">
                                                {errors.last_name.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Middle Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="middle_name" className="text-sm font-bold text-gray-700">
                                            Middle Name
                                        </Label>
                                        <Input
                                            id="middle_name"
                                            type="text"
                                            {...register('middle_name')}
                                            className="rounded-md border border-gray-300 font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                                            aria-label="Middle Name"
                                        />
                                    </div>

                                    {/* Jr./Suffix */}
                                    <div className="space-y-2">
                                        <Label htmlFor="suffix" className="text-sm font-bold text-gray-700">
                                            Jr./Suffix
                                        </Label>
                                        <Input
                                            autoComplete="off"
                                            id="suffix"
                                            type="text"
                                            {...register('suffix')}
                                            className="rounded-md border border-gray-300 font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                                            aria-label="Jr. or Suffix"
                                            placeholder="Jr., Sr., III, etc."
                                        />
                                    </div>
                                    {/* Contact Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_number" className="text-sm font-bold text-gray-700">
                                            Contact Number *
                                        </Label>
                                        <Input
                                            autoComplete="off"
                                            id="contact_number"
                                            type="tel"
                                            {...register('contact_number', {
                                                required: 'Contact number is required',
                                                pattern: {
                                                    value: /^[\d\s\-$$$$+]+$/,
                                                    message: 'Please enter a valid phone number',
                                                },
                                            })}
                                            className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                                errors.contact_number ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            aria-label="Contact Number"
                                            aria-required="true"
                                            aria-invalid={!!errors.contact_number}
                                            placeholder="(555) 123-4567"
                                        />
                                        {errors.contact_number && (
                                            <p className="text-sm text-red-600" role="alert">
                                                {errors.contact_number.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {/* BDAY */}
                                    <div className="space-y-2">
                                        <Label htmlFor="birth_date" className="text-sm font-bold text-gray-700">
                                            Birth Date *
                                        </Label>
                                        <input type="hidden" {...register('birth_date', { required: 'Birth date is required' })} />
                                        <DatePicker
                                            value={selectedDate}
                                            onChange={(date) => {
                                                setSelectedDate(date);
                                                setValue(
                                                    'birth_date',
                                                    date ? moment(date).format('YYYY-MM-DD') : '',
                                                    { shouldValidate: true, shouldDirty: true }, // <-- important
                                                );
                                            }}
                                        />
                                        {errors.birth_date && (
                                            <p className="text-sm text-red-600" role="alert">
                                                {errors.birth_date.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Assistance Needed */}
                                    <div className="space-y-2">
                                        <Label htmlFor="assistance_type" className="text-sm font-bold text-gray-700">
                                            Assistance Needed *
                                        </Label>
                                        <Select value={watch('assistance_type')} onValueChange={(value) => setValue('assistance_type', value)}>
                                            <SelectTrigger
                                                className={`rounded-md border font-medium text-gray-600 transition-colors ${
                                                    errors.assistance_type ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                aria-label="Assistance Needed"
                                                aria-required="true"
                                                aria-invalid={!!errors.assistance_type}
                                            >
                                                <SelectValue placeholder="Select assistance type" />
                                            </SelectTrigger>
                                            <SelectContent className="font-semibold text-gray-600">
                                                {assistanceOptions.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" {...register('assistance_type', { required: 'Please select assistance type' })} />
                                        {errors.assistance_type && (
                                            <p className="text-sm text-red-600" role="alert">
                                                {errors.assistance_type.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Location Fields */}

                                <AddressDropdown onAddressChange={handleAddressChange} />

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="assistance_type" className="text-sm font-bold text-gray-700">
                                        Description / Reason for Assistance *
                                    </Label>
                                    <Textarea
                                        autoComplete="off"
                                        id="description"
                                        {...register('description')}
                                        className={`min-h-[120px] rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                                            errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        aria-label="Description or Reason for Assistance"
                                        aria-required="true"
                                        aria-invalid={!!errors.description}
                                        placeholder="Please provide detailed information about the assistance needed, including any relevant circumstances or urgency..."
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600" role="alert">
                                            {errors.description.message}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 font-medium text-white shadow-md transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Submitting...' : editData ? 'Update Record' : 'Submit Request'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="flex-1 rounded-md border-gray-300 bg-transparent px-6 py-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 sm:flex-none"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

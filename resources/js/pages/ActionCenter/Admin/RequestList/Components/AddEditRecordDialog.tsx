import { AddressDropdown } from '@/components/Shared/AddressDropdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import ToastProvider from '@/pages/Utility/ToastShower';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DatePicker } from './DatePicker';

interface Props {
    isOpen: boolean;
    editData?: AssistanceRequest | null;
    onClose: () => void;
    onSuccess: (data: AssistanceRequest, editMode: boolean) => void;
}

const assistanceOptions = ['Medical Assistance', 'Food Assistance', 'Transportation Assistance', 'Financial Assistance', 'Burial Assistance'];

export default function AddEditRecordDialog({ isOpen, onClose, editData, onSuccess }: Props) {
    const { currentMunicipality } = useMunicipality();
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [assistanceType, setAssistanceType] = useState('');
    const [geoData, setGeoData] = useState({
        editProvince: '',
        editMunicipality: '',
        editBarangay: '',
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<any>({
        defaultValues: {
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix: '',
            contact_number: '',
            birth_date: '',
            assistance_type: '',
            province: '',
            municipality: '',
            barangay: '',
            description: '',
        },
    });

    // 1. FIXED: Data not displaying in edit mode
    useEffect(() => {
        if (isOpen) {
            if (editData) {
                const b = editData.beneficiary;
                const date = b?.birth_date ? moment(b.birth_date, 'YYYY-MM-DD').toDate() : undefined;

                // Update local UI states
                setSelectedDate(date);
                setAssistanceType(editData.assistance_type || '');

                // Set GeoData for the AddressDropdown component
                setGeoData({
                    editProvince: b?.province ?? '',
                    editMunicipality: b?.municipality ?? '',
                    editBarangay: b?.barangay ?? '',
                });

                // Use reset with a small timeout to ensure inputs are registered
                const timer = setTimeout(() => {
                    reset({
                        first_name: b?.first_name ?? '',
                        last_name: b?.last_name ?? '',
                        middle_name: b?.middle_name ?? '',
                        suffix: b?.suffix ?? '',
                        contact_number: b?.contact_number ?? '',
                        birth_date: b?.birth_date ?? '',
                        assistance_type: editData.assistance_type ?? '',
                        description: editData.description ?? '',
                        province: b?.province ?? '',
                        municipality: b?.municipality ?? '',
                        barangay: b?.barangay ?? '',
                    });
                }, 0);

                return () => clearTimeout(timer);
            } else {
                // New Record Mode: Clear everything
                reset({
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    suffix: '',
                    contact_number: '',
                    birth_date: '',
                    assistance_type: '',
                    province: '',
                    municipality: '',
                    barangay: '',
                    description: '',
                });
                setAssistanceType('');
                setSelectedDate(undefined);
                setGeoData({ editProvince: '', editMunicipality: '', editBarangay: '' });
            }
        }
    }, [isOpen, editData, reset]);

    const handleFormSubmit = async (data: any) => {
        try {
            if (!editData) {
                const response = await ActionCenterApi.storeRequest(currentMunicipality.slug, data);

                if (!response.success) {
                    setError('root', { message: response.data });
                    throw new Error(response.data);
                }

                await queryClient.invalidateQueries({
                    queryKey: ['request-list'],
                    refetchType: 'active',
                });

                toast.success('Successfully added');
                onSuccess(response.data, false);
                handleReset();
            } else {
                // Logic for update would go here
                toast.info('Update logic not yet implemented');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred. Try again later.');
        }
    };

    const handleReset = () => {
        reset();
        onClose();
    };

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal>
            <DialogContent
                showCloseButton
                onInteractOutside={(e) => e.preventDefault()}
                className="scrollbar-hide m-0 flex h-auto w-full max-w-none flex-col rounded-none bg-gradient-to-b from-white via-orange-50 to-rose-50 p-4 shadow-xl sm:m-auto sm:h-auto sm:max-w-[720px] sm:rounded-2xl lg:h-[90vh]"
            >
                <DialogTitle className="text-2xl font-bold text-gray-800">{editData ? 'Edit Record' : 'Add New Record'}</DialogTitle>

                <DialogHeader className="border-b border-orange-100 pb-3 text-center">
                    <p className="text-sm text-gray-500">Please fill in the required information carefully.</p>
                </DialogHeader>

                <div className="scrollbar-hide mt-3 flex-1 overflow-y-auto">
                    <Card className="rounded-xl border-0 bg-white/90 shadow-md">
                        <CardContent className="space-y-8 p-6">
                            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                                {/* Personal Info */}
                                <section>
                                    <h3 className="mb-3 border-b border-orange-100 pb-1 text-base font-semibold text-orange-600">
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <FormField
                                            label="First Name *"
                                            id="first_name"
                                            register={register}
                                            name="first_name"
                                            requiredMsg="First name is required"
                                            errors={errors}
                                        />
                                        <FormField
                                            label="Last Name *"
                                            id="last_name"
                                            register={register}
                                            name="last_name"
                                            requiredMsg="Last name is required"
                                            errors={errors}
                                        />
                                        <FormField label="Middle Name" id="middle_name" register={register} name="middle_name" errors={errors} />
                                        <FormField
                                            label="Jr./Suffix"
                                            id="suffix"
                                            register={register}
                                            name="suffix"
                                            placeholder="Jr., Sr., III, etc."
                                            errors={errors}
                                        />
                                        <FormField
                                            label="Contact Number *"
                                            id="contact_number"
                                            register={register}
                                            name="contact_number"
                                            type="tel"
                                            requiredMsg="Contact number is required"
                                            errors={errors}
                                        />

                                        {/* Birth Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="birth_date" className="text-sm font-semibold text-gray-700">
                                                Birth Date *
                                            </Label>
                                            <input type="hidden" {...register('birth_date', { required: 'Birth date is required' })} />
                                            <DatePicker
                                                value={selectedDate}
                                                onChange={(date) => {
                                                    setSelectedDate(date);
                                                    setValue('birth_date', date ? moment(date).format('YYYY-MM-DD') : '', { shouldValidate: true });
                                                }}
                                            />
                                            {errors.birth_date?.message && (
                                                <p className="text-sm text-red-600" role="alert">
                                                    {String(errors.birth_date.message)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Assistance Section */}
                                <section>
                                    <h3 className="mb-3 border-b border-orange-100 pb-1 text-base font-semibold text-orange-600">
                                        {' '}
                                        Assistance Information{' '}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="assistance_type" className="text-sm font-semibold text-gray-700">
                                                Assistance Needed *
                                            </Label>
                                            <Select
                                                value={assistanceType}
                                                onValueChange={(value) => {
                                                    setAssistanceType(value);
                                                    setValue('assistance_type', value, { shouldValidate: true });
                                                }}
                                            >
                                                <SelectTrigger
                                                    className={`rounded-md border font-medium text-gray-600 transition-colors ${errors.assistance_type ? 'border-red-500' : 'border-gray-300'}`}
                                                >
                                                    <SelectValue placeholder="Select assistance type" />
                                                </SelectTrigger>
                                                <SelectContent className="font-medium text-gray-700">
                                                    {assistanceOptions.map((option) => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" {...register('assistance_type', { required: 'Please select assistance type' })} />
                                            {errors.assistance_type?.message && (
                                                <p className="text-sm text-red-600" role="alert">
                                                    {String(errors.assistance_type.message)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Address Section */}
                                <section>
                                    <h3 className="mb-3 border-b border-orange-100 pb-1 text-base font-semibold text-orange-600">Address Details</h3>
                                    <AddressDropdown
                                        onAddressChange={handleAddressChange}
                                        editMunicipality={geoData.editMunicipality}
                                        editBarangay={geoData.editBarangay}
                                    />
                                </section>

                                {/* Description */}
                                <section>
                                    <h3 className="mb-3 border-b border-orange-100 pb-1 text-base font-semibold text-orange-600">
                                        Description / Reason
                                    </h3>
                                    <div className="space-y-2">
                                        <Textarea
                                            autoComplete="off"
                                            id="description"
                                            {...register('description', { required: 'Description is required' })}
                                            className={`min-h-[120px] rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Provide details about the assistance needed..."
                                        />
                                        {errors.description?.message && (
                                            <p className="text-sm text-red-600" role="alert">
                                                {String(errors.description.message)}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Buttons */}
                                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="flex-1 rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 sm:flex-none"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-md bg-gradient-to-r from-orange-500 to-red-500 font-medium text-white shadow-md transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-lg disabled:opacity-50 sm:flex-none"
                                    >
                                        {isSubmitting ? 'Submitting...' : editData ? 'Update Record' : 'Add Record'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    <ToastProvider />
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* 🔹 Helper for form inputs - FIXED rendering and type error */
function FormField({ label, id, register, name, requiredMsg, type = 'text', placeholder, errors }: any) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-semibold text-gray-700">
                {label}
            </Label>
            <Input
                id={id}
                type={type}
                autoComplete="off"
                placeholder={placeholder}
                {...register(name, requiredMsg ? { required: requiredMsg } : {})}
                className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${
                    errors?.[name] ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors?.[name]?.message && (
                <p className="text-sm text-red-600" role="alert">
                    {String(errors[name].message)}
                </p>
            )}
        </div>
    );
}

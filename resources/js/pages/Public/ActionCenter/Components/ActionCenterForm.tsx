import { AddressDropdown } from '@/components/Shared/AddressDropdown';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { cn } from '@/lib/utils';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import ToastProvider from '@/pages/Utility/ToastShower';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Control, Controller, ControllerProps, FieldErrors, Path, useForm } from 'react-hook-form';

const assistanceOptions = ['Medical Assistance', 'Food Assistance', 'Transportation Assistance', 'Financial Assistance', 'Burial Assistance'];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: (title: string, message: string) => void;
}

interface FormData {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    contact_number: string;
    assistance_type: string;
    description: string;
    province?: string;
    municipality?: string;
    barangay?: string;
    birth_date?: string;
}

export function ActionCenterForm({ isOpen, onClose, onSubmitSuccess }: Props) {
    const { currentMunicipality } = useMunicipality();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [classicDialog, setClassicDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        positiveButtonText: string;
        negativeButtonText: string;
        isNegativeButtonHidden: boolean;
        action: string | null;
    }>({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
        action: null,
    });

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
            birth_date: '',
        },
    });

    const handleAddressChange = useCallback(
        (address: { provinceCode: string; municipalityCode: string; barangayCode: string } | null) => {
            if (!address) return;
            setValue('province', address.provinceCode);
            setValue('municipality', address.municipalityCode);
            setValue('barangay', address.barangayCode);
        },
        [setValue],
    );

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            console.log('Submitted data:', data);
            const response = await ActionCenterApi.storeRequest(currentMunicipality.slug, data);
            if (response.success) {
                onSubmitSuccess('Submitted!', 'Your request has been successfully submitted. A municipal staff member may contact you soon.');
                onClose();
            } else {
                setClassicDialog((prev) => ({
                    ...prev,
                    isOpen: true,
                    title: 'Failed!',
                    message: 'An error occurred while submitting your request. Please try again later.',
                    positiveButtonText: 'Close',
                    isNegativeButtonHidden: true,
                }));
            }
            console.log('Action center response: ', response);
            reset();
            setIsSubmitting(false);
        } catch (error: any) {
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: 'An error occurred!',
                message: error,
                positiveButtonText: 'Close',
                isNegativeButtonHidden: true,
            }));
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-orange-200 p-0 sm:max-w-3xl"
            >
                {/* HEADER */}
                <div className="sticky top-0 z-50 rounded-t-2xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 sm:px-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">Assistance Request Form</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* PERSONAL INFORMATION */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-orange-600">Personal Information</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <InputField label="Last Name *" id="last_name" register={register} errors={errors} required />
                                <InputField label="First Name *" id="first_name" register={register} errors={errors} required />
                                <InputField label="Middle Name" id="middle_name" register={register} errors={errors} />
                                <InputField label="Suffix" id="suffix" register={register} errors={errors} />

                                {/* ✅ Birth Date Input */}
                                <DatePickerField label="Birth Date *" name="birth_date" control={control} errors={errors} required />

                                <InputField label="Contact Number *" id="contact_number" type="tel" register={register} errors={errors} required />
                            </div>
                        </div>

                        {/* ADDRESS DROPDOWN */}
                        <AddressDropdown onAddressChange={handleAddressChange} />

                        {/* ASSISTANCE TYPE */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Type of Assistance *</Label>
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
                                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </form>

                    <ToastProvider />

                    <ClassicDialog
                        title={classicDialog.title}
                        message={classicDialog.message}
                        open={classicDialog.isOpen}
                        positiveButtonText={classicDialog.positiveButtonText}
                        negativeButtonText={classicDialog.negativeButtonText}
                        hideNegativeButton={classicDialog.isNegativeButtonHidden}
                        onPositiveClick={() => {
                            setClassicDialog((prev) => ({
                                ...prev,
                                action: null,
                                isOpen: false,
                            }));
                        }}
                        onNegativeClick={() => {
                            setClassicDialog((prev) => ({
                                ...prev,
                                action: null,
                                isOpen: false,
                            }));
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

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
                className={`rounded-md border font-medium text-gray-600 focus:border-orange-400 focus:ring-orange-200 ${errors[id] ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors[id] && <p className="text-sm text-red-500">{errors[id]?.message}</p>}
        </div>
    );
}

// ✅ NEW: Date Picker Component wrapping Controller + Popover + Calendar
interface DatePickerFieldProps {
    name: Path<FormData>;
    control: Control<FormData>;
    errors: FieldErrors<FormData>;
    label: string;
    required?: boolean;
}

function DatePickerField({ name, control, errors, label, required = false }: DatePickerFieldProps) {
    const rules: ControllerProps<FormData>['rules'] = required ? { required: `${label} is required` } : {};

    return (
        <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">{label}</Label>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-medium',
                                    !field.value && 'text-muted-foreground',
                                    errors[name] ? 'border-red-500' : 'border-gray-300',
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        {/* Added z-[1000] and pointer-events-auto to ensure it sits on top of the Dialog (which is typically z-50).
                          This fixes the issue where calendar dates are not clickable inside a modal.
                        */}
                        <PopoverContent className="pointer-events-auto z-[1000] w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                    field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                                }}
                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {errors[name] && <p className="text-sm text-red-500">{errors[name]?.message}</p>}
        </div>
    );
}

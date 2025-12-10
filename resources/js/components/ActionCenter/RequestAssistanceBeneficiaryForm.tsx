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

// ----------------------------------------------------------------------
// MAIN FORM COMPONENT
// ----------------------------------------------------------------------

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
        setError,
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
            const response = await ActionCenterApi.storeRequest(currentMunicipality.slug, data);

            if (response.success) {
                onSubmitSuccess('Submitted!', 'Your request has been successfully submitted. A municipal staff member may contact you soon.');
                reset();
                onClose();
            } else {
                setClassicDialog((prev) => ({
                    ...prev,
                    isOpen: true,
                    title: 'Failed!',
                    message: response.message || 'An error occurred while submitting your request.',
                    positiveButtonText: 'Close',
                    isNegativeButtonHidden: true,
                }));
            }
        } catch (error: any) {
            if (error.response?.data) {
                const { errors: validationErrors, message } = error.response.data;
                if (validationErrors) {
                    Object.keys(validationErrors).forEach((field) => {
                        setError(field as keyof FormData, {
                            type: 'server',
                            message: validationErrors[field][0],
                        });
                    });
                }
                if (!validationErrors && message) {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: true,
                        title: 'An error occurred!',
                        message: message,
                        positiveButtonText: 'Close',
                        isNegativeButtonHidden: true,
                    }));
                }
            } else {
                setClassicDialog((prev) => ({
                    ...prev,
                    isOpen: true,
                    title: 'An error occurred!',
                    message: error.message || 'The server could not process the request.',
                    positiveButtonText: 'Close',
                    isNegativeButtonHidden: true,
                }));
            }
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                // ✅ REFACTORED CSS:
                // Mobile: Full viewport (h-[100dvh] w-screen), no border/radius.
                // Desktop (sm): Auto height but capped at 90vh (sm:max-h-[90vh]) to prevent vertical clipping, smaller width (max-w-lg), rounded/bordered.
                className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-background p-0 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:rounded-xl sm:border"
            >
                {/* Header Section (Fixed/Non-scrollable) */}
                <div className="shrink-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">Assistance Request Form</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* PERSONAL INFORMATION */}
                        <div className="space-y-4">
                            <h3 className="border-b border-orange-100 pb-2 text-base font-semibold text-orange-600">Personal Information</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <InputField label="Last Name *" id="last_name" register={register} errors={errors} required />
                                <InputField label="First Name *" id="first_name" register={register} errors={errors} required />
                                <InputField label="Middle Name" id="middle_name" register={register} errors={errors} />
                                <InputField label="Suffix" id="suffix" register={register} errors={errors} />

                                <DatePickerField label="Birth Date *" name="birth_date" control={control} errors={errors} required />

                                <InputField label="Contact Number *" id="contact_number" type="tel" register={register} errors={errors} required />
                            </div>
                        </div>

                        {/* ADDRESS DROPDOWN */}
                        <div className="space-y-4">
                            <h3 className="border-b border-orange-100 pb-2 text-base font-semibold text-orange-600">Address</h3>
                            <AddressDropdown onAddressChange={handleAddressChange} />
                        </div>

                        {/* ASSISTANCE TYPE */}
                        <div className="space-y-4">
                            <h3 className="border-b border-orange-100 pb-2 text-base font-semibold text-orange-600">Request Details</h3>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Type of Assistance *</Label>
                                <Controller
                                    name="assistance_type"
                                    control={control}
                                    rules={{ required: 'Please select a type of assistance' }}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger
                                                className={`w-full text-sm ${errors.assistance_type ? 'border-red-500' : 'border-gray-300'}`}
                                            >
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
                                {errors.assistance_type && <p className="animate-pulse text-sm text-red-500">{errors.assistance_type.message}</p>}
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
                                {errors.description && <p className="animate-pulse text-sm text-red-500">{errors.description.message}</p>}
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-row gap-4 pt-4 pb-2">
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
                                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Request'
                                )}
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
                            setClassicDialog((prev) => ({ ...prev, action: null, isOpen: false }));
                        }}
                        onNegativeClick={() => {
                            setClassicDialog((prev) => ({ ...prev, action: null, isOpen: false }));
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
    id: Path<FormData>;
    type?: string;
    register: any;
    errors: FieldErrors<FormData>;
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
                className={cn(
                    'rounded-md border font-medium text-gray-600 focus:border-orange-400 focus:ring-orange-200',
                    errors[id] && 'border-red-500 focus-visible:ring-red-500', // Added explicit focus ring for errors
                )}
            />
            {/* Added animate-pulse as per your preference */}
            {errors[id] && <p className="animate-pulse text-sm text-red-500">{errors[id]?.message}</p>}
        </div>
    );
}

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
            {errors[name] && <p className="animate-pulse text-sm text-red-500">{errors[name]?.message}</p>}
        </div>
    );
}

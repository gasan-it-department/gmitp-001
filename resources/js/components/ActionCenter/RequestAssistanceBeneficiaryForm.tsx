import { store } from '@/actions/App/External/Api/Controllers/ActionCenter/ActionCenterController';
import { AddressDropdown } from '@/components/Shared/AddressDropdown';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { ActionCenterFormData } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import ToastProvider from '@/pages/Utility/ToastShower';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { InertiaInput } from '../InputField';
import { AssistanceOptions } from './AssistanceOptionsDropdown';
import { DatePickerField } from './Form/DatePicker';
import { FileUploader } from './Form/FileUploader';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: (title: string, message: string) => void;
    editData: ActionCenterFormData | null;
}
export function ActionCenterForm({ isOpen, onClose, onSubmitSuccess, editData }: Props) {
    const { currentMunicipality } = useMunicipality();

    // 1. INITIALIZE INERTIA FORM
    // ✅ CLEANER: We remove the explicit generic and intersection types.
    // TypeScript will automatically infer the correct shape from the initial values below.
    // This satisfies Inertia's constraints while keeping your code readable.
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        first_name: editData?.first_name || '',
        middle_name: editData?.middle_name || '',
        last_name: editData?.last_name || '',
        suffix: editData?.suffix || '',
        assistance_type: editData?.assistance_type || '',
        description: editData?.description || '',
        province: editData?.province || '',
        municipality: editData?.municipality || '',
        barangay: editData?.barangay || '',
        birth_date: editData?.birth_date || '',
        documents: [] as File[],
    });

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

    const handleAddressChange = (address: { province: string; municipality: string; barangay: string } | null) => {
        if (address) {
            // We use the functional update pattern to update multiple fields at once
            setData((prevData) => ({
                ...prevData,
                province: address.province,
                municipality: address.municipality,
                barangay: address.barangay,
            }));
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(store.url(), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                onSubmitSuccess('Submitted!', 'Your request has been successfully submitted.');
                reset();
                onClose();
            },
            onError: (err: any) => {
                console.error('Submission errors:', err);
            },
        });
    };

    // Helper for simple text inputs
    // We cast field to 'any' to ensure compatibility between the Interface keys and the Inferred keys,
    // which prevents strict type mismatches in edge cases.
    const handleTextChange = (field: keyof ActionCenterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(field as any, e.target.value);
    };

    const handleFileChange = () => {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                // ✅ APPLIED: Mobile full screen, flex-col structure
                className="flex h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-background p-0 sm:h-auto sm:max-h-[90vh] sm:w-[1100px] sm:max-w-none sm:rounded-2xl sm:border"
            >
                {/* Header Section (Fixed/Non-scrollable) */}
                <div className="shrink-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 sm:rounded-t-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">Assistance Request Form</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* PERSONAL INFORMATION */}
                        <div className="space-y-4">
                            <h3 className="border-b border-orange-100 pb-2 text-base font-semibold text-orange-600">Personal Information</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <InertiaInput
                                    label="First Name *"
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={handleTextChange('first_name')}
                                    error={errors.first_name}
                                    isUppercase={true}
                                />
                                <InertiaInput
                                    label="Last Name *"
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={handleTextChange('last_name')}
                                    error={errors.last_name}
                                    isUppercase={true}
                                />
                                <InertiaInput
                                    label="Middle Name"
                                    id="middle_name"
                                    value={data.middle_name}
                                    onChange={handleTextChange('middle_name')}
                                    error={errors.middle_name}
                                    isUppercase={true}
                                />
                                <InertiaInput
                                    label="Suffix"
                                    id="suffix"
                                    value={data.suffix}
                                    onChange={handleTextChange('suffix')}
                                    isUppercase={true}
                                />
                                <DatePickerField
                                    label="Birth Date"
                                    value={data.birth_date}
                                    error={errors.birth_date}
                                    onChange={(date) => setData('birth_date', date)}
                                    required
                                />
                            </div>
                        </div>

                        {/* ADDRESS DROPDOWN */}
                        <div className="space-y-4">
                            <h3 className="border-b border-orange-100 pb-2 text-base font-semibold text-orange-600">Address</h3>
                            <AddressDropdown
                                editMunicipality={editData?.municipality || ''}
                                editBarangay={editData?.barangay || ''}
                                errorBarangay={errors.barangay}
                                errorMunicipality={errors.municipality}
                                onAddressChange={handleAddressChange}
                            />
                        </div>

                        {/* ASSISTANCE TYPE */}
                        <div className="space-y-4">
                            <h3 className="border-b border-orange-100 pb-2 text-base font-semibold text-orange-600">Request Details</h3>

                            <div className="space-y-2">
                                <AssistanceOptions value={data.assistance_type} onChange={(val) => setData('assistance_type', val)} />
                                {errors.assistance_type && <p className="text-sm text-red-500">{errors.assistance_type}</p>}
                            </div>

                            {/* DESCRIPTION */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-800">Description / Reason *</Label>
                                <Textarea
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Provide details about your request..."
                                    className={errors.description ? 'border-red-500' : 'border-gray-300'}
                                />
                                {errors.description && <p className="animate-pulse text-sm text-red-500">{errors.description}</p>}
                            </div>

                            {/*file uploading*/}
                            <div className="pt-2">
                                <FileUploader
                                    files={data.documents}
                                    onFilesChange={(newFiles) => setData('documents', newFiles)}
                                    error={errors.documents}
                                    maxFiles={5}
                                    label="Attach Supporting Documents"
                                    description="Please attach photos of your Valid ID, Indigency, or other requirements."
                                />
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
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                                disabled={processing}
                            >
                                {processing ? (
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

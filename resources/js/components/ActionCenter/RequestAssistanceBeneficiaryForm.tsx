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
import { ShieldCheck } from 'lucide-react';
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

    const { data, setData, post, processing, errors, reset } = useForm({
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

    const [classicDialog, setClassicDialog] = useState({
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
        // post(store.url(), {
        //     headers: {
        //         'X-Municipality-Slug': currentMunicipality.slug,
        //     },
        //     onSuccess: () => {
        //         onSubmitSuccess('Submitted!', 'Your request has been successfully submitted.');
        //         reset();
        //         onClose();
        //     },
        //     onError: (err: any) => {
        //         console.error('Submission errors:', err);
        //     },
        // });
    };

    const handleTextChange = (field: keyof ActionCenterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(field as any, e.target.value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="flex h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 border-border bg-background p-0 shadow-2xl sm:h-auto sm:max-h-[90vh] sm:w-[1100px] sm:max-w-none sm:rounded-2xl sm:border"
            >
                {/* --- HEADER SECTION (Solid Brand Color) --- */}
                <div className="shrink-0 border-b border-primary-foreground/10 bg-primary px-6 py-6 sm:rounded-t-xl">
                    <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 shadow-inner backdrop-blur-sm">
                            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tight text-primary-foreground uppercase">
                                Assistance Request Form
                            </DialogTitle>
                            <p className="mt-0.5 text-[10px] font-bold tracking-[0.2em] text-primary-foreground/60 uppercase">
                                Gasan Social Welfare Services
                            </p>
                        </div>
                    </DialogHeader>
                </div>

                {/* --- SCROLLABLE CONTENT AREA --- */}
                <div className="scrollbar-thin scrollbar-thumb-primary/20 flex-1 overflow-y-auto px-6 py-8">
                    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-10">
                        {/* I. PERSONAL INFORMATION */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black tracking-widest text-primary uppercase italic">I. Personal Information</h3>
                                <div className="h-[1px] flex-1 bg-border" />
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                                <div className="sm:col-span-2 lg:col-span-2">
                                    <DatePickerField
                                        label="Birth Date"
                                        value={data.birth_date}
                                        error={errors.birth_date}
                                        onChange={(date) => setData('birth_date', date)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* II. ADDRESS DETAILS */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black tracking-widest text-primary uppercase italic">II. Address Details</h3>
                                <div className="h-[1px] flex-1 bg-border" />
                            </div>
                            <AddressDropdown
                                editMunicipality={editData?.municipality || ''}
                                editBarangay={editData?.barangay || ''}
                                errorBarangay={errors.barangay}
                                errorMunicipality={errors.municipality}
                                onAddressChange={handleAddressChange}
                            />
                        </div>

                        {/* III. REQUEST SPECIFICATIONS */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black tracking-widest text-primary uppercase italic">III. Request Specifications</h3>
                                <div className="h-[1px] flex-1 bg-border" />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-tight text-muted-foreground uppercase">Type of Assistance</Label>
                                    <AssistanceOptions value={data.assistance_type} onChange={(val) => setData('assistance_type', val)} />
                                    {errors.assistance_type && <p className="mt-1 text-xs font-bold text-destructive">{errors.assistance_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-tight text-muted-foreground uppercase">Description / Reason *</Label>
                                    <Textarea
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Explain the reason for your request..."
                                        className={`rounded-xl border-border bg-muted/30 focus:ring-primary ${errors.description ? 'border-destructive focus:ring-destructive' : ''}`}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 animate-pulse text-xs font-bold text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <FileUploader
                                        files={data.documents}
                                        onFilesChange={(newFiles) => setData('documents', newFiles)}
                                        error={errors.documents}
                                        maxFiles={5}
                                        label="Supporting Documents"
                                        description="Attach photos of Valid ID, Certificate of Indigency, or relevant medical records."
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* --- ACTIONS FOOTER (Side-by-Side Mobile) --- */}
                <div className="shrink-0 border-t border-border bg-muted/20 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="mx-auto flex w-full max-w-5xl flex-row gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 flex-1 rounded-xl border-border text-[11px] font-bold tracking-wider uppercase shadow-sm transition-all hover:bg-muted sm:h-12 sm:text-xs"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="h-11 flex-1 rounded-xl bg-primary text-[11px] font-black tracking-widest text-primary-foreground uppercase shadow-lg transition-all hover:opacity-90 active:scale-[0.98] sm:h-12 sm:text-xs"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent sm:h-4 sm:w-4"></span>
                                    <span className="xs:inline hidden">Processing...</span>
                                    <span className="xs:hidden inline">...</span>
                                </span>
                            ) : (
                                'Submit Request'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>

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
        </Dialog>
    );
}

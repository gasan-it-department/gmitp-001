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
import { ShieldCheck } from "lucide-react";

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

    const handleTextChange = (field: keyof ActionCenterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(field as any, e.target.value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="flex h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-background p-0 sm:h-auto sm:max-h-[90vh] sm:w-[1100px] sm:max-w-none sm:rounded-2xl sm:border border-border shadow-2xl"
            >
                {/* --- HEADER SECTION (Solid Brand Color) --- */}
                <div className="shrink-0 bg-primary px-6 py-6 sm:rounded-t-xl border-b border-primary-foreground/10">
                    <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 shadow-inner backdrop-blur-sm">
                            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-primary-foreground">
                                Assistance Request Form
                            </DialogTitle>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60 mt-0.5">
                                Gasan Social Welfare Services
                            </p>
                        </div>
                    </DialogHeader>
                </div>

                {/* --- SCROLLABLE CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-primary/20">
                    <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl mx-auto">
                        
                        {/* I. PERSONAL INFORMATION */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">
                                    I. Personal Information
                                </h3>
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
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">
                                    II. Address Details
                                </h3>
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
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">
                                    III. Request Specifications
                                </h3>
                                <div className="h-[1px] flex-1 bg-border" />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Type of Assistance</Label>
                                    <AssistanceOptions value={data.assistance_type} onChange={(val) => setData('assistance_type', val)} />
                                    {errors.assistance_type && <p className="text-xs font-bold text-destructive mt-1">{errors.assistance_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Description / Reason *</Label>
                                    <Textarea
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Explain the reason for your request..."
                                        className={`rounded-xl border-border bg-muted/30 focus:ring-primary ${errors.description ? 'border-destructive focus:ring-destructive' : ''}`}
                                    />
                                    {errors.description && <p className="text-xs font-bold text-destructive animate-pulse mt-1">{errors.description}</p>}
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
                    <div className="flex flex-row gap-3 max-w-5xl mx-auto w-full">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-11 sm:h-12 rounded-xl font-bold uppercase tracking-wider border-border hover:bg-muted text-[11px] sm:text-xs shadow-sm transition-all"
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
                            className="flex-1 h-11 sm:h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg hover:opacity-90 active:scale-[0.98] text-[11px] sm:text-xs transition-all"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                                    <span className="hidden xs:inline">Processing...</span>
                                    <span className="inline xs:hidden">...</span>
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcurementsApi } from '@/Core/Api/PublicInformation/ProcureMentApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Link } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';
import { AlertTriangle, ArrowLeft, DollarSign, FileText, Hash, Paperclip, Save, Tag, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, FieldErrors, useForm, UseFormRegister } from 'react-hook-form';
import { toast } from 'sonner';

// --- CONSTANTS ---
const MAX_FILES = 5;
const MAX_TOTAL_SIZE_MB = 50;

const PROCUREMENT_CATEGORIES = ['Goods', 'Infrastructure', 'Consulting Services'];
const STATUS_OPTIONS = ['OPEN', 'CLOSED', 'AWARDED', 'FAILED'];
const DOCUMENT_TYPES = [
    { label: 'Invitation to Bid / REI', value: 'INVITATION' },
    { label: 'Bidding Documents', value: 'BID_DOCS' },
    { label: 'Bid Bulletin', value: 'BULLETIN' },
    { label: 'Notice of Award', value: 'NOTICE_OF_AWARD' },
    { label: 'Contract', value: 'CONTRACT' },
    { label: 'Notice to Proceed', value: 'NOTICE_TO_PROCEED' },
    { label: 'Others', value: 'OTHERS' },
];

export interface ProcurementFormData {
    reference_number: string;
    title: string;
    category: string;
    status: string;
    approved_budget: number;
    contract_amount?: number | null;
    pre_bid_date?: string | null;
    closing_date?: string | null;
    award_date?: string | null;
    winning_bidder?: string | null;
}

// --- HELPER COMPONENT ---
function FormField({
    label,
    id,
    name,
    register,
    requiredMsg,
    type = 'text',
    placeholder,
    errors,
    icon: Icon,
    required = false,
}: {
    label: string;
    id: string;
    name: keyof ProcurementFormData;
    register: UseFormRegister<ProcurementFormData>;
    requiredMsg?: string;
    type?: string;
    placeholder?: string;
    errors: FieldErrors<ProcurementFormData>;
    icon?: React.ElementType;
    required?: boolean;
}) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
                {Icon && <Icon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />}
                <Input
                    id={id}
                    type={type}
                    step={type === 'number' ? '0.01' : undefined}
                    autoComplete="off"
                    placeholder={placeholder}
                    {...register(name, requiredMsg ? { required: requiredMsg } : {})}
                    className={`rounded-md border bg-white font-medium text-gray-800 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:bg-neutral-900 pl-${Icon ? '10' : '3'} ${errors[name] ? 'border-red-500 ring-red-100' : 'border-gray-300 dark:border-neutral-700'} `}
                />
            </div>
            {errors[name] && <p className="mt-1 text-sm font-medium text-red-600">{errors[name]?.message}</p>}
        </div>
    );
}

interface Props {
    editData?: ProcurementFormData | null;
}

export default function ProcurementForm({ editData }: Props) {
    const { currentMunicipality } = useMunicipality();

    const [stagedFiles, setStagedFiles] = useState<{ file: File; type: string }[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProcurementFormData>({
        defaultValues: editData || {
            reference_number: '',
            title: '',
            category: 'Infrastructure',
            status: 'OPEN',
            approved_budget: 0,
            contract_amount: null,
            winning_bidder: '',
        },
    });

    const currentStatus = watch('status');

    // --- FILE HANDLING ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        const selected = e.target.files;
        if (!selected) return;

        let newItems = Array.from(selected).map((file) => ({ file, type: 'INVITATION' }));

        if (stagedFiles.length + newItems.length > MAX_FILES) {
            setFileError(`You can upload up to ${MAX_FILES} files.`);
            newItems = newItems.slice(0, MAX_FILES - stagedFiles.length);
        }

        const totalSize = [...stagedFiles, ...newItems].reduce((acc, item) => acc + item.file.size / 1024 / 1024, 0);
        if (totalSize > MAX_TOTAL_SIZE_MB) {
            setFileError(`Total size limit (${MAX_TOTAL_SIZE_MB}MB) exceeded.`);
            return;
        }

        setStagedFiles((prev) => [...prev, ...newItems]);
        e.target.value = '';
    };

    const updateFileType = (index: number, newType: string) => {
        setStagedFiles((prev) => prev.map((item, i) => (i === index ? { ...item, type: newType } : item)));
    };

    const removeFile = (index: number) => {
        setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ProcurementFormData) => {
        try {
            // 1. Create a FormData instance
            const formData = new FormData();

            // 2. Append all text fields
            (Object.keys(data) as Array<keyof ProcurementFormData>).forEach((key) => {
                const value = data[key];
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, value.toString());
                }
            });

            // 3. Append Files and Types as separate Parallel Arrays
            // This matches your backend rules: 'files' => array, 'file_types' => array
            stagedFiles.forEach((item, index) => {
                formData.append(`files[${index}]`, item.file);
                formData.append(`file_types[${index}]`, item.type);
            });

            // 4. Send the Request
            await ProcurementsApi.store(currentMunicipality.slug, formData);

            toast.success('Procurement record saved successfully');

            // Optional: reset form
            // reset();
            // setStagedFiles([]);
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Failed to save record');
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        }
    };
    return (
        <>
            {/* --- TOP HEADER (Sticky) --- */}
            <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleBack} className="rounded-full bg-white p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editData ? 'Edit Procurement Record' : 'Create New Procurement'}
                            </h1>
                            <p className="text-sm text-gray-500">Fill in the details below to publish a new bid.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={`/admin/${currentMunicipality.slug}/procurements`}>
                            <Button variant="outline" type="button" disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="gap-2 bg-orange-600 text-white hover:bg-orange-700"
                        >
                            {isSubmitting ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Save className="h-4 w-4" /> Save Record
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT LAYOUT --- */}
            <div className="mx-auto mt-8 max-w-7xl px-6 pb-20">
                <form className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* LEFT COLUMN: FORM INPUTS */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* IDENTITY */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Project Details</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField
                                        label="Reference Number"
                                        id="reference_number"
                                        name="reference_number"
                                        register={register}
                                        placeholder="e.g. INFRA-2025-001"
                                        errors={errors}
                                        icon={Hash}
                                        required
                                        requiredMsg="Ref # required"
                                    />
                                    <FormField
                                        label="Project Title"
                                        id="title"
                                        name="title"
                                        register={register}
                                        placeholder="Project description..."
                                        errors={errors}
                                        icon={Tag}
                                        required
                                        requiredMsg="Title required"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</Label>
                                        <Controller
                                            name="category"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-white dark:bg-neutral-900">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PROCUREMENT_CATEGORIES.map((c) => (
                                                            <SelectItem key={c} value={c}>
                                                                {c}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</Label>
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-white dark:bg-neutral-900">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map((s) => (
                                                            <SelectItem key={s} value={s}>
                                                                {s}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BUDGET & DATES */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                <DollarSign className="h-5 w-5 text-orange-500" />
                                Budget & Schedule
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField
                                    label="Approved Budget (ABC)"
                                    id="approved_budget"
                                    name="approved_budget"
                                    type="number"
                                    register={register}
                                    required
                                    requiredMsg="ABC required"
                                    errors={errors}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        label="Pre-Bid Date"
                                        id="pre_bid_date"
                                        name="pre_bid_date"
                                        type="date" // CHANGED FROM datetime-local
                                        register={register}
                                        errors={errors}
                                    />
                                    <FormField
                                        label="Closing Date"
                                        id="closing_date"
                                        name="closing_date"
                                        type="date" // CHANGED FROM datetime-local
                                        register={register}
                                        errors={errors}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* AWARDS (CONDITIONAL) */}
                        {(currentStatus === 'AWARDED' || currentStatus === 'CLOSED') && (
                            <div className="rounded-xl border border-green-200 bg-green-50/50 p-6 shadow-sm dark:border-green-900/30 dark:bg-green-900/10">
                                <h2 className="mb-4 text-lg font-semibold text-green-800 dark:text-green-400">Award Information</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField
                                        label="Winning Bidder"
                                        id="winning_bidder"
                                        name="winning_bidder"
                                        register={register}
                                        errors={errors}
                                        placeholder="Company Name"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            label="Contract Amount"
                                            id="contract_amount"
                                            name="contract_amount"
                                            type="number"
                                            register={register}
                                            errors={errors}
                                        />
                                        <FormField
                                            label="Date Awarded"
                                            id="award_date"
                                            name="award_date"
                                            type="date" // CHANGED FROM datetime-local
                                            register={register}
                                            errors={errors}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: FILE MANAGER */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Attachments</h3>
                                <p className="text-sm text-gray-500">Upload PDF documents related to this bid.</p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-auto w-full flex-col gap-2 border-2 border-dashed py-6 text-gray-500 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-neutral-800"
                                    onClick={() => document.getElementById('procurement_files')?.click()}
                                    disabled={stagedFiles.length >= MAX_FILES}
                                >
                                    <Upload className="h-6 w-6" />
                                    <span className="text-sm font-medium">Click to Upload PDF</span>
                                </Button>
                                <input
                                    id="procurement_files"
                                    type="file"
                                    multiple
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {fileError && (
                                    <div className="flex items-center gap-2 rounded bg-red-50 p-2 text-sm text-red-600">
                                        <AlertTriangle className="h-4 w-4" /> {fileError}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {stagedFiles.length === 0 && (
                                    <div className="py-8 text-center">
                                        <Paperclip className="mx-auto h-10 w-10 text-gray-300" />
                                        <p className="mt-2 text-sm text-gray-400">No files selected</p>
                                    </div>
                                )}

                                {stagedFiles.map((item, index) => (
                                    <div
                                        key={index}
                                        className="relative rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all dark:border-neutral-800 dark:bg-neutral-800"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileText className="h-8 w-8 shrink-0 text-red-500" />
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className="truncate text-sm font-medium text-gray-700 dark:text-gray-200"
                                                        title={item.file.name}
                                                    >
                                                        {item.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-3">
                                            <Select value={item.type} onValueChange={(val) => updateFileType(index, val)}>
                                                <SelectTrigger className="h-7 w-full border-gray-200 bg-white text-xs dark:border-neutral-700 dark:bg-neutral-900">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DOCUMENT_TYPES.map((t) => (
                                                        <SelectItem key={t.value} value={t.value} className="text-xs">
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 text-center text-xs text-gray-400">
                                {stagedFiles.length}/{MAX_FILES} files attached
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

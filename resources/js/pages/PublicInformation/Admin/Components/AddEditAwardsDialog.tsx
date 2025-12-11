import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcurementsApi } from '@/Core/Api/PublicInformation/ProcureMentApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Label } from '@radix-ui/react-label';
import { AlertTriangle, Calendar, CheckCircle2, DollarSign, FileText, Hash, Tag, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, FieldErrors, useForm, UseFormRegister } from 'react-hook-form';

const MAX_FILES = 5;
const MAX_TOTAL_SIZE_MB = 50;

// --- CONSTANTS ---
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
    file_attachments?: { file: File; type: string }[];
}

interface Props {
    isOpen: boolean;
    editData?: ProcurementFormData | null;
    onClose: () => void;
    onSuccess: (formData: FormData) => void;
}

// --- HELPER: Friendlier Form Field ---
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
    helperText,
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
    helperText?: string;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            </div>

            <div className="group relative">
                {Icon && (
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-orange-500">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <Input
                    id={id}
                    type={type}
                    step={type === 'number' ? '0.01' : undefined}
                    autoComplete="off"
                    placeholder={placeholder}
                    {...register(name, requiredMsg ? { required: requiredMsg } : {})}
                    className={`h-11 rounded-lg border bg-white text-gray-900 shadow-sm transition-all dark:bg-neutral-900 dark:text-gray-100 ${Icon ? 'pl-10' : 'pl-3'} ${
                        errors[name]
                            ? 'border-red-300 ring-4 ring-red-50 focus:border-red-500 focus:ring-red-100 dark:border-red-800 dark:ring-red-900/20'
                            : 'border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:border-neutral-700 dark:hover:border-neutral-600 dark:focus:ring-neutral-800'
                    } `}
                />
            </div>

            {helperText && !errors[name] && <p className="ml-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}

            {errors[name] && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 animate-in slide-in-from-top-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors[name]?.message}
                </p>
            )}
        </div>
    );
}

export default function ProcurementFormDialog({ isOpen, editData, onClose, onSuccess }: Props) {
    const [stagedFiles, setStagedFiles] = useState<{ file: File; type: string }[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { currentMunicipality } = useMunicipality();

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

    // --- DRAG & DROP + FILE LOGIC ---
    const processFiles = (fileList: FileList | null) => {
        setFileError(null);
        if (!fileList) return;

        let newItems = Array.from(fileList)
            .filter((f) => f.type === 'application/pdf') // Strict PDF check
            .map((file) => ({ file, type: 'DOCUMENT' }));

        if (newItems.length < fileList.length) {
            setFileError('Some files were skipped. Only PDF files are allowed.');
        }

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
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const updateFileType = (index: number, newType: string) => {
        setStagedFiles((prev) => prev.map((item, i) => (i === index ? { ...item, type: newType } : item)));
    };

    const removeFile = (index: number) => {
        setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // --- SUBMISSION (FIXED LOGIC) ---
    const onSubmit = async (data: ProcurementFormData) => {
        const formData = new FormData();

        // 1. Text Data
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof ProcurementFormData];
            if (value !== null && value !== undefined && key !== 'file_attachments') {
                formData.append(key, value.toString());
            }
        });

        // 2. File Data
        stagedFiles.forEach((item, index) => {
            formData.append(`files[${index}]`, item.file);
            formData.append(`file_types[${index}]`, item.type);
        });

        try {
            const response = await ProcurementsApi.store(currentMunicipality.slug, formData);
            onSuccess(response);
        } catch (error) {
            console.error('Upload failed', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal>
            <DialogContent
                showCloseButton
                onInteractOutside={(e) => e.preventDefault()}
                className="flex max-h-[90vh] w-full max-w-[850px] flex-col gap-0 overflow-hidden rounded-2xl border-none bg-white p-0 shadow-2xl sm:m-auto dark:bg-neutral-950"
            >
                {/* Header */}
                <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6 dark:border-neutral-800 dark:bg-neutral-900/50">
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {editData ? 'Edit Procurement' : 'Create Procurement'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Fill in the details below to publish a new government transparency record.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* --- GROUP 1: ESSENTIAL INFO --- */}
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
                                requiredMsg="Required for tracking"
                            />
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Category</Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="h-11 border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
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

                            <div className="md:col-span-2">
                                <FormField
                                    label="Project Title"
                                    id="title"
                                    name="title"
                                    register={register}
                                    placeholder="e.g. Construction of Multi-Purpose Hall..."
                                    errors={errors}
                                    icon={Tag}
                                    required
                                    requiredMsg="Project title is required"
                                />
                            </div>
                        </div>

                        {/* --- GROUP 2: STATUS & BUDGET --- */}
                        <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/30">
                            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                <DollarSign className="h-4 w-4" /> Financials & Timeline
                            </h4>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Status</Label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger
                                                    className={`h-11 font-medium ${
                                                        field.value === 'OPEN'
                                                            ? 'border-blue-200 bg-blue-50 text-blue-600'
                                                            : field.value === 'AWARDED'
                                                              ? 'border-green-200 bg-green-50 text-green-600'
                                                              : 'bg-white'
                                                    }`}
                                                >
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

                                <FormField
                                    label="Approved Budget (ABC)"
                                    id="approved_budget"
                                    name="approved_budget"
                                    type="number"
                                    register={register}
                                    required
                                    requiredMsg="Required"
                                    errors={errors}
                                    helperText="Total allocated budget"
                                />

                                <FormField
                                    label="Closing Date"
                                    id="closing_date"
                                    name="closing_date"
                                    type="datetime-local"
                                    register={register}
                                    errors={errors}
                                    icon={Calendar}
                                />
                            </div>

                            {/* Extra Dates (Collapsible feel) */}
                            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField
                                    label="Pre-Bid Conference"
                                    id="pre_bid_date"
                                    name="pre_bid_date"
                                    type="datetime-local"
                                    register={register}
                                    errors={errors}
                                    icon={Calendar}
                                    helperText="Optional"
                                />
                            </div>
                        </div>

                        {/* --- GROUP 3: AWARD (Conditional) --- */}
                        {(currentStatus === 'AWARDED' || currentStatus === 'CLOSED') && (
                            <div className="relative overflow-hidden rounded-xl border border-green-200 bg-green-50/50 p-5 duration-300 animate-in fade-in slide-in-from-bottom-2 dark:border-green-900/30 dark:bg-green-950/20">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <CheckCircle2 className="h-24 w-24 text-green-600" />
                                </div>
                                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-green-700 uppercase dark:text-green-400">
                                    <Tag className="h-4 w-4" /> Winner Details
                                </h4>
                                <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div className="md:col-span-2">
                                        <FormField
                                            label="Winning Contractor / Bidder"
                                            id="winning_bidder"
                                            name="winning_bidder"
                                            register={register}
                                            errors={errors}
                                            placeholder="Official Company Name"
                                        />
                                    </div>
                                    <FormField
                                        label="Final Contract Amount"
                                        id="contract_amount"
                                        name="contract_amount"
                                        type="number"
                                        register={register}
                                        errors={errors}
                                    />
                                    <FormField
                                        label="Date of Award"
                                        id="award_date"
                                        name="award_date"
                                        type="datetime-local"
                                        register={register}
                                        errors={errors}
                                        icon={Calendar}
                                    />
                                </div>
                            </div>
                        )}

                        {/* --- GROUP 4: DRAG & DROP FILES --- */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold text-gray-900 dark:text-white">Documents</Label>
                                <span className="text-xs text-gray-500">
                                    {stagedFiles.length} / {MAX_FILES} attached
                                </span>
                            </div>

                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
                                    isDragging
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                                        : 'border-gray-200 hover:border-orange-400 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
                                } ${stagedFiles.length >= MAX_FILES ? 'pointer-events-none opacity-50' : ''} `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="mb-3 rounded-full bg-orange-100 p-3 dark:bg-neutral-800">
                                    <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Click to upload or drag and drop</p>
                                <p className="mt-1 text-xs text-gray-500">PDF files only (Max {MAX_TOTAL_SIZE_MB}MB total)</p>
                            </div>

                            {fileError && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
                                    <AlertTriangle className="h-4 w-4 shrink-0" /> {fileError}
                                </div>
                            )}

                            {/* File List */}
                            <div className="space-y-3">
                                {stagedFiles.map((item, index) => (
                                    <div
                                        key={index}
                                        className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{item.file.name}</p>
                                            <div className="mt-1 flex gap-2">
                                                <span className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                {/* Inline Type Selector */}
                                                <select
                                                    value={item.type}
                                                    onChange={(e) => updateFileType(index, e.target.value)}
                                                    className="h-auto w-auto rounded border-none bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-orange-500 dark:bg-neutral-800 dark:text-gray-300"
                                                >
                                                    {DOCUMENT_TYPES.map((t) => (
                                                        <option key={t.value} value={t.value}>
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(index);
                                            }}
                                            className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="min-w-[140px] bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:shadow-orange-600/30"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Upload className="h-4 w-4 animate-spin" /> Uploading...
                            </span>
                        ) : (
                            'Post Opportunity'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

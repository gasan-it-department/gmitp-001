import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useForm, Controller, UseFormRegister, FieldErrors } from "react-hook-form";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, AlertTriangle, FileText, DollarSign, Clock } from "lucide-react";
import { useState } from "react";

const MAX_FILES = 5;
const MAX_TOTAL_SIZE_MB = 50;

// --- CONSTANTS ---
const BID_TYPES = ['Goods', 'Infrastructure', 'Services', 'Consulting'];
const BID_STATUSES = ['Open', 'Evaluation', 'Awarded'];
// -------------------

// Mock Type Definition (Assuming File is included)
interface BiddingFormData {
    title: string;
    type: string; // New
    status: string; // New
    deadline: string; // Assuming format YYYY-MM-DD
    budget: number; // Assuming a number field for budget
    files?: File[];
}

interface Props {
    isOpen: boolean;
    editData?: BiddingFormData | null;
    onClose: () => void;
    onSuccess: (data: BiddingFormData, editMode: boolean) => void;
}

// --- HELPER COMPONENT: FormField (Themed) ---
function FormField({ label, id, name, register, requiredMsg, type = "text", placeholder, errors, icon: Icon }: {
    label: string; id: string; name: keyof BiddingFormData; register: UseFormRegister<BiddingFormData>;
    requiredMsg?: string; type?: string; placeholder?: string; errors: FieldErrors<BiddingFormData>;
    icon?: React.ElementType;
}) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id} className="text-sm font-semibold text-red-700 dark:text-orange-200">
                {label}
            </Label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                )}
                <Input
                    id={id}
                    type={type}
                    autoComplete="off"
                    placeholder={placeholder}
                    {...register(name, requiredMsg ? { required: requiredMsg } : {})}
                    className={`
                        rounded-md border font-medium text-gray-800 transition-colors bg-white dark:bg-neutral-900
                        focus:border-red-500 focus:ring-2 focus:ring-red-200 pl-${Icon ? '10' : '3'}
                        ${errors[name] ? "border-red-500 ring-red-100" : "border-gray-300 dark:border-neutral-700"}
                    `}
                />
            </div>
            {errors[name] && <p className="text-sm text-red-600 font-medium mt-1">{errors[name]?.message || "This field is required."}</p>}
        </div>
    );
}

// --- MAIN DIALOG COMPONENT ---

export default function AddEditBiddingDialog({ isOpen, editData, onClose, onSuccess }: Props) {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<BiddingFormData>({
        defaultValues: editData || {
            title: '',
            type: BID_TYPES[0],
            status: BID_STATUSES[0],
            deadline: '',
            budget: 0,
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        let newFiles = Array.from(selectedFiles);

        // Limit file count
        if (files.length + newFiles.length > MAX_FILES) {
            setError(`You can upload up to ${MAX_FILES} files.`);
            newFiles = newFiles.slice(0, MAX_FILES - files.length);
        }

        // Limit total size
        const totalSizeMB = [...files, ...newFiles].reduce((acc, f) => acc + f.size / 1024 / 1024, 0);
        if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
            setError(`Total file size cannot exceed ${MAX_TOTAL_SIZE_MB} MB.`);
            return;
        }

        setFiles((prev) => [...prev, ...newFiles]);
        e.target.value = ""; // reset input
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFormSubmit = (data: BiddingFormData) => {
        // NOTE: In a real application, you would handle file upload (e.g., to Cloudinary) 
        // and replace the 'files' array with the resulting URLs before calling onSuccess.
        // For now, we attach the File objects directly.
        data.files = files;
        onSuccess(data, !!editData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal>
            <DialogContent
                showCloseButton
                onInteractOutside={(e) => e.preventDefault()}
                className="m-0 flex w-full max-w-[800px] flex-col rounded-2xl bg-gradient-to-b from-white via-orange-50 to-rose-50 p-6 shadow-xl sm:m-auto"
            >
                <DialogHeader className="border-b border-orange-100 pb-3 flex-shrink-0 text-center">
                    <DialogTitle className="text-2xl font-extrabold text-red-800 dark:text-gray-100">
                        {editData ? "Edit Procurement Record" : "Add New Procurement Bid"}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fill in the details of the procurement project, including title, type, deadline, and budget.
                    </p>
                </DialogHeader>

                <div className="overflow-y-auto mt-3">
                    {/* Wrap the form in the scrollable div */}
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-6">

                        {/* -------------------- ROW 1: TITLE -------------------- */}
                        <FormField
                            label="Project Title *"
                            id="title"
                            name="title"
                            register={register}
                            requiredMsg="Project Title is required"
                            errors={errors}
                        />

                        {/* -------------------- ROW 2: TYPE & STATUS -------------------- */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                            {/* Dropdown 1: Procurement Type */}
                            <div className="space-y-1">
                                <Label htmlFor="type" className="text-sm font-semibold text-red-700 dark:text-orange-200">
                                    Procurement Type *
                                </Label>
                                <Controller
                                    name="type"
                                    control={control}
                                    rules={{ required: "Type is required" }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger
                                                id="type"
                                                className={`rounded-md border font-medium transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200 ${errors.type ? "border-red-500 ring-red-100" : "border-gray-300 dark:border-neutral-700"
                                                    }`}
                                            >
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-neutral-800">
                                                {BID_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.type && <p className="text-sm text-red-600 font-medium mt-1">{errors.type.message}</p>}
                            </div>

                            {/* Dropdown 2: Status */}
                            <div className="space-y-1">
                                <Label htmlFor="status" className="text-sm font-semibold text-red-700 dark:text-orange-200">
                                    Current Status *
                                </Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    rules={{ required: "Status is required" }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger
                                                id="status"
                                                className={`rounded-md border font-medium transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200 ${errors.status ? "border-red-500 ring-red-100" : "border-gray-300 dark:border-neutral-700"
                                                    }`}
                                            >
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-neutral-800">
                                                {BID_STATUSES.map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.status && <p className="text-sm text-red-600 font-medium mt-1">{errors.status.message}</p>}
                            </div>
                        </div>

                        {/* -------------------- ROW 3: DEADLINE & BUDGET -------------------- */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                            {/* Deadline */}
                            <FormField
                                label="Bidding Deadline *"
                                id="deadline"
                                name="deadline"
                                register={register}
                                requiredMsg="Deadline is required"
                                errors={errors}
                                type="date"
                            />

                            {/* Budget */}
                            <FormField
                                label="Approved Budget (₱)*"
                                id="budget"
                                name="budget"
                                register={register}
                                requiredMsg="Budget is required"
                                errors={errors}
                                type="number"
                                placeholder="e.g., ₱5000000"
                            />
                        </div>


                        {/* -------------------- FILE UPLOAD -------------------- */}
                        <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm space-y-3">
                            <Label className="font-semibold text-red-700 dark:text-orange-200">Upload PDF Files</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Upload up to <b>{MAX_FILES}</b> files, total size must not exceed <b>{MAX_TOTAL_SIZE_MB} MB</b>.
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('evidence')?.click()}
                                className="border-red-400 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-orange-300 dark:hover:bg-neutral-800"
                                disabled={files.length >= MAX_FILES}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {files.length >= MAX_FILES ? 'Max Files Reached' : 'Choose Files (PDF Only)'}
                            </Button>

                            <input
                                id="evidence"
                                type="file"
                                multiple
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {error && (
                                <div className="flex items-center gap-2 rounded-md bg-red-100 p-2 text-sm text-red-700 border border-red-300 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-2 bg-orange-50/70 dark:bg-neutral-800/80 px-3 py-2 text-sm border border-orange-200/70 dark:border-orange-900 rounded-md shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <FileText className="h-4 w-4 text-red-600 dark:text-orange-400" />
                                                <span className="truncate max-w-[140px] sm:max-w-[200px] text-gray-800 dark:text-gray-200 font-medium">{file.name}</span>
                                                <span className="text-xs text-gray-500 whitespace-nowrap dark:text-gray-400">
                                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-6 w-6 p-0 text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filler space to ensure scrolling works well */}
                        <div className="h-4"></div>
                    </form>
                </div>

                {/* Footer Buttons (fixed position in scrollable dialog) */}
                <div className="flex w-full gap-4 border-t border-orange-100 pt-4 sm:justify-end flex-shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 sm:flex-none dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        // Use button inside form scrollable area for submission
                        onClick={handleSubmit(handleFormSubmit)}
                        className="flex-1 rounded-md bg-gradient-to-r from-orange-500 to-red-500 font-medium text-white shadow-md hover:from-orange-600 hover:to-red-600 sm:flex-none"
                    >
                        {isSubmitting ? "Processing..." : editData ? "Update Record" : "Add Record"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// NOTE: FormField helper moved inside the main component file.
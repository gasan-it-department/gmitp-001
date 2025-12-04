import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useForm, Controller, UseFormRegister, FieldErrors } from "react-hook-form";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, AlertTriangle, FileText, DollarSign, Clock, Briefcase, BookOpen, Tag } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

const MAX_FILES = 5;
const MAX_TOTAL_SIZE_MB = 50;

// Mock Type Definition for Citizen Charter Service Data
interface CharterFormData {
    name: string; // Service Name
    office: string; // Responsible Office
    time: string; // Processing Time
    fee: string; // Fee / Cost
    files?: File[]; // Requirements/Documents
}

interface Props {
    isOpen: boolean;
    editData?: CharterFormData | null;
    onClose: () => void;
    onSuccess: (data: CharterFormData, editMode: boolean) => void;
}

// --- HELPER COMPONENT: FormField (Themed) ---
function FormField({ label, id, name, register, requiredMsg, type = "text", placeholder, errors, icon: Icon }: {
    label: string; id: string; name: keyof CharterFormData; register: UseFormRegister<CharterFormData>;
    requiredMsg?: string; type?: string; placeholder?: string; errors: FieldErrors<CharterFormData>;
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

export default function AddEditCitizenCharterDialog({ isOpen, editData, onClose, onSuccess }: Props) {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CharterFormData>({
        defaultValues: editData || {
            name: '',
            office: '',
            time: '1 day',
            fee: 'Varies',
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

    const handleFormSubmit = (data: CharterFormData) => {
        // Attach files (requirements documents) for processing
        data.files = files;
        onSuccess(data, !!editData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal>
            <DialogContent
                showCloseButton
                onInteractOutside={(e) => e.preventDefault()}
                className="m-0 flex w-full max-w-[800px] flex-col rounded-2xl bg-gradient-to-b from-white via-orange-50 to-rose-50 p-6 shadow-xl sm:m-auto dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950"
            >
                <DialogHeader className="border-b border-orange-100 pb-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-red-600 dark:text-orange-400" />
                        <DialogTitle className="text-2xl font-extrabold text-red-800 dark:text-gray-100">
                            {editData ? "Edit Charter Service" : "Add New Charter Service"}
                        </DialogTitle>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Define a service, including the responsible office, processing time, and associated fees.
                    </p>
                </DialogHeader>

                <div className="overflow-y-auto mt-3">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-6">

                        {/* --- SERVICE NAME --- */}
                        <h4 className="text-lg font-bold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-neutral-800 pb-2 mb-4">
                            Service & Office
                        </h4>

                        {/* -------------------- ROW 1: SERVICE NAME -------------------- */}
                        <FormField
                            label="Service Name *"
                            id="name"
                            name="name"
                            register={register}
                            requiredMsg="Service Name is required"
                            errors={errors}
                            icon={FileText}
                            placeholder="e.g., Business Permit Application"
                        />

                        {/* -------------------- ROW 2: RESPONSIBLE OFFICE -------------------- */}
                        <FormField
                            label="Responsible Office *"
                            id="office"
                            name="office"
                            register={register}
                            requiredMsg="Responsible Office is required"
                            errors={errors}
                            icon={Briefcase}
                            placeholder="e.g., Business Permits & Licensing Office"
                        />

                        {/* --- TIME & FEE --- */}
                        <h4 className="text-lg font-bold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-neutral-800 pb-2 mb-4 pt-4">
                            Details
                        </h4>

                        {/* -------------------- ROW 3: TIME & FEE -------------------- */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                            {/* Processing Time */}
                            <FormField
                                label="Processing Time *"
                                id="time"
                                name="time"
                                register={register}
                                requiredMsg="Processing time is required"
                                errors={errors}
                                type="text"
                                placeholder="e.g., 3-5 working days"
                                icon={Clock}
                            />

                            {/* Fee / Cost */}
                            <FormField
                                label="Fee / Cost *"
                                id="fee"
                                name="fee"
                                register={register}
                                requiredMsg="Fee/Cost is required"
                                errors={errors}
                                type="text"
                                placeholder="e.g., ₱500 or Varies"
                                icon={DollarSign}
                            />
                        </div>


                        {/* -------------------- FILE UPLOAD (Requirements, Procedures) -------------------- */}
                        <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm space-y-3 dark:bg-neutral-800 dark:border-neutral-700">
                            <Label className="font-semibold text-red-700 dark:text-orange-200">Upload Requirements Documents (PDF)</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Upload specific requirements or procedural guides (up to <b>{MAX_FILES}</b> files, max <b>{MAX_TOTAL_SIZE_MB} MB</b>).
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('requirements_documents')?.click()}
                                className="border-red-400 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-orange-300 dark:hover:bg-neutral-700/60"
                                disabled={files.length >= MAX_FILES}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {files.length >= MAX_FILES ? 'Max Files Reached' : 'Choose Documents (PDF Only)'}
                            </Button>

                            <input
                                id="requirements_documents"
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
                                <Card className="p-3 bg-gray-50 dark:bg-neutral-700 shadow-inner space-y-2 border-dashed border-gray-300 dark:border-neutral-600">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-2 bg-white dark:bg-neutral-800 px-3 py-2 text-sm border border-gray-200 dark:border-neutral-600 rounded-md shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Tag className="h-4 w-4 text-red-600 dark:text-orange-400 flex-shrink-0" />
                                                <span className="truncate text-gray-800 dark:text-gray-200 font-medium max-w-[200px] sm:max-w-none">{file.name}</span>
                                                <span className="text-xs text-gray-500 whitespace-nowrap dark:text-gray-400 flex-shrink-0">
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
                                </Card>
                            )}
                        </div>

                        {/* Filler space to ensure scrolling works well */}
                        <div className="h-4"></div>
                    </form>
                </div>

                {/* Footer Buttons (fixed position in scrollable dialog) */}
                <div className="flex w-full gap-4 border-t border-orange-100 pt-4 sm:justify-end flex-shrink-0 dark:border-neutral-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 sm:flex-none dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-700/60"
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
                        {isSubmitting ? "Processing..." : editData ? "Update Service" : "Add Service"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
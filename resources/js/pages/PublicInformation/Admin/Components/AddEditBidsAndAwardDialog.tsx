import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { BidsAndAwardsFormData } from "@/Core/Types/PublicInformation/PublicInformationTypes";
import { useForm, Controller } from "react-hook-form";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, AlertTriangle } from "lucide-react";
import { useState } from "react";

const MAX_FILES = 5;
const MAX_TOTAL_SIZE_MB = 50;

interface Props {
    isOpen: boolean;
    editData?: BidsAndAwardsFormData | null;
    onClose: () => void;
    onSuccess: (data: BidsAndAwardsFormData, editMode: boolean) => void;
}

export default function AddEditBidsAndAwardsDialog({ isOpen, editData, onClose, onSuccess }: Props) {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<BidsAndAwardsFormData>({
        defaultValues: editData || {},
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

    const handleFormSubmit = (data: BidsAndAwardsFormData) => {
        data.files = files;
        onSuccess(data, !!editData);
    };

    // Example years: current year ±5
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal>
            <DialogContent
                showCloseButton
                onInteractOutside={(e) => e.preventDefault()}
                className="m-0 flex w-full max-w-[800px] flex-col rounded-2xl bg-gradient-to-b from-white via-orange-50 to-rose-50 p-6 shadow-xl sm:m-auto"
            >
                <DialogHeader className="border-b border-orange-100 pb-3 flex-shrink-0 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        {editData ? "Edit" : "Add New"}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        Fill in the details of the procurement project, including title, type, deadline, and budget.
                    </p>
                </DialogHeader>

                <div className="overflow-y-auto mt-3">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-24">
                        <div className="space-y-4">
                            {/* Text Fields */}
                            <FormField
                                label="Title *"
                                id="title"
                                name="title"
                                register={register}
                                requiredMsg="Title is required"
                                errors={errors}
                            />
                            <FormField
                                label="Description *"
                                id="description"
                                name="description"
                                register={register}
                                requiredMsg="Description is required"
                                errors={errors}
                            />
                            <FormField
                                label="Deadline *"
                                id="deadline"
                                name="deadline"
                                register={register}
                                requiredMsg="Deadline is required"
                                type="date"
                                errors={errors}
                            />

                            {/* Year dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="year" className="text-sm font-semibold text-gray-700">
                                    Year *
                                </Label>
                                <Controller
                                    name="year"
                                    control={control}
                                    rules={{ required: "Please select a year" }}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger
                                                className={`w-full rounded-md border font-medium text-gray-600 transition-colors ${errors.year ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            >
                                                <SelectValue placeholder="Select a year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y} value={y.toString()}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.year && <p className="text-sm text-red-600">{errors.year.message}</p>}
                            </div>

                            {/* File Upload */}
                            <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm space-y-3">
                                <Label className="font-semibold text-gray-800">Upload PDF Files</Label>
                                <p className="text-sm text-gray-600">
                                    Upload up to <b>{MAX_FILES}</b> files, total size must not exceed <b>{MAX_TOTAL_SIZE_MB} MB</b>.
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('evidence')?.click()}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                    disabled={files.length >= MAX_FILES}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {files.length >= MAX_FILES ? 'Max Files Reached' : 'Choose Files'}
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
                                    <div className="flex items-center gap-2 rounded-md bg-red-100 p-2 text-sm text-red-600 border border-red-300">
                                        <AlertTriangle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between gap-2 bg-orange-50 px-3 py-2 text-sm border border-orange-200 rounded-md"
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <Upload className="h-4 w-4 text-orange-600" />
                                                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{file.name}</span>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-500 flex-shrink-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="flex w-full gap-4 border-t border-orange-100 pt-4 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 sm:flex-none"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-md bg-gradient-to-r from-orange-500 to-red-500 font-medium text-white shadow-md sm:flex-none"
                        onClick={handleSubmit(handleFormSubmit)}
                    >
                        {isSubmitting ? "Submitting..." : editData ? "Update Record" : "Add Record"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function FormField({ label, id, name, register, requiredMsg, type = "text", placeholder, errors }: any) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id} className="text-sm font-semibold text-gray-700">
                {label}
            </Label>
            <Input
                id={id}
                type={type}
                autoComplete="off"
                placeholder={placeholder}
                {...register(name, requiredMsg ? { required: requiredMsg } : {})}
                className={`rounded-md border font-medium text-gray-600 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200 ${errors[name] ? "border-red-500" : "border-gray-300"
                    }`}
            />
            {errors[name] && <p className="text-sm text-red-600">{errors[name].message}</p>}
        </div>
    );
}

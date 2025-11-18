import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FeedbackApi } from '@/Core/Api/Feedback/FeedbackApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, FileIcon, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import StarRating from './StarRatingBar';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FeedbackFormValues {
    feedback_target: 'employee' | 'department';
    department_id?: string;
    employee_name: string;
    feedback_message: string;
    sender_name?: string;
    rating?: number;
}

type DepartmentsData = {
    id: number;
    name: string;
};

export function FeedbackFormDialog({ open, onOpenChange }: FeedbackDialogProps) {
    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm<FeedbackFormValues>({
        defaultValues: {
            feedback_target: 'employee',
            department_id: '',
            employee_name: '',
            feedback_message: '',
            sender_name: '',
            rating: 5,
        },
        mode: 'onSubmit',
    });

    const { currentMunicipality } = useMunicipality();

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const feedback_target = watch('feedback_target');
    const department_id = watch('department_id');

    const dummy_departments: DepartmentsData[] = [
        { id: 1, name: 'Office of the Mayor' },
        { id: 2, name: 'Office of the Vice Mayor' },
        { id: 3, name: 'Business Permits and Licensing Office (BPLO)' },
        { id: 4, name: 'City Planning and Development Office (CPDO)' },
        { id: 5, name: 'Engineering Office' },
    ];

    const MAX_FILES = 5;
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

    // Reset fields and clear errors when switching feedback target
    useEffect(() => {
        setValue('employee_name', '');
        setValue('department_id', '');
        setValue('rating', feedback_target === 'department' ? 5 : undefined);
        clearErrors('employee_name');
        clearErrors('department_id');
    }, [feedback_target, setValue, clearErrors]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        const combined = [...files, ...newFiles].slice(0, MAX_FILES);

        const totalSize = combined.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            setError('Total file size exceeds 50MB limit.');
            return;
        }
        setError(null);
        setFiles(combined);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FeedbackFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Prepare payload based on feedback_target
            const payload: any = {
                feedback_target: data.feedback_target,
                feedback_message: data.feedback_message,
                sender_name: data.sender_name || null,
                feedback_files: files, // Axios will handle file conversion
            };

            // Include department_id and rating only if feedback is about department
            if (data.feedback_target === 'department') {
                payload.department_id = data.department_id;
                payload.rating = data.rating || null;
            } else {
                // Include employee_name only if feedback is about employee
                payload.employee_name = data.employee_name;
            }

            console.log('Payload:', payload);

            // Make API call to Laravel backend using axios
            const response = await FeedbackApi.storeFeedback(currentMunicipality.slug, payload);

            console.log('Feedback submitted successfully:', response.data);

            // Show success message
            setIsSubmitted(true);

            // Reset form after delay
            setTimeout(() => {
                setIsSubmitted(false);
                reset();
                setFiles([]);
                setError(null);
                onOpenChange(false);
            }, 3000);
        } catch (err) {
            console.error('Error submitting feedback:', err);
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.message || 'Failed to submit feedback. Please try again.';
                setError(errorMessage);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-h-[90vh] w-full overflow-y-auto p-0 sm:max-w-3xl rounded-2xl shadow-xl border border-red-200"
            >
                {/* HEADER */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-5 sm:px-8 rounded-t-2xl sticky top-0 z-50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">
                            Citizen Feedback Form
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-8">
                    {isSubmitted ? (
                        <Alert className="bg-green-100 border-green-300 animate-in fade-in slide-in-from-top-3 duration-300 rounded-xl">
                            <CheckCircle2 className="text-green-600 h-5 w-5" />
                            <AlertDescription className="text-green-700 font-medium">
                                Feedback submitted successfully! Thank you for helping us improve.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* SECTION CARD */}
                            <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm space-y-4">
                                <Label className="text-base font-semibold text-gray-800">
                                    Feedback About <span className="text-red-500">*</span>
                                </Label>

                                <Controller
                                    control={control}
                                    name="feedback_target"
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="flex gap-6 pt-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="employee" id="employee" />
                                                <Label htmlFor="employee" className="cursor-pointer">
                                                    Employee
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="department" id="department" />
                                                <Label htmlFor="department" className="cursor-pointer">
                                                    Office/Department
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {/* FULL NAME */}
                            <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm space-y-2">
                                <Label className="font-semibold text-gray-800">
                                    Your Full Name (Optional)
                                </Label>
                                <Input
                                    placeholder="Enter your full name"
                                    {...register('sender_name')}
                                    className="focus:ring-red-400"
                                />
                            </div>

                            {/* EMPLOYEE or DEPARTMENT FIELD */}
                            <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm space-y-2">
                                {feedback_target === 'department' ? (
                                    <>
                                        <Label className="font-semibold text-gray-800">
                                            Select Department <span className="text-red-500">*</span>
                                        </Label>

                                        <Controller
                                            control={control}
                                            name="department_id"
                                            rules={{ required: 'Department is required' }}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setValue('department_id', value);
                                                        clearErrors('department_id');
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        className={`w-full text-sm ${errors.department_id ? 'border-red-500' : ''
                                                            }`}
                                                    >
                                                        <SelectValue placeholder="-- Select Department --" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dummy_departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.department_id && (
                                            <p className="text-sm text-red-500">{errors.department_id.message}</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Label className="font-semibold text-gray-800">
                                            Employee Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            placeholder="Enter employee name"
                                            {...register('employee_name', {
                                                required: 'Employee name is required',
                                            })}
                                            className={errors.employee_name ? 'border-red-500' : ''}
                                        />
                                        {errors.employee_name && (
                                            <p className="text-sm text-red-500">
                                                {errors.employee_name.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* RATING */}
                            {feedback_target === 'department' && department_id && (
                                <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm">
                                    <Controller
                                        control={control}
                                        name="rating"
                                        render={({ field }) => (
                                            <StarRating value={field.value} onChange={field.onChange} />
                                        )}
                                    />
                                </div>
                            )}

                            {/* MESSAGE */}
                            <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm space-y-2">
                                <Label className="font-semibold text-gray-800">
                                    Feedback Message <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    rows={5}
                                    placeholder="Share your compliments, suggestions, or complaints..."
                                    {...register('feedback_message', { required: 'Feedback message is required' })}
                                    className={errors.feedback_message ? 'border-red-500' : ''}
                                />
                                {errors.feedback_message && (
                                    <p className="text-sm text-red-500">{errors.feedback_message.message}</p>
                                )}
                            </div>

                            {/* UPLOAD */}
                            <div className="rounded-xl bg-white border border-red-200/40 p-5 shadow-sm space-y-3">
                                <Label className="font-semibold text-gray-800">Upload Evidence (Optional)</Label>
                                <p className="text-sm text-gray-600">
                                    Upload up to <b>5 files</b>, total size must not exceed <b>50MB</b>.
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

                                <input id="evidence" type="file" multiple accept="image/*,video/*," onChange={handleFileChange} className="hidden" />

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
                                                className="flex items-center justify-between gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm border border-orange-200"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <FileIcon className="h-4 w-4 text-orange-600" />
                                                    <span className="truncate">{file.name}</span>
                                                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-row gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 rounded-xl"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );

}

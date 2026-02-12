import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FeedbackApi } from '@/Core/Api/Feedback/FeedbackApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import { dummy_departments } from '@/pages/Utility/Offices';
import axios from 'axios';
import { AlertTriangle, FileIcon, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import StarRating from './StarRatingBar';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusChange?: (status: 'success' | 'failed', message: string) => void;
}

interface FeedbackFormValues {
    feedback_target: 'employee' | 'department';
    department_id?: string;
    employee_name: string;
    feedback_message: string;
    sender_name?: string;
    rating?: number;
}

export function FeedbackFormDialog({ open, onOpenChange, onStatusChange }: FeedbackDialogProps) {
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
    const [isSubmitting, setIsSubmitting] = useState({
        isOpen: false,
        title: 'Loading...',
    });
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const feedback_target = watch('feedback_target');
    const department_id = watch('department_id');

    const MAX_FILES = 5;
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

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
        setIsSubmitting((prev) => ({
            ...prev,
            isOpen: true,
            title: 'Submitting...',
        }));
        setError(null);

        try {
            const payload: any = {
                feedback_target: data.feedback_target,
                feedback_message: data.feedback_message,
                sender_name: data.sender_name || null,
                feedback_files: files,
            };

            if (data.feedback_target === 'department') {
                payload.department_id = data.department_id;
                payload.rating = data.rating || null;
            } else {
                payload.employee_name = data.employee_name;
            }

            await FeedbackApi.storeFeedback(currentMunicipality.slug, payload);

            reset();
            setFiles([]);
            setError(null);
            onOpenChange(false);
            onStatusChange?.('success', 'Thank you for your feedback!');
        } catch (err) {
            console.error('Error submitting feedback:', err);
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.message || 'Failed to submit feedback. Please try again.';
                setError(errorMessage);
                onStatusChange?.('failed', errorMessage);
            } else {
                setError('An unexpected error occurred. Please try again.');
                onStatusChange?.('failed', 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting((prev) => ({
                ...prev,
                isOpen: false,
                title: 'Submitting...',
            }));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 bg-background p-0 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-xl sm:rounded-2xl sm:border sm:border-border lg:max-w-2xl"
            >
                {/* HEADER - Updated to Theme */}
                <div className="sticky top-0 z-50 border-b border-border bg-background px-6 py-5 sm:px-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground">Citizen Feedback Form</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="space-y-6 overflow-auto px-6 py-6 sm:px-8 sm:py-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* FEEDBACK TARGET */}
                        <div>
                            <Label className="text-base font-semibold text-foreground">
                                Feedback About <span className="text-destructive">*</span>
                            </Label>
                            <Controller
                                control={control}
                                name="feedback_target"
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="employee" id="employee" className="border-primary text-primary" />
                                            <Label htmlFor="employee" className="cursor-pointer text-foreground">
                                                Employee
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="department" id="department" className="border-primary text-primary" />
                                            <Label htmlFor="department" className="cursor-pointer text-foreground">
                                                Office/Department
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        {/* FULL NAME */}
                        <div>
                            <Label className="font-semibold text-foreground">Your Full Name (Optional)</Label>
                            <Input placeholder="Enter your full name" {...register('sender_name')} className="bg-background text-foreground" />
                        </div>

                        {/* EMPLOYEE or DEPARTMENT FIELD */}
                        <div>
                            {feedback_target === 'department' ? (
                                <>
                                    <Label className="font-semibold text-foreground">
                                        Select Department <span className="text-destructive">*</span>
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
                                                    className={`w-full text-sm ${errors.department_id ? 'border-destructive' : ''}`}
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
                                        <p className="text-sm text-destructive">{errors.department_id.message}</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Label className="font-semibold text-foreground">
                                        Employee Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Enter employee name"
                                        {...register('employee_name', { required: 'Employee name is required' })}
                                        className={errors.employee_name ? 'border-destructive' : ''}
                                    />
                                    {errors.employee_name && (
                                        <p className="text-sm text-destructive">{errors.employee_name.message}</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* RATING */}
                        {feedback_target === 'department' && department_id && (
                            <Controller
                                control={control}
                                name="rating"
                                render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
                            />
                        )}

                        {/* MESSAGE */}
                        <div>
                            <Label className="font-semibold text-foreground">
                                Feedback Message <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                rows={5}
                                placeholder="Share your compliments, suggestions, or complaints..."
                                {...register('feedback_message', { required: 'Feedback message is required' })}
                                className={errors.feedback_message ? 'border-destructive' : ''}
                            />
                            {errors.feedback_message && (
                                <p className="text-sm text-destructive">{errors.feedback_message.message}</p>
                            )}
                        </div>

                        {/* UPLOAD */}
                        <div>
                            <Label className="font-semibold text-foreground">Upload Evidence (Optional)</Label>
                            <p className="text-sm text-muted-foreground">
                                Upload up to <b>5 files</b>, total size must not exceed <b>50MB</b>.
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('evidence')?.click()}
                                className="mt-2"
                                disabled={files.length >= MAX_FILES}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {files.length >= MAX_FILES ? 'Max Files Reached' : 'Choose Files'}
                            </Button>

                            <input
                                id="evidence"
                                type="file"
                                multiple
                                accept="image/*,video/*,"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* Error Alert - Theme Updated */}
                            {error && (
                                <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {/* Files List - Theme Updated */}
                            {files.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm">
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <FileIcon className="h-4 w-4 text-primary" />
                                                <span className="max-w-[200px] truncate text-foreground">{file.name}</span>
                                                <span className="whitespace-nowrap text-xs text-muted-foreground">
                                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                                </span>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-6 w-6 flex-shrink-0 p-0 text-muted-foreground hover:text-destructive"
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
                                className="flex-1"
                                disabled={isSubmitting.isOpen}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                // Uses Primary Theme Color
                                className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                                disabled={isSubmitting.isOpen}
                            >
                                {isSubmitting.isOpen ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </div>
                    </form>

                    <LoadingDialog isOpen={isSubmitting.isOpen} title={isSubmitting.title} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
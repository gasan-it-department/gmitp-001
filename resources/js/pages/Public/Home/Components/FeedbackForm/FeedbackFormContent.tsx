import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import api from '@/routes/api';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, FileIcon, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import StarRating from './StarRatingBar';

export type DepartmentOption = { id: string; name: string };

interface FeedbackFormContentProps {
    departments?: DepartmentOption[];
    onCancel?: () => void;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

type FeedbackFormShape = {
    citizen_name: string;
    contact_number: string;
    email: string;
    employee_name: string;
    department_id: string;
    subject: string;
    message: string;
    rating: number | null;
    attachments: File[];
};

const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB

export function FeedbackFormContent({ departments = [], onCancel, onSuccess, onError }: FeedbackFormContentProps) {
    const { currentMunicipality } = useMunicipality();

    const { data, setData, post, processing, errors, reset } = useForm<FeedbackFormShape>({
        citizen_name: '',
        contact_number: '',
        email: '',
        employee_name: '',
        department_id: '',
        subject: '',
        message: '',
        rating: 5,
        attachments: [],
    });

    const [fileError, setFileError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const incoming = Array.from(e.target.files);
        const combined = [...data.attachments, ...incoming].slice(0, MAX_FILES);

        const totalSize = combined.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            setFileError('Total file size exceeds 50 MB limit.');
            return;
        }
        setFileError(null);
        setData('attachments', combined);
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setData(
            'attachments',
            data.attachments.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFileError(null);

        post(api.feedback.store.url(), {
            forceFormData: true,
            preserveScroll: true,
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                reset();
                onSuccess?.('Thank you for your feedback!');
            },
            onError: (errs: any) => {
                const first = Object.values(errs)[0];
                onError?.(typeof first === 'string' ? first : 'Failed to submit feedback.');
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* SUBJECT */}
            <div>
                <Label className="font-semibold text-foreground">
                    Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                    placeholder="Brief title for your feedback"
                    className={errors.subject ? 'border-destructive' : ''}
                />
                {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
            </div>

            {/* CITIZEN NAME */}
            <div>
                <Label className="font-semibold text-foreground">Your Full Name (Optional)</Label>
                <Input
                    value={data.citizen_name}
                    onChange={(e) => setData('citizen_name', e.target.value)}
                    placeholder="Leave blank to submit anonymously"
                    className={errors.citizen_name ? 'border-destructive' : ''}
                />
                {errors.citizen_name && <p className="text-sm text-destructive">{errors.citizen_name}</p>}
            </div>

            {/* CONTACT */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <Label className="font-semibold text-foreground">Contact Number (Optional)</Label>
                    <Input
                        value={data.contact_number}
                        onChange={(e) => setData('contact_number', e.target.value)}
                        placeholder="e.g. 09171234567"
                        className={errors.contact_number ? 'border-destructive' : ''}
                    />
                    {errors.contact_number && <p className="text-sm text-destructive">{errors.contact_number}</p>}
                </div>
                <div>
                    <Label className="font-semibold text-foreground">Email (Optional)</Label>
                    <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                        className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
            </div>

            {/* DEPARTMENT */}
            <div>
                <Label className="font-semibold text-foreground">Department (Optional)</Label>
                <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                    <SelectTrigger className={`w-full text-sm ${errors.department_id ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="-- Select Department --" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">No departments available</div>
                        ) : (
                            departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                {errors.department_id && <p className="text-sm text-destructive">{errors.department_id}</p>}
            </div>

            {/* EMPLOYEE NAME (plain text) */}
            <div>
                <Label className="font-semibold text-foreground">Employee Name (Optional)</Label>
                <Input
                    value={data.employee_name}
                    onChange={(e) => setData('employee_name', e.target.value)}
                    placeholder="Name of staff who assisted you"
                    className={errors.employee_name ? 'border-destructive' : ''}
                />
                {errors.employee_name && <p className="text-sm text-destructive">{errors.employee_name}</p>}
            </div>

            {/* RATING */}
            <div>
                <StarRating value={data.rating ?? 0} onChange={(value) => setData('rating', value)} />
                {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
            </div>

            {/* MESSAGE */}
            <div>
                <Label className="font-semibold text-foreground">
                    Feedback Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    rows={5}
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    placeholder="Share your compliments, suggestions, or complaints..."
                    className={errors.message ? 'border-destructive' : ''}
                />
                {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
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
                    onClick={() => document.getElementById('feedback-evidence')?.click()}
                    className="mt-2"
                    disabled={data.attachments.length >= MAX_FILES}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    {data.attachments.length >= MAX_FILES ? 'Max Files Reached' : 'Choose Files'}
                </Button>

                <input
                    id="feedback-evidence"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,video/mp4,video/avi,video/mpeg"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {(fileError || errors.attachments) && (
                    <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {fileError ?? errors.attachments}
                    </div>
                )}

                {data.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {data.attachments.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <FileIcon className="h-4 w-4 text-primary" />
                                    <span className="max-w-[200px] truncate text-foreground">{file.name}</span>
                                    <span className="text-xs whitespace-nowrap text-muted-foreground">
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
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={processing}>
                        Cancel
                    </Button>
                )}

                <Button type="submit" className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" disabled={processing}>
                    {processing ? 'Submitting...' : 'Submit Feedback'}
                </Button>
            </div>

            <LoadingDialog isOpen={processing} title="Submitting..." />
        </form>
    );
}

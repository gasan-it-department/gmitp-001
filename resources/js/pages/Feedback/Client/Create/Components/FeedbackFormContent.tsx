import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import api from '@/routes/api';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, FileIcon, Loader2, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import StarRating from './StarRatingBar';

export type DepartmentOption = { id: string; name: string };

interface FeedbackFormContentProps {
    departments?: DepartmentOption[];
    feedbackTypes?: { value: string; label: string }[];
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

export function FeedbackFormContent({ departments = [], feedbackTypes = [], onCancel, onSuccess, onError }: FeedbackFormContentProps) {
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
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* SUBJECT */}
            <div className="space-y-3">
                <Label className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                    Uri ng Feedback <span className="text-destructive">*</span>
                </Label>

                {feedbackTypes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                        {feedbackTypes.map((type) => {
                            const isSelected = data.subject === type.value;
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setData('subject', type.value)}
                                    className={`flex min-h-[50px] items-center justify-center rounded-xl border-2 p-3 text-center text-xs font-bold transition-all duration-200 active:scale-95 sm:min-h-[60px] sm:text-sm ${
                                        isSelected
                                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100'
                                    } ${errors.subject && !isSelected ? 'border-destructive/60 bg-destructive/5' : ''} `}
                                >
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <Input
                        value={data.subject}
                        onChange={(e) => setData('subject', e.target.value)}
                        placeholder="Hal: Reklamo o Suhestiyon"
                        className={`h-12 rounded-xl ${errors.subject ? 'border-destructive' : 'bg-slate-50'}`}
                    />
                )}
                {errors.subject && <p className="text-xs font-medium text-destructive">{errors.subject}</p>}
            </div>

            {/* RATING */}
            <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 sm:p-6">
                <StarRating value={data.rating ?? 0} onChange={(value) => setData('rating', value)} />
                {errors.rating && <p className="mt-2 text-xs font-medium text-destructive">{errors.rating}</p>}
            </div>

            {/* MESSAGE */}
            <div className="space-y-2">
                <Label className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                    Iyong Mensahe <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    rows={5}
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    placeholder="Dito mo isulat ang iyong suhestiyon, papuri, o reklamo..."
                    className={`resize-none rounded-xl ${errors.message ? 'border-destructive ring-destructive/20' : 'bg-slate-50'}`}
                />
                {errors.message && <p className="text-xs font-medium text-destructive">{errors.message}</p>}
            </div>

            {/* PERSONAL INFO SECTION */}
            <div className="space-y-6 pt-2">
                <h3 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">Impormasyon (Opsyonal)</h3>

                {/* CITIZEN NAME */}
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Pangalan</Label>
                    <Input
                        value={data.citizen_name}
                        onChange={(e) => setData('citizen_name', e.target.value)}
                        placeholder="Iwanang bakante kung nais mong manatiling anonymous"
                        className={`h-12 rounded-xl ${errors.citizen_name ? 'border-destructive' : 'bg-slate-50'}`}
                    />
                    {errors.citizen_name && <p className="text-xs font-medium text-destructive">{errors.citizen_name}</p>}
                </div>

                {/* CONTACT & EMAIL */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Numero ng Telepono</Label>
                        <Input
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                            placeholder="Hal: 09171234567"
                            className={`h-12 rounded-xl ${errors.contact_number ? 'border-destructive' : 'bg-slate-50'}`}
                        />
                        {errors.contact_number && <p className="text-xs font-medium text-destructive">{errors.contact_number}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Email Address</Label>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="halimbawa@email.com"
                            className={`h-12 rounded-xl ${errors.email ? 'border-destructive' : 'bg-slate-50'}`}
                        />
                        {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                    </div>
                </div>

                {/* DEPARTMENT & EMPLOYEE */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Departamento</Label>
                        <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                            <SelectTrigger className={`h-12 rounded-xl bg-slate-50 ${errors.department_id ? 'border-destructive' : ''}`}>
                                <SelectValue placeholder="Pumili ng Departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Walang departamento</div>
                                ) : (
                                    departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.department_id && <p className="text-xs font-medium text-destructive">{errors.department_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Pangalan ng Empleyado</Label>
                        <Input
                            value={data.employee_name}
                            onChange={(e) => setData('employee_name', e.target.value)}
                            placeholder="Sino ang tumulong sa iyo?"
                            className={`h-12 rounded-xl ${errors.employee_name ? 'border-destructive' : 'bg-slate-50'}`}
                        />
                        {errors.employee_name && <p className="text-xs font-medium text-destructive">{errors.employee_name}</p>}
                    </div>
                </div>
            </div>

            {/* UPLOAD */}
            <div className="space-y-3 pt-2">
                <Label className="text-sm font-bold tracking-wider text-slate-500 uppercase">Litrato o Video (Opsyonal)</Label>

                <div
                    onClick={() => data.attachments.length < MAX_FILES && document.getElementById('feedback-evidence')?.click()}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors ${
                        data.attachments.length >= MAX_FILES
                            ? 'cursor-not-allowed border-slate-200 bg-slate-50'
                            : 'cursor-pointer border-slate-200 bg-slate-50/50 hover:border-primary/50'
                    }`}
                >
                    <Upload className={`mb-2 h-8 w-8 ${data.attachments.length >= MAX_FILES ? 'text-slate-300' : 'text-primary/60'}`} />
                    <p className="text-xs font-bold text-slate-600">
                        {data.attachments.length >= MAX_FILES ? 'Puno na ang limitasyon' : 'Mag-attach ng Patunay'}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">Hanggang 5 files (Max 50MB)</p>
                </div>

                <input
                    id="feedback-evidence"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,video/mp4,video/avi,video/mpeg"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {(fileError || errors.attachments) && (
                    <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {fileError ?? errors.attachments}
                    </div>
                )}

                {data.attachments.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {data.attachments.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                            >
                                <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                                    <FileIcon className="mb-1 h-6 w-6 text-primary/40" />
                                    <span className="line-clamp-1 px-2 text-[10px] font-bold text-slate-600">{file.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="order-2 h-14 rounded-2xl font-bold sm:order-1 sm:flex-1"
                        disabled={processing}
                    >
                        I-kansela
                    </Button>
                )}

                <Button
                    type="submit"
                    className="order-1 h-14 rounded-2xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] sm:order-2 sm:flex-1"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            I-sinusumite…
                        </>
                    ) : (
                        'I-sumite ang Feedback'
                    )}
                </Button>
            </div>

            <LoadingDialog isOpen={processing} title="I-sinusumite ang iyong feedback..." />
        </form>
    );
}

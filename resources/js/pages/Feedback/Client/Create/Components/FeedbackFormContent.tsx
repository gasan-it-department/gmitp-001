import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import api from '@/routes/api';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';
import { AlertTriangle, Building2, Check, FileIcon, Loader2, MessageSquareText, Paperclip, ShieldCheck, Upload, UserRound, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import StarRating from './StarRatingBar';

export type DepartmentOption = { id: string; name: string };

type TurnstileWidgetId = string;

type TurnstileRenderOptions = {
    sitekey: string;
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
};

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: TurnstileRenderOptions) => TurnstileWidgetId;
            reset: (widgetId?: TurnstileWidgetId) => void;
            remove: (widgetId?: TurnstileWidgetId) => void;
        };
    }
}

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
    captcha_token: string;
    attachments: File[];
};

const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';

export function FeedbackFormContent({ departments = [], feedbackTypes = [], onCancel, onSuccess, onError }: FeedbackFormContentProps) {
    const { currentMunicipality } = useMunicipality();
    const { auth } = usePage<SharedData>().props;
    const isGuest = !auth.user;
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
    const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<FeedbackFormShape>({
        citizen_name: '',
        contact_number: '',
        email: '',
        employee_name: '',
        department_id: '',
        subject: '',
        message: '',
        rating: 5,
        captcha_token: '',
        attachments: [],
    });

    const [fileError, setFileError] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const captchaRequired = isGuest;

    useEffect(() => {
        if (!captchaRequired || !turnstileSiteKey || !turnstileContainerRef.current) {
            return;
        }

        let cancelled = false;
        let scriptElement: HTMLElement | null = document.getElementById(TURNSTILE_SCRIPT_ID);

        const renderTurnstile = () => {
            if (cancelled || !window.turnstile || !turnstileContainerRef.current || turnstileWidgetIdRef.current) {
                return;
            }

            turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
                sitekey: turnstileSiteKey,
                callback: (token) => setData('captcha_token', token),
                'expired-callback': () => setData('captcha_token', ''),
                'error-callback': () => setData('captcha_token', ''),
            });
        };

        if (window.turnstile) {
            renderTurnstile();
        } else if (scriptElement) {
            scriptElement.addEventListener('load', renderTurnstile);
        } else {
            const script = document.createElement('script');
            script.id = TURNSTILE_SCRIPT_ID;
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.addEventListener('load', renderTurnstile);
            document.head.appendChild(script);
            scriptElement = script;
        }

        return () => {
            cancelled = true;
            scriptElement?.removeEventListener('load', renderTurnstile);

            if (turnstileWidgetIdRef.current && window.turnstile) {
                window.turnstile.remove(turnstileWidgetIdRef.current);
                turnstileWidgetIdRef.current = null;
            }
        };
    }, [captchaRequired, setData, turnstileSiteKey]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const incoming = Array.from(e.target.files);
        const availableSlots = MAX_FILES - data.attachments.length;
        const filesToProcess = incoming.slice(0, availableSlots);

        if (filesToProcess.length === 0) return;

        setIsCompressing(true);
        setFileError(null);
        await new Promise((resolve) => setTimeout(resolve, 50));

        const compressedFiles: File[] = [];
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        for (const file of filesToProcess) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressedBlob = await imageCompression(file, options);
                    const finalFile = new File([compressedBlob], file.name, {
                        type: file.type,
                        lastModified: Date.now(),
                    });
                    compressedFiles.push(finalFile);
                } catch (error) {
                    console.error('Compression failed for:', file.name, error);
                    compressedFiles.push(file);
                }
            } else {
                compressedFiles.push(file);
            }
        }

        const combined = [...data.attachments, ...compressedFiles];
        const totalSize = combined.reduce((acc, file) => acc + file.size, 0);

        if (totalSize > MAX_TOTAL_SIZE) {
            setFileError('Sobra sa 50 MB ang kabuuang laki ng iyong mga files kahit pagkatapos ng compression.');
            setIsCompressing(false);
            return;
        }

        setData('attachments', combined);
        setIsCompressing(false);
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
        if (isCompressing) return;
        setFileError(null);

        post(api.feedback.store.url(), {
            forceFormData: true,
            preserveScroll: true,
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                reset();
                if (turnstileWidgetIdRef.current) {
                    window.turnstile?.reset(turnstileWidgetIdRef.current);
                }
                onSuccess?.('Thank you for your feedback!');
            },
            onError: (errs) => {
                const first = Object.values(errs)[0];
                onError?.(typeof first === 'string' ? first : 'Failed to submit feedback.');
            },
        });
    };

    const fieldClass = 'h-12 rounded-lg border-border bg-background shadow-sm focus-visible:ring-primary/20';

    return (
        <form onSubmit={handleSubmit} className="space-y-7">
            <section className="space-y-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                        <MessageSquareText className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Ikuwento ang iyong karanasan</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">Piliin ang uri at ilahad nang malinaw ang iyong feedback.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground">
                        Uri ng Feedback <span className="text-destructive">*</span>
                    </Label>

                    {feedbackTypes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {feedbackTypes.map((type) => {
                                const isSelected = data.subject === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setData('subject', type.value)}
                                        className={`relative flex min-h-14 items-center justify-center rounded-lg border px-3 py-2 text-center text-xs font-bold transition-all active:scale-[0.98] sm:text-sm ${
                                            isSelected
                                                ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10'
                                                : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-primary/[0.03] hover:text-foreground'
                                        } ${errors.subject && !isSelected ? 'border-destructive/60 bg-destructive/5' : ''}`}
                                    >
                                        {isSelected && (
                                            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                <Check className="h-2.5 w-2.5" />
                                            </span>
                                        )}
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
                            className={`${fieldClass} ${errors.subject ? 'border-destructive' : ''}`}
                        />
                    )}
                    {errors.subject && <p className="text-xs font-medium text-destructive">{errors.subject}</p>}
                </div>

                <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5">
                    <StarRating value={data.rating ?? 0} onChange={(value) => setData('rating', value)} />
                    {errors.rating && <p className="mt-2 text-xs font-medium text-destructive">{errors.rating}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">
                        Iyong Mensahe <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        rows={6}
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        placeholder="Ibahagi rito ang iyong suhestiyon, papuri, o concern..."
                        className={`min-h-36 resize-none rounded-lg border-border bg-background shadow-sm focus-visible:ring-primary/20 ${
                            errors.message ? 'border-destructive ring-destructive/20' : ''
                        }`}
                    />
                    {errors.message && <p className="text-xs font-medium text-destructive">{errors.message}</p>}
                </div>
            </section>

            <section className="space-y-5 rounded-lg border border-sky-100 bg-sky-50/50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                        <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-950">Impormasyon tungkol sa iyo</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-600">Opsyonal ang lahat ng detalye sa seksyong ito.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-800">Pangalan</Label>
                    <Input
                        value={data.citizen_name}
                        onChange={(e) => setData('citizen_name', e.target.value)}
                        placeholder="Iwanang blangko kung nais maging anonymous"
                        className={`${fieldClass} ${errors.citizen_name ? 'border-destructive' : ''}`}
                    />
                    {errors.citizen_name && <p className="text-xs font-medium text-destructive">{errors.citizen_name}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-800">Numero ng Telepono</Label>
                        <Input
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                            placeholder="Hal: 09171234567"
                            className={`${fieldClass} ${errors.contact_number ? 'border-destructive' : ''}`}
                        />
                        {errors.contact_number && <p className="text-xs font-medium text-destructive">{errors.contact_number}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-800">Email Address</Label>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="halimbawa@email.com"
                            className={`${fieldClass} ${errors.email ? 'border-destructive' : ''}`}
                        />
                        {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-sky-100 pt-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <Building2 className="h-4 w-4 text-sky-700" />
                            Departamento
                        </Label>
                        <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                            <SelectTrigger className={`${fieldClass} ${errors.department_id ? 'border-destructive' : ''}`}>
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
                        <Label className="text-sm font-bold text-slate-800">Pangalan ng Empleyado</Label>
                        <Input
                            value={data.employee_name}
                            onChange={(e) => setData('employee_name', e.target.value)}
                            placeholder="Sino ang tumulong sa iyo?"
                            className={`${fieldClass} ${errors.employee_name ? 'border-destructive' : ''}`}
                        />
                        {errors.employee_name && <p className="text-xs font-medium text-destructive">{errors.employee_name}</p>}
                    </div>
                </div>
            </section>

            <section className="space-y-4 rounded-lg border border-violet-100 bg-violet-50/40 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                        <Paperclip className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-950">Magdagdag ng attachment</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-600">Opsyonal na larawan, hanggang 5 photos at 50 MB lahat.</p>
                    </div>
                </div>

                <div
                    onClick={() => !isCompressing && data.attachments.length < MAX_FILES && document.getElementById('feedback-evidence')?.click()}
                    className={`flex min-h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition-all ${
                        isCompressing || data.attachments.length >= MAX_FILES
                            ? 'cursor-not-allowed border-slate-200 bg-white/50'
                            : 'cursor-pointer border-violet-200 bg-white/70 hover:border-primary/40 hover:bg-white'
                    }`}
                >
                    {isCompressing ? (
                        <>
                            <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary" />
                            <p className="text-xs font-bold text-slate-700">Inihahanda ang mga larawan...</p>
                        </>
                    ) : (
                        <>
                            <Upload className={`mb-2 h-7 w-7 ${data.attachments.length >= MAX_FILES ? 'text-slate-300' : 'text-violet-600'}`} />
                            <p className="text-xs font-bold text-slate-700">
                                {data.attachments.length >= MAX_FILES ? 'Puno na ang limitasyon' : 'Pumili ng larawan'}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">JPEG, PNG, o WebP</p>
                        </>
                    )}
                </div>

                <input
                    id="feedback-evidence"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {(fileError || errors.attachments) && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {fileError ?? errors.attachments}
                    </div>
                )}

                {data.attachments.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {data.attachments.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="group relative aspect-video overflow-hidden rounded-lg border border-violet-100 bg-white"
                            >
                                <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                                    <FileIcon className="mb-1 h-6 w-6 text-violet-500" />
                                    <span className="line-clamp-1 px-2 text-[10px] font-bold text-slate-600">{file.name}</span>
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Alisin ang ${file.name}`}
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 rounded-full bg-white p-1 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {captchaRequired && (
                <section className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-950">Security check</h3>
                            <p className="mt-1 text-xs leading-5 text-slate-600">Kumpirmahin muna bago isumite ang feedback.</p>
                        </div>
                    </div>

                    {turnstileSiteKey ? (
                        <div ref={turnstileContainerRef} />
                    ) : (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive">
                            CAPTCHA is not configured.
                        </div>
                    )}

                    {errors.captcha_token && <p className="text-xs font-medium text-destructive">{errors.captcha_token}</p>}
                </section>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="order-2 h-12 rounded-lg font-bold sm:order-1 sm:flex-1"
                        disabled={processing || isCompressing}
                    >
                        I-kansela
                    </Button>
                )}

                <Button
                    type="submit"
                    className="order-1 h-12 rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] sm:order-2 sm:flex-1"
                    disabled={processing || isCompressing || (captchaRequired && (!data.captcha_token || !turnstileSiteKey))}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Isinusumite...
                        </>
                    ) : isCompressing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Inihahanda...
                        </>
                    ) : (
                        'I-sumite ang Feedback'
                    )}
                </Button>
            </div>

            <LoadingDialog isOpen={processing} title="Isinusumite ang iyong feedback..." />
        </form>
    );
}

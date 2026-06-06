import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, FileIcon, LifeBuoy, Loader2, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

type Option = { value: string; label: string };

interface CreateTicketProps {
    categories: Option[];
    priorities: Option[];
    is_eligible: boolean;
    // Provided by shared Inertia props when the visitor is authenticated.
    auth?: { user?: { id: string } | null };
}

type TicketFormShape = {
    category: string;
    priority: string;
    subject: string;
    description: string;
    contact_name: string;
    contact_email: string;
    contact_number: string;
    page_url: string;
    attachments: File[];
};

const MAX_FILES = 5;

export default function Create({ categories, priorities, is_eligible, auth }: CreateTicketProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const isGuest = !auth?.user;

    const { data, setData, post, processing, errors, reset } = useForm<TicketFormShape>({
        category: '',
        priority: 'normal',
        subject: '',
        description: '',
        contact_name: '',
        contact_email: '',
        contact_number: '',
        page_url: typeof window !== 'undefined' ? window.location.origin : '',
        attachments: [],
    });

    const [fileError, setFileError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const incoming = Array.from(e.target.files);
        const availableSlots = MAX_FILES - data.attachments.length;
        const next = [...data.attachments, ...incoming.slice(0, availableSlots)];
        setData('attachments', next);
        setFileError(availableSlots < incoming.length ? `You may attach up to ${MAX_FILES} files.` : null);
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setData('attachments', data.attachments.filter((_, i) => i !== index));
    };

    const isBug = data.category === 'bug';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!is_eligible) return;

        post('/api/support', {
            forceFormData: true,
            preserveScroll: true,
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            onSuccess: () => reset(),
        });
    };

    return (
        <PublicLayout description="" title="">
            <Head title="Get Help / Report a Problem" />

            <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
                <Card className="border-none shadow-xl sm:border sm:shadow-lg">
                    <CardHeader className="space-y-2 pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
                            <LifeBuoy className="h-6 w-6 text-primary" />
                            Get Help / Report a Problem
                        </CardTitle>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Found a bug, need help, or have a request? Tell us what's going on and our team will get back to you.
                        </p>
                    </CardHeader>

                    <CardContent>
                        {!is_eligible ? (
                            <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                                <AlertCircle className="h-12 w-12 text-amber-500" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-amber-900">You've reached today's limit</h3>
                                    <p className="text-sm text-amber-700">
                                        You can submit up to <b>5 tickets per day</b>. Please try again tomorrow, or reply on an
                                        existing ticket instead.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* CATEGORY */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        What is this about? <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                                        {categories.map((cat) => {
                                            const isSelected = data.category === cat.value;
                                            return (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setData('category', cat.value)}
                                                    className={`flex min-h-[50px] items-center justify-center rounded-xl border-2 p-3 text-center text-xs font-bold transition-all duration-200 active:scale-95 sm:min-h-[60px] sm:text-sm ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.category && <p className="text-xs font-medium text-destructive">{errors.category}</p>}
                                </div>

                                {/* PRIORITY */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Priority</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {priorities.map((p) => {
                                            const isSelected = data.priority === p.value;
                                            return (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => setData('priority', p.value)}
                                                    className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* SUBJECT */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Subject <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        maxLength={160}
                                        placeholder="A short summary of your request"
                                        className={`h-12 rounded-xl ${errors.subject ? 'border-destructive ring-destructive/20' : 'bg-slate-50'}`}
                                    />
                                    {errors.subject && <p className="text-xs font-medium text-destructive">{errors.subject}</p>}
                                </div>

                                {/* DESCRIPTION */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Details <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        rows={6}
                                        maxLength={5000}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder={
                                            isBug
                                                ? 'What did you do, what did you expect, and what happened instead?'
                                                : 'Describe what you need help with.'
                                        }
                                        className={`resize-none rounded-xl ${errors.description ? 'border-destructive ring-destructive/20' : 'bg-slate-50'}`}
                                    />
                                    {errors.description && <p className="text-xs font-medium text-destructive">{errors.description}</p>}
                                </div>

                                {/* BUG CONTEXT */}
                                {isBug && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                            Page URL (optional)
                                        </Label>
                                        <Input
                                            value={data.page_url}
                                            onChange={(e) => setData('page_url', e.target.value)}
                                            placeholder="https://…"
                                            className="h-12 rounded-xl bg-slate-50"
                                        />
                                        <p className="text-[11px] text-slate-400">Where did the problem happen?</p>
                                    </div>
                                )}

                                {/* GUEST CONTACT */}
                                {isGuest && (
                                    <div className="space-y-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            How can we reach you?
                                        </p>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-500">
                                                Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                value={data.contact_name}
                                                onChange={(e) => setData('contact_name', e.target.value)}
                                                className={`h-11 rounded-xl bg-white ${errors.contact_name ? 'border-destructive' : ''}`}
                                            />
                                            {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-500">
                                                Email <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                type="email"
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                className={`h-11 rounded-xl bg-white ${errors.contact_email ? 'border-destructive' : ''}`}
                                            />
                                            {errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-500">Phone (optional)</Label>
                                            <Input
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                className="h-11 rounded-xl bg-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ATTACHMENTS */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Screenshots (optional)
                                    </Label>
                                    <div
                                        onClick={() => data.attachments.length < MAX_FILES && document.getElementById('ticket-attachments')?.click()}
                                        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors ${
                                            data.attachments.length >= MAX_FILES
                                                ? 'cursor-not-allowed border-slate-200 bg-slate-50'
                                                : 'cursor-pointer border-slate-200 bg-slate-50/50 hover:border-primary/50'
                                        }`}
                                    >
                                        <Upload className={`mb-2 h-8 w-8 ${data.attachments.length >= MAX_FILES ? 'text-slate-300' : 'text-primary/60'}`} />
                                        <p className="text-xs font-bold text-slate-600">
                                            {data.attachments.length >= MAX_FILES ? 'Attachment limit reached' : 'Upload screenshots'}
                                        </p>
                                        <p className="mt-1 text-[10px] text-slate-400">Up to 5 images (Max 10MB each)</p>
                                    </div>
                                    <input
                                        id="ticket-attachments"
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {fileError && <p className="text-xs font-medium text-destructive">{fileError}</p>}
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
                                                        className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-white"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98]"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Submitting…
                                            </>
                                        ) : (
                                            'Submit Ticket'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}

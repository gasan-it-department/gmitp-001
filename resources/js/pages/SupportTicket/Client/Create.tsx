import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, FileIcon, LifeBuoy, Loader2, Upload, X, MessageSquare, ShieldCheck } from 'lucide-react';
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
        setFileError(availableSlots < incoming.length ? `Maaari kang mag-attach ng hanggang ${MAX_FILES} file.` : null);
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
            <Head title="Humingi ng Tulong / I-report ang Problema" />

            {/* Clean solid background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-slate-50/50" />

            <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
                
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Support Center
                    </h1>
                    <p className="mt-2 text-base text-slate-600">
                        Nandito kami para tumulong. Ipadala ang iyong mga katanungan o i-report ang mga problema.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                    
                    {/* LEFT COLUMN: Info & Context */}
                    <div className="hidden space-y-6 lg:col-span-4 lg:block">
                        <Card className="border border-slate-200 bg-white/60 backdrop-blur-md">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <LifeBuoy className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-lg font-bold text-slate-900">Kailangan ng Tulong?</h3>
                                        <p className="text-sm text-slate-600">Kumpletuhin ang form para makipag-ugnayan.</p>
                                    </div>
                                </div>
                                <hr className="border-slate-100" />
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                                        <MessageSquare className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-heading text-sm font-bold text-slate-900">Mabilis na Tugon</h4>
                                        <p className="text-xs text-slate-500">Ang aming team ay tutugon sa lalong madaling panahon.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                                        <ShieldCheck className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-heading text-sm font-bold text-slate-900">Secure na Proseso</h4>
                                        <p className="text-xs text-slate-500">Ang iyong impormasyon ay ligtas sa amin.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: The Form */}
                    <div className="lg:col-span-8">
                        <Card className="border border-slate-200 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="space-y-2 border-b border-slate-100 pb-6">
                                <CardTitle className="font-heading flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                                    Isumite ang Ticket
                                </CardTitle>
                                <p className="text-sm leading-relaxed text-slate-500">
                                    Nakahanap ng bug, kailangan ng tulong, o may request? Ipaalam sa amin at tutugunan ito ng aming team.
                                </p>
                            </CardHeader>

                            <CardContent className="pt-6">
                                {!is_eligible ? (
                                    <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-10 text-center backdrop-blur-sm">
                                        <AlertCircle className="h-14 w-14 text-amber-500" />
                                        <div className="space-y-2">
                                            <h3 className="font-heading text-xl font-bold text-amber-900">Naabot mo na ang limitasyon</h3>
                                            <p className="text-sm text-amber-700 max-w-sm mx-auto">
                                                Maaari kang magpasa ng hanggang <b>5 ticket kada araw</b>. Mangyaring subukan muli bukas, o sumagot sa isang umiiral na ticket.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        
                                        {/* SECTION: Category & Priority */}
                                        <div className="space-y-6 rounded-2xl bg-slate-50/50 p-5 sm:p-6 border border-slate-100">
                                            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900">Mga Detalye ng Ticket</h4>
                                            
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Tungkol saan ito? <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    {categories.map((cat) => {
                                                        const isSelected = data.category === cat.value;
                                                        return (
                                                            <button
                                                                key={cat.value}
                                                                type="button"
                                                                onClick={() => setData('category', cat.value)}
                                                                className={`flex min-h-[54px] items-center justify-center rounded-xl border-2 p-3 text-center text-xs font-bold transition-all duration-200 sm:text-sm ${
                                                                    isSelected
                                                                        ? 'border-primary bg-primary text-white'
                                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                {cat.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {errors.category && <p className="text-xs font-medium text-destructive">{errors.category}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Prayoridad</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {priorities.map((p) => {
                                                        const isSelected = data.priority === p.value;
                                                        return (
                                                            <button
                                                                key={p.value}
                                                                type="button"
                                                                onClick={() => setData('priority', p.value)}
                                                                className={`rounded-full border-2 px-5 py-2 text-xs font-bold transition-all duration-200 ${
                                                                    isSelected
                                                                        ? 'border-primary bg-primary/10 text-primary'
                                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                {p.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION: Form Fields */}
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Paksa <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    value={data.subject}
                                                    onChange={(e) => setData('subject', e.target.value)}
                                                    maxLength={160}
                                                    placeholder="Maikling buod ng iyong request"
                                                    className={`h-12 rounded-xl transition-all focus:ring-2 ${errors.subject ? 'border-destructive focus:ring-destructive/20' : 'bg-slate-50 focus:bg-white focus:ring-primary/20'}`}
                                                />
                                                {errors.subject && <p className="text-xs font-medium text-destructive">{errors.subject}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Mga Detalye <span className="text-destructive">*</span>
                                                </Label>
                                                <Textarea
                                                    rows={6}
                                                    maxLength={5000}
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder={
                                                        isBug
                                                            ? 'Ano ang ginawa mo, ano ang inaasahan mo, at ano ang nangyari?'
                                                            : 'Ilarawan kung ano ang kailangan mo ng tulong.'
                                                    }
                                                    className={`resize-none rounded-xl transition-all focus:ring-2 ${errors.description ? 'border-destructive focus:ring-destructive/20' : 'bg-slate-50 focus:bg-white focus:ring-primary/20'}`}
                                                />
                                                {errors.description && <p className="text-xs font-medium text-destructive">{errors.description}</p>}
                                            </div>

                                            {isBug && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                        URL ng Pahina (opsiyonal)
                                                    </Label>
                                                    <Input
                                                        value={data.page_url}
                                                        onChange={(e) => setData('page_url', e.target.value)}
                                                        placeholder="https://…"
                                                        className="h-12 rounded-xl bg-slate-50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
                                                    />
                                                    <p className="text-[11px] text-slate-400">Saan nangyari ang problema?</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* SECTION: Guest Contact Info */}
                                        {isGuest && (
                                            <div className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:p-6">
                                                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900">
                                                    Paano ka namin makokontak?
                                                </h4>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-slate-500">
                                                            Pangalan <span className="text-destructive">*</span>
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
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-slate-500">Telepono (opsiyonal)</Label>
                                                    <Input
                                                        value={data.contact_number}
                                                        onChange={(e) => setData('contact_number', e.target.value)}
                                                        className="h-11 rounded-xl bg-white max-w-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* SECTION: Attachments */}
                                        <div className="space-y-4">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Mga Screenshot (opsiyonal)
                                            </Label>
                                            <div
                                                onClick={() => data.attachments.length < MAX_FILES && document.getElementById('ticket-attachments')?.click()}
                                                className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200 ${
                                                    data.attachments.length >= MAX_FILES
                                                        ? 'cursor-not-allowed border-slate-200 bg-slate-50'
                                                        : 'cursor-pointer border-slate-300 bg-slate-50/50 hover:border-primary hover:bg-primary/5'
                                                }`}
                                            >
                                                <div className={`mb-3 rounded-full p-3 transition-colors ${data.attachments.length >= MAX_FILES ? 'bg-slate-100' : 'bg-primary/10 group-hover:bg-primary/20'}`}>
                                                    <Upload className={`h-6 w-6 ${data.attachments.length >= MAX_FILES ? 'text-slate-400' : 'text-primary'}`} />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {data.attachments.length >= MAX_FILES ? 'Naabot na ang limitasyon sa attachment' : 'Mag-upload ng mga screenshot'}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">Hanggang 5 larawan (Max 10MB bawat isa)</p>
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
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    {data.attachments.map((file, index) => (
                                                        <div
                                                            key={`${file.name}-${index}`}
                                                            className="group relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white"
                                                        >
                                                            <FileIcon className="mb-2 h-8 w-8 text-slate-300 transition-colors group-hover:text-primary/60" />
                                                            <span className="line-clamp-1 w-full px-3 text-center text-xs font-medium text-slate-600">{file.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                                                className="absolute right-2 top-2 rounded-full bg-slate-100 p-1.5 text-slate-500 opacity-0 transition-all hover:bg-destructive hover:text-white group-hover:opacity-100"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-white transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:px-12"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Isinusumite…
                                                    </>
                                                ) : (
                                                    'Isumite ang Ticket'
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}


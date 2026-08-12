import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, FileIcon, LifeBuoy, Loader2, MessageSquare, ShieldCheck, Upload, X } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useState } from 'react';

type Option = { value: string; label: string };

interface CreateTicketProps {
    categories: Option[];
    priorities: Option[];
    is_eligible: boolean;
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
    const isBug = data.category === 'bug';
    const hasReachedFileLimit = data.attachments.length >= MAX_FILES;

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;

        const incoming = Array.from(event.target.files);
        const availableSlots = MAX_FILES - data.attachments.length;
        setData('attachments', [...data.attachments, ...incoming.slice(0, availableSlots)]);
        setFileError(availableSlots < incoming.length ? `Maaari kang mag-attach ng hanggang ${MAX_FILES} file.` : null);
        event.target.value = '';
    };

    const removeFile = (index: number) => {
        setData(
            'attachments',
            data.attachments.filter((_, attachmentIndex) => attachmentIndex !== index),
        );
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!is_eligible) return;

        post('/api/support', {
            forceFormData: true,
            preserveScroll: true,
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            onSuccess: () => reset(),
        });
    };

    return (
        <PublicLayout
            title="Help & Support"
            description="Humingi ng tulong, mag-report ng problema, o magpadala ng support request sa munisipyo."
            noIndex
        >
            <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                    <header className="mb-8 max-w-2xl sm:mb-10">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                            <LifeBuoy className="h-5 w-5 text-primary" />
                        </div>
                        <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">Municipal Support</p>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Help &amp; Support</h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                            May tanong, request, o problemang kailangang i-report? Ipadala ang mga detalye at tutulungan ka ng aming team.
                        </p>
                    </header>

                    <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                        <aside className="hidden lg:col-span-4 lg:block">
                            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-semibold text-slate-900">Bago magsumite</h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Ibigay ang kumpletong detalye para mas mabilis naming ma-review.
                                </p>

                                <div className="mt-6 space-y-5 border-t border-slate-100 pt-6">
                                    <div className="flex gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-900">Mabilis na tugon</h3>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Tutugon ang support team sa lalong madaling panahon.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-900">Ligtas na proseso</h3>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Ang iyong impormasyon ay gagamitin lamang para sa request na ito.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <div className="lg:col-span-8">
                            <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white py-0 shadow-sm">
                                <CardHeader className="border-b border-slate-100 px-6 py-6 sm:px-8">
                                    <CardTitle className="text-xl font-semibold tracking-tight text-slate-950">Submit a support request</CardTitle>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Piliin ang uri ng concern at ilagay ang impormasyong makakatulong sa aming pagsisiyasat.
                                    </p>
                                </CardHeader>

                                <CardContent className="p-6 sm:p-8">
                                    {!is_eligible ? (
                                        <div className="flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
                                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                            <div>
                                                <h2 className="text-sm font-semibold text-amber-950">Naabot mo na ang limitasyon</h2>
                                                <p className="mt-1 text-sm leading-6 text-amber-800">
                                                    Maaari kang magpasa ng hanggang <strong>5 ticket kada araw</strong>. Subukan muli bukas o sumagot
                                                    sa isang kasalukuyang ticket.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-8">
                                            <section aria-labelledby="request-type-heading" className="space-y-6">
                                                <div>
                                                    <h2 id="request-type-heading" className="text-base font-semibold text-slate-900">
                                                        Request type
                                                    </h2>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Ano ang pinakamalapit na paglalarawan sa iyong concern?
                                                    </p>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Kategorya <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                                        {categories.map((category) => {
                                                            const isSelected = data.category === category.value;

                                                            return (
                                                                <button
                                                                    key={category.value}
                                                                    type="button"
                                                                    aria-pressed={isSelected}
                                                                    onClick={() => setData('category', category.value)}
                                                                    className={`min-h-12 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none ${
                                                                        isSelected
                                                                            ? 'border-primary bg-primary/10 text-primary'
                                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    {category.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {errors.category && (
                                                        <p role="alert" className="text-xs font-medium text-destructive">
                                                            {errors.category}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2.5">
                                                    <Label className="text-sm font-medium text-slate-700">Priority</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {priorities.map((priority) => {
                                                            const isSelected = data.priority === priority.value;

                                                            return (
                                                                <button
                                                                    key={priority.value}
                                                                    type="button"
                                                                    aria-pressed={isSelected}
                                                                    onClick={() => setData('priority', priority.value)}
                                                                    className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none ${
                                                                        isSelected
                                                                            ? 'border-slate-900 bg-slate-900 text-white'
                                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    {priority.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </section>

                                            <section aria-labelledby="request-details-heading" className="space-y-5 border-t border-slate-100 pt-8">
                                                <div>
                                                    <h2 id="request-details-heading" className="text-base font-semibold text-slate-900">
                                                        Request details
                                                    </h2>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Ilarawan nang malinaw kung paano ka namin matutulungan.
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="ticket-subject" className="text-sm font-medium text-slate-700">
                                                        Subject <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="ticket-subject"
                                                        value={data.subject}
                                                        onChange={(event) => setData('subject', event.target.value)}
                                                        maxLength={160}
                                                        placeholder="Maikling buod ng iyong request"
                                                        className={`h-11 rounded-lg bg-white ${
                                                            errors.subject
                                                                ? 'border-destructive focus-visible:ring-destructive/20'
                                                                : 'border-slate-200 focus-visible:ring-primary/20'
                                                        }`}
                                                    />
                                                    {errors.subject && (
                                                        <p role="alert" className="text-xs font-medium text-destructive">
                                                            {errors.subject}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="ticket-description" className="text-sm font-medium text-slate-700">
                                                        Description <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Textarea
                                                        id="ticket-description"
                                                        rows={6}
                                                        maxLength={5000}
                                                        value={data.description}
                                                        onChange={(event) => setData('description', event.target.value)}
                                                        placeholder={
                                                            isBug
                                                                ? 'Ano ang ginawa mo, ano ang inaasahan mo, at ano ang nangyari?'
                                                                : 'Ilarawan kung ano ang kailangan mo ng tulong.'
                                                        }
                                                        className={`min-h-40 resize-y rounded-lg bg-white ${
                                                            errors.description
                                                                ? 'border-destructive focus-visible:ring-destructive/20'
                                                                : 'border-slate-200 focus-visible:ring-primary/20'
                                                        }`}
                                                    />
                                                    {errors.description && (
                                                        <p role="alert" className="text-xs font-medium text-destructive">
                                                            {errors.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {isBug && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="ticket-page-url" className="text-sm font-medium text-slate-700">
                                                            Page URL <span className="font-normal text-slate-400">(optional)</span>
                                                        </Label>
                                                        <Input
                                                            id="ticket-page-url"
                                                            value={data.page_url}
                                                            onChange={(event) => setData('page_url', event.target.value)}
                                                            placeholder="https://…"
                                                            className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-primary/20"
                                                        />
                                                        <p className="text-xs text-slate-400">Ilagay ang pahina kung saan nangyari ang problema.</p>
                                                    </div>
                                                )}
                                            </section>

                                            {isGuest && (
                                                <section aria-labelledby="contact-heading" className="space-y-5 border-t border-slate-100 pt-8">
                                                    <div>
                                                        <h2 id="contact-heading" className="text-base font-semibold text-slate-900">
                                                            Contact information
                                                        </h2>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            Saan namin maaaring ipadala ang update tungkol sa request?
                                                        </p>
                                                    </div>

                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
                                                                Name <span className="text-destructive">*</span>
                                                            </Label>
                                                            <Input
                                                                id="contact-name"
                                                                value={data.contact_name}
                                                                onChange={(event) => setData('contact_name', event.target.value)}
                                                                className={`h-11 rounded-lg bg-white ${errors.contact_name ? 'border-destructive' : 'border-slate-200'}`}
                                                            />
                                                            {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name}</p>}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
                                                                Email <span className="text-destructive">*</span>
                                                            </Label>
                                                            <Input
                                                                id="contact-email"
                                                                type="email"
                                                                value={data.contact_email}
                                                                onChange={(event) => setData('contact_email', event.target.value)}
                                                                className={`h-11 rounded-lg bg-white ${errors.contact_email ? 'border-destructive' : 'border-slate-200'}`}
                                                            />
                                                            {errors.contact_email && (
                                                                <p className="text-xs text-destructive">{errors.contact_email}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="max-w-sm space-y-2">
                                                        <Label htmlFor="contact-number" className="text-sm font-medium text-slate-700">
                                                            Phone <span className="font-normal text-slate-400">(optional)</span>
                                                        </Label>
                                                        <Input
                                                            id="contact-number"
                                                            value={data.contact_number}
                                                            onChange={(event) => setData('contact_number', event.target.value)}
                                                            className="h-11 rounded-lg border-slate-200 bg-white"
                                                        />
                                                    </div>
                                                </section>
                                            )}

                                            <section aria-labelledby="attachments-heading" className="space-y-4 border-t border-slate-100 pt-8">
                                                <div>
                                                    <h2 id="attachments-heading" className="text-base font-semibold text-slate-900">
                                                        Attachments <span className="font-normal text-slate-400">(optional)</span>
                                                    </h2>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Magdagdag ng screenshot para mas madaling makita ang problema.
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={hasReachedFileLimit}
                                                    onClick={() => document.getElementById('ticket-attachments')?.click()}
                                                    className="group flex w-full items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:opacity-60"
                                                >
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors group-hover:text-primary">
                                                        <Upload className="h-4 w-4" />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block text-sm font-medium text-slate-800">
                                                            {hasReachedFileLimit ? 'Naabot na ang attachment limit' : 'Choose screenshots to upload'}
                                                        </span>
                                                        <span className="mt-0.5 block text-xs text-slate-500">
                                                            Up to 5 JPG, PNG, or WebP files · 10MB each
                                                        </span>
                                                    </span>
                                                </button>

                                                <input
                                                    id="ticket-attachments"
                                                    type="file"
                                                    multiple
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />

                                                {fileError && (
                                                    <p role="alert" className="text-xs font-medium text-destructive">
                                                        {fileError}
                                                    </p>
                                                )}

                                                {data.attachments.length > 0 && (
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        {data.attachments.map((file, index) => (
                                                            <div
                                                                key={`${file.name}-${index}`}
                                                                className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                                                            >
                                                                <FileIcon className="h-5 w-5 shrink-0 text-slate-400" />
                                                                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                                                                    {file.name}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Remove ${file.name}`}
                                                                    onClick={() => removeFile(index)}
                                                                    className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive/20 focus-visible:outline-none"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>

                                            <div className="flex justify-end border-t border-slate-100 pt-6">
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="h-11 w-full rounded-lg px-6 text-sm font-semibold shadow-sm sm:w-auto"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Isinusumite…
                                                        </>
                                                    ) : (
                                                        'Submit request'
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
            </div>
        </PublicLayout>
    );
}

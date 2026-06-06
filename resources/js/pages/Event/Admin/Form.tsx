import { FormInput } from '@/components/FormInputField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type EnumOption = { value: string; label: string };

interface ExistingBanner {
    id: number | string;
    url: string;
    name: string;
}

interface EventDetail {
    id: string;
    title: string;
    description: string;
    type: EnumOption;
    is_published: boolean;
    start_datetime_input: string | null;
    end_datetime_input: string | null;
    location_name: string;
    banner: ExistingBanner | null;
}

interface Props {
    event: EventDetail | null;
    types: EnumOption[];
}

type FormShape = {
    title: string;
    description: string;
    type: string;
    start_datetime: string;
    end_datetime: string;
    location_name: string;
    is_published: boolean;
    event_banner: File | null;
    _method?: 'PUT';
};

export default function EventForm({ event, types }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const isEdit = event !== null;

    const initialForm: FormShape = {
        title: event?.title ?? '',
        description: event?.description ?? '',
        type: event?.type?.value ?? 'community',
        start_datetime: event?.start_datetime_input ?? '',
        end_datetime: event?.end_datetime_input ?? '',
        location_name: event?.location_name ?? '',
        is_published: event?.is_published ?? false,
        event_banner: null,
        ...(isEdit ? { _method: 'PUT' as const } : {}),
    };

    const { data, setData, post, processing, errors, clearErrors, progress } = useForm<FormShape>(initialForm);

    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        setData('event_banner', file);
        setBannerPreview(URL.createObjectURL(file));
        clearErrors('event_banner');

        e.target.value = '';
    };

    const removeBanner = () => {
        setData('event_banner', null);
        setBannerPreview(null);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const url = isEdit ? `/api/event/${event!.id}` : '/api/event';

        post(url, {
            headers: { 'X-Municipality-Slug': slug },
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const existingBanner = isEdit ? event!.banner : null;
    const willReplaceExisting = isEdit && data.event_banner !== null;

    return (
        <AppLayout>
            <Head title={isEdit ? `Edit ${event!.title}` : 'New Event'} />

            <div className="m-6 max-w-3xl space-y-6">
                <Link href={`/${slug}/admin/event`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEdit ? 'Edit Event' : 'Create Event'}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Title */}
                            <FormInput
                                label="Title"
                                id="title"
                                value={data.title}
                                onChange={(e) => {
                                    setData('title', e.target.value);
                                    clearErrors('title');
                                }}
                                placeholder="e.g., Town Fiesta 2026"
                                required
                                error={errors.title}
                            />

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">
                                    Type <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) => {
                                        setData('type', value);
                                        clearErrors('type');
                                    }}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="mt-1 text-sm text-destructive">{errors.type}</p>}
                            </div>

                            {/* Schedule */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormInput
                                    label="Start"
                                    id="start_datetime"
                                    type="datetime-local"
                                    value={data.start_datetime}
                                    onChange={(e) => {
                                        setData('start_datetime', e.target.value);
                                        clearErrors('start_datetime');
                                    }}
                                    required
                                    error={errors.start_datetime}
                                />
                                <FormInput
                                    label="End"
                                    id="end_datetime"
                                    type="datetime-local"
                                    value={data.end_datetime}
                                    onChange={(e) => {
                                        setData('end_datetime', e.target.value);
                                        clearErrors('end_datetime');
                                    }}
                                    required
                                    error={errors.end_datetime}
                                />
                            </div>

                            {/* Location */}
                            <FormInput
                                label="Location"
                                id="location_name"
                                value={data.location_name}
                                onChange={(e) => {
                                    setData('location_name', e.target.value);
                                    clearErrors('location_name');
                                }}
                                placeholder="e.g., Municipal Plaza"
                                required
                                error={errors.location_name}
                            />

                            {/* Description */}
                            <div>
                                <Label htmlFor="description">
                                    Description <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => {
                                        setData('description', e.target.value);
                                        clearErrors('description');
                                    }}
                                    rows={8}
                                    placeholder="Tell citizens what to expect at this event…"
                                />
                                {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                            </div>

                            {/* Banner — single optional image */}
                            <div>
                                <Label className="mb-2 block">
                                    Banner <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                                </Label>

                                {isEdit && existingBanner && !willReplaceExisting && (
                                    <div className="mb-3">
                                        <p className="mb-2 text-xs text-muted-foreground">Current banner:</p>
                                        <div className="h-32 w-full max-w-md overflow-hidden rounded-lg border bg-slate-50">
                                            <img
                                                src={existingBanner.url}
                                                alt={existingBanner.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                {bannerPreview && (
                                    <div className="mb-3">
                                        <div className="relative h-32 w-full max-w-md overflow-hidden rounded-lg border bg-slate-50">
                                            <img src={bannerPreview} alt="banner preview" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={removeBanner}
                                                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                                                aria-label="Remove banner"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <label htmlFor="event-banner-upload">
                                    <Button type="button" variant="outline" asChild>
                                        <span>
                                            <ImagePlus className="mr-2 h-4 w-4" />
                                            {data.event_banner ? 'Change Banner' : 'Add Banner'}
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="event-banner-upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleBannerChange}
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    JPEG, PNG, or WebP. Max 10MB.
                                    {isEdit && ' Selecting a new banner will replace the existing one on save.'}
                                </p>

                                {errors.event_banner && <p className="mt-1 text-sm text-destructive">{errors.event_banner}</p>}
                                {progress && (
                                    <div className="mt-2 h-1 w-full overflow-hidden rounded bg-slate-200">
                                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress.percentage ?? 0}%` }} />
                                    </div>
                                )}
                            </div>

                            {/* Publish toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="is_published" className="text-base">
                                        Publish immediately
                                    </Label>
                                    <p className="text-sm text-muted-foreground">When off, the event is saved as a draft.</p>
                                </div>
                                <Switch
                                    id="is_published"
                                    checked={data.is_published}
                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href={`/${slug}/admin/event`}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

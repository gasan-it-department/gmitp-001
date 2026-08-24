import { FormInput } from '@/components/FormInputField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, Globe, ImagePlus, LayoutDashboard, MapPin, X } from 'lucide-react';
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
    location_name: string | null;
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

    const { data, setData, post, processing, errors, clearErrors, progress, isDirty, reset } = useForm<FormShape>(initialForm);

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
        <>
            <Head title={isEdit ? `Edit ${event!.title}` : 'New Event'} />

            <div className="mx-auto max-w-6xl p-6 lg:p-8">
                <form onSubmit={submit} className="space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1.5">
                            <Link
                                href={`/${slug}/admin/event`}
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Events
                            </Link>
                            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
                                {isEdit ? 'Edit Event' : 'Create New Event'}
                                {isDirty && (
                                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Unsaved Changes</span>
                                )}
                            </h1>
                            <p className="text-muted-foreground">
                                {isEdit
                                    ? 'Update the details, schedule, and media for your event.'
                                    : 'Fill in the details to publish a new event for the community.'}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <Link href={`/${slug}/admin/event`}>
                                {isDirty && (
                                    <Button onClick={() => reset()} type="button" variant="outline" className="w-full sm:w-auto">
                                        Discard Changes
                                    </Button>
                                )}
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing || (!isDirty && isEdit)} // <--- Moved here!
                                className="w-full sm:w-auto"
                            >
                                {processing ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
                            </Button>
                        </div>
                    </div>

                    {/* Form Layout Grid */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content Column (Left side) */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* General Information */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        General Information
                                    </CardTitle>
                                    <CardDescription>Provide the basic details that describe this event.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormInput
                                        label="Event Title"
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => {
                                            setData('title', e.target.value);
                                            clearErrors('title');
                                        }}
                                        placeholder="e.g., Annual Town Fiesta 2026"
                                        required
                                        error={errors.title}
                                    />

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="font-medium">
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
                                            className="resize-y"
                                            placeholder="Tell citizens what to expect at this event…"
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Schedule & Location */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        Schedule & Location
                                    </CardTitle>
                                    <CardDescription>Add an end time and physical venue only when they apply to the event.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <FormInput
                                            label="Start Date & Time"
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
                                        <div className="space-y-1.5">
                                            <FormInput
                                                label="End Date & Time (Optional)"
                                                id="end_datetime"
                                                type="datetime-local"
                                                value={data.end_datetime}
                                                min={data.start_datetime || undefined}
                                                onChange={(e) => {
                                                    setData('end_datetime', e.target.value);
                                                    clearErrors('end_datetime');
                                                }}
                                                error={errors.end_datetime}
                                            />
                                            <p className="text-xs leading-5 text-muted-foreground">
                                                Leave blank when no ending time has been announced.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="relative">
                                            <FormInput
                                                label="Location (Optional)"
                                                id="location_name"
                                                value={data.location_name}
                                                onChange={(e) => {
                                                    setData('location_name', e.target.value);
                                                    clearErrors('location_name');
                                                }}
                                                placeholder="e.g., Municipal Plaza, Town Hall"
                                                error={errors.location_name}
                                            />
                                            <MapPin className="pointer-events-none absolute top-[38px] right-3 h-4 w-4 text-muted-foreground opacity-50" />
                                        </div>
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            Leave blank for online, municipality-wide, or venue-free events.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Column (Right side) */}
                        <div className="space-y-8">
                            {/* Publishing Status */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Globe className="h-5 w-5 text-muted-foreground" />
                                        Publishing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-4 rounded-lg border bg-slate-50/50 p-4 shadow-sm transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_published" className="text-base font-medium">
                                                    {data.is_published ? 'Published' : 'Draft'}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {data.is_published ? 'Visible to public' : 'Hidden from public'}
                                                </p>
                                            </div>
                                            <Switch
                                                id="is_published"
                                                checked={data.is_published}
                                                onCheckedChange={(checked) => setData('is_published', checked)}
                                            />
                                        </div>
                                        {data.is_published ? (
                                            <div className="flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-600">
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                                </span>
                                                Event will be live immediately
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-600">
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                                                Event is saved as a draft
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Classification */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                                        Classification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="font-medium">
                                            Event Type <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value) => {
                                                setData('type', value);
                                                clearErrors('type');
                                            }}
                                        >
                                            <SelectTrigger id="type" className="w-full bg-white">
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
                                </CardContent>
                            </Card>

                            {/* Media Upload */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                        Event Banner
                                    </CardTitle>
                                    <CardDescription>Add a high-quality image to represent your event visually.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-slate-50/50">
                                        {/* Existing Banner Preview */}
                                        {isEdit && existingBanner && !willReplaceExisting && (
                                            <div className="w-full space-y-2">
                                                <div className="relative aspect-video w-full overflow-hidden rounded-md border shadow-sm">
                                                    <img src={existingBanner.url} alt={existingBanner.name} className="h-full w-full object-cover" />
                                                </div>
                                                <p className="text-left text-xs font-medium text-muted-foreground">Current Banner Image</p>
                                            </div>
                                        )}

                                        {/* New Banner Preview */}
                                        {bannerPreview && (
                                            <div className="w-full space-y-2">
                                                <div className="relative aspect-video w-full overflow-hidden rounded-md border shadow-sm ring-2 ring-primary/20">
                                                    <img src={bannerPreview} alt="banner preview" className="h-full w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={removeBanner}
                                                        className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/80"
                                                        aria-label="Remove banner"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-left text-xs font-medium text-primary">New Banner Ready</p>
                                            </div>
                                        )}

                                        {/* Empty State */}
                                        {!existingBanner && !bannerPreview && (
                                            <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                                                <div className="rounded-full bg-slate-100 p-3">
                                                    <ImagePlus className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <p className="text-sm font-medium">No banner uploaded</p>
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            disabled={processing}
                                            variant={bannerPreview || existingBanner ? 'outline' : 'secondary'}
                                            className="mt-2 w-full"
                                            onClick={() => document.getElementById('event-banner-upload')?.click()}
                                        >
                                            {data.event_banner || existingBanner ? 'Change Banner Image' : 'Upload Banner Image'}
                                        </Button>

                                        <input
                                            id="event-banner-upload"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleBannerChange}
                                        />

                                        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                            <p>Recommended ratio: 16:9 (Max 10MB)</p>
                                            <p>Supported: JPEG, PNG, WebP</p>
                                        </div>

                                        {errors.event_banner && <p className="mt-1 text-sm font-medium text-destructive">{errors.event_banner}</p>}

                                        {/* Upload Progress Bar */}
                                        {progress && (
                                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                                                    style={{ width: `${progress.percentage ?? 0}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, FileImage, ImagePlus, Info, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type EnumOption = { value: string; label: string };

interface AnnouncementImage {
    id: number | string;
    url: string;
    name?: string;
}

interface AnnouncementDetail {
    id: string;
    title: string;
    content: string;
    type: EnumOption;
    is_published: boolean;
    images: AnnouncementImage[];
}

interface Props {
    announcement: AnnouncementDetail | null;
    types: EnumOption[];
}

type FormShape = {
    title: string;
    content: string;
    type: string;
    is_published: boolean;
    images: File[];
    _method?: 'PUT';
};

const MAX_IMAGES = 3;

export default function AnnouncementForm({ announcement, types }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const isEdit = announcement !== null;

    const initialForm: FormShape = {
        title: announcement?.title ?? '',
        content: announcement?.content ?? '',
        type: announcement?.type?.value ?? 'general',
        is_published: announcement?.is_published ?? false,
        images: [],
        ...(isEdit ? { _method: 'PUT' as const } : {}),
    };

    const { data, setData, post, processing, errors, clearErrors, progress, setError, isDirty, reset } = useForm<FormShape>(initialForm);

    const [previews, setPreviews] = useState<string[]>([]);

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const incoming = Array.from(e.target.files ?? []);
        if (incoming.length === 0) return;

        const imageErrorKeys = Object.keys(errors).filter((key) => key.startsWith('images.')) as (keyof FormShape)[];
        clearErrors('images', ...imageErrorKeys);

        const validIncoming: File[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        let hasSizeError = false;
        let hasTypeError = false;

        for (const file of incoming) {
            if (file.size > maxSize) {
                hasSizeError = true;
            } else if (!validTypes.includes(file.type)) {
                hasTypeError = true;
            } else {
                validIncoming.push(file);
            }
        }

        if (hasSizeError || hasTypeError) {
            let errorMsg = 'Some images were skipped. ';
            if (hasSizeError) errorMsg += 'Each image must be 10MB or smaller. ';
            if (hasTypeError) errorMsg += 'Must be JPEG, PNG, or WebP.';
            setError('images', errorMsg.trim());
        }

        const merged = [...data.images, ...validIncoming].slice(0, MAX_IMAGES);
        setData('images', merged);
        setPreviews(merged.map((f) => URL.createObjectURL(f)));

        e.target.value = '';
    };

    const removeNewImage = (index: number) => {
        const next = data.images.filter((_, i) => i !== index);
        setData('images', next);
        setPreviews(next.map((f) => URL.createObjectURL(f)));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const url = isEdit ? `/api/announcement/${announcement!.id}` : '/api/announcement';

        post(url, {
            headers: { 'X-Municipality-Slug': slug },
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const existingImages = isEdit ? announcement!.images : [];
    const willReplaceExisting = isEdit && data.images.length > 0;

    return (
        <>
            <Head title={isEdit ? `Edit ${announcement!.title}` : 'New Announcement'} />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${slug}/admin/announcement`}
                            className="group mb-2 flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Announcements
                        </Link>
                        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {isEdit ? 'Edit Announcement' : 'Create Announcement'}
                            {isDirty && (
                                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Unsaved Changes</span>
                            )}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/${slug}/admin/announcement`}>
                            {isDirty ? (
                                <Button onClick={() => reset()} type="button" variant="outline" className="rounded-full bg-white px-5 shadow-sm">
                                    Discard Changes
                                </Button>
                            ) : (
                                <Button type="button" variant="outline" className="rounded-full bg-white px-5 shadow-sm">
                                    Cancel
                                </Button>
                            )}
                        </Link>
                        <Button
                            type="submit"
                            form="announcement-form"
                            disabled={processing || (!isDirty && isEdit)}
                            className="rounded-full bg-indigo-600 px-6 shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
                        >
                            {processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Announcement'}
                        </Button>
                    </div>
                </div>

                <form id="announcement-form" onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column - Main Content */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Title & Content */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="title" className="text-sm font-semibold text-slate-900">
                                        Announcement Title
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => {
                                            setData('title', e.target.value);
                                            clearErrors('title');
                                        }}
                                        className="mt-2 h-12 rounded-xl border-slate-200 text-lg shadow-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g., Scheduled Power Interruption - Sept 15"
                                        required
                                    />
                                    {errors.title && <p className="mt-2 text-sm font-medium text-red-500">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="content" className="text-sm font-semibold text-slate-900">
                                        Detailed Content
                                    </Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => {
                                            setData('content', e.target.value);
                                            clearErrors('content');
                                        }}
                                        rows={12}
                                        className="mt-2 rounded-xl border-slate-200 text-base shadow-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Provide the full details of the announcement here..."
                                    />
                                    {errors.content && <p className="mt-2 text-sm font-medium text-red-500">{errors.content}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Media Attachments</h2>
                                    <p className="mt-1 text-sm text-slate-500">Upload up to {MAX_IMAGES} images to support your announcement.</p>
                                </div>
                            </div>

                            <label
                                htmlFor="images-upload"
                                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
                                    data.images.length >= MAX_IMAGES
                                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
                                        : 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-300 hover:bg-indigo-50/80'
                                }`}
                            >
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="mb-4 rounded-full bg-indigo-100 p-3 text-indigo-600 transition-colors group-hover:bg-indigo-200">
                                        <ImagePlus className="h-6 w-6" />
                                    </div>
                                    <p className="mb-1 text-sm font-medium text-slate-700">
                                        <span className="text-indigo-600 group-hover:text-indigo-700">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500">PNG, JPG, or WEBP up to 10MB</p>
                                    {data.images.length >= MAX_IMAGES && (
                                        <p className="mt-2 text-xs font-semibold text-amber-600">Maximum images reached</p>
                                    )}
                                </div>
                                <input
                                    id="images-upload"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleImagesChange}
                                    disabled={data.images.length >= MAX_IMAGES}
                                />
                            </label>

                            {/* Errors */}
                            {errors.images && <p className="mt-3 text-sm font-medium text-red-500">{errors.images}</p>}
                            {Object.entries(errors)
                                .filter(([key]) => key.startsWith('images.'))
                                .map(([key, error]) => (
                                    <p key={key} className="mt-1 text-sm font-medium text-red-500">
                                        {error as string}
                                    </p>
                                ))}

                            {/* Previews */}
                            {isEdit && existingImages.length > 0 && !willReplaceExisting && (
                                <div className="mt-8">
                                    <p className="mb-3 flex items-center text-sm font-semibold text-slate-900">
                                        <FileImage className="mr-2 h-4 w-4 text-slate-500" />
                                        Current Images
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {existingImages.map((img) => (
                                            <div
                                                key={img.id}
                                                className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-md"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.name ?? 'announcement image'}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex items-start rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                                        <Info className="mt-0.5 mr-2 h-4 w-4 shrink-0" />
                                        <span>Selecting new images above will replace these existing images when you save.</span>
                                    </div>
                                </div>
                            )}

                            {previews.length > 0 && (
                                <div className="mt-8">
                                    <p className="mb-3 flex items-center text-sm font-semibold text-slate-900">
                                        <FileImage className="mr-2 h-4 w-4 text-slate-500" />
                                        New Images to Upload
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {previews.map((src, i) => (
                                            <div
                                                key={`${src}-${i}`}
                                                className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-md"
                                            >
                                                <img
                                                    src={src}
                                                    alt={`preview ${i + 1}`}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(i)}
                                                    className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-slate-700 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                                                    aria-label="Remove image"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {progress && (
                                <div className="mt-6 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                                        style={{ width: `${progress.percentage ?? 0}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Settings */}
                    <div className="space-y-6">
                        <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-5 text-xs font-bold tracking-wider text-slate-400 uppercase">Settings</h3>

                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="type" className="text-sm font-semibold text-slate-900">
                                        Category
                                    </Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => {
                                            setData('type', value);
                                            clearErrors('type');
                                        }}
                                    >
                                        <SelectTrigger id="type" className="mt-2 h-11 w-full rounded-xl border-slate-200 shadow-sm">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {types.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="mt-2 text-sm font-medium text-red-500">{errors.type}</p>}
                                </div>

                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 transition-colors hover:bg-indigo-50">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="is_published" className="cursor-pointer text-sm font-semibold text-indigo-950">
                                                Publish Instantly
                                            </Label>
                                            <p className="text-xs text-indigo-700/80">Make visible to the public</p>
                                        </div>
                                        <Switch
                                            id="is_published"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) => setData('is_published', checked)}
                                            className="data-[state=checked]:bg-indigo-600"
                                        />
                                    </div>
                                    {!data.is_published && (
                                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/60 p-2.5 text-xs text-slate-600">
                                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                            <span>This announcement will be saved as a draft and hidden from the public portal.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

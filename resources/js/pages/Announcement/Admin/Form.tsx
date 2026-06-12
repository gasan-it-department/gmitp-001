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

    const { data, setData, post, processing, errors, clearErrors, progress, setError } = useForm<FormShape>(initialForm);

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
        <AppLayout>
            <Head title={isEdit ? `Edit ${announcement!.title}` : 'New Announcement'} />

            <div className="m-6 max-w-3xl space-y-6">
                <Link href={`/${slug}/admin/announcement`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEdit ? 'Edit Announcement' : 'Create Announcement'}</CardTitle>
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
                                placeholder="e.g., Water service interruption — Sept 15"
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

                            {/* Content */}
                            <div>
                                <Label htmlFor="content">
                                    Content <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => {
                                        setData('content', e.target.value);
                                        clearErrors('content');
                                    }}
                                    rows={8}
                                    placeholder="Write the announcement body here…"
                                />
                                {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content}</p>}
                            </div>

                            {/* Images — max 3 */}
                            <div>
                                <Label className="mb-2 block">
                                    Images <span className="text-xs font-normal text-muted-foreground">(up to {MAX_IMAGES})</span>
                                </Label>

                                {/* Existing images (edit mode) */}
                                {isEdit && existingImages.length > 0 && !willReplaceExisting && (
                                    <div className="mb-3">
                                        <p className="mb-2 text-xs text-muted-foreground">Current images:</p>
                                        <div className="flex flex-wrap gap-3">
                                            {existingImages.map((img) => (
                                                <div key={img.id} className="h-24 w-24 overflow-hidden rounded-lg border bg-slate-50">
                                                    <img
                                                        src={img.url}
                                                        alt={img.name ?? 'announcement image'}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New image previews */}
                                {previews.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-3">
                                        {previews.map((src, i) => (
                                            <div key={`${src}-${i}`} className="relative h-24 w-24 overflow-hidden rounded-lg border bg-slate-50">
                                                <img src={src} alt={`preview ${i + 1}`} className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(i)}
                                                    className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                                                    aria-label="Remove image"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <label htmlFor="images-upload">
                                    <Button type="button" variant="outline" asChild disabled={data.images.length >= MAX_IMAGES}>
                                        <span>
                                            <ImagePlus className="mr-2 h-4 w-4" />
                                            {data.images.length >= MAX_IMAGES ? 'Maximum reached' : 'Add Image'}
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="images-upload"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleImagesChange}
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    JPEG, PNG, or WebP. Max 10MB each.
                                    {isEdit && ' Selecting new images will replace the existing ones on save.'}
                                </p>

                                {errors.images && <p className="mt-1 text-sm text-destructive">{errors.images}</p>}
                                {Object.entries(errors)
                                    .filter(([key]) => key.startsWith('images.'))
                                    .map(([key, error]) => (
                                        <p key={key} className="mt-1 text-sm text-destructive">
                                            {error as string}
                                        </p>
                                    ))}
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
                                    <p className="text-sm text-muted-foreground">When off, the announcement is saved as a draft.</p>
                                </div>
                                <Switch
                                    id="is_published"
                                    checked={data.is_published}
                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href={`/${slug}/admin/announcement`}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Announcement'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import tourism from '@/routes/tourism';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import React, { useState } from 'react';

interface Type {
    value: string;
    label: string;
}

interface Props {
    categoryType: any;
    categories: { data: any };
}

export default function CreateTourismAssetForm({ categoryType, categories }: Props) {
    const categoriesData = categories.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    // 1. INERTIA USEFORM
    const { data, setData, post, processing, errors, clearErrors, progress } = useForm({
        category_id: '', // Ensure this is dynamic if you are passing categories!
        type: '',
        name: '',
        short_description: '',
        description: '',
        is_published: false,
        meta: {},
        cover: null as File | null,
        gallery: [] as File[],
    });

    // 2. PREVIEW STATE
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const filteredCategories = categoriesData.filter((category: any) => category.type === data.type);

    // 3. HANDLERS FOR TEXT & JSON
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData(e.target.name as any, e.target.value);
        clearErrors(e.target.name as any);
    };

    const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('meta', { ...data.meta, [e.target.name]: e.target.value });
        clearErrors(`meta.${e.target.name}` as any);
    };

    // 4. HANDLERS FOR FILE UPLOADS + PREVIEWS
    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('cover', file);
            setCoverPreview(URL.createObjectURL(file));
            clearErrors('cover');
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            // Append new files to the existing array
            setData('gallery', [...data.gallery, ...newFiles]);

            // Append new previews
            const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
            setGalleryPreviews((prev) => [...prev, ...newPreviews]);

            clearErrors('gallery');

            // Reset input so they can select the same file again if they delete it
            e.target.value = '';
        }
    };

    const removeGalleryImage = (indexToRemove: number) => {
        setData(
            'gallery',
            data.gallery.filter((_, index) => index !== indexToRemove),
        );
        setGalleryPreviews(galleryPreviews.filter((_, index) => index !== indexToRemove));
    };

    // 5. SUBMIT FUNCTION
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(tourism.asset.store.url(), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => {
                console.log('Asset successfully created!');
            },
        });
    };

    // Cancel navigation helper
    const handleCancel = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-slate-100/50 pb-20 font-sans text-slate-900">
            <form onSubmit={submit}>
                {/* * TOP NAVIGATION BAR (Sticky)
                 * This locks to the top of the screen, acting as the control center
                 * since there is no sidebar.
                 */}
                <div className="sticky top-0 z-40 border-b bg-white shadow-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
                            >
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-xl leading-tight font-bold tracking-tight">Create Tourism Asset</h1>
                                <p className="text-sm text-slate-500">Adding to {currentMunicipality.name} Directory</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button type="button" variant="ghost" onClick={handleCancel} disabled={processing}>
                                Discard
                            </Button>

                            <Button type="submit" className="relative overflow-hidden px-8" disabled={processing}>
                                {/* Background Progress Fill */}
                                {progress && (
                                    <div
                                        className="absolute top-0 bottom-0 left-0 bg-white/20 transition-all duration-300"
                                        style={{ width: `${progress.percentage}%` }}
                                    />
                                )}
                                {processing ? <span>Uploading... {progress ? `${progress.percentage}%` : ''}</span> : <span>Save Asset</span>}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* * MAIN CONTENT CONTAINER
                 * Constrained width so it doesn't stretch weirdly on 4K monitors.
                 */}
                <main className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* DISCRIMINATOR CARD */}
                    <Card className="mb-8 border-t-4 border-t-primary shadow-sm">
                        <CardHeader>
                            <CardTitle>What are you adding to Gasan?</CardTitle>
                            <CardDescription>Select a category to load the correct data fields.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>Asset Type</Label>
                                <Select
                                    value={data.type ? String(data.type) : undefined}
                                    onValueChange={(value) => {
                                        // THE FIX: When they change the Type, we must clear the category_id!
                                        setData({
                                            ...data,
                                            type: value,
                                            category_id: '', // <--- Reset the child dropdown!
                                            meta: {},
                                        });
                                        clearErrors();
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-slate-50 sm:w-[400px]">
                                        <SelectValue placeholder="Select a category to begin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryType.map((catType: any) => (
                                            <SelectItem key={catType.value} value={String(catType.value)}>
                                                {catType.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 2nd Dropdown: SPECIFIC CATEGORY */}
                            <div className="space-y-2">
                                <Label>Specific Category (Public Tag)</Label>
                                <Select
                                    value={data.category_id ? String(data.category_id) : undefined}
                                    onValueChange={(value) => {
                                        setData('category_id', value);
                                        clearErrors('category_id');
                                    }}
                                    // UX UPGRADE: Disable this dropdown entirely until they pick a Type!
                                    disabled={!data.type}
                                >
                                    <SelectTrigger className="w-full sm:w-[400px]">
                                        <SelectValue placeholder={data.type ? 'Select a specific tag...' : 'Select an Asset Type first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Notice we map over filteredCategories now, NOT categoriesData */}
                                        {filteredCategories.map((category: any) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TWO-COLUMN EDITOR LAYOUT (Only shows after type is selected) */}
                    {data.type && (
                        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                            {/* LEFT COLUMN: Data Entry (Takes up 2/3 of the space on Desktop) */}
                            <div className="space-y-8 lg:col-span-2">
                                {/* BASIC INFO */}
                                <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                name="name"
                                                value={data.name}
                                                placeholder="e.g., HappyRoo"
                                                onChange={handleChange}
                                                className="text-lg font-medium"
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Short Description (For Cards)</Label>
                                            <Input
                                                name="short_description"
                                                value={data.short_description}
                                                maxLength={150}
                                                placeholder="A brief one-liner..."
                                                onChange={handleChange}
                                            />
                                            {errors.short_description && <p className="text-sm text-red-500">{errors.short_description}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Full Description</Label>
                                            <Textarea
                                                name="description"
                                                value={data.description}
                                                rows={10}
                                                placeholder="Full details..."
                                                onChange={handleChange}
                                                className="resize-y"
                                            />
                                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* DYNAMIC JSON POCKET */}
                                <Card className="bg-slate-50 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                    <CardHeader>
                                        <CardTitle className="text-primary">
                                            {data.type === 'establishment' && 'Establishment Details'}
                                            {data.type === 'event' && 'Event Schedule & Details'}
                                            {data.type === 'heritage' && 'Historical Context'}
                                            {data.type === 'spot' && 'Visitor Information'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        {/* --- ESTABLISHMENT FIELDS --- */}
                                        {data.type === 'establishment' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label>Exact Address</Label>
                                                    <Input name="address" placeholder="e.g., Bahi, Gasan" onChange={handleMetaChange} />
                                                    {errors['meta.address'] && <p className="text-sm text-red-500">{errors['meta.address']}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Contact Number</Label>
                                                    <Input name="contact_number" placeholder="+63..." onChange={handleMetaChange} />
                                                    {errors['meta.contact_number'] && (
                                                        <p className="text-sm text-red-500">{errors['meta.contact_number']}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2 sm:col-span-2">
                                                    <Label>Available Rooms / Capacity</Label>
                                                    <Input name="available_rooms" placeholder="e.g., 8 Rooms" onChange={handleMetaChange} />
                                                    {errors['meta.available_rooms'] && (
                                                        <p className="text-sm text-red-500">{errors['meta.available_rooms']}</p>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {/* --- EVENT FIELDS --- */}
                                        {data.type === 'event' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label>Start Date</Label>
                                                    <Input type="date" name="start_date" onChange={handleMetaChange} />
                                                    {errors['meta.start_date'] && <p className="text-sm text-red-500">{errors['meta.start_date']}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>End Date</Label>
                                                    <Input type="date" name="end_date" onChange={handleMetaChange} />
                                                    {errors['meta.end_date'] && <p className="text-sm text-red-500">{errors['meta.end_date']}</p>}
                                                </div>
                                                <div className="space-y-2 sm:col-span-2">
                                                    <Label>Organizer Name</Label>
                                                    <Input name="organizer" placeholder="e.g., Gasan LGU" onChange={handleMetaChange} />
                                                    {errors['meta.organizer'] && <p className="text-sm text-red-500">{errors['meta.organizer']}</p>}
                                                </div>
                                            </>
                                        )}

                                        {/* --- HERITAGE FIELDS --- */}
                                        {data.type === 'heritage' && (
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label>Historical Era / Year Built</Label>
                                                <Input
                                                    name="historical_era"
                                                    placeholder="e.g., Spanish Colonial Period"
                                                    onChange={handleMetaChange}
                                                />
                                                {errors['meta.historical_era'] && (
                                                    <p className="text-sm text-red-500">{errors['meta.historical_era']}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* --- SPOT FIELDS --- */}
                                        {data.type === 'spot' && (
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label>Entrance Fee</Label>
                                                <Input name="entrance_fee" placeholder="e.g., ₱50.00 (Adults)" onChange={handleMetaChange} />
                                                {errors['meta.entrance_fee'] && <p className="text-sm text-red-500">{errors['meta.entrance_fee']}</p>}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: Media & Publishing */}
                            <div className="space-y-8 lg:col-span-1">
                                {/* PUBLISHING CONTROLS */}
                                <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                    <CardHeader>
                                        <CardTitle>Visibility</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Publish Asset</Label>
                                                <p className="text-sm text-slate-500">Make visible to the public.</p>
                                            </div>
                                            <Switch checked={data.is_published} onCheckedChange={(checked) => setData('is_published', checked)} />
                                        </div>
                                        {errors.is_published && <p className="mt-2 text-sm text-red-500">{errors.is_published}</p>}
                                    </CardContent>
                                </Card>

                                {/* MEDIA UPLOADER */}
                                <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                    <CardHeader>
                                        <CardTitle>Media Gallery</CardTitle>
                                        <CardDescription>Upload photos for the directory.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* COVER PHOTO */}
                                        <div className="space-y-2">
                                            <Label>Cover Photo (Required to Publish)</Label>
                                            <Label
                                                htmlFor="cover-upload"
                                                className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-slate-50 transition-colors hover:bg-slate-100"
                                            >
                                                {coverPreview ? (
                                                    <img src={coverPreview} alt="Cover Preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                                                        <ImagePlus className="mb-2 h-8 w-8" />
                                                        <p className="text-sm font-semibold">Click to upload cover</p>
                                                        <p className="text-xs">PNG, JPG up to 5MB</p>
                                                    </div>
                                                )}
                                            </Label>
                                            <Input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                                            {errors.cover && <p className="text-sm text-red-500">{errors.cover}</p>}
                                        </div>

                                        {/* MULTI-GALLERY */}
                                        <div className="space-y-2 border-t pt-4">
                                            <Label>Supporting Gallery</Label>
                                            <Label
                                                htmlFor="gallery-upload"
                                                className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 transition-colors hover:bg-slate-100"
                                            >
                                                <div className="flex items-center text-slate-500">
                                                    <ImagePlus className="mr-2 h-5 w-5" />
                                                    <span className="text-sm font-medium">Add images</span>
                                                </div>
                                            </Label>
                                            <Input
                                                id="gallery-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleGalleryChange}
                                            />

                                            {/* GALLERY PREVIEWS WITH REMOVE FIX */}
                                            {galleryPreviews.length > 0 && (
                                                <div className="mt-4 grid grid-cols-3 gap-3">
                                                    {galleryPreviews.map((src, index) => (
                                                        <div
                                                            key={index}
                                                            className="group relative aspect-square overflow-hidden rounded-md border shadow-sm"
                                                        >
                                                            <img
                                                                src={src}
                                                                alt={`Gallery ${index}`}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />

                                                            {/* Remove Image Button overlay */}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryImage(index)}
                                                                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {errors.gallery && <p className="text-sm text-red-500">{errors.gallery}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </main>
            </form>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, FileIcon, Loader2, MapPin, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

type CategoryOption = { value: string; label: string };

interface CreateReportProps {
    categories: CategoryOption[];
}

type ReportFormShape = {
    category: string;
    location_text: string;
    latitude: number | null;
    longitude: number | null;
    description: string;
    is_anonymous: boolean;
    evidence_photos: File[];
};

const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB

export default function Create({ categories }: CreateReportProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const { data, setData, post, processing, errors, reset } = useForm<ReportFormShape>({
        category: '',
        location_text: '',
        latitude: null,
        longitude: null,
        description: '',
        is_anonymous: false,
        evidence_photos: [],
    });

    const [fileError, setFileError] = useState<string | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const handleGetLocation = () => {
        setGeoError(null);

        if (!('geolocation' in navigator)) {
            setGeoError('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData((prev) => ({
                    ...prev,
                    latitude: Number(position.coords.latitude.toFixed(8)),
                    longitude: Number(position.coords.longitude.toFixed(8)),
                }));
                setIsLocating(false);
            },
            (err) => {
                setGeoError(err.message || 'Unable to retrieve your location.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
    };

    const clearLocation = () => {
        setData((prev) => ({ ...prev, latitude: null, longitude: null }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const incoming = Array.from(e.target.files);
        const combined = [...data.evidence_photos, ...incoming].slice(0, MAX_FILES);

        const totalSize = combined.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            setFileError('Total file size exceeds 50 MB limit.');
            return;
        }
        setFileError(null);
        setData('evidence_photos', combined);
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setData(
            'evidence_photos',
            data.evidence_photos.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFileError(null);

        post('/api/community-report', {
            forceFormData: true,
            preserveScroll: true,
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <PublicLayout description="" title="">
            <Head title="Report a Community Issue" />

            <div className="container mx-auto max-w-2xl py-8">
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Report a Community Issue</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Help us improve your community by reporting potholes, broken streetlights, water leaks, and other local problems.
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* CATEGORY */}
                            <div>
                                <Label className="mb-3 block font-semibold text-foreground">
                                    Issue Category <span className="text-destructive">*</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {categories.map((cat) => {
                                        const isSelected = data.category === cat.value;
                                        return (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setData('category', cat.value)}
                                                className={`flex min-h-[60px] items-center justify-center rounded-xl border p-3 text-center text-sm font-semibold transition-all duration-200 active:scale-95 ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/50 hover:text-foreground'
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.category && <p className="mt-2 text-sm text-destructive">{errors.category}</p>}
                            </div>

                            {/* LOCATION TEXT */}
                            <div>
                                <Label className="font-semibold text-foreground">
                                    Location Description <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={data.location_text}
                                    onChange={(e) => setData('location_text', e.target.value)}
                                    placeholder="e.g. Corner of Rizal St. and Mabini Ave., near barangay hall"
                                    className={errors.location_text ? 'border-destructive' : ''}
                                />
                                {errors.location_text && <p className="text-sm text-destructive">{errors.location_text}</p>}
                            </div>

                            {/* GEOLOCATION */}
                            <div>
                                <Label className="mb-2 block font-semibold text-foreground">GPS Coordinates (Optional)</Label>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isLocating}>
                                        {isLocating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Locating…
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="mr-2 h-4 w-4" />
                                                Get My Location
                                            </>
                                        )}
                                    </Button>

                                    {data.latitude !== null && data.longitude !== null && (
                                        <div className="flex items-center gap-3 text-sm text-foreground">
                                            <span>
                                                Lat: <b>{data.latitude}</b>, Lng: <b>{data.longitude}</b>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={clearLocation}
                                                className="text-xs text-muted-foreground underline hover:text-destructive"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {geoError && (
                                    <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        {geoError}
                                    </div>
                                )}
                                {(errors.latitude || errors.longitude) && (
                                    <p className="mt-2 text-sm text-destructive">{errors.latitude ?? errors.longitude}</p>
                                )}
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <Label className="font-semibold text-foreground">
                                    Description <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    rows={6}
                                    maxLength={5000}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the issue: when you noticed it, severity, any safety concerns…"
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            {/* IS ANONYMOUS */}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is-anonymous"
                                    checked={data.is_anonymous}
                                    onCheckedChange={(checked) => setData('is_anonymous', checked === true)}
                                />
                                <Label htmlFor="is-anonymous" className="cursor-pointer font-medium text-foreground">
                                    Submit anonymously (your name will be hidden on public displays)
                                </Label>
                            </div>

                            {/* EVIDENCE PHOTOS */}
                            <div>
                                <Label className="font-semibold text-foreground">Evidence Photos (Optional)</Label>
                                <p className="text-sm text-muted-foreground">
                                    Upload up to <b>5 photos</b>, total size must not exceed <b>50 MB</b>. JPEG, PNG, or WebP.
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('evidence-photos')?.click()}
                                    className="mt-2"
                                    disabled={data.evidence_photos.length >= MAX_FILES}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {data.evidence_photos.length >= MAX_FILES ? 'Max Photos Reached' : 'Choose Photos'}
                                </Button>

                                <input
                                    id="evidence-photos"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {(fileError || errors.evidence_photos) && (
                                    <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        {fileError ?? errors.evidence_photos}
                                    </div>
                                )}

                                {data.evidence_photos.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {data.evidence_photos.map((file, index) => (
                                            <div
                                                key={`${file.name}-${index}`}
                                                className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm"
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                                    <FileIcon className="h-4 w-4 text-primary" />
                                                    <span className="max-w-[200px] truncate text-foreground">{file.name}</span>
                                                    <span className="text-xs whitespace-nowrap text-muted-foreground">
                                                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="h-6 w-6 flex-shrink-0 p-0 text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* SUBMIT */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                                    disabled={processing}
                                >
                                    {processing ? 'Submitting…' : 'Submit Report'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}

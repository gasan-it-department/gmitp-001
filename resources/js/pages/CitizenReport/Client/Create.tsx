import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, FileIcon, Loader2, MapPin, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

type CategoryOption = { value: string; label: string };

interface CreateReportProps {
    categories: CategoryOption[];
    is_eligible: boolean;
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

export default function Create({ categories, is_eligible }: CreateReportProps) {
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
    const [isCompressing, setIsCompressing] = useState(false);

    const handleGetLocation = () => {
        setGeoError(null);

        if (!('geolocation' in navigator)) {
            setGeoError('Hindi suportado ng iyong browser ang geolocation.');
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
                setGeoError('Hindi makuha ang iyong lokasyon. Pakisuri ang iyong settings.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
    };

    const clearLocation = () => {
        setData((prev) => ({ ...prev, latitude: null, longitude: null }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        
        const incoming = Array.from(e.target.files);
        const availableSlots = MAX_FILES - data.evidence_photos.length;
        const filesToProcess = incoming.slice(0, availableSlots);

        if (filesToProcess.length === 0) return;

        setIsCompressing(true);
        setFileError(null);

        // Yield to the main thread so React can render the "Inihahanda..." UI
        await new Promise((resolve) => setTimeout(resolve, 50));

        const compressedFiles: File[] = [];

        const options = {
            maxSizeMB: 1,           // Shrink to ~1MB
            maxWidthOrHeight: 1920,  // Standard HD
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
                    console.error("Compression failed for:", file.name, error);
                    compressedFiles.push(file); 
                }
            } else {
                compressedFiles.push(file);
            }
        }

        const combined = [...data.evidence_photos, ...compressedFiles];
        const totalSize = combined.reduce((acc, file) => acc + file.size, 0);

        if (totalSize > MAX_TOTAL_SIZE) {
            setFileError('Sobra sa 50 MB ang kabuuang laki ng iyong mga litrato kahit pagkatapos ng compression.');
            setIsCompressing(false);
            return;
        }

        setData('evidence_photos', combined);
        setIsCompressing(false);
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
        if (!is_eligible || isCompressing) return;

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
            <Head title="I-ulat ang Problema sa Komunidad" />

            <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
                <Card className="border-none shadow-xl sm:border sm:shadow-lg">
                    <CardHeader className="space-y-2 pb-6">
                        <CardTitle className="text-xl font-extrabold tracking-tight sm:text-2xl">
                            I-ulat ang Problema sa Komunidad
                        </CardTitle>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Tulungan kaming mapabuti ang ating bayan. I-ulat ang mga butas sa kalsada, sirang ilaw, tagas ng tubig, at iba pang problema.
                        </p>
                    </CardHeader>

                    <CardContent>
                        {!is_eligible ? (
                            <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-amber-50 p-8 text-center border border-amber-200">
                                <AlertCircle className="h-12 w-12 text-amber-500" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-amber-900">Naabot mo na ang limitasyon</h3>
                                    <p className="text-sm text-amber-700">
                                        Paumanhin, ang bawat mamamayan ay pinapayagan lamang ng hanggang <b>3 ulat kada araw</b>.
                                        Maaari kang muling mag-ulat bukas. Maraming salamat sa iyong malasakit!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* CATEGORY */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Uri ng Problema <span className="text-destructive">*</span>
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

                                {/* LOCATION TEXT */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Eksaktong Lokasyon <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        value={data.location_text}
                                        onChange={(e) => setData('location_text', e.target.value)}
                                        placeholder="Hal: Kanto ng Rizal St. at Mabini Ave., tapat ng barangay hall"
                                        className={`rounded-xl h-12 ${errors.location_text ? 'border-destructive ring-destructive/20' : 'bg-slate-50'}`}
                                    />
                                    {errors.location_text && <p className="text-xs font-medium text-destructive">{errors.location_text}</p>}
                                </div>

                                {/* GEOLOCATION */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">GPS Coordinates (Optional)</Label>
                                        {data.latitude !== null && (
                                            <button
                                                type="button"
                                                onClick={clearLocation}
                                                className="text-xs font-bold text-destructive hover:underline"
                                            >
                                                Alisin
                                            </button>
                                        )}
                                    </div>

                                    {!data.latitude ? (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleGetLocation}
                                            disabled={isLocating}
                                            className="w-full h-12 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200"
                                        >
                                            {isLocating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Kinukuha ang lokasyon…
                                                </>
                                            ) : (
                                                <>
                                                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                                                    Gamitin ang aking lokasyon
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="overflow-hidden rounded-2xl border-2 border-slate-100 shadow-sm">
                                                <iframe
                                                    width="100%"
                                                    height="200"
                                                    style={{ border: 0 }}
                                                    loading="lazy"
                                                    src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=16&output=embed`}
                                                ></iframe>
                                            </div>
                                            <p className="text-center text-[11px] font-bold text-slate-400">
                                                LAT: {data.latitude} • LNG: {data.longitude}
                                            </p>
                                        </div>
                                    )}

                                    {geoError && (
                                        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            {geoError}
                                        </div>
                                    )}
                                </div>

                                {/* DESCRIPTION */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Karagdagang Detalye <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        rows={5}
                                        maxLength={5000}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="I-larawan ang problema: gaano ito kalubha, kailan mo napansin, atbp."
                                        className={`rounded-xl resize-none ${errors.description ? 'border-destructive ring-destructive/20' : 'bg-slate-50'}`}
                                    />
                                    {errors.description && <p className="text-xs font-medium text-destructive">{errors.description}</p>}
                                </div>

                                {/* EVIDENCE PHOTOS */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Litrato (Optional)</Label>
                                    
                                    <div 
                                        onClick={() => data.evidence_photos.length < MAX_FILES && document.getElementById('evidence-photos')?.click()}
                                        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors ${
                                            data.evidence_photos.length >= MAX_FILES 
                                                ? 'bg-slate-50 border-slate-200 cursor-not-allowed' 
                                                : 'bg-slate-50/50 border-slate-200 hover:border-primary/50 cursor-pointer'
                                        }`}
                                    >
                                        <Upload className={`h-8 w-8 mb-2 ${data.evidence_photos.length >= MAX_FILES ? 'text-slate-300' : 'text-primary/60'}`} />
                                        <p className="text-xs font-bold text-slate-600">
                                            {data.evidence_photos.length >= MAX_FILES ? 'Puno na ang limitasyon' : 'Mag-upload ng Litrato'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">Hanggang 5 litrato (Max 50MB)</p>
                                    </div>

                                    <input
                                        id="evidence-photos"
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    {data.evidence_photos.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {data.evidence_photos.map((file, index) => (
                                                <div
                                                    key={`${file.name}-${index}`}
                                                    className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                                >
                                                    <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                                                        <FileIcon className="h-6 w-6 text-primary/40 mb-1" />
                                                        <span className="line-clamp-1 text-[10px] font-bold text-slate-600 px-2">{file.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-destructive shadow-sm hover:bg-destructive hover:text-white transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* IS ANONYMOUS */}
                                <div className="flex items-center space-x-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4">
                                    <Checkbox
                                        id="is-anonymous"
                                        checked={data.is_anonymous}
                                        onCheckedChange={(checked) => setData('is_anonymous', checked === true)}
                                        className="h-5 w-5 rounded-md"
                                    />
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is-anonymous" className="cursor-pointer text-sm font-bold text-slate-700">
                                            I-ulat bilang Anonymous
                                        </Label>
                                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                                            Itatago ang iyong pangalan sa mga pampublikong display.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] transition-all"
                                        disabled={processing || isCompressing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                I-sinusumite…
                                            </>
                                        ) : isCompressing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Inihahanda…
                                            </>
                                        ) : (
                                            'I-sumite ang Ulat'
                                        )}
                                    </Button>
                                    <p className="mt-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        Ligtas at Mabilis na Serbisyo
                                    </p>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}


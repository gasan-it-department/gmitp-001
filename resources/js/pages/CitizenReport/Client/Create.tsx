import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';
import { AlertCircle, AlertTriangle, ArrowLeft, Check, FileIcon, Loader2, MapPin, MapPinned, ShieldCheck, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

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
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

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
            () => {
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
        await new Promise((resolve) => setTimeout(resolve, 50));

        const compressedFiles: File[] = [];
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        for (const file of filesToProcess) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressedBlob = await imageCompression(file, options);
                    compressedFiles.push(
                        new File([compressedBlob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        }),
                    );
                } catch (error) {
                    console.error('Compression failed for:', file.name, error);
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
            onSuccess: () => reset(),
        });
    };

    const fieldClass = 'h-12 rounded-lg border-border bg-background shadow-sm focus-visible:ring-primary/20';

    return (
        <PublicLayout description="" title="Community Report">
            <Head title="I-ulat ang Problema sa Komunidad" />

            <div className="min-h-[calc(100vh-5rem)] bg-muted/20">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                    <Link
                        href={`/${currentMunicipality.slug}/home`}
                        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Bumalik sa Home
                    </Link>

                    <div className="grid overflow-hidden rounded-lg border border-border/70 bg-background shadow-xl shadow-primary/5 lg:grid-cols-[0.72fr_1.35fr]">
                        <aside className="flex flex-col bg-primary p-7 text-primary-foreground sm:p-9 lg:min-h-[780px] lg:p-10">
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10">
                                <MapPinned className="h-7 w-7" />
                            </div>

                            <div className="mt-8">
                                <p className="text-xs font-bold tracking-widest text-primary-foreground/70 uppercase">Aksyon para sa Komunidad</p>
                                <h1 className="mt-3 text-3xl leading-tight font-black sm:text-4xl">May napansin na problema sa inyong lugar?</h1>
                                <p className="mt-4 max-w-md text-sm leading-7 text-primary-foreground/80 sm:text-base">
                                    Ipaalam sa munisipyo ang mga sirang pasilidad, problema sa kalsada, basura, ilaw, tubig, at iba pang concern sa
                                    komunidad.
                                </p>
                            </div>

                            <div className="mt-9 space-y-4 border-t border-primary-foreground/15 pt-7">
                                <div className="flex gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground/80" />
                                    <div>
                                        <p className="text-sm font-bold">Ibigay ang eksaktong lokasyon</p>
                                        <p className="mt-1 text-xs leading-5 text-primary-foreground/65">
                                            Mas mabilis matutugunan kapag malinaw kung saan naroon ang problema.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground/80" />
                                    <div>
                                        <p className="text-sm font-bold">Maaaring mag-ulat nang anonymous</p>
                                        <p className="mt-1 text-xs leading-5 text-primary-foreground/65">
                                            Maaari mong itago ang pangalan mo sa pampublikong display.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <blockquote className="mt-auto hidden border-l-2 border-primary-foreground/30 pl-4 text-sm leading-6 text-primary-foreground/70 lg:block">
                                “Ang maagap na pag-uulat ay mahalagang hakbang sa mas ligtas at maayos na bayan.”
                            </blockquote>
                        </aside>

                        <main className="p-5 sm:p-8 lg:p-10">
                            <div className="mb-7 border-b border-border pb-5">
                                <p className="text-xs font-bold tracking-widest text-primary uppercase">Community Issue Form</p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                    I-ulat ang Problema sa Komunidad
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Ibigay ang mahahalagang detalye upang maipadala ang iyong report sa tamang tanggapan.
                                </p>
                            </div>

                            {!is_eligible ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                        <AlertCircle className="h-7 w-7" />
                                    </div>
                                    <div className="mt-4 max-w-lg space-y-2">
                                        <h3 className="text-lg font-bold text-amber-950">Naabot mo na ang limitasyon</h3>
                                        <p className="text-sm leading-6 text-amber-800">
                                            Paumanhin, ang bawat mamamayan ay pinapayagan lamang ng hanggang <b>3 ulat kada araw</b>. Maaari kang
                                            muling mag-ulat bukas. Maraming salamat sa iyong malasakit!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-7">
                                    <section className="space-y-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">Ano ang kailangang aksyunan?</h3>
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    Piliin ang uri at ilarawan ang problemang iyong nakita.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-foreground">
                                                Uri ng Problema <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {categories.map((cat) => {
                                                    const isSelected = data.category === cat.value;
                                                    return (
                                                        <button
                                                            key={cat.value}
                                                            type="button"
                                                            onClick={() => setData('category', cat.value)}
                                                            className={`relative flex min-h-14 items-center justify-center rounded-lg border px-3 py-2 text-center text-xs font-bold transition-all active:scale-[0.98] sm:text-sm ${
                                                                isSelected
                                                                    ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10'
                                                                    : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-primary/[0.03] hover:text-foreground'
                                                            } ${errors.category && !isSelected ? 'border-destructive/60 bg-destructive/5' : ''}`}
                                                        >
                                                            {isSelected && (
                                                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                                    <Check className="h-2.5 w-2.5" />
                                                                </span>
                                                            )}
                                                            {cat.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {errors.category && <p className="text-xs font-medium text-destructive">{errors.category}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-foreground">
                                                Karagdagang Detalye <span className="text-destructive">*</span>
                                            </Label>
                                            <Textarea
                                                rows={6}
                                                maxLength={5000}
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Ilarawan ang problema, gaano ito kalubha, at kailan mo ito napansin..."
                                                className={`min-h-36 resize-none rounded-lg border-border bg-background shadow-sm focus-visible:ring-primary/20 ${
                                                    errors.description ? 'border-destructive ring-destructive/20' : ''
                                                }`}
                                            />
                                            {errors.description && <p className="text-xs font-medium text-destructive">{errors.description}</p>}
                                        </div>
                                    </section>

                                    <section className="space-y-5 rounded-lg border border-sky-100 bg-sky-50/50 p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-950">Saan matatagpuan ang problema?</h3>
                                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                                    Magbigay ng landmark o gamitin ang GPS para mas madaling makita.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-800">
                                                Eksaktong Lokasyon <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                value={data.location_text}
                                                onChange={(e) => setData('location_text', e.target.value)}
                                                placeholder="Hal: Rizal St., tapat ng barangay hall"
                                                className={`${fieldClass} ${errors.location_text ? 'border-destructive ring-destructive/20' : ''}`}
                                            />
                                            {errors.location_text && <p className="text-xs font-medium text-destructive">{errors.location_text}</p>}
                                        </div>

                                        <div className="space-y-3 border-t border-sky-100 pt-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <Label className="text-sm font-bold text-slate-800">GPS Coordinates</Label>
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

                                            {data.latitude === null ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleGetLocation}
                                                    disabled={isLocating}
                                                    className="h-12 w-full rounded-lg border-sky-200 bg-white text-sky-800 hover:bg-sky-100"
                                                >
                                                    {isLocating ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                            Kinukuha ang lokasyon...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className="mr-2 h-5 w-5" />
                                                            Gamitin ang aking lokasyon
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="aspect-video overflow-hidden rounded-lg border border-sky-200 bg-white shadow-sm">
                                                        <iframe
                                                            title="Lokasyon ng report"
                                                            width="100%"
                                                            height="100%"
                                                            className="h-full min-h-52 w-full border-0"
                                                            loading="lazy"
                                                            src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=16&output=embed`}
                                                        />
                                                    </div>
                                                    <p className="text-center text-[11px] font-bold text-slate-500">
                                                        LAT: {data.latitude} | LNG: {data.longitude}
                                                    </p>
                                                </div>
                                            )}

                                            {geoError && (
                                                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive">
                                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                                    {geoError}
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <section className="space-y-4 rounded-lg border border-violet-100 bg-violet-50/40 p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-950">Magdagdag ng mga larawan</h3>
                                                <p className="mt-1 text-xs leading-5 text-slate-600">Opsyonal, hanggang 5 larawan at 50 MB lahat.</p>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() =>
                                                !isCompressing &&
                                                data.evidence_photos.length < MAX_FILES &&
                                                document.getElementById('evidence-photos')?.click()
                                            }
                                            className={`flex min-h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition-all ${
                                                isCompressing || data.evidence_photos.length >= MAX_FILES
                                                    ? 'cursor-not-allowed border-slate-200 bg-white/50'
                                                    : 'cursor-pointer border-violet-200 bg-white/70 hover:border-primary/40 hover:bg-white'
                                            }`}
                                        >
                                            {isCompressing ? (
                                                <>
                                                    <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary" />
                                                    <p className="text-xs font-bold text-slate-700">Inihahanda ang mga larawan...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload
                                                        className={`mb-2 h-7 w-7 ${data.evidence_photos.length >= MAX_FILES ? 'text-slate-300' : 'text-violet-600'}`}
                                                    />
                                                    <p className="text-xs font-bold text-slate-700">
                                                        {data.evidence_photos.length >= MAX_FILES
                                                            ? 'Puno na ang limitasyon'
                                                            : 'Pumili ng mga larawan'}
                                                    </p>
                                                    <p className="mt-1 text-[11px] text-slate-500">JPEG, PNG, o WebP</p>
                                                </>
                                            )}
                                        </div>

                                        <input
                                            id="evidence-photos"
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        {(fileError || errors.evidence_photos) && (
                                            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive">
                                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                                {fileError ?? errors.evidence_photos}
                                            </div>
                                        )}

                                        {data.evidence_photos.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {data.evidence_photos.map((file, index) => (
                                                    <div
                                                        key={`${file.name}-${index}`}
                                                        className="group relative aspect-video overflow-hidden rounded-lg border border-violet-100 bg-white"
                                                    >
                                                        <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                                                            <FileIcon className="mb-1 h-6 w-6 text-violet-500" />
                                                            <span className="line-clamp-1 px-2 text-[10px] font-bold text-slate-600">
                                                                {file.name}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            aria-label={`Alisin ang ${file.name}`}
                                                            onClick={() => removeFile(index)}
                                                            className="absolute top-1 right-1 rounded-full bg-white p-1 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-white"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
                                        <Checkbox
                                            id="is-anonymous"
                                            checked={data.is_anonymous}
                                            onCheckedChange={(checked) => setData('is_anonymous', checked === true)}
                                            className="mt-0.5 h-5 w-5 rounded-sm"
                                        />
                                        <div>
                                            <Label htmlFor="is-anonymous" className="cursor-pointer text-sm font-bold text-emerald-950">
                                                I-ulat bilang anonymous
                                            </Label>
                                            <p className="mt-1 text-xs leading-5 text-emerald-800">
                                                Itatago ang iyong pangalan sa mga pampublikong display.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-6">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="h-12 w-full rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98]"
                                            disabled={processing || isCompressing}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Isinusumite...
                                                </>
                                            ) : isCompressing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Inihahanda...
                                                </>
                                            ) : (
                                                'I-sumite ang Ulat'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </main>
                    </div>

                    <p className="mt-6 text-center text-[11px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                        Ligtas at mabilis na serbisyo para sa komunidad
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}

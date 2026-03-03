import SetMunicipalityLogoController from '@/actions/App/External/Api/Controllers/Municipality/Logo/SetMunicipalityLogoController';
import UpdateMunicipalityLogoController from '@/actions/App/External/Api/Controllers/Municipality/Logo/UpdateMunicipalityLogoController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { useForm } from '@inertiajs/react'; // Use Inertia's hook
import { Image as ImageIcon, Loader2, Upload, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function LogoEditor() {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const { currentMunicipality, logoUrl: persistedLogoUrl, settingsId } = useMunicipality();

    const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(persistedLogoUrl);

    // 1. Initialize Inertia useForm
    // We only need the 'logo' field.
    const { data, setData, post, processing, progress, cancel, errors } = useForm({
        logo: null as File | null,
    });

    useEffect(() => {
        setLocalLogoUrl(persistedLogoUrl);
    }, [persistedLogoUrl]);

    const handlePickLogo = () => {
        if (!processing) {
            logoInputRef.current?.click();
        }
    };
    console.log(errors.logo);
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!currentMunicipality?.slug) {
            return;
        }

        if (!file) return;

        // Preview image instantly
        const reader = new FileReader();
        reader.onload = (event) => setLocalLogoUrl(event.target?.result as string);
        reader.readAsDataURL(file);

        // Put file in Inertia state
        setData('logo', file);
    };

    // 2. Trigger upload automatically when 'data.logo' changes
    useEffect(() => {
        if (data.logo) {
            submitLogo();
        }
    }, [data.logo]);

    const submitLogo = () => {
        const isUpdate = !!settingsId;

        // Fixed: Logic order (Update vs Set) and URL argument syntax
        const url = isUpdate ? UpdateMunicipalityLogoController.url() : SetMunicipalityLogoController.url();

        post(url, {
            forceFormData: true,
            preserveScroll: true,
            // Don't forget the headers if your middleware requires it!
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                setData('logo', null);
                if (logoInputRef.current) logoInputRef.current.value = '';
            },
            onError: () => {
                setLocalLogoUrl(persistedLogoUrl);
            },
            onCancel: () => {
                setLocalLogoUrl(persistedLogoUrl);
            },
        });
    };
    return (
        <div className="space-y-6">
            <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoChange} disabled={processing} />

            <Card className="border-gray-200 p-8 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex flex-col items-center gap-8 md:flex-row">
                    <div className="flex-shrink-0">
                        <div className="group relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                            {localLogoUrl ? (
                                <>
                                    <img src={localLogoUrl} alt="Site Logo" className="h-full w-full object-cover" />
                                    <div
                                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                        onClick={handlePickLogo}
                                    >
                                        <span className="text-sm font-medium text-white">Change Logo</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <ImageIcon className="mb-2 h-10 w-10 opacity-50" />
                                    <span className="text-sm font-medium">No Logo</span>
                                </div>
                            )}

                            {/* 3. The Progress / Processing Overlay */}
                            {processing && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60">
                                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
                                    {progress && <span className="text-xs font-bold text-white">{progress.percentage}%</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 text-center md:text-left">
                        {/* ... text headers ... */}

                        <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                            {/* 4. The Buttons (Upload vs Cancel) */}
                            {processing ? (
                                <Button onClick={() => cancel()} variant="destructive" className="gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Cancel Upload
                                </Button>
                            ) : (
                                <Button onClick={handlePickLogo} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    <Upload className="h-4 w-4" />
                                    {localLogoUrl ? 'Replace Logo' : 'Upload Logo'}
                                </Button>
                            )}
                        </div>
                        {errors.logo && <p className="mt-2 text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.logo}</p>}
                    </div>
                </div>
            </Card>
        </div>
    );
}

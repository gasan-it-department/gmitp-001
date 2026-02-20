import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MunicipalitiesApi } from '@/Core/Api/Municipality/MunicipalityApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { router } from '@inertiajs/react';
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function LogoEditor() {
    const logoInputRef = useRef<HTMLInputElement>(null);
    // Get settingsId from context (it will be undefined/null on fresh deploy)
    const { currentMunicipality, logoUrl: persistedLogoUrl, settingsId } = useMunicipality();
    console.log(persistedLogoUrl);

    const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(persistedLogoUrl);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setLocalLogoUrl(persistedLogoUrl);
    }, [persistedLogoUrl]);

    const handlePickLogo = () => {
        if (!isUploading) {
            logoInputRef.current?.click();
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // Basic validation: We definitely need the slug
        if (!currentMunicipality?.slug) {
            toast.error('Municipality slug is missing.');
            return;
        }

        if (!file) return;

        setIsUploading(true);

        try {
            if (settingsId) {
                // CASE A: UPDATE (Settings exist, we have an ID)
                console.log('Updating existing logo...');
                await MunicipalitiesApi.updateMunicipalityLogo(currentMunicipality.slug, { logo: file });
            } else {
                // CASE B: CREATE (Fresh deploy, no ID yet)
                console.log('Uploading fresh logo...');

                const formData = new FormData();
                // Ensure this key ('logo') matches what your Store Controller expects!
                formData.append('logo', file);

                await MunicipalitiesApi.uploadMunicipalLogo(currentMunicipality.slug, formData);
            }

            // ---------------------------------------------------------

            // UI Update (Immediate feedback)
            const reader = new FileReader();
            reader.onload = (event) => {
                setLocalLogoUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            toast.success(settingsId ? 'Logo updated successfully!' : 'Logo uploaded successfully!');

            // Refresh props: This will fetch the new settingsId from the backend
            // so the next time the user clicks, it will perform an Update.
            router.reload({ only: ['currentMunicipality'] });
        } catch (error) {
            console.error('Logo operation failed:', error);
            toast.error('Failed to process logo.');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="space-y-6">
            <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoChange} disabled={isUploading} />

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
                            {isUploading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Municipal Logo</h3>
                            <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                Upload your organization's official seal or logo.
                                <br />
                                <span className="text-xs opacity-80">
                                    Recommended format: <b>PNG</b> (500x500px).
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                            <Button onClick={handlePickLogo} className="gap-2 bg-blue-600 text-white hover:bg-blue-700" disabled={isUploading}>
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {localLogoUrl ? 'Replace Logo' : 'Upload Logo'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

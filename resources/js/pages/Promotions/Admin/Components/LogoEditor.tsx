import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MunicipalitiesApi } from '@/Core/Api/Municipality/MunicipalityApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { router } from '@inertiajs/react'; // Import Inertia router for refreshing props
import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'; // Added useEffect
import { toast } from 'sonner';

// Removed LogoEditorProps interface and props from signature

export default function LogoEditor() {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const { currentMunicipality, logoUrl: persistedLogoUrl } = useMunicipality();

    // State to manage the logo displayed, initialized from the context
    const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(persistedLogoUrl);
    const [isUploading, setIsUploading] = useState(false);

    // CRITICAL: Sync local state when the global context updates (e.g., after successful Inertia reload)
    // This ensures the component always shows the globally correct/persisted logo URL.
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

        if (!currentMunicipality?.slug) {
            toast.error('Municipality context is missing.');
            return;
        }
        if (!file) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('logo', file);

            // 1. Call the API to upload
            await MunicipalitiesApi.uploadMunicipalSettings(currentMunicipality.slug, formData);

            // 2. UI Update (Immediate feedback)
            const reader = new FileReader();
            reader.onload = (event) => {
                setLocalLogoUrl(event.target?.result as string); // Update local state with the Data URL
            };
            reader.readAsDataURL(file);

            toast.success('Logo uploaded successfully!');

            // 3. CRITICAL: Refresh Inertia Props to get the permanent, optimized Cloudinary URL into the context
            router.reload({ only: ['currentMunicipality'] });
        } catch (error) {
            console.error('Logo upload failed:', error);
            toast.error('Failed to upload logo. Please check the file size and type.');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Clear input
        }
    };

    const handleRemoveLogo = async () => {
        if (!currentMunicipality?.slug) {
            toast.error('Municipality context is missing.');
            return;
        }

        setIsUploading(true); // Treat deletion as an upload state

        try {
            // API call to remove logo: Send empty string/null for 'logo' field
            const formData = new FormData();
            formData.append('logo', '');
            await MunicipalitiesApi.uploadMunicipalSettings(currentMunicipality.slug, formData);

            setLocalLogoUrl(null); // Clear local state immediately

            toast.success('Logo removed successfully!');

            // CRITICAL: Refresh Inertia Props to sync the global context state
            router.reload({ only: ['currentMunicipality'] });
        } catch (error) {
            console.error('Logo removal failed:', error);
            toast.error('Failed to remove logo.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoChange} disabled={isUploading} />

            <Card className="border-gray-200 p-8 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex flex-col items-center gap-8 md:flex-row">
                    {/* Logo Preview Circle */}
                    <div className="flex-shrink-0">
                        <div className="group relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                            {localLogoUrl ? (
                                <>
                                    <img src={localLogoUrl} alt="Site Logo" className="h-full w-full object-cover" />
                                    {/* Hover Overlay */}
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

                    {/* Info & Actions */}
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Municipal Logo</h3>
                            <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                Upload your organization's official seal or logo. This image will be displayed in the website header and footer.
                                <br />
                                <span className="text-xs opacity-80">
                                    Recommended format: <b>PNG</b> with transparent background (500x500px).
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                            <Button onClick={handlePickLogo} className="gap-2 bg-blue-600 text-white hover:bg-blue-700" disabled={isUploading}>
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {localLogoUrl ? 'Replace Logo' : 'Upload Logo'}
                            </Button>
                            {localLogoUrl && (
                                <Button
                                    variant="outline"
                                    onClick={handleRemoveLogo}
                                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                                    disabled={isUploading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

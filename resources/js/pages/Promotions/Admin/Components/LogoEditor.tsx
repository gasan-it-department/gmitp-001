import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MunicipalitiesApi } from '@/Core/Api/Municipality/MunicipalityApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface LogoEditorProps {
    logo: string | null;
    setLogo: (logo: string | null) => void;
}

export default function LogoEditor({ logo, setLogo }: LogoEditorProps) {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const { currentMunicipality } = useMunicipality();
    const [isUploading, setIsUploading] = useState(false);

    const handlePickLogo = () => {
        logoInputRef.current?.click();
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
            // 1. Prepare FormData for file upload
            const formData = new FormData();

            // FIX: The key must match '$request->file("logo")' in your Laravel Controller
            formData.append('logo', file);

            // 2. Call the API
            await MunicipalitiesApi.uploadMunicipalSettings(currentMunicipality.slug, formData);

            // 3. UI Update (on success)
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogo(event.target?.result as string);
            };
            reader.readAsDataURL(file);
            toast.success('Logo uploaded successfully!');
        } catch (error) {
            console.error('Logo upload failed:', error);
            toast.error('Failed to upload logo. Please check the file size and type.');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Clear input to allow re-selection
        }
    };

    const handleRemoveLogo = async () => {
        if (!currentMunicipality?.slug) {
            toast.error('Municipality context is missing.');
            return;
        }

        // Since the removal API is not yet available, we just update the UI state.
        try {
            setLogo(null);
            toast.success('Logo removed (UI updated, API pending)!');
        } catch (error) {
            console.error('Logo removal failed:', error);
            toast.error('Failed to remove logo.');
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
                            {logo ? (
                                <>
                                    <img src={logo} alt="Site Logo" className="h-full w-full object-cover" />
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
                                {logo ? 'Replace Logo' : 'Upload Logo'}
                            </Button>
                            {logo && (
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

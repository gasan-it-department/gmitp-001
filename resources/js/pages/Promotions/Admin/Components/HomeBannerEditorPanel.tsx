import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MunicipalitiesApi } from '@/Core/Api/Municipality/MunicipalityApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Image, Loader2, Phone, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import HotlineEditor from './HotlineEditor';
import LogoEditor from './LogoEditor'; // Imported LogoEditor

// --- TYPES ---
interface Banner {
    id: string;
    title: string;
    image: string;
}

interface Hotline {
    id: string;
    name: string;
    number: string;
}

// --- COMPONENT: HOTLINE PREVIEW CARD (Red Theme) ---
const HotlinePreview = ({ hotlines }: { hotlines: Hotline[] }) => (
    <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-red-600 to-orange-500 p-8 text-white shadow-2xl">
        <h2 className="mb-6 text-2xl font-extrabold tracking-wide uppercase">Emergency Hotline</h2>
        <div className="space-y-5">
            {hotlines.length > 0 ? (
                hotlines.map((hotline, index) => (
                    <div key={hotline.id} className={index > 0 ? 'border-t border-white/30 pt-5' : ''}>
                        <h3 className="text-lg font-bold tracking-tight uppercase">{hotline.name}</h3>
                        <p className="mt-1 text-base leading-relaxed font-medium whitespace-pre-line opacity-95">{hotline.number}</p>
                    </div>
                ))
            ) : (
                <p className="text-sm text-white/70 italic">No hotlines configured.</p>
            )}
        </div>
    </div>
);

// --- MAIN COMPONENT ---
export default function HomeBannerEditorPanel() {
    // 1. Context & Hooks
    const { currentMunicipality } = useMunicipality();
    const municipalSlug = currentMunicipality?.slug;

    // 2. Local State
    const [banners, setBanners] = useState<Banner[]>([]);
    const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'banners' | 'hotlines' | 'logo'>('banners');
    const [isUploading, setIsUploading] = useState(false);

    // 3. Logo State
    const [logo, setLogo] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hotline State
    const [hotlines, setHotlines] = useState<Hotline[]>([
        { id: '1', name: 'MDRRMO', number: '(042) 332-0833\n09091099922 – SMART' },
        { id: '2', name: 'Gasan Police Station', number: '0912-345-6789' },
        { id: '3', name: 'Bureau of Fire Protection', number: '0912-345-6789' },
    ]);

    // Drag States
    const dragItemIndex = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handlePickImage = () => fileInputRef.current?.click();

    // --- HANDLE FILE SELECTION (Direct Upload, No Resize) ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!municipalSlug) {
            toast.error('Municipality context missing');
            return;
        }

        if (e.target.files?.[0]) {
            const file = e.target.files[0];

            setIsUploading(true);
            try {
                // 1. Prepare Form Data
                const formData = new FormData();
                formData.append('banner', file); // Direct file upload
                const newBannerTitle = `Banner ${banners.length + 1}`;
                formData.append('home_title', newBannerTitle);
                formData.append('home_subtitle', 'Default Subtitle');

                // 2. Upload to API
                await MunicipalitiesApi.uploadMunicipalSettings(municipalSlug, formData);

                toast.success('Banner uploaded successfully!');

                // 3. Update Local State (Use object URL for immediate preview)
                const newId = Date.now().toString();
                const previewUrl = URL.createObjectURL(file);

                setBanners((prev) => [
                    ...prev,
                    {
                        id: newId,
                        title: newBannerTitle,
                        image: previewUrl,
                    },
                ]);
                setSelectedBannerId(newId);
            } catch (error) {
                console.error(error);
                toast.error('Failed to upload banner.');
            } finally {
                setIsUploading(false);
                e.target.value = ''; // Reset input
            }
        }
    };

    // --- DRAG HANDLERS ---
    const handleDragStart = (index: number) => {
        dragItemIndex.current = index;
    };
    const handleDragEnter = (index: number) => {
        setDragOverIndex(index);
    };
    const handleDragEnd = () => {
        dragItemIndex.current = null;
        setDragOverIndex(null);
    };
    const handleDrop = (index: number) => {
        if (dragItemIndex.current === null) return;
        const newBanners = [...banners];
        const [removed] = newBanners.splice(dragItemIndex.current, 1);
        newBanners.splice(index, 0, removed);
        setBanners(newBanners);
        dragItemIndex.current = null;
        setDragOverIndex(null);
    };

    const selectedBanner = banners.find((b) => b.id === selectedBannerId);

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-gray-100">CMS Editor Panel</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Manage featured banners, municipal hotlines, and site branding.</p>

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

            {/* TAB NAVIGATION */}
            <div className="mb-6 flex space-x-4 border-b border-gray-200 pb-1 dark:border-neutral-700 overflow-x-auto">
                <Button
                    variant={activeTab === 'banners' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('banners')}
                    className={`gap-2 ${activeTab === 'banners' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                >
                    <Image className="h-4 w-4" /> Home Banners
                </Button>
                <Button
                    variant={activeTab === 'hotlines' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('hotlines')}
                    className={`gap-2 ${activeTab === 'hotlines' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                >
                    <Phone className="h-4 w-4" /> Emergency Hotlines
                </Button>
                <Button
                    variant={activeTab === 'logo' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('logo')}
                    className={`gap-2 ${activeTab === 'logo' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                >
                    <div className="w-4 h-4 border-2 border-current rounded-full" /> Municipal Logo
                </Button>
            </div>

            {/* BANNERS TAB */}
            {activeTab === 'banners' && (
                <div className="space-y-8">
                    {/* Preview */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-bold text-gray-700 dark:text-gray-300">Selected Banner Preview</h2>
                        {selectedBanner ? (
                            <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-black shadow-lg">
                                <img src={selectedBanner.image} alt={selectedBanner.title} className="h-full w-full object-cover" />
                                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                    <h3 className="text-xl font-bold">{selectedBanner.title}</h3>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
                                Select a banner to preview
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">Active Banners ({banners.length}/10)</h2>
                            {banners.length < 10 && (
                                <Button onClick={handlePickImage} disabled={isUploading} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" /> Add Banner
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {banners.map((banner, index) => (
                                <Card
                                    key={banner.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnter={() => handleDragEnter(index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(index)}
                                    onClick={() => setSelectedBannerId(banner.id)}
                                    className={`relative cursor-pointer p-2 transition-all ${selectedBannerId === banner.id ? 'ring-2 ring-blue-500' : 'hover:border-blue-300'
                                        } ${dragOverIndex === index ? 'scale-105 opacity-50' : ''}`}
                                >
                                    <img src={banner.image} className="mb-2 h-24 w-full rounded-lg bg-gray-100 object-cover" />
                                    <div className="flex items-center justify-between px-1">
                                        <span className="flex-1 truncate text-xs font-medium">
                                            {index + 1}. {banner.title}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setBanners((b) => b.filter((i) => i.id !== banner.id));
                                            }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                            {banners.length === 0 && (
                                <div
                                    onClick={handlePickImage}
                                    className="col-span-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:bg-gray-50 md:col-span-4"
                                >
                                    <Plus className="mb-2 h-8 w-8" />
                                    <span>Click to upload first banner</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HOTLINES TAB */}
            {activeTab === 'hotlines' && (
                <div className="space-y-8">
                    <HotlineEditor hotlines={hotlines} setHotlines={setHotlines} />

                    <div className="border-t pt-10 mt-10 dark:border-neutral-700">
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Website Footer Preview</h2>
                        <p className="text-gray-600 mb-6 text-sm">Preview of the Emergency Hotline card as it appears on the public site.</p>
                        <div className="flex justify-center p-8 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-dashed border-gray-200 dark:border-neutral-700 overflow-x-auto">
                            <HotlinePreview hotlines={hotlines} />
                        </div>
                    </div>
                </div>
            )}

            {/* LOGO TAB */}
            {activeTab === 'logo' && (
                <LogoEditor logo={logo} setLogo={setLogo} />
            )}
        </div>
    );
}
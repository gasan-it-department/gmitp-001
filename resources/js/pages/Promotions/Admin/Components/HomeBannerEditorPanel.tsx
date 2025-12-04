import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus, Image, Phone, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import HotlineEditor from "./HotlineEditor";

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

// --- HELPER: AUTO-RESIZE IMAGE ---
// Resizes images to 1920x960 automatically to maintain banner consistency
const resizeImage = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            // Set fixed banner aspect ratio 2:1 (1920x960)
            canvas.width = 1920;
            canvas.height = 960;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Draw image to cover canvas (similar to object-fit: cover)
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                resolve(canvas.toDataURL("image/jpeg", 0.9));
            } else {
                resolve(url);
            }
        };
        img.onerror = () => resolve(url);
    });
};

// --- COMPONENT: HOTLINE PREVIEW CARD (Red Theme) ---
const HotlinePreview = ({ hotlines }: { hotlines: Hotline[] }) => (
    <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-red-600 to-orange-500 p-8 text-white shadow-2xl">
        <h2 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">Emergency Hotline</h2>
        <div className="space-y-5">
            {hotlines.length > 0 ? (
                hotlines.map((hotline, index) => (
                    <div key={hotline.id} className={index > 0 ? "border-t border-white/30 pt-5" : ""}>
                        <h3 className="text-lg font-bold uppercase tracking-tight">{hotline.name}</h3>
                        <p className="mt-1 text-base font-medium opacity-95 whitespace-pre-line leading-relaxed">
                            {hotline.number}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-white/70 italic text-sm">No hotlines configured.</p>
            )}
        </div>
    </div>
);

// --- MAIN COMPONENT ---
export default function HomeBannerEditorPanel() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'banners' | 'hotlines'>('banners');
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

    // --- HANDLE FILE SELECTION (Auto-Resize, No Manual Crop) ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                const url = event.target?.result as string;

                // Automatically resize image to 1920x960
                const resizedUrl = await resizeImage(url);

                const newId = Date.now().toString();
                setBanners(prev => [...prev, { id: newId, title: `Banner ${prev.length + 1}`, image: resizedUrl }]);
                setSelectedBannerId(newId);
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        }
    };

    const handleDragStart = (index: number) => { dragItemIndex.current = index; };
    const handleDragEnter = (index: number) => { setDragOverIndex(index); };
    const handleDragEnd = () => { dragItemIndex.current = null; setDragOverIndex(null); };
    const handleDrop = (index: number) => {
        if (dragItemIndex.current === null) return;
        const newBanners = [...banners];
        const [removed] = newBanners.splice(dragItemIndex.current, 1);
        newBanners.splice(index, 0, removed);
        setBanners(newBanners);
        dragItemIndex.current = null;
        setDragOverIndex(null);
    };

    const selectedBanner = banners.find(b => b.id === selectedBannerId);

    return (
        <div className="mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
            <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-gray-100">CMS Editor Panel</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Manage featured banners and municipal hotlines.</p>

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

            {/* TAB NAVIGATION */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-neutral-700 mb-6 pb-1">
                <Button
                    variant={activeTab === 'banners' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('banners')}
                    className={`gap-2 ${activeTab === 'banners' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                >
                    <Image className="w-4 h-4" /> Home Banners
                </Button>
                <Button
                    variant={activeTab === 'hotlines' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('hotlines')}
                    className={`gap-2 ${activeTab === 'hotlines' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                >
                    <Phone className="w-4 h-4" /> Emergency Hotlines
                </Button>
            </div>

            {/* BANNERS TAB */}
            {activeTab === 'banners' && (
                <div className="space-y-8">
                    {/* Preview */}
                    <div className="p-6 border rounded-xl bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-700">
                        <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">Selected Banner Preview</h2>
                        {selectedBanner ? (
                            <div className="relative rounded-xl overflow-hidden shadow-lg aspect-[2/1] bg-black">
                                <img src={selectedBanner.image} alt={selectedBanner.title} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                    <h3 className="text-xl font-bold">{selectedBanner.title}</h3>
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
                                Select a banner to preview
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">Active Banners ({banners.length}/10)</h2>
                            {
                                banners.length < 10 && (
                                    <Button onClick={handlePickImage} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                        <Plus className="w-4 h-4" /> Add Banner
                                    </Button>
                                )
                            }
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                    className={`relative p-2 cursor-pointer transition-all ${selectedBannerId === banner.id ? 'ring-2 ring-blue-500' : 'hover:border-blue-300'
                                        } ${dragOverIndex === index ? 'opacity-50 scale-105' : ''}`}
                                >
                                    <img src={banner.image} className="w-full h-24 object-cover rounded-lg mb-2 bg-gray-100" />
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-xs font-medium truncate flex-1">{index + 1}. {banner.title}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setBanners(b => b.filter(i => i.id !== banner.id)); }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                            {banners.length === 0 && (
                                <div onClick={handlePickImage} className="col-span-2 md:col-span-4 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 text-gray-400 transition-colors">
                                    <Plus className="w-8 h-8 mb-2" />
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
                    {/* Editor */}
                    <HotlineEditor hotlines={hotlines} setHotlines={setHotlines} />

                    {/* Footer Preview Section (Now moved here) */}
                    <div className="border-t pt-10 mt-10 dark:border-neutral-700">
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Website Footer Preview</h2>
                        <p className="text-gray-600 mb-6 text-sm">Preview of the Emergency Hotline card as it appears on the public site.</p>
                        <div className="flex justify-center p-8 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-dashed border-gray-200 dark:border-neutral-700">
                            <HotlinePreview hotlines={hotlines} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
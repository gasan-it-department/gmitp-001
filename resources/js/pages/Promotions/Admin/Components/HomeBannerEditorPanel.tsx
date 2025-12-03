import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
// Import Cropper component
import Cropper from 'react-easy-crop';

interface Banner {
    id: string;
    title: string;
    image: string;
}

export default function HomeBannerEditorPanel() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedBanner = banners.find((b) => b.id === selectedBannerId);

    // Drag and Drop States
    const dragItemIndex = useRef<number | null>(null);
    const [isDraggingId, setIsDraggingId] = useState<string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // --- CROPPING STATES ---
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Original image source URL
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null); // Pixel area defined by Cropper
    // ----------------------------

    // Function to trigger file selection
    const handlePickImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
            fileInputRef.current.dataset.bannerId = "new";
        }
    };

    // --- MODIFIED FILE CHANGE HANDLER (Triggers Cropper) ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const url = event.target?.result as string;
            setSelectedImage(url);
            setIsCropDialogOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    // --- CROPPING LOGIC ---

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImage = useCallback(async () => {
        if (!selectedImage || !croppedAreaPixels) return null;

        // Helper function (defined below the component) to load the image element
        const image = await createImage(selectedImage);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const { width, height, x, y } = croppedAreaPixels;
        canvas.width = width;
        canvas.height = height;

        // Draw the cropped portion of the original image onto the new canvas
        ctx.drawImage(
            image,
            x, // source x
            y, // source y
            width, // source width
            height, // source height
            0, // destination x
            0, // destination y
            width, // destination width
            height // destination height
        );

        // Convert the canvas image to a data URL
        return new Promise<string>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(URL.createObjectURL(blob));
            }, 'image/png');
        });
    }, [selectedImage, croppedAreaPixels]);

    // Function executed when the user clicks 'Apply' in the cropping dialog
    async function handleCropSave() {
        const croppedImgUrl = await getCroppedImage();

        if (croppedImgUrl) {
            // Create a new banner using the final cropped image URL
            const newId = Date.now().toString();
            const newBanner: Banner = {
                id: newId,
                title: `Banner ${banners.length + 1}`,
                image: croppedImgUrl,
            };
            setBanners((prev) => [...prev, newBanner]);
            setSelectedBannerId(newId);
        }

        // Close and reset cropping states
        setIsCropDialogOpen(false);
        setSelectedImage(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
    }
    // -----------------------------


    const removeBanner = (id: string) => {
        const filtered = banners.filter((b) => b.id !== id);
        setBanners(filtered);
        if (filtered.length === 0) setSelectedBannerId(null);
        else if (selectedBannerId === id) setSelectedBannerId(filtered[0].id);
    };

    // --- DRAG AND DROP HANDLERS ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, id: string) => {
        dragItemIndex.current = index;
        setIsDraggingId(id);
        const imgElement = e.currentTarget.querySelector('img');
        if (imgElement && e.dataTransfer.setDragImage) {
            e.dataTransfer.setDragImage(imgElement, 0, 0);
        }

        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (index: number) => {
        if (dragItemIndex.current === null || dragItemIndex.current === index) return;
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        dragItemIndex.current = null;
        setDragOverIndex(null);
        setIsDraggingId(null);
    };

    const handleDrop = (index: number) => {
        if (dragItemIndex.current === null || dragItemIndex.current === index) return;

        const newBanners = [...banners];
        const draggedItem = newBanners[dragItemIndex.current];

        // Perform array reordering
        newBanners.splice(dragItemIndex.current, 1);
        newBanners.splice(index, 0, draggedItem);

        setBanners(newBanners);
        dragItemIndex.current = null;
        setDragOverIndex(null);
        setIsDraggingId(null);
    };
    // ---------------------------------


    return (
        <div className="mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-gray-100">Home Banner Editor</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage and reorder the image banners displayed on your home page. Drag and drop cards to change the display sequence.
            </p>

            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Preview Section */}
            <div className="mb-8 p-4 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Selected Banner Preview</h2>
                {selectedBanner ? (
                    <Card className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg shadow-inner relative">
                        <img
                            src={selectedBanner.image}
                            alt={selectedBanner.title}
                            className="w-full h-1px object-cover rounded-xl border border-gray-200"
                        />
                        <div className="absolute bottom-6 left-6 bg-black/50 text-white p-2 rounded-lg text-lg font-semibold">
                            {selectedBanner.title}
                        </div>
                    </Card>
                ) : (
                    <Card className="p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg shadow-inner relative h-64 flex items-center justify-center border border-dashed border-gray-400">
                        <p className="text-center text-gray-500 dark:text-gray-400">Select a banner card below to see the preview.</p>
                    </Card>
                )}
            </div>

            {/* Banner List */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">Banners ({banners.length}/10)</h2>
                    {banners.length < 10 && banners.length > 0 && (
                        <Button
                            onClick={handlePickImage}
                            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Banner
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {banners.length === 0 && (
                        <Card
                            className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-blue-500 bg-blue-50/50 rounded-xl cursor-pointer text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
                            onClick={handlePickImage}
                        >
                            <Plus className="w-6 h-6 mb-2" />
                            Click to Add First Banner
                        </Card>
                    )}

                    {banners.map((banner, index) => {
                        const isSelected = banner.id === selectedBannerId;
                        const isBeingDragged = isDraggingId === banner.id;
                        const isDragOverTarget = dragOverIndex === index && !isBeingDragged;

                        return (
                            <Card
                                key={banner.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index, banner.id)}
                                onDragOver={(e) => e.preventDefault()} // Essential to allow dropping
                                onDragEnter={() => handleDragEnter(index)}
                                onDragLeave={handleDragLeave}
                                onDrop={() => handleDrop(index)}
                                onDragEnd={handleDragEnd}
                                onClick={() => setSelectedBannerId(banner.id)}
                                className={`
                                    relative p-2 rounded-xl cursor-grab group
                                    border-2 transition-all duration-200 ease-in-out
                                    ${isSelected
                                        ? "border-blue-600 ring-4 ring-blue-100 shadow-md scale-[1.03]"
                                        : "border-gray-200 hover:border-blue-300 dark:border-neutral-700 dark:hover:border-neutral-500"}
                                    ${isBeingDragged ? "opacity-30 cursor-grabbing" : "opacity-100"} 
                                    ${isDragOverTarget
                                        ? "border-dashed border-green-500 ring-4 ring-green-200 transform scale-[1.02]"
                                        : ""}
                                `}
                            >
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    // Use smaller images for the thumbnail list
                                    className="w-full h-35 object-cover rounded-lg mb-1"
                                />
                                <div className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">
                                    {index + 1}. {banner.title}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card selection
                                        removeBanner(banner.id);
                                    }}
                                    // FIX: Changed opacity-0 group-hover:opacity-100 to opacity-100 for permanent visibility
                                    className="absolute top-3 right-3 bg-red-600/90 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700 shadow-md opacity-100 transition-opacity"
                                    title="Remove Banner"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* CROPPING DIALOG */}
            {isCropDialogOpen && selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex w-[95%] max-w-lg flex-col items-center gap-4 rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Crop Image</h3>
                        <div className="relative h-80 w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-100 dark:bg-neutral-700">
                            <Cropper
                                image={selectedImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={25 / 12.5}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                showGrid={true}
                            />
                        </div>

                        {/* Zoom Slider */}
                        <div className="w-full px-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Zoom: {Math.round(zoom * 100)}%</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
                            />
                        </div>

                        <div className="mt-4 flex gap-3">
                            <Button variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCropSave} className="bg-blue-600 hover:bg-blue-700">
                                Apply & Add Banner
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Helper for cropper image creation (kept outside the component) */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        // Must set crossOrigin to 'anonymous' to avoid CORS issues when using canvas.toBlob
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCroppedImg } from '@/lib/cropImage';
import imageCompression from 'browser-image-compression';
import { Loader2, ScanFace } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

interface Props {
    file: File | null;
    onCancel: () => void;
    onReady: (file: File) => void;
}

export default function AvatarCropDialog({ file, onCancel, onReady }: Props) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [preparing, setPreparing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setImageUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setImageUrl(objectUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setError(null);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const prepareAvatar = async () => {
        if (!imageUrl || !croppedAreaPixels) return;

        setPreparing(true);
        setError(null);

        try {
            const cropped = await getCroppedImg(imageUrl, croppedAreaPixels, 'beneficiary-avatar.jpg');

            if (!cropped) {
                throw new Error('The selected image could not be cropped.');
            }

            const optimized = await imageCompression(cropped, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                fileType: 'image/webp',
                initialQuality: 0.88,
                preserveExif: false,
            });

            onReady(
                new File([optimized], 'beneficiary-avatar.webp', {
                    type: 'image/webp',
                    lastModified: Date.now(),
                }),
            );
        } catch {
            setError('Could not prepare this photo. Please choose another image.');
        } finally {
            setPreparing(false);
        }
    };

    return (
        <Dialog open={file !== null} onOpenChange={(open) => !open && !preparing && onCancel()}>
            <DialogContent className="max-h-[95vh] overflow-y-auto p-4 sm:max-w-lg sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ScanFace className="h-5 w-5" />
                        Crop profile photo
                    </DialogTitle>
                    <DialogDescription>Center the beneficiary's face inside the circle.</DialogDescription>
                </DialogHeader>

                <div className="relative h-[52vh] min-h-72 w-full overflow-hidden rounded-md bg-slate-950 sm:max-h-[440px]">
                    {imageUrl && (
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="avatar-zoom" className="text-sm font-medium text-slate-700">
                        Zoom
                    </label>
                    <input
                        id="avatar-zoom"
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={(event) => setZoom(Number(event.target.value))}
                        disabled={preparing}
                        className="h-11 w-full cursor-pointer accent-slate-900 disabled:cursor-not-allowed"
                    />
                </div>

                {error && <p className="text-sm font-medium text-red-600">{error}</p>}

                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={preparing}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={prepareAvatar} disabled={preparing || croppedAreaPixels === null}>
                        {preparing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Use photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

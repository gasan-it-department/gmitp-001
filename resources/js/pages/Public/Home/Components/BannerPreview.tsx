import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useRef, useState, type TouchEvent } from 'react';
import type { Banner } from './Carousel';

interface BannerPreviewProps {
    banner: Banner | null;
    onClose: () => void;
    onRestoreFocus: () => void;
}

const MAX_TOUCH_ZOOM = 4;

type TouchTransform = {
    scale: number;
    x: number;
    y: number;
};

const getTouchDistance = (touches: TouchList) => Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);

export default function BannerPreview({ banner, onClose, onRestoreFocus }: BannerPreviewProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const transformRef = useRef<TouchTransform>({ scale: 1, x: 0, y: 0 });
    const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);
    const panStartRef = useRef<{ clientX: number; clientY: number; x: number; y: number } | null>(null);
    const [touchTransform, setTouchTransform] = useState<TouchTransform>(transformRef.current);

    const updateTransform = (nextTransform: TouchTransform) => {
        transformRef.current = nextTransform;
        setTouchTransform(nextTransform);
    };

    const constrainTranslation = (scale: number, x: number, y: number) => {
        const viewport = viewportRef.current;
        const image = imageRef.current;
        if (!viewport || !image || scale <= 1) return { x: 0, y: 0 };

        const maxX = Math.max(0, (image.clientWidth * scale - viewport.clientWidth) / 2);
        const maxY = Math.max(0, (image.clientHeight * scale - viewport.clientHeight) / 2);

        return {
            x: Math.min(maxX, Math.max(-maxX, x)),
            y: Math.min(maxY, Math.max(-maxY, y)),
        };
    };

    const resetTouchTransform = () => {
        pinchStartRef.current = null;
        panStartRef.current = null;
        updateTransform({ scale: 1, x: 0, y: 0 });
    };

    const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
        if (event.touches.length === 2) {
            event.preventDefault();
            pinchStartRef.current = {
                distance: getTouchDistance(event.touches),
                scale: transformRef.current.scale,
            };
            panStartRef.current = null;
            return;
        }

        if (event.touches.length === 1 && transformRef.current.scale > 1) {
            const touch = event.touches[0];
            panStartRef.current = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                x: transformRef.current.x,
                y: transformRef.current.y,
            };
        }
    };

    const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
        const pinchStart = pinchStartRef.current;
        if (event.touches.length === 2 && pinchStart) {
            event.preventDefault();
            const scale = Math.min(MAX_TOUCH_ZOOM, Math.max(1, pinchStart.scale * (getTouchDistance(event.touches) / pinchStart.distance)));
            const translation = constrainTranslation(scale, transformRef.current.x, transformRef.current.y);
            updateTransform({ scale, ...translation });
            return;
        }

        const panStart = panStartRef.current;
        if (event.touches.length === 1 && panStart && transformRef.current.scale > 1) {
            event.preventDefault();
            const touch = event.touches[0];
            const translation = constrainTranslation(
                transformRef.current.scale,
                panStart.x + touch.clientX - panStart.clientX,
                panStart.y + touch.clientY - panStart.clientY,
            );
            updateTransform({ scale: transformRef.current.scale, ...translation });
        }
    };

    const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
        pinchStartRef.current = null;

        if (event.touches.length === 1 && transformRef.current.scale > 1) {
            const touch = event.touches[0];
            panStartRef.current = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                x: transformRef.current.x,
                y: transformRef.current.y,
            };
            return;
        }

        panStartRef.current = null;
    };

    return (
        <Dialog
            open={banner !== null}
            onOpenChange={(open) => {
                if (!open) {
                    resetTouchTransform();
                    onClose();
                }
            }}
        >
            <DialogContent
                className="w-[calc(100%-1rem)] max-w-6xl overflow-hidden border-0 bg-transparent p-0 shadow-none sm:w-[calc(100%-3rem)]"
                showCloseButton={false}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    onRestoreFocus();
                }}
            >
                <DialogTitle className="sr-only">{banner?.name || 'Municipality banner'}</DialogTitle>
                <DialogDescription className="sr-only">
                    Full view of the selected municipality banner. On a touchscreen, pinch to zoom and drag to move the image. Press Escape to close.
                </DialogDescription>

                <div
                    ref={viewportRef}
                    className="relative flex max-h-[92dvh] touch-none items-center justify-center overflow-hidden rounded-xl bg-black"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                >
                    {banner && (
                        <img
                            ref={imageRef}
                            src={banner.url}
                            alt={banner.name || 'Municipality banner'}
                            className="max-h-[92dvh] w-auto max-w-full origin-center object-contain select-none"
                            style={{
                                transform: `translate3d(${touchTransform.x}px, ${touchTransform.y}px, 0) scale(${touchTransform.scale})`,
                            }}
                            draggable={false}
                        />
                    )}
                    <DialogClose asChild>
                        <button
                            type="button"
                            className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full bg-black/65 text-white shadow-sm transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-3 sm:right-3"
                            aria-label="Close banner preview"
                        >
                            <X className="size-5" />
                        </button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import * as React from 'react';
import BannerPreview from './BannerPreview';

export type Banner = {
    id: string | number;
    name: string;
    url: string;
};

interface CarouselProps {
    slides?: Banner[];
}

const SWIPE_THRESHOLD = 50;
const TAP_THRESHOLD = 8;

export default function Carousel({ slides = [] }: CarouselProps) {
    const [index, setIndex] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState(0);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [preview, setPreview] = React.useState<Banner | null>(null);
    const previewTrigger = React.useRef<HTMLButtonElement | null>(null);
    const gesture = React.useRef<{ pointerId: number; x: number; y: number } | null>(null);
    const suppressClick = React.useRef(false);
    const activeIndex = slides.length ? index % slides.length : 0;

    const next = React.useCallback(() => {
        setIndex((current) => (slides.length ? (current + 1) % slides.length : 0));
    }, [slides.length]);

    const prev = React.useCallback(() => {
        setIndex((current) => (slides.length ? (current - 1 + slides.length) % slides.length : 0));
    }, [slides.length]);

    React.useEffect(() => {
        if (slides.length < 2 || preview || isDragging || isHovered || isFocused) return;

        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [slides.length, preview, isDragging, isHovered, isFocused, next]);

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!event.isPrimary || event.button !== 0) return;

        gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        suppressClick.current = false;
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const start = gesture.current;
        if (!start || start.pointerId !== event.pointerId) return;

        const distance = event.clientX - start.x;
        const verticalDistance = event.clientY - start.y;

        // Scrolling or dragging must not also open the image when the finger is released.
        if (Math.hypot(distance, verticalDistance) > TAP_THRESHOLD) suppressClick.current = true;
        if (slides.length > 1 && Math.abs(distance) > Math.abs(verticalDistance)) setDragOffset(distance);
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
        const start = gesture.current;
        if (!start || start.pointerId !== event.pointerId) return;

        const distance = event.clientX - start.x;
        const verticalDistance = event.clientY - start.y;
        const cancelled = event.type === 'pointercancel' || event.type === 'lostpointercapture';
        if (cancelled || Math.hypot(distance, verticalDistance) > TAP_THRESHOLD) suppressClick.current = true;

        if (!cancelled && Math.abs(distance) > SWIPE_THRESHOLD && Math.abs(distance) > Math.abs(verticalDistance)) {
            if (distance > 0) prev();
            else next();
        }

        gesture.current = null;
        setIsDragging(false);
        setDragOffset(0);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    };

    if (slides.length === 0) return null;

    return (
        <>
            <div
                className="group relative w-full overflow-hidden select-none"
                role="region"
                aria-label="Municipality banners"
                aria-roledescription="carousel"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocusCapture={() => setIsFocused(true)}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false);
                }}
            >
                <div
                    className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
                    style={{
                        transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
                        transitionDuration: isDragging ? '0ms' : undefined,
                    }}
                >
                    {slides.map((banner, i) => (
                        <button
                            key={banner.id}
                            type="button"
                            className="relative flex aspect-[24/10] w-full min-w-full cursor-pointer touch-pan-y items-center justify-center overflow-hidden bg-gray-100 focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-primary"
                            style={{ cursor: isDragging && dragOffset !== 0 ? 'grabbing' : undefined }}
                            tabIndex={i === activeIndex ? 0 : -1}
                            aria-hidden={i !== activeIndex}
                            aria-label={`Open ${banner.name || `banner ${i + 1}`}`}
                            aria-haspopup="dialog"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerEnd}
                            onPointerCancel={handlePointerEnd}
                            onLostPointerCapture={handlePointerEnd}
                            onClick={(event) => {
                                if (suppressClick.current && event.detail !== 0) {
                                    event.preventDefault();
                                    return;
                                }
                                previewTrigger.current = event.currentTarget;
                                setPreview(banner);
                            }}
                        >
                            <img
                                loading={i === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                src={banner.url}
                                alt={banner.name || `Banner ${i + 1}`}
                                className="pointer-events-none h-full w-full shrink-0 object-fill"
                                draggable={false}
                            />
                            <span
                                className="pointer-events-none absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 text-[11px] font-medium text-white sm:top-4 sm:right-4 sm:text-xs"
                                aria-hidden="true"
                            >
                                <Expand className="size-3.5" /> View image
                            </span>
                        </button>
                    ))}
                </div>

                {slides.length > 1 && (
                    <>
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-2 sm:p-4">
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={prev}
                                className="pointer-events-auto size-11 border-none bg-black/30 text-white hover:bg-black/50"
                                aria-label="Nakaraang slide"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={next}
                                className="pointer-events-auto size-11 border-none bg-black/30 text-white hover:bg-black/50"
                                aria-label="Susunod na slide"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="absolute right-0 bottom-0 left-0 flex justify-center sm:bottom-2">
                            {slides.map((banner, i) => (
                                <button
                                    key={banner.id}
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    className="flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
                                    aria-label={`Pumunta sa slide ${i + 1}`}
                                    aria-current={i === activeIndex ? 'true' : undefined}
                                >
                                    <span
                                        className={`size-2.5 rounded-full shadow-sm transition-all ${i === activeIndex ? 'scale-125 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <BannerPreview banner={preview} onClose={() => setPreview(null)} onRestoreFocus={() => previewTrigger.current?.focus()} />
        </>
    );
}

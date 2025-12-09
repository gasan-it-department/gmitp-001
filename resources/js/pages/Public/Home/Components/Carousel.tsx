import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

// Define the type for a single banner
export type Banner = {
    id: string;
    title: string | null;
    bannerUrl: string;
    sortOrder: number | null;
};

// Define props interface
interface CarouselProps {
    slides: Banner[];
}

// --- CONSTANTS ---
const SWIPE_THRESHOLD = 50; // Minimum distance (in pixels) for a swipe to register

export default function Carousel({ slides }: CarouselProps) {
    if (!slides || slides.length === 0) return null;

    const [index, setIndex] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState(0);
    const slidesRef = React.useRef<HTMLDivElement>(null);

    // Refs for tracking drag/touch start and end points
    const touchStartX = React.useRef(0);
    const touchEndX = React.useRef(0);

    // --- NAVIGATION LOGIC ---
    const next = React.useCallback(() => {
        setIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prev = React.useCallback(() => {
        setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    // --- AUTOPLAY EFFECT ---
    React.useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    // --- DRAG / TOUCH HANDLERS ---

    // 1. Start Tracking (Mouse Down or Touch Start)
    const handleStart = React.useCallback((clientX: number) => {
        touchStartX.current = clientX;
        setIsDragging(true);
        // Clear transition duration temporarily to allow for immediate drag feedback
        if (slidesRef.current) {
            slidesRef.current.style.transitionDuration = '0ms';
        }
    }, []);

    // 2. Tracking Movement (Mouse/Touch Move)
    const handleMove = React.useCallback((clientX: number) => {
        if (!isDragging) return;
        touchEndX.current = clientX;
        setDragOffset(touchEndX.current - touchStartX.current);
    }, [isDragging]);

    // 3. End Tracking (Mouse Up or Touch End)
    const handleEnd = React.useCallback(() => {
        if (!isDragging) return;

        // Restore transition duration
        if (slidesRef.current) {
            slidesRef.current.style.transitionDuration = '700ms';
        }

        const distance = touchEndX.current - touchStartX.current;

        if (Math.abs(distance) > SWIPE_THRESHOLD) {
            if (distance > 0) {
                // Swipe Right (Go Previous)
                prev();
            } else {
                // Swipe Left (Go Next)
                next();
            }
        }

        // Reset state
        setIsDragging(false);
        setDragOffset(0);
        touchStartX.current = 0;
        touchEndX.current = 0;
    }, [isDragging, next, prev]);


    // --- BINDING FUNCTIONS ---

    const onTouchStart = (e: React.TouchEvent) => {
        handleStart(e.touches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        handleStart(e.clientX);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        // Prevent default behavior only when dragging has started
        if (isDragging) {
            e.preventDefault();
        }
        handleMove(e.clientX);
    };

    const onMouseUp = () => {
        handleEnd();
    };

    const onMouseLeave = () => {
        // If mouse leaves while dragging, treat it as drag end
        if (isDragging) {
            handleEnd();
        }
    };


    // Calculate dynamic transform value
    const baseTransform = index * 100;
    const finalTransform = `translateX(calc(-${baseTransform}% + ${dragOffset}px))`;


    return (
        <div
            className="group relative w-full cursor-grab overflow-hidden select-none"
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onTouchEnd={handleEnd}
        >
            {/* Slides Container */}
            <div
                ref={slidesRef}
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                    transform: finalTransform,
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
            >
                {slides.map((banner, i) => (
                    <div
                        key={banner.id}
                        className="flex h-full w-full min-w-full transition-transform duration-700 ease-in-out"
                    >
                        <img
                            src={banner.bannerUrl}
                            alt={banner.title || `Banner ${i}`}
                            className="aspect-[2/1] h-auto w-full object-cover md:aspect-[3/1]"
                            // Dragging fixes
                            draggable={false}
                        />
                    </div>
                ))}
            </div>

            {/* Controls */}
            {slides.length > 1 && (
                <>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-4">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={prev}
                            className="pointer-events-auto border-none bg-black/30 text-white hover:bg-black/50"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={next}
                            className="pointer-events-auto border-none bg-black/30 text-white hover:bg-black/50"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Dot Indicators */}
                    <div className="absolute right-0 bottom-4 left-0 flex justify-center space-x-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-2.5 w-2.5 rounded-full shadow-sm transition-all ${i === index ? 'scale-125 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
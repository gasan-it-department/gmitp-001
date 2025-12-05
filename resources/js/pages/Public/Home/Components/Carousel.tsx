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

export default function Carousel({ slides }: CarouselProps) {
    // Safety check: if no slides, show nothing or a placeholder
    if (!slides || slides.length === 0) return null;

    const [index, setIndex] = React.useState(0);

    // ... keep all your existing drag/touch logic ...
    const touchStartX = React.useRef(0);
    const touchEndX = React.useRef(0);
    // ... (omitted for brevity, keep your logic here)

    const next = React.useCallback(() => {
        setIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prev = React.useCallback(() => {
        setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    React.useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <div className="group relative w-full cursor-grab overflow-hidden select-none">
            {/* Slides Container */}
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${index * 100}%)` }}>
                {slides.map((banner, i) => (
                    <div
                        key={banner.id} // Use the ID from DB
                        className="flex h-full w-full min-w-full transition-transform duration-700 ease-in-out"
                    >
                        <img
                            src={banner.bannerUrl}
                            alt={banner.title || `Banner ${i}`}
                            className="aspect-[2/1] h-auto w-full object-cover md:aspect-[3/1]"
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
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={next}
                            className="pointer-events-auto border-none bg-black/30 text-white hover:bg-black/50"
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
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

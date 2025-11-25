'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as React from 'react';

const images = ['/assets/banner_01.png'];

export default function Carousel() {
    const [index, setIndex] = React.useState(0);
    const touchStartX = React.useRef(0);
    const touchEndX = React.useRef(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartX = React.useRef(0);
    const dragCurrentX = React.useRef(0);
    const [showNotice, setShowNotice] = React.useState(true);

    const next = React.useCallback(() => {
        setIndex((prev) => (prev + 1) % images.length);
    }, []);

    const prev = React.useCallback(() => {
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    }, []);

    React.useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const distance = touchStartX.current - touchEndX.current;
        if (Math.abs(distance) > 50) {
            if (distance > 0) next();
            else prev();
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        dragCurrentX.current = e.clientX;
    };

    const handleMouseUp = () => {
        if (!isDragging) return;

        setIsDragging(false);
        const distance = dragStartX.current - dragCurrentX.current;
        const dragThreshold = 50;

        if (Math.abs(distance) > dragThreshold) {
            if (distance > 0) next();
            else prev();
        }
        // Reset drag positions
        dragStartX.current = 0;
        dragCurrentX.current = 0;
    };

    React.useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleMouseUp();
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging]);

    return (
        <div>
            {/* {showNotice && (
                <Card className="relative mt-3 mr-3 mb-3 ml-3 rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4 shadow-sm transition-all dark:border-orange-400 dark:bg-orange-900/20">
                    <button
                        onClick={() => setShowNotice(false)}
                        className="absolute top-2 right-2 text-orange-700 transition hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100"
                        aria-label="Close Notice"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-start gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>

                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Notice of System Maintenance</span>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                Please be advised that maintenance will occur tonight from 2:00 AM to 4:00 AM.
                            </p>
                        </div>
                    </div>
                </Card>
            )} */}

            <div
                className="relative w-full cursor-grab overflow-hidden select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Notice Card */}

                {/* Slides */}
                <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${index * 100}%)` }}>
                    <div
                        className="flex h-full w-full transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${index * 100}%)` }}
                    >
                        {images.map((src, i) => (
                            <img key={i} src={src} alt={`Slide ${i}`} className="h-full w-full flex-shrink-0 object-fill" />
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute inset-0 flex items-center justify-between p-4">
                    <Button variant="secondary" size="icon" onClick={prev} className="border-none bg-black/40 text-white hover:bg-black/60">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button variant="secondary" size="icon" onClick={next} className="border-none bg-black/40 text-white hover:bg-black/60">
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>

                {/* Dot Indicators */}
                <div className="absolute right-0 bottom-4 left-0 flex justify-center space-x-2">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-3 w-3 rounded-full transition-all ${i === index ? 'scale-125 bg-white' : 'bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

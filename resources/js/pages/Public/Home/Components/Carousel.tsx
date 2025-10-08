"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
    "assets/banner11.png",
    "assets/banner11.png",
    "assets/banner11.png",
];

export default function Carousel() {
    const [index, setIndex] = React.useState(0);
    const touchStartX = React.useRef(0);
    const touchEndX = React.useRef(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartX = React.useRef(0);
    const dragCurrentX = React.useRef(0);

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
        <div
            className="relative w-full overflow-hidden select-none cursor-grab"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {images.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`Slide ${i}`}
                        className="w-full flex-shrink-0 object-cover h-64 md:h-96 lg:h-[600px]"
                    />
                ))}
            </div>

            {/* Controls */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={prev}
                    className="bg-black/40 hover:bg-black/60 text-white border-none"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                    variant="secondary"
                    size="icon"
                    onClick={next}
                    className="bg-black/40 hover:bg-black/60 text-white border-none"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-3 w-3 rounded-full transition-all ${i === index ? "bg-white scale-125" : "bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
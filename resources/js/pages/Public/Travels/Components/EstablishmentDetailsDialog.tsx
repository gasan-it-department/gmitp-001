"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, X, ChevronLeft, ChevronRight, Bed, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface EstablishmentData {
    id: number;
    name: string;
    category: string;
    image?: string | string[];
    promo_video_url?: string | null;
    address?: string;
    phone?: string;
    number_rooms?: number;
    total_capacity?: string;
}

interface EstablishmentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    establishment?: EstablishmentData;
}

/**
 * Helper function to safely extract the YouTube video ID and convert it 
 * to a direct embed URL with necessary parameters (autoplay, muted, controls).
 */
const getYouTubeEmbedUrl = (url: string): string => {
    try {
        const videoUrl = new URL(url);
        let videoId = '';

        // 1. Handle standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
        if (videoUrl.hostname.includes("youtube.com")) {
            videoId = videoUrl.searchParams.get("v") || '';
        }

        // 2. Handle short share URL: https://youtu.be/VIDEO_ID?si=...
        else if (videoUrl.hostname.includes("youtu.be")) {
            // The video ID is the path (e.g., /VIDEO_ID), ignoring any query params
            videoId = videoUrl.pathname.substring(1);
        }

        // YouTube Video IDs are always 11 characters long
        if (videoId && videoId.length === 11) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&mute=1`;
        }

    } catch (error) {
        console.error("Failed to parse URL for YouTube embed:", url, error);
    }

    return "";
};


export default function EstablishmentDetailsDialog({
    open,
    onOpenChange,
    establishment,
}: EstablishmentDetailsDialogProps) {
    if (!establishment) return null;

    // Combine video + images
    const images = establishment.image
        ? Array.isArray(establishment.image)
            ? establishment.image
            : [establishment.image]
        : [];

    const slides = establishment.promo_video_url
        ? [establishment.promo_video_url, ...images]
        : images;

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
    const prevSlide = () =>
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    const isVideo = (index: number) =>
        establishment.promo_video_url && index === 0;

    // Reset slide when modal closes
    useEffect(() => {
        if (!open) setCurrentIndex(0);
    }, [open]);

    const videoEmbedUrl = establishment.promo_video_url
        ? getYouTubeEmbedUrl(establishment.promo_video_url)
        : "";


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* FIX 1: Apply specific rounding logic to the DialogContent wrapper. 
                - On mobile (default), remove top rounding: rounded-t-none
                - On desktop (sm:), restore full rounding: sm:rounded-2xl
            */}
            <DialogContent
                showCloseButton={false}
                className="w-full max-w-lg sm:max-w-3xl p-0 overflow-hidden rounded-2xl sm:rounded-2xl shadow-2xl flex flex-col h-full max-h-[95vh] sm:h-auto"
            >
                {/* Header: Fixed and responsive padding */}
                {/* CHANGE: Removed border-b border-gray-100 */}
                <DialogHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 bg-white/95 backdrop-blur-sm sticky top-0 z-[60]">
                    <DialogTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {establishment.name}
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </Button>
                </DialogHeader>

                <div className="relative w-full aspect-video rounded-none overflow-hidden shadow-xl group bg-black">
                    {slides.map((src, i) => (
                        <div
                            key={i}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === currentIndex ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            {isVideo(i) ? (
                                <div className="w-full h-full">
                                    {videoEmbedUrl && i === currentIndex ? (
                                        <iframe
                                            key={videoEmbedUrl}
                                            src={videoEmbedUrl}
                                            title={`${establishment.name} Promotional Video`}
                                            className="w-full h-full border-0 absolute top-0 left-0 z-40"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/80 bg-gray-900">
                                            {i !== currentIndex && images.length > 0 && (
                                                <img
                                                    src={images[0]}
                                                    alt={`${establishment.name} Video Placeholder`}
                                                    className="w-full h-full object-cover opacity-60"
                                                />
                                            )}
                                            {!videoEmbedUrl && (
                                                <span className="absolute">Video Source Invalid or Restricted</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // RENDER IMAGE
                                <>
                                    <img
                                        src={src}
                                        alt={`${establishment.name} ${i}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </>
                            )}
                        </div>
                    ))}

                    {/* Category Tag - Hides when video is playing */}
                    <div
                        className={`
                            absolute top-4 left-4 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md backdrop-blur-sm z-50 transition-opacity duration-300
                            ${
                                isVideo(currentIndex) && videoEmbedUrl
                                    ? 'opacity-0'
                                    : 'opacity-100 bg-gradient-to-r from-red-500 to-orange-500'
                            }
                        `}
                    >
                        {establishment.category}
                    </div>

                    {/* Prev/Next Buttons */}
                    {slides.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute top-1/2 -translate-y-1/2 left-3 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition z-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition z-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Dots Indicator */}
                    {slides.length > 1 && (
                        <div className="absolute bottom-3 w-full flex justify-center gap-2 z-50">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${currentIndex === i
                                            ? "bg-white scale-110 shadow-md"
                                            : "bg-white/40 hover:bg-white/70"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>


                {/* Body: Responsive, Scrollable Content Area */}
                <div className="flex flex-col gap-8 p-4 sm:p-6 flex-1 overflow-y-auto">
                    
                    {/* Details: Adaptive grid layout */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Information & Contacts</h3>

                        {/* Switches from 1 column on mobile to 2 columns on medium screens */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                            {/* Contact & Location */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-lg font-semibold text-gray-700">Contact & Location</h4>

                                {/* Address Card */}
                                {establishment.address && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition duration-200 border border-gray-200">
                                        <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0"> {/* ensures text wraps correctly on small screens */}
                                            <p className="text-sm font-light text-gray-500">Address</p>
                                            <span className="text-base text-gray-800 font-medium leading-snug break-words">
                                                {establishment.address}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Phone Card */}
                                {establishment.phone && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition duration-200 border border-gray-200">
                                        <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-light text-gray-500">Contact Number</p>
                                            <a
                                                href={`tel:${establishment.phone}`}
                                                className="text-base text-gray-800 font-medium hover:text-green-600 transition-colors"
                                            >
                                                {establishment.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Accommodation Details: Conditional padding ensures spacing is right on mobile vs desktop */}
                            {(establishment.number_rooms || establishment.total_capacity) && (
                                <div className="flex flex-col gap-3 pt-6 md:pt-0">
                                    <h4 className="text-lg font-semibold text-gray-700">Accommodation Details</h4>

                                    {/* Rooms Card */}
                                    {establishment.number_rooms && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition duration-200 border border-gray-200">
                                            <Bed className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-light text-gray-500">Available Rooms</p>
                                                <span className="text-base text-gray-800 font-medium">
                                                    {establishment.number_rooms} Rooms
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Capacity Card */}
                                    {establishment.total_capacity && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition duration-200 border border-gray-200">
                                            <Users className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-light text-gray-500">Total Capacity</p>
                                                <span className="text-base text-gray-800 font-medium">
                                                    {establishment.total_capacity}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Separator className="my-6" />

                        {/* Footer Button - Fixed to the bottom of the scrollable content */}
                        <div className="flex justify-end pt-2">
                            <Button
                                variant="default"
                                className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-full px-8 py-3 shadow-lg hover:shadow-xl hover:opacity-90 transition-all text-base"
                                onClick={() => onOpenChange(false)}
                            >
                                Looks Great! Close
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

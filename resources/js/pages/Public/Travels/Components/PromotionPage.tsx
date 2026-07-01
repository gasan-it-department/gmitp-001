"use client";

import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { TourismEventBanner } from "../TravelPage";

type Props = {
    heroImageUrl?: string | null;
    eventBanners?: TourismEventBanner[];
};

export default function PromotionPage({ heroImageUrl, eventBanners = [] }: Props) {
    const [, setScrolled] = useState(false);
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const cards = eventBanners.map((banner) => ({
        name: banner.name || "Tourism Highlight",
        img: banner.cover_image,
        description: banner.description || "Explore the latest tourism feature from the AGA travel guide.",
    }));

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-950 font-baloo">
            <motion.div
                ref={ref}
                className="relative flex h-[68vh] w-full items-start justify-center overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: heroImageUrl ? `url('${heroImageUrl}')` : undefined,
                    opacity: bgOpacity,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-blue-950/50 to-slate-950/90" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />

                <div className="sticky top-[80px] z-40 transform bg-transparent px-4 text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 scale-125 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300 opacity-40 blur-2xl" />

                        <motion.img
                            src="/assets/dummy/tourism.png"
                            alt="Tourism Logo"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative mx-auto w-[200px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] filter saturate-125 brightness-110 sm:w-[260px] md:w-[320px] lg:w-[380px] xl:w-[420px]"
                        />
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.6,
                            duration: 0.8,
                            ease: "easeOut",
                        }}
                        className="mt-4 text-[16px] font-medium tracking-wide text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px]"
                    >
                        Embrace the{" "}
                        <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                            beauty beyond the shore
                        </span>
                    </motion.h2>
                </div>
            </motion.div>

            <div className="space-y-8 px-6 py-12 text-slate-100 sm:px-16">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Featured guide</span>
                    <h2 className="mt-2 text-3xl font-semibold">Cultures, traditions, and travel highlights</h2>
                </div>
                <p className="max-w-3xl leading-relaxed text-slate-300">
                    Discover hidden gems, cultural celebrations, and visitor experiences curated for an elegant municipal travel guide.
                </p>

                {cards.length > 0 && (
                <div className="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:gap-6 sm:px-8 lg:grid-cols-3 lg:gap-8">
                    {cards.slice(0, 3).map((dest, index) => (
                        <Card
                            key={`${dest.name}-${index}`}
                            className="overflow-hidden rounded-xl border border-cyan-100/40 bg-white/95 shadow-xl shadow-cyan-950/20 transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                        >
                            {dest.img ? (
                                <img
                                    src={dest.img}
                                    alt={dest.name}
                                    className="h-40 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 px-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-cyan-100">
                                    Tourism
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="mb-1 text-lg font-semibold text-gray-800">
                                    {dest.name}
                                </h3>
                                <p className="text-sm leading-snug text-gray-600">
                                    {dest.description}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
}

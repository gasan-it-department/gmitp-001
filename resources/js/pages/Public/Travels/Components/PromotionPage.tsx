"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function PromotionPage() {
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

    return (
        <div className="w-full min-h-screen bg-gray-200 flex flex-col font-baloo">
            <motion.div
                ref={ref}
                className="relative w-full h-[60vh] bg-cover bg-center overflow-hidden flex items-start justify-center"
                style={{
                    backgroundImage: "url('assets/travel_banner_1.png')",
                    opacity: bgOpacity,
                }}
            >
                <div className="absolute inset-0 bg-black/30" />

                <div className="sticky top-[80px] transform text-center z-40 bg-transparent px-4">
                    {/* Soft Golden–Blue Glow Behind Logo */}
                    <div className="relative inline-block">
                        <div className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-yellow-300 via-orange-300 to-sky-400 rounded-full scale-125 animate-pulse"></div>

                        <motion.img
                            src="assets/dummy/tourism.png"
                            alt="Tourism Logo"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative w-[200px] sm:w-[260px] md:w-[320px] lg:w-[380px] xl:w-[420px] 
             mx-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] 
             filter saturate-125 brightness-110"
                        />

                    </div>

                    {/* Tagline with Warm Ocean Gradient */}
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.6,
                            duration: 0.8,
                            ease: "easeOut",
                        }}
                        className="text-white 
      text-[16px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] 
      font-medium tracking-wide mt-4 drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)]"
                    >
                        Embrace the{" "}
                        <span className="text-transparent bg-gradient-to-r from-sky-400 via-emerald-400 to-yellow-400 bg-clip-text">
                            beauty beyond the shore
                        </span>
                    </motion.h2>
                </div>


            </motion.div>

            <div className="px-6 sm:px-16 py-12 space-y-8 text-gray-800">
                <h2 className="text-3xl font-semibold">Cultures and Traditions</h2>
                <p className="text-gray-600 leading-relaxed max-w-3xl">
                    Discover the hidden gems of the world. From pristine beaches to
                    breathtaking mountain peaks, our curated destinations will ignite
                    your wanderlust and inspire your next adventure.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 px-4 sm:px-8">
                    {[
                        { name: "Araw ng Gasan", img: "assets/araw_ng_gasan.jpg" },
                        { name: "Gasang Gasang Easter Sunday", img: "assets/gasang_gasang.jpg" },
                        { name: "Putong", img: "assets/putong.jpg" },
                    ].map((dest, i) => (
                        <Card
                            key={i}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform duration-300 hover:scale-105"
                        >
                            <img
                                src={dest.img}
                                alt={dest.name}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-1 text-gray-800">
                                    {dest.name}
                                </h3>
                                <p className="text-sm text-gray-600 leading-snug">
                                    Experience the local culture, food, and adventure that makes{" "}
                                    {dest.name} a must-visit destination.
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import TravelHeader from "./TravelHeader";

export default function PromotionPage() {
    const [scrolled, setScrolled] = useState(false);
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

                {/* STICKY TITLE SECTION */}
                <div className="sticky top-[80px] transform text-center z-40 bg-transparent px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 1,
                            ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="font-baloo text-white 
                   text-[48px] sm:text-[80px] md:text-[120px] lg:text-[150px] xl:text-[180px] 
                   font-bold tracking-wide leading-none drop-shadow-lg"
                    >
                        Travel
                    </motion.h1>

                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.5,
                            duration: 0.8,
                            ease: "easeOut",
                        }}
                        className="text-white 
                   text-[16px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] 
                   font-medium tracking-wide mt-2 drop-shadow-md"
                    >
                        Embrace the beauty beyond the shore
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

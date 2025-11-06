import { useEffect, useState } from 'react';
import { MunicipalityCard } from './MunicipalityCard';

export default function LandingPageHeroBanner() {
    const [fadeVisible, setFadeVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFadeVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const registeredMunicipalities = [{ id: 4902, name: 'Gasan', logo: '/assets/gasan_logo.png' }];
    registeredMunicipalities.sort((a, b) => a.id - b.id);

    return (
        <div className="relative overflow-hidden bg-white">
            {/* Soft background glow */}
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-r from-orange-300/20 to-red-300/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-r from-red-300/20 to-orange-200/20 blur-3xl" />

            {/* Hero Content */}
            <div className="relative container mx-auto grid grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-5 md:gap-12 xl:gap-16 2xl:max-w-[1400px]">
                {/* Logo Bubble
                <div className="absolute top-0 m-4 flex gap-3">
                    <div
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-contain bg-center bg-no-repeat shadow-md ring-2 ring-orange-200 md:h-20 md:w-20 lg:h-24 lg:w-24"
                        style={{ backgroundImage: "url('/assets/bp_logo.png')" }}
                    ></div>
                </div> */}

                {/* Hero Text Section */}
                <div className="mt-2 flex flex-col justify-center md:col-span-3 md:pr-6 xl:pr-12">
                    <div
                        className={`transform space-y-6 transition-all duration-1000 ease-out md:space-y-8 ${fadeVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                    >
                        <h1 className="scroll-m-20 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                            <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent sm:text-[90px]">
                                Welcome
                            </span>
                        </h1>

                        <p className="max-w-xl text-lg text-gray-600">
                            Streamline and unify services across all municipalities.
                        </p>

                        <div className="h-1 w-28 rounded-full bg-gradient-to-r from-orange-400 to-red-400"></div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="relative hidden w-full items-center justify-center md:col-span-2 md:flex md:h-[400px] lg:h-[600px]">
                    {/* Decorative corners */}
                    <div className="absolute -top-6 -right-6 h-20 w-20 rounded-md border border-orange-200/40 bg-orange-50/40 backdrop-blur-sm"></div>
                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full border border-red-200/40 bg-rose-50/40 backdrop-blur-sm"></div>

                    {/* Map Frame */}
                    <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-b from-orange-50/40 via-white/40 to-red-50/40 shadow-xl">
                        <img
                            src="/assets/marinduque_map.jpg"
                            className="h-full w-full object-cover"
                            alt="Marinduque Map"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* Municipality Cards Section */}
            <div className="relative z-20 mt-10">
                <MunicipalityCard />
            </div>
        </div>
    );
}

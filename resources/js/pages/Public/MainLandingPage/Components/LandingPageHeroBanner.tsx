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
        // Theme Update: 'bg-background'
        <div className="relative overflow-hidden bg-background">
            
            {/* Soft background glow - Updated to Cool/Slate tones */}
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-r from-slate-200/60 to-blue-200/30 blur-3xl opacity-60 dark:from-slate-800/40 dark:to-blue-900/20" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-r from-blue-200/30 to-slate-200/60 blur-3xl opacity-60 dark:from-blue-900/20 dark:to-slate-800/40" />

            {/* Hero Content */}
            <div className="relative container mx-auto grid grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-5 md:gap-12 xl:gap-16 2xl:max-w-[1400px]">
                
                {/* Hero Text Section */}
                <div className="mt-2 flex flex-col justify-center md:col-span-3 md:pr-6 xl:pr-12">
                    <div
                        className={`transform space-y-6 transition-all duration-1000 ease-out md:space-y-8 ${fadeVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                    >
                        <h1 className="scroll-m-20 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                            {/* Theme Update: Uses 'text-primary' for high contrast professional look */}
                            <span className="block text-primary sm:text-[90px]">
                                Welcome
                            </span>
                        </h1>

                        <p className="max-w-xl text-lg text-muted-foreground">
                            Streamline and unify services across all municipalities.
                        </p>

                        {/* Divider Line: 'bg-primary' */}
                        <div className="h-1 w-28 rounded-full bg-primary"></div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="relative hidden w-full items-center justify-center md:col-span-2 md:flex md:h-[400px] lg:h-[600px]">
                    {/* Decorative corners - Updated to Theme */}
                    <div className="absolute -top-6 -right-6 h-20 w-20 rounded-md border border-border bg-secondary/50 backdrop-blur-sm"></div>
                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm"></div>

                    {/* Map Frame */}
                    <img
                        src="https://res.cloudinary.com/drhkb0ubf/image/upload/v1768972079/landing_design_1_g2ta8o.png"
                        className="h-full w-full object-contain"
                        alt="Marinduque Map"
                    />
                </div>
            </div>

            {/* Municipality Cards Section */}
            <div className="relative z-20 mt-10">
                <MunicipalityCard />
            </div>
        </div>
    );
}
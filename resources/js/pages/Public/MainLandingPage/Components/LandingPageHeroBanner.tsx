import { useEffect, useState } from 'react';
import { MunicipalityCard } from './MunicipalityCard';
import { Globe } from 'lucide-react';

export default function LandingPageHeroBanner() {
    const [fadeVisible, setFadeVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFadeVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            
            {/* 2. HERO SECTION */}
            <div className="relative z-10 container mx-auto px-6 py-20 lg:py-32 2xl:max-w-[1400px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* LEFT: Text Content */}
                    <div className={`space-y-8 transition-all duration-1000 ease-out ${fadeVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary backdrop-blur-sm">
                            <Globe className="h-3.5 w-3.5" />
                            <span>One Province. One Portal.</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
                            UNIFIED <br />
                            <span className="text-primary">SERVICES</span> <br />
                            PORTAL
                        </h1>

                        {/* Subheading */}
                        <p className="max-w-xl text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
                            Streamlining government services across Marinduque. Access municipal resources, reports, and applications in one centralized hub.
                        </p>
                    </div>

                    {/* RIGHT: Map Visual (Glassmorphism Card) */}
                    <div className={`relative hidden lg:flex items-center justify-center transition-all duration-1000 delay-300 ease-out ${fadeVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                        {/* Blob Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
                        
                        {/* Map Container */}
                        <div className="relative z-10 w-full max-w-[600px]">
                            <img
                                src="https://res.cloudinary.com/drhkb0ubf/image/upload/v1768972079/landing_design_1_g2ta8o.png"
                                alt="Marinduque Map"
                                className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MUNICIPALITY SELECTION SECTION */}
            <div className="relative z-20 bg-muted/30 border-t border-border py-20">
                <div className="container mx-auto px-6 2xl:max-w-[1400px]">
                    
                    <div className="mb-12 text-center space-y-4">
                        <h2 className="text-3xl font-black uppercase tracking-widest text-foreground">Select Municipality</h2>
                        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
                        <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
                            Choose your local government unit to access specific services, apply for permits, or file reports.
                        </p>
                    </div>

                    <MunicipalityCard />
                </div>
            </div>

        </div>
    );
}
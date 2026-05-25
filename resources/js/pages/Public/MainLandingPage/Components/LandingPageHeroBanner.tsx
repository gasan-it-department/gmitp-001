import { useEffect, useState } from 'react';
import { MunicipalityCard } from './MunicipalityCard';
import { Globe, ArrowRight, ClipboardCheck, MessageSquare, AlertCircle, Eye } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function LandingPageHeroBanner() {
    const [fadeVisible, setFadeVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFadeVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        { 
            title: "Sentro ng Aksyon", 
            description: "Mabilis na pagproseso ng mga dokumento at mga aplikasyon.", 
            icon: ClipboardCheck 
        },
        { 
            title: "Puna at Suhestiyon", 
            description: "Ibahagi ang inyong karanasan upang mapabuti ang aming serbisyo.", 
            icon: MessageSquare 
        },
        { 
            title: "Pag-uulat", 
            description: "Iulat ang mga insidente o mahahalagang concerns sa inyong komunidad.", 
            icon: AlertCircle 
        },
        { 
            title: "Katapatan", 
            description: "Buksan at tingnan ang mga ulat at paggamit ng pondo ng bayan.", 
            icon: Eye 
        },
    ];

    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            
            {/* HERO SECTION */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
                {/* Background Decor */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* LEFT: Text Content */}
                    <div className={`space-y-8 transition-all duration-1000 ease-out ${fadeVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-sm shadow-sm">
                            <Globe className="h-3.5 w-3.5" />
                            <span>Isang Lalawigan. Isang Portal.</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-black text-foreground leading-[1.05] tracking-tight">
                            PORTAL NG <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">SERBISYO</span> <br />
                        </h1>

                        {/* Subheading */}
                        <p className="max-w-xl text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
                            Pinag-iisa ang mga serbisyo ng gobyerno sa buong Marinduque. I-access ang mga dokumento, permits, at impormasyon sa isang sentralisadong hub.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105">
                                Magsimula Na
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-background px-8 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted">
                                Alamin ang Higit Pa
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Map Visual */}
                    <div className={`relative hidden lg:flex items-center justify-center transition-all duration-1000 delay-300 ease-out ${fadeVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                        {/* Glowing orb */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[120px]" />
                        
                        {/* Map Container */}
                        <div className="relative z-10 w-full max-w-[550px] transform hover:-translate-y-2 transition-transform duration-500">
                            <img
                                src="https://res.cloudinary.com/drhkb0ubf/image/upload/v1768972079/landing_design_1_g2ta8o.png"
                                alt="Marinduque Map"
                                className="w-full h-auto object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* E-SERVICES HIGHLIGHT SECTION - INFORMATIVE ONLY */}
            <div className="relative z-20 border-y border-border bg-card/50 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl uppercase italic">
                            Serbisyong Digital sa Iyong mga Kamay
                        </h2>
                        <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
                        <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                            Ang aming layunin ay gawing mas madali, mabilis, at transparent ang bawat transaksyon sa pamahalaan. Narito ang apat na haligi ng aming serbisyo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="relative flex flex-col items-center text-center space-y-4">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary shadow-sm">
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-foreground tracking-tight">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                    {/* Subtle separator for mobile/tablet */}
                                    {idx < features.length - 1 && (
                                        <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 h-12 w-[1px] bg-border/50" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* MUNICIPALITY SELECTION SECTION */}
            <div className="relative z-20 bg-muted/20 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    <div className="mb-16 text-center space-y-4">
                        <span className="text-sm font-bold text-primary tracking-widest uppercase">Piliin ang Iyong Lokal na Pamahalaan</span>
                        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">Galugarin ang mga Bayan</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mt-4" />
                        <p className="text-muted-foreground font-medium max-w-2xl mx-auto mt-6 text-lg">
                            Pumili ng iyong lokal na yunit ng pamahalaan upang ma-access ang mga serbisyo, mag-apply ng permits, o mag-ulat sa komunidad.
                        </p>
                    </div>

                    <MunicipalityCard />
                </div>
            </div>

        </div>
    );
}
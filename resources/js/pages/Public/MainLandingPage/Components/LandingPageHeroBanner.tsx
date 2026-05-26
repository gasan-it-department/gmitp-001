import { AlertCircle, ClipboardCheck, Eye, Globe, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MunicipalityCard } from './MunicipalityCard';

export default function LandingPageHeroBanner() {
    const [fadeVisible, setFadeVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFadeVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        {
            title: 'Sentro ng Aksyon',
            description: 'Mabilis na pagproseso ng mga dokumento at mga aplikasyon.',
            icon: ClipboardCheck,
        },
        {
            title: 'Puna at Suhestiyon',
            description: 'Ibahagi ang inyong karanasan upang mapabuti ang aming serbisyo.',
            icon: MessageSquare,
        },
        {
            title: 'Pag-uulat',
            description: 'Iulat ang mga insidente o mahahalagang concerns sa inyong komunidad.',
            icon: AlertCircle,
        },
        {
            title: 'Katapatan',
            description: 'Buksan at tingnan ang mga ulat at paggamit ng pondo ng bayan.',
            icon: Eye,
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-background">
            {/* HERO SECTION */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
                {/* Background Decor */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 right-0 left-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
                    {/* LEFT: Text Content */}
                    <div
                        className={`space-y-8 transition-all duration-1000 ease-out ${fadeVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase shadow-sm backdrop-blur-sm">
                            <Globe className="h-3.5 w-3.5" />
                            <span>Isang Lalawigan. Isang Portal.</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl leading-[1.05] font-black tracking-tight text-foreground sm:text-6xl lg:text-[5rem]">
                            PORTAL NG <br />
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">SERBISYO</span> <br />
                        </h1>

                        {/* Subheading */}
                        <p className="max-w-xl text-lg leading-relaxed font-medium text-muted-foreground sm:text-xl">
                            Pinag-iisa ang mga serbisyo ng gobyerno sa buong Marinduque. I-access ang mga dokumento, permits, at impormasyon sa isang
                            sentralisadong hub.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            {/* <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105">
                                Magsimula Na
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-background px-8 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted">
                                Alamin ang Higit Pa
                            </button> */}
                        </div>
                    </div>

                    {/* RIGHT: Map Visual */}
                    <div
                        className={`relative hidden items-center justify-center transition-all delay-300 duration-1000 ease-out lg:flex ${fadeVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                    >
                        {/* Glowing orb */}
                        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-[120px]" />

                        {/* Map Container */}
                        <div className="relative z-10 w-full max-w-[550px] transform transition-transform duration-500 hover:-translate-y-2">
                            <img
                                src="https://res.cloudinary.com/drhkb0ubf/image/upload/v1768972079/landing_design_1_g2ta8o.png"
                                alt="Marinduque Map"
                                className="h-auto w-full object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* E-SERVICES HIGHLIGHT SECTION - INFORMATIVE ONLY */}
            <div className="relative z-20 border-y border-border bg-card/50 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
                        <h2 className="text-3xl font-black tracking-tight text-foreground uppercase italic sm:text-4xl lg:text-5xl">
                            Serbisyong Digital sa Iyong mga Kamay
                        </h2>
                        <div className="mx-auto h-1.5 w-20 rounded-full bg-primary" />
                        <p className="text-lg leading-relaxed font-medium text-muted-foreground">
                            Ang aming layunin ay gawing mas madali, mabilis, at transparent ang bawat transaksyon sa pamahalaan. Narito ang apat na
                            haligi ng aming serbisyo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="relative flex flex-col items-center space-y-4 text-center">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5 text-primary shadow-sm">
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold tracking-tight text-foreground">{feature.title}</h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                                    </div>
                                    {/* Subtle separator for mobile/tablet */}
                                    {idx < features.length - 1 && (
                                        <div className="absolute top-1/2 -right-4 hidden h-12 w-[1px] -translate-y-1/2 bg-border/50 lg:block" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MUNICIPALITY SELECTION SECTION */}
            <div className="relative z-20 bg-muted/20 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 space-y-4 text-center">
                        <span className="text-sm font-bold tracking-widest text-primary uppercase">Piliin ang Iyong Lokal na Pamahalaan</span>
                        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">Galugarin ang mga Bayan</h2>
                        <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-primary" />
                        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-muted-foreground">
                            Pumili ng iyong lokal na yunit ng pamahalaan upang ma-access ang mga serbisyo, mag-apply ng permits, o mag-ulat sa
                            komunidad.
                        </p>
                    </div>

                    <MunicipalityCard />
                </div>
            </div>
        </div>
    );
}

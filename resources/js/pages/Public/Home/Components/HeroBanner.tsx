import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HeroBanner() {
    const [fadeVisible, setFadeVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setFadeVisible(true), 500);
    }, []);
    return (
        <div className="relative overflow-hidden">
            {/* Background gradient accent */}
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-5 md:gap-12 md:py-15 lg:py-10 xl:gap-16 2xl:max-w-[1400px]">
                {/* Text column - takes 3/5 on desktop, full on mobile */}
                <div className="absolute top-0 m-2 flex gap-3">
                    <div
                        className="flex h-15 w-15 animate-bounce items-center justify-center rounded-full bg-contain bg-center bg-no-repeat md:mt-3 md:h-20 md:w-20 lg:mt-15 lg:h-24 lg:w-24"
                        style={{ backgroundImage: "url('/assets/bp_logo.png')" }}
                    ></div>{' '}
                </div>
                <div className="mt-2 flex flex-col justify-center md:col-span-3 md:pr-6 xl:pr-12">
                    <div
                        className={`transform space-y-6 transition-all duration-1000 md:space-y-8 ${
                            fadeVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        } `}
                    >
                        {/* Label with dots */}
                        <div className="flex items-center space-x-3">
                            {/* <span className="h-1.5 w-1.5 rounded-full bg-primary"></span> */}
                            {/* <h2 className="text-sm font-semibold tracking-wider text-primary uppercase">Art Director & Visual Designer</h2> */}
                        </div>

                        {/* Main heading with multi-line approach */}
                        <h1 className="transform scroll-m-20 text-4xl font-bold tracking-tight transition-all duration-1000 md:text-5xl lg:text-6xl">
                            <span className="block">Gasan System</span>
                            <span className="mt-1 block text-primary">Coming Soon</span>
                        </h1>

                        {/* Description text */}
                        <p className="max-w-xl text-lg text-muted-foreground">
                            Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de
                            relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Button size="lg" className="group">
                                Lorem Ipsum
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>

                            <Button variant="outline" size="lg" className="group">
                                Lorem Ipsum
                                <ExternalLink className="ml-2 h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Image column - takes 2/5 on desktop, full on mobile */}
                <div className="relative hidden w-full items-center bg-black md:col-span-2 md:flex md:h-[400px] lg:h-[600px]">
                    {/* Decorative element */}
                    <div className="absolute -top-6 -right-6 h-20 w-20 rounded-md border border-primary/20 bg-background/50 backdrop-blur-sm"></div>

                    {/* Main image with frame */}
                    <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl border border-muted/30 bg-muted/10 shadow-xl">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full border border-primary/10 bg-background/50 backdrop-blur-sm"></div>
                </div>
            </div>
        </div>
    );
}

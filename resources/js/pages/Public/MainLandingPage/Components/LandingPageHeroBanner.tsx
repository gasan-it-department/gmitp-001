
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';

export default function LandingPageHeroBanner() {
    const [fadeVisible, setFadeVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setFadeVisible(true), 500);
    }, []);

    const registeredMunicipalities = [
        { id: 4902, name: 'Gasan', logo: '/assets/gasan_logo.png' },
    ]

    registeredMunicipalities.sort((a, b) => a.id - b.id);

    return (
        <div className="relative overflow-hidden">
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-5 md:gap-12 md:py-15 lg:py-10 xl:gap-16 2xl:max-w-[1400px]">

                <div className="absolute top-0 m-2 flex gap-3">
                    <div
                        className="flex h-15 w-15 animate-bounce items-center justify-center rounded-full bg-contain bg-center bg-no-repeat md:mt-3 md:h-20 md:w-20 lg:mt-15 lg:h-24 lg:w-24"
                        style={{ backgroundImage: "url('/assets/bp_logo.png')" }}
                    ></div>{' '}
                </div>
                <div className="mt-2 flex flex-col justify-center md:col-span-3 md:pr-6 xl:pr-12">
                    <div
                        className={`transform space-y-6 transition-all duration-1000 md:space-y-8 ${fadeVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            } `}
                    >
                        <div className="flex items-center space-x-3">

                        </div>

                        <h1 className="transform scroll-m-20 text-4xl font-bold tracking-tight transition-all duration-1000 md:text-5xl lg:text-6xl">
                            <span className="block sm:text-[90px]">Welcome</span>
                        </h1>

                        <p className="max-w-xl text-lg text-muted-foreground">
                            streamline and unify services accross all municipalities
                        </p>

                    </div>
                </div>

                <div className="relative hidden w-full items-center bg-black md:col-span-2 md:flex md:h-[400px] lg:h-[600px]">
                    <div className="absolute -top-6 -right-6 h-20 w-20 rounded-md border border-primary/20 bg-background/50 backdrop-blur-sm"></div>

                    <div className="relative z-10 h-full w-full overflow-hidden rounded-2xl border border-muted/30 bg-muted/10 shadow-xl">
                        {/* <img
                            src="assets/marinduque_map.jpg"
                            className="w-full h-full object-cover"
                            alt="Marinduque Map"
                        /> */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </div>


                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full border border-primary/10 bg-background/50 backdrop-blur-sm"></div>
                </div>
            </div>
            <div className="mt-10 w-full p-5">
                <h2 className="text-[25px] font-bold px-4 mb-2">Municipalities</h2>

                <div className="px-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                        {registeredMunicipalities.map((municipality) => (
                            <Card
                                key={municipality.id}
                                className="w-full sm:w-[20rem] flex-shrink-0 p-4 flex flex-col items-center text-center bg-white rounded-xl"
                            >
                                <img
                                    src={municipality.logo}
                                    alt={`${municipality.name} logo`}
                                    className="w-30 h-30 object-contain mb-3"
                                />
                                <h3 className="text-[25px] font-semibold">{municipality.name}</h3>
                                <h2 className="text-lg text-[10px]">{municipality.id}</h2>
                                <Link
                                    href={route('home.show')}
                                    className="inline-block w-full text-center bg-black text-white py-2 px-4 rounded hover:shadow-md"
                                >
                                    View
                                </Link>
                            </Card>

                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

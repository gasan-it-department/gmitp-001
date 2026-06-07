import { ArrowDown, ClipboardCheck, Eye, FileText, LifeBuoy, MapPinned, MessageSquare, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MunicipalityCard } from './MunicipalityCard';

const MARINDUQUE_MARK = 'https://res.cloudinary.com/drhkb0ubf/image/upload/v1768972079/landing_design_1_g2ta8o.png';

export default function LandingPageHeroBanner() {
    const [fadeVisible, setFadeVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFadeVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        {
            title: 'Sentro ng Aksyon',
            description: 'Magpadala ng request at subaybayan ang proseso mula sa inyong bayan.',
            icon: ClipboardCheck,
        },
        {
            title: 'Dokumento at Permit',
            description: 'Makahanap ng forms, requirements, at local service information.',
            icon: FileText,
        },
        {
            title: 'Puna at Suhestiyon',
            description: 'Ibahagi ang karanasan upang mas mapabuti ang serbisyo publiko.',
            icon: MessageSquare,
        },
        {
            title: 'Transparency',
            description: 'Tingnan ang mahahalagang ulat, abiso, at impormasyon ng pamahalaan.',
            icon: Eye,
        },
    ];

    const serviceStats = [
        { label: 'Municipal portals', value: '6' },
        { label: 'Citizen services', value: '24/7' },
        { label: 'Province', value: '1' },
    ];

    return (
        <div className="relative overflow-hidden bg-[#f8faf9]">
            <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-[#d9e2df] bg-[#f8faf9]">
                <img
                    src={MARINDUQUE_MARK}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.06] sm:h-[42rem] sm:w-[42rem]"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-white" />

                <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
                    <div
                        className={`mx-auto max-w-4xl space-y-8 text-center transition-all duration-700 ease-out ${
                            fadeVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                        }`}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold tracking-widest text-slate-900 uppercase shadow-sm">
                            <ShieldCheck className="h-4 w-4 text-slate-700" />
                            Serbisyong Bayan, Isang Portal
                        </div>

                        <div className="space-y-5">
                            <h1 className="text-4xl leading-tight font-black tracking-tight text-[#102a26] sm:text-5xl lg:text-7xl">
                                Mas malapit na serbisyo para sa bawat mamamayan.
                            </h1>
                            <p className="mx-auto max-w-2xl text-base leading-8 font-medium text-slate-600 sm:text-lg">
                                Piliin ang inyong munisipalidad at makapasok sa lokal na portal para sa impormasyon, requests, permits, reports, at
                                iba pang serbisyong pampubliko.
                            </p>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <a
                                href="#municipalities"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-900 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-none"
                            >
                                Piliin ang Bayan
                                <ArrowDown className="h-4 w-4" />
                            </a>
                            <a
                                href="#services"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-none"
                            >
                                Tingnan ang Serbisyo
                                <LifeBuoy className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div className="relative z-10 mx-auto mt-14 grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-lg border border-[#d9e2df] bg-white shadow-sm sm:grid-cols-3">
                        {serviceStats.map((item) => (
                            <div
                                key={item.label}
                                className="border-b border-[#d9e2df] px-6 py-5 text-center last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
                            >
                                <p className="text-2xl font-black text-slate-900">{item.value}</p>
                                <p className="mt-1 text-xs font-bold tracking-widest text-slate-500 uppercase">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="municipalities" className="relative bg-white px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-900">
                            <MapPinned className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold tracking-widest text-slate-700 uppercase">Piliin ang Iyong Lokal na Pamahalaan</p>
                        <h2 className="text-3xl font-black tracking-tight text-[#102a26] sm:text-4xl">Saan ang inyong bayan?</h2>
                        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
                            Nasa gitna ang listahan upang mabilis ninyong makita ang tamang municipal portal bago pumili ng serbisyo.
                        </p>
                    </div>

                    <MunicipalityCard />
                </div>
            </section>

            <section id="services" className="border-y border-[#d9e2df] bg-slate-100 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
                        <p className="text-sm font-bold tracking-widest text-slate-700 uppercase">Digital na Serbisyo</p>
                        <h2 className="text-3xl font-black tracking-tight text-[#102a26] sm:text-4xl">Mas malinaw, mas mabilis, mas maaasahan.</h2>
                        <p className="text-base leading-7 text-slate-600">
                            Isang maayos na entry point para sa mahahalagang transaksyon at impormasyon ng lokal na pamahalaan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black text-[#102a26]">{feature.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}

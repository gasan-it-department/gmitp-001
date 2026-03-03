import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ToastProvider from '@/pages/Utility/ToastShower';
import government from '@/routes/government';
import { router } from '@inertiajs/react';

// Make sure your PublicRosterItem interface includes 'category' and 'title'

interface Props {
    municipality: { data: MunicipalityType };
    term: { data: Term };
    publishedTerms: { data: Term[] };
    roster: { data: PublicRosterItem[] };
}

export default function GovernmentPage({ municipality, term, publishedTerms, roster }: Props) {
    // Extract the actual array from Laravel's Resource wrapper
    const municipalityData = municipality.data;
    const termData = term.data;
    const publishedTermsData = publishedTerms.data;
    const rosterData = roster.data;

    const handleTermChange = (selectedSlug: string) => {
        router.get(
            government.roster.url({ municipality: municipalityData.slug, term_slug: selectedSlug }),
            {},
            { headers: { 'X-Municipality-Slug': municipalityData.slug }, preserveScroll: true },
        );
    };

    // ==========================================
    // 1. DATA FORMATTER (The "Pro-Move")
    // ==========================================
    const formatOfficial = (pos: PublicRosterItem | undefined, fallbackTitle: string) => {
        const official = pos?.official;
        return {
            position: pos?.title || fallbackTitle,
            name: official ? official.formatted_name || `Hon. ${official.first_name} ${official.last_name}` : 'Vacant Seat',
            image: official?.profile_url || municipalityData?.settings?.logo_url,
        };
    };

    // ==========================================
    // 2. RAW DATA QUERIES
    // ==========================================
    const rawMayor = rosterData.find((pos) => pos.title.includes('Mayor') && !pos.title.includes('Vice'));
    const rawViceMayor = rosterData.find((pos) => pos.title.includes('Vice Mayor'));

    const rawCouncilors = rosterData
        .filter((pos) => pos.title.includes('Sangguniang') || pos.title.includes('Councilor'))
        .sort((a, b) => a.sequence - b.sequence);

    const rawExOfficios = rosterData
        .filter((pos) => pos.category?.includes('Ex-officio') && !pos.title.includes('IPMR'))
        .sort((a, b) => a.sequence - b.sequence);

    // ==========================================
    // 3. UI BINDING
    // ==========================================
    const mayor = formatOfficial(rawMayor, 'Municipal Mayor');
    const viceMayor = formatOfficial(rawViceMayor, 'Municipal Vice Mayor');
    const councilors = rawCouncilors.map((c) => formatOfficial(c, c.title));
    const exOfficios = rawExOfficios.map((e) => formatOfficial(e, e.title));

    return (
        <PublicLayout
            title={`Government Officials | ${municipalityData.name}`}
            description={`The Elective Officials of the Municipality of ${municipalityData.name} for the term ${termData.name}`}
        >
            <div className="min-h-screen bg-[#fcfcfc] dark:bg-zinc-950">
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-900 via-orange-500 to-blue-900" />

                <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    {/* Header */}
                    <header className="mb-20 text-center">
                        <h2 className="mb-4 text-xs font-bold tracking-[0.25em] text-orange-600 uppercase dark:text-orange-500">
                            Republic of the Philippines
                        </h2>
                        <h1 className="font-serif text-4xl font-extrabold text-slate-900 md:text-6xl dark:text-gray-100">
                            Municipality of {municipalityData.name}
                        </h1>
                        <div className="mt-3 flex items-center justify-center gap-4">
                            <div className="h-[1px] w-12 bg-slate-300" />
                            <p className="text-lg font-medium text-slate-600 italic dark:text-gray-400">Province of Marinduque</p>
                            <div className="h-[1px] w-12 bg-slate-300" />
                        </div>
                    </header>

                    <div className="space-y-32">
                        {/* 1. MUNICIPAL MAYOR */}
                        <section className="relative">
                            <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
                                <div className="relative shrink-0">
                                    <div className="absolute -inset-4 -z-10 rounded-2xl border border-slate-200 dark:border-zinc-800" />
                                    <img
                                        src={mayor.image}
                                        alt={mayor.name}
                                        className="h-72 w-72 rounded-xl border-4 border-white object-cover shadow-2xl sm:h-96 sm:w-96 dark:border-zinc-900"
                                    />
                                </div>
                                <div className="flex-1 space-y-4 text-center lg:text-left">
                                    <div className="inline-block bg-slate-900 px-4 py-1 text-xs font-bold tracking-[0.2em] text-white uppercase dark:bg-white dark:text-black">
                                        Chief Executive
                                    </div>
                                    <h2 className="font-serif text-5xl leading-tight font-black text-slate-900 sm:text-6xl dark:text-white">
                                        {mayor.name}
                                    </h2>
                                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{mayor.position}</p>
                                </div>
                            </div>
                        </section>

                        {/* 2. MUNICIPAL VICE MAYOR */}
                        <section className="rounded-[2.5rem] border border-slate-200 bg-slate-50 p-8 shadow-sm md:p-16 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="flex flex-col items-center justify-center gap-12 md:flex-row">
                                <div className="order-2 flex-1 space-y-2 text-center md:order-1 md:text-right">
                                    <h3 className="font-serif text-4xl font-bold text-slate-900 dark:text-white">{viceMayor.name}</h3>
                                    <p className="text-lg font-bold tracking-widest text-orange-700 uppercase dark:text-orange-400">
                                        {viceMayor.position}
                                    </p>
                                    <span className="inline-block text-xs font-black tracking-tighter text-slate-400 uppercase">
                                        Presiding Officer, Sangguniang Bayan
                                    </span>
                                </div>
                                <div className="order-1 md:order-2">
                                    <img
                                        src={viceMayor.image}
                                        alt={viceMayor.name}
                                        className="h-64 w-64 rounded-full border-4 border-white object-cover shadow-xl ring-1 ring-slate-200 dark:border-zinc-900 dark:ring-zinc-700"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 3. COUNCILORS GRID */}
                        <section className="pt-10">
                            <div className="mb-16 text-center">
                                <h2 className="font-serif text-2xl font-bold tracking-[0.3em] text-slate-800 uppercase dark:text-gray-200">
                                    Sangguniang Bayan Members
                                </h2>
                                <p className="mt-2 text-xs tracking-widest text-slate-500 uppercase">
                                    Legislative Body of {municipalityData.name} ({termData.name})
                                </p>
                                <div className="mx-auto mt-4 h-1 w-20 bg-orange-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-16 px-4 md:grid-cols-3 lg:grid-cols-4">
                                {councilors.map((c, i) => (
                                    <div key={i} className="group flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <div className="absolute -inset-2 rounded-lg border border-slate-200 transition-colors duration-300 group-hover:border-orange-400 dark:border-zinc-800" />
                                            <img
                                                src={c.image}
                                                alt={c.name}
                                                className={`relative h-40 w-40 rounded-md object-cover shadow-md transition-all duration-300 sm:h-48 sm:w-48 ${c.name === 'Vacant Seat' ? 'opacity-50 grayscale' : 'group-hover:shadow-xl'}`}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <h4 className="font-serif leading-tight font-bold text-slate-900 dark:text-gray-100">{c.name}</h4>
                                            <div className="mt-2 flex flex-col items-center">
                                                <div className="mb-2 h-0.5 w-8 bg-slate-200 transition-all group-hover:w-12 group-hover:bg-orange-500 dark:bg-zinc-800" />
                                                <p className="text-[10px] font-bold tracking-tighter text-slate-500 uppercase dark:text-orange-500">
                                                    {c.position}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. EX-OFFICIO MEMBERS GRID */}
                        {exOfficios.length > 0 && (
                            <section className="border-t border-slate-200 pt-10 dark:border-zinc-800">
                                <div className="mt-10 mb-16 text-center">
                                    <h2 className="font-serif text-2xl font-bold tracking-[0.3em] text-slate-800 uppercase dark:text-gray-200">
                                        Ex-Officio Members
                                    </h2>
                                    <div className="mx-auto mt-4 h-1 w-20 bg-slate-400" />
                                </div>
                                <div className="flex flex-wrap justify-center gap-x-12 gap-y-16 px-4">
                                    {exOfficios.map((c, i) => (
                                        <div key={i} className="group flex w-48 flex-col items-center">
                                            <div className="relative mb-6">
                                                <div className="absolute -inset-2 rounded-lg border border-slate-200 transition-colors duration-300 group-hover:border-slate-400 dark:border-zinc-800" />
                                                <img
                                                    src={c.image}
                                                    alt={c.name}
                                                    className={`relative h-40 w-40 rounded-md object-cover shadow-md transition-all duration-300 sm:h-48 sm:w-48 ${c.name === 'Vacant Seat' ? 'opacity-50 grayscale' : 'group-hover:shadow-xl'}`}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-serif leading-tight font-bold text-slate-900 dark:text-gray-100">{c.name}</h4>
                                                <div className="mt-2 flex flex-col items-center">
                                                    <div className="mb-2 h-0.5 w-8 bg-slate-200 transition-all group-hover:w-12 group-hover:bg-slate-500 dark:bg-zinc-800" />
                                                    <p className="text-[10px] font-bold tracking-tighter text-slate-500 uppercase">{c.position}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* FOOTER & YEAR SELECTION */}
                    <footer className="mt-32 border-t border-slate-200 pt-12 text-center dark:border-zinc-800">
                        <p className="mb-6 text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase">
                            Official Directory • Municipality of {municipalityData.name}
                        </p>

                        <div className="mb-8 flex flex-col items-center justify-center gap-3">
                            <label htmlFor="year-select" className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                                Select Administrative Year
                            </label>
                            <div className="relative">
                                {/* The Inertia Navigation Dropdown */}
                                <select
                                    id="year-select"
                                    value={termData.slug}
                                    onChange={(e) => handleTermChange(e.target.value)}
                                    className="cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-10 py-2 font-serif text-sm font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-200"
                                >
                                    {publishedTermsData.map((t) => (
                                        <option key={t.id} value={t.slug}>
                                            {t.name} {t.is_current ? '(Current)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <p className="text-[9px] text-slate-400 italic">Data provided for the administrative period of {termData.name}</p>
                        <p className="mt-4 text-[9px] tracking-[0.2em] text-slate-300 uppercase dark:text-zinc-700">
                            © {new Date().getFullYear()} {municipalityData.name} Marinduque Local Government Unit
                        </p>
                    </footer>
                </div>

                <ToastProvider />
            </div>
        </PublicLayout>
    );
}

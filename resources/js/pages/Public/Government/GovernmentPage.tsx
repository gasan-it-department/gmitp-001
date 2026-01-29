import { useState } from "react";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/layouts/Public/wrapper/PublicLayoutTemplate";
import ToastProvider from "@/pages/Utility/ToastShower";

export default function GovernmentPage() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const officials = [
        {
            name: "Hon. James Marty L. Lim",
            position: "Municipal Mayor",
            image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654278/1_dx3kpm.png",
            description:
                "As the chief executive of the Municipality of Gasan, the Municipal Mayor oversees the implementation of development programs, ensures efficient delivery of public services, and upholds transparent and accountable governance for every Gasanon.",
        },
        {
            name: "Hon. Lidany A. Lao-Baldo",
            position: "Municipal Vice Mayor",
            image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654277/2_gkkwyd.png",
            description:
                "The Municipal Vice Mayor presides over the Sangguniang Bayan and supports the Mayor in ensuring effective legislative and executive coordination for the welfare of the community.",
        },
        { name: "Hon. Ricardo F. Macunat", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654277/3_fyqluf.png" },
        { name: "Hon. Dunne Melton S. Motol", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654278/4_qmpmsx.png" },
        { name: "Hon. Reynaldo M. Maming", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654278/5_fqsuhk.png" },
        { name: "Hon. Mary Kris Tolentino", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654279/6_ayzauk.png" },
        { name: "Hon. Maria Merlie Soberano-Selda", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654279/7_p0brvz.png" },
        { name: "Hon. Servillano M. Balitaan", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654277/8_atppzz.png" },
        { name: "Hon. Harold K. Lim", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654277/9_himsyv.png" },
        { name: "Hon. Constancio W. Saludo", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654277/10_dxetgg.png" },
        { name: "Hon. Karin-An M. De Villena", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654277/11_bn72lg.png" },
        { name: "Hon. Marck Jhun Zoleta", position: "Municipal Councilor", image: "https://res.cloudinary.com/drhkb0ubf/image/upload/v1769654278/12_zqzkgk.png" },
    ];

    const mayor = officials.find((o) => o.position === "Municipal Mayor");
    const viceMayor = officials.find((o) => o.position === "Municipal Vice Mayor");
    const councilors = officials.filter((o) => o.position === "Municipal Councilor");

    const availableYears = ["2026"];

    return (
        <PublicLayout
            title="Government Officials"
            description="The Elective Officials of the Municipality of Gasan"
        >
            <div className="min-h-screen bg-[#fcfcfc] dark:bg-zinc-950">
                <div className="h-1.5 bg-gradient-to-r from-blue-900 via-orange-500 to-blue-900 w-full" />

                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <header className="text-center mb-20">
                        <h2 className="text-orange-600 dark:text-orange-500 font-bold tracking-[0.25em] uppercase text-xs mb-4">
                            Republic of the Philippines
                        </h2>
                        <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-slate-900 dark:text-gray-100">
                            Municipality of Gasan
                        </h1>
                        <div className="flex items-center justify-center gap-4 mt-3">
                            <div className="h-[1px] w-12 bg-slate-300" />
                            <p className="text-lg text-slate-600 dark:text-gray-400 font-medium italic">
                                Province of Marinduque
                            </p>
                            <div className="h-[1px] w-12 bg-slate-300" />
                        </div>
                    </header>

                    <div className="space-y-32">
                        {/* 1. MUNICIPAL MAYOR */}
                        {mayor && (
                            <section className="relative">
                                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                                    <div className="relative shrink-0">
                                        <div className="absolute -inset-4 border border-slate-200 dark:border-zinc-800 rounded-2xl -z-10" />
                                        <img 
                                            src={mayor.image} 
                                            alt={mayor.name} 
                                            className="h-72 w-72 sm:h-96 sm:w-96 rounded-xl object-cover shadow-2xl border-4 border-white dark:border-zinc-900" 
                                        />
                                    </div>
                                    <div className="flex-1 space-y-6 text-center lg:text-left">
                                        <div className="inline-block px-4 py-1 bg-slate-900 dark:bg-white dark:text-black text-white text-xs font-bold uppercase tracking-[0.2em]">
                                            Chief Executive
                                        </div>
                                        <h2 className="text-4xl sm:text-5xl font-serif font-black text-slate-900 dark:text-white leading-tight">
                                            {mayor.name}
                                        </h2>
                                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                                            Municipal Mayor
                                        </p>
                                        <p className="text-lg text-slate-700 dark:text-gray-300 leading-relaxed font-light italic border-l-4 border-orange-500 pl-6 text-justify lg:text-left">
                                            "{mayor.description}"
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 2. MUNICIPAL VICE MAYOR */}
                        {viceMayor && (
                            <section className="bg-slate-50 dark:bg-zinc-900/50 p-8 md:p-16 rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                                    <div className="text-center md:text-right order-2 md:order-1 flex-1">
                                        <h3 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
                                            {viceMayor.name}
                                        </h3>
                                        <p className="text-orange-700 dark:text-orange-400 font-bold uppercase tracking-widest text-sm mb-4">
                                            Municipal Vice Mayor
                                        </p>
                                        <p className="text-slate-600 dark:text-gray-400 text-sm md:text-base italic leading-relaxed">
                                            {viceMayor.description}
                                        </p>
                                    </div>
                                    <div className="order-1 md:order-2">
                                        <img 
                                            src={viceMayor.image} 
                                            alt={viceMayor.name} 
                                            className="h-56 w-56 rounded-full object-cover shadow-xl border-4 border-white dark:border-zinc-900 ring-1 ring-slate-200 dark:ring-zinc-700" 
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 3. COUNCILORS GRID */}
                        <section className="pt-10">
                            <div className="text-center mb-16">
                                <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-gray-200 uppercase tracking-[0.3em]">
                                    Sangguniang Bayan Members
                                </h2>
                                <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">
                                    Legislative Body of Gasan ({selectedYear})
                                </p>
                                <div className="h-1 w-20 bg-orange-500 mx-auto mt-4" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-16 gap-x-8 px-4">
                                {councilors.map((c, i) => (
                                    <div key={i} className="group flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <div className="absolute -inset-2 border border-slate-200 dark:border-zinc-800 rounded-lg group-hover:border-orange-400 transition-colors duration-300" />
                                            <img 
                                                src={c.image} 
                                                alt={c.name} 
                                                className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-md object-cover shadow-md group-hover:shadow-xl transition-all duration-300" 
                                            />
                                        </div>
                                        <div className="text-center">
                                            <h4 className="font-serif font-bold text-slate-900 dark:text-gray-100 leading-tight">
                                                {c.name}
                                            </h4>
                                            <div className="mt-2 flex flex-col items-center">
                                                <div className="h-0.5 w-8 bg-slate-200 dark:bg-zinc-800 group-hover:w-12 group-hover:bg-orange-500 transition-all mb-2" />
                                                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-orange-500 tracking-tighter">
                                                    Municipal Councilor
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* FOOTER & YEAR SELECTION */}
                    <footer className="mt-32 pt-12 border-t border-slate-200 dark:border-zinc-800 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-6">
                            Official Directory • Municipality of Gasan
                        </p>

                        <div className="flex flex-col items-center justify-center gap-3 mb-8">
                            <label htmlFor="year-select" className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                                Select Administrative Year
                            </label>
                            <div className="relative">
                                <select 
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="appearance-none bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md px-10 py-2 text-sm font-serif font-bold text-slate-800 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                >
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <p className="text-[9px] text-slate-400 italic">
                            Data provided for the administrative period of {selectedYear}
                        </p>
                        <p className="text-[9px] text-slate-300 dark:text-zinc-700 mt-4 uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} Gasan Marinduque Local Government Unit
                        </p>
                    </footer>
                </div>

                <ToastProvider/>
            </div>
        </PublicLayout>
    );
}
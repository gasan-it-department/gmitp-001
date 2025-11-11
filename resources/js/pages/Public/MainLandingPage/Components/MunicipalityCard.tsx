import { Card } from '@/components/ui/card';
import { getMunicipalities } from '@/Core/Api/Municipality/MunicipalityApi';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { show as home } from '@/routes/home';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MunicipalityCard() {
    const [municipalities, setMunicipalities] = useState<MunicipalityType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log(typeof route);
    useEffect(() => {
        async function fetchMunicipalities() {
            try {
                const data = await getMunicipalities();
                setMunicipalities(data);
            } catch (err) {
                console.error('Error fetching municipalities:', err);
                setError('Failed to load municipalities.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchMunicipalities();
    }, []);

    if (isLoading) return <p className="animate-pulse p-5 text-center text-lg font-medium text-gray-400">Loading municipalities...</p>;

    if (error) return <p className="p-5 text-center font-semibold text-red-500">{error}</p>;

    return (
        <section className="relative mt-16 w-full px-4 sm:px-6 md:px-10">
            {/* ✨ Gradient glow background */}
            <div className="absolute inset-x-0 top-0 -z-10 h-52 bg-gradient-to-r from-orange-100/40 via-transparent to-red-100/40 blur-3xl" />

            {/* Title header */}
            <div className="mb-10 flex flex-col items-center text-center">
                <h2 className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl md:text-4xl">
                    Municipalities of Marinduque
                </h2>
                <p className="mt-2 max-w-lg text-sm text-gray-500 sm:text-base">
                    Explore each municipality’s profile and connect with local services.
                </p>
                <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-orange-400 to-red-400 sm:w-36"></div>
            </div>

            {/* Responsive grid layout */}
            <div className="mb-15 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {municipalities.map((municipality, index) => (
                    <motion.div
                        key={municipality.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                        className="w-full max-w-[20rem]"
                    >
                        <Card className="group relative flex flex-col items-center rounded-[1.8rem] border border-orange-200/40 bg-gradient-to-b from-white/70 via-orange-50/20 to-red-50/20 p-6 text-center shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-orange-300/70 hover:shadow-xl sm:p-7">
                            {/* 🧭 Icon */}
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 shadow-inner sm:h-16 sm:w-16">
                                <MapPin className="h-6 w-6 text-orange-600 sm:h-7 sm:w-7" />
                            </div>

                            {/* 🏙️ Municipality name */}
                            <h3 className="mt-4 text-[20px] font-bold text-gray-800 transition-colors duration-300 group-hover:text-orange-600 sm:text-[22px]">
                                {municipality.name}
                            </h3>

                            {/* 📮 Zip Code */}
                            <p className="mt-1 text-sm text-gray-500">
                                Zip Code: <span className="font-medium">{municipality.zip_code || '—'}</span>
                            </p>

                            {/* 🔗 CTA */}
                            <Link
                                href={home({ municipality: municipality.slug })}
                                className="mt-5 inline-block w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:shadow-lg focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
                            >
                                View Details
                            </Link>

                            {/* ✨ Hover glow */}
                            <div className="absolute inset-0 -z-10 scale-105 rounded-[1.8rem] bg-gradient-to-br from-orange-200/40 via-transparent to-red-200/40 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"></div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

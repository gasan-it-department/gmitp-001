import { Card } from '@/components/ui/card';
import { MunicipalitiesApi } from '@/Core/Api/Municipality/MunicipalityApi';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MunicipalityCard() {
    const [municipalities, setMunicipalities] = useState<MunicipalityType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMunicipalities() {
            try {
                const data = await MunicipalitiesApi.getMunicipalities();
                setMunicipalities(data?.data || []);
            } catch (err) {
                console.error('Error fetching municipalities:', err);
                setError('Nabigong i-load ang mga bayan.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMunicipalities();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-14">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                <p className="animate-pulse text-sm font-bold tracking-widest text-slate-500 uppercase">Naglo-load ng mga bayan...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-14">
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-6 py-4 text-center text-sm font-semibold text-destructive">
                    {error}
                </div>
            </div>
        );
    }

    if (municipalities.length === 0) {
        return (
            <div className="mx-auto max-w-xl rounded-lg border border-[#d9e2df] bg-[#f8faf9] px-6 py-10 text-center">
                <Building2 className="mx-auto h-9 w-9 text-slate-500" />
                <p className="mt-4 text-sm font-semibold text-slate-700">Wala pang aktibong munisipalidad na maipapakita.</p>
            </div>
        );
    }

    return (
        <section className="mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 place-items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {municipalities.map((municipality, index) => {
                    const logoUrl = municipality.settings?.logo_url;
                    const hasLogo = Boolean(logoUrl && logoUrl.trim() !== '');

                    return (
                        <motion.div
                            key={municipality.id}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
                            className="h-full"
                        >
                            <Card className="group flex h-full flex-col rounded-lg border-[#d9e2df] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-900/30 hover:shadow-md">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#d9e2df] bg-slate-100">
                                        {hasLogo ? (
                                            <img src={logoUrl || ''} alt={`${municipality.name} Logo`} className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <Building2 className="h-7 w-7 text-slate-900" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-xl font-black tracking-tight text-[#102a26] transition-colors group-hover:text-slate-900">
                                            {municipality.name}
                                        </h3>
                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#f8faf9] px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>Zip {municipality.zip_code || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={home({ municipality: municipality.slug })}
                                    className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-none"
                                >
                                    Pumunta sa Portal
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

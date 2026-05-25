import { Card } from '@/components/ui/card';
import { MunicipalitiesApi } from '@/Core/Api/Municipality/MunicipalityApi';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
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

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-10 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            <p className="animate-pulse text-lg font-medium text-muted-foreground">Naglo-load ng mga bayan...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-10">
            <div className="rounded-xl bg-destructive/10 px-6 py-4 text-center font-semibold text-destructive border border-destructive/20">
                {error}
            </div>
        </div>
    );

    return (
        <section className="relative w-full">
            {/* Grid layout */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center">
                {Array.isArray(municipalities) &&
                    municipalities.map((municipality, index) => {
                        const logoUrl = municipality.settings?.logo_url;
                        const hasLogo = Boolean(logoUrl && logoUrl.trim() !== '');

                        return (
                            <motion.div
                                key={municipality.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                                className="w-full max-w-[22rem]"
                            >
                                <Card className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 text-center shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl hover:bg-card">
                                    
                                    {/* Abstract background shape for flair */}
                                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-150"></div>

                                    {/* Logo */}
                                    <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/50 shadow-inner ring-1 ring-border/50 overflow-hidden group-hover:ring-primary/30 transition-all duration-300">
                                        {hasLogo ? (
                                            <img src={logoUrl || ''} alt={`${municipality.name} Logo`} className="h-full w-full object-cover p-2" />
                                        ) : (
                                            <MapPin className="h-8 w-8 text-primary/70" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <h3 className="mb-1 text-2xl font-black text-foreground tracking-tight transition-colors duration-300 group-hover:text-primary">
                                        {municipality.name}
                                    </h3>
                                    <div className="mb-6 flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>Zip: {municipality.zip_code || '—'}</span>
                                    </div>

                                    {/* Action Button */}
                                    <Link
                                        href={home({ municipality: municipality.slug })}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary px-4 py-3 text-sm font-bold shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
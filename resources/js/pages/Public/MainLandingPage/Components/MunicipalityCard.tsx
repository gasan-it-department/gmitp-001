import { Card } from '@/components/ui/card';
import { MunicipalitiesApi } from '@/Core/Api/Municipality/MunicipalityApi';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

// Ensure your type definition matches the API response
// If not already defined in your types file, it generally looks like this:
// interface MunicipalityType {
//   ...
//   settings?: {
//     logo_url?: string | null;
//   }
// }

export function MunicipalityCard() {
    const [municipalities, setMunicipalities] = useState<MunicipalityType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMunicipalities() {
            try {
                const data = await MunicipalitiesApi.getMunicipalities();
                // FIX 1: Default to empty array if data.data is undefined
                setMunicipalities(data?.data || []);
            } catch (err) {
                console.error('Error fetching municipalities:', err);
                setError('Failed to load municipalities.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchMunicipalities();
    }, []);

    if (isLoading) return <p className="animate-pulse p-5 text-center text-lg font-medium text-muted-foreground">Loading municipalities...</p>;

    if (error) return <p className="p-5 text-center font-semibold text-destructive">{error}</p>;

    return (
        <section className="relative mt-16 w-full px-4 sm:px-6 md:px-10">
            {/* ✨ Gradient glow background - Updated to Theme */}
            <div className="absolute inset-x-0 top-0 -z-10 h-52 bg-gradient-to-r from-secondary/40 via-transparent to-primary/10 blur-3xl" />

            {/* Title header */}
            <div className="mb-10 flex flex-col items-center text-center">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                    Municipalities of Marinduque
                </h2>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
                    Explore each municipality’s profile and connect with local services.
                </p>
                {/* Divider Line: 'bg-primary' */}
                <div className="mt-4 h-1 w-28 rounded-full bg-primary sm:w-36"></div>
            </div>

            {/* Responsive grid layout */}
            <div className="mb-15 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* FIX 2: Check if municipalities is an array before mapping */}
                {Array.isArray(municipalities) &&
                    municipalities.map((municipality, index) => {
                        const logoUrl = municipality.settings?.logo_url;
                        // Check if logoUrl exists and is not an empty string
                        const hasLogo = Boolean(logoUrl && logoUrl.trim() !== '');

                        return (
                            <motion.div
                                key={municipality.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                                className="w-full max-w-[20rem]"
                            >
                                {/* Theme Update: 'bg-card', 'border-border' */}
                                <Card className="group relative flex flex-col items-center rounded-[1.8rem] border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl sm:p-7">
                                    {/* 🧭 Icon or Logo */}
                                    {/* Added overflow-hidden to ensure image stays circular */}
                                    {/* Theme Update: 'bg-secondary' for placeholder background */}
                                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-secondary shadow-inner sm:h-16 sm:w-16">
                                        {hasLogo ? (
                                            <img src={logoUrl || ''} alt={`${municipality.name} Logo`} className="h-full w-full object-cover" />
                                        ) : (
                                            <MapPin className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                                        )}
                                    </div>

                                    {/* 🏙️ Municipality name */}
                                    {/* Theme Update: 'text-foreground', hover: 'text-primary' */}
                                    <h3 className="mt-4 text-[20px] font-bold text-foreground transition-colors duration-300 group-hover:text-primary sm:text-[22px]">
                                        {municipality.name}
                                    </h3>

                                    {/* 📮 Zip Code */}
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Zip Code: <span className="font-medium text-foreground">{municipality.zip_code || '—'}</span>
                                    </p>

                                    {/* 🔗 CTA */}
                                    <Link
                                        href={home({ municipality: municipality.slug })}
                                        // Theme Update: 'bg-primary', 'text-primary-foreground'
                                        className="mt-5 inline-block w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        View
                                    </Link>

                                    {/* ✨ Hover glow - Updated to subtle primary glow */}
                                    <div className="absolute inset-0 -z-10 scale-105 rounded-[1.8rem] bg-primary/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"></div>
                                </Card>
                            </motion.div>
                        );
                    })}
            </div>
        </section>
    );
}
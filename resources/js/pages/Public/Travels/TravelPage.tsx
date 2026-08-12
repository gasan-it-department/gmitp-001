import { MunicipalityProvider, useMunicipality } from '@/Core/Context/MunicipalityContext';
import PublicSeo from '@/components/Seo/PublicSeo';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { DestinationCard } from './Components/DestinationsCard';
import LeaftfletMapView from './Components/LeafletMapView';
import PromotionPage from './Components/PromotionPage';
import TravelHeader from './Components/TravelHeader';

type Destination = {
    id: string;
    name: string;
    description: string;
    position?: [number, number];
    image?: string | null;
};

type TourismSpot = {
    id: string;
    name: string | null;
    description: string | null;
    images: string[];
    videos: string[];
    coordinates: {
        latitude?: number | string | null;
        longitude?: number | string | null;
    } | null;
    date_added: number | string | null;
    status: string | null;
    allow_reviews: boolean;
    municipality: number | string | null;
};

export type TourismEventBanner = {
    id: string;
    name: string | null;
    description: string | null;
    date_added: string | number | null;
    cover_image: string | null;
    municipal_zipcode: number | string | null;
};

type TourismApiResponse = {
    data: {
        tourist_spots: TourismSpot[];
        event_banners: TourismEventBanner[];
        likes: unknown[];
        reviews: unknown[];
    };
    pagination: {
        page: number;
        per_page: number;
    };
};

export default function TravelPage() {
    return (
        <MunicipalityProvider>
            <TravelPageContent />
        </MunicipalityProvider>
    );
}

function TravelPageContent() {
    const { currentMunicipality } = useMunicipality();
    const [tourismData, setTourismData] = useState<TourismApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentMunicipality?.slug) {
            return;
        }

        const controller = new AbortController();

        async function fetchTourism() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.get<TourismApiResponse>('/api/v1/tourism', {
                    params: {
                        page: 1,
                        per_page: 20,
                    },
                    headers: {
                        Accept: 'application/json',
                        'X-Municipality-Slug': currentMunicipality.slug,
                    },
                    signal: controller.signal,
                });

                setTourismData(response.data);
            } catch (err) {
                if (axios.isCancel(err)) {
                    return;
                }

                setError('We could not load tourism spots right now. Please check the tourism service configuration.');
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        fetchTourism();

        return () => controller.abort();
    }, [currentMunicipality?.slug]);

    const destinations = useMemo<Destination[]>(() => {
        return (tourismData?.data.tourist_spots ?? []).map((spot) => {
            const latitude = Number(spot.coordinates?.latitude);
            const longitude = Number(spot.coordinates?.longitude);
            const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

            return {
                id: spot.id,
                name: spot.name || 'Unnamed Tourist Spot',
                description: spot.description || 'No description available yet.',
                position: hasCoordinates ? [latitude, longitude] : undefined,
                image: spot.images?.[0] || null,
            };
        });
    }, [tourismData]);

    const mapDestinations = destinations.filter((destination): destination is Destination & { position: [number, number] } =>
        Boolean(destination.position),
    );

    const eventBanners = tourismData?.data.event_banners ?? [];
    const heroImageUrl = eventBanners[0]?.cover_image || null;

    return (
        <>
            <PublicSeo
                title={`Explore ${currentMunicipality.name}`}
                description={`Discover tourist destinations, attractions, and community experiences in ${currentMunicipality.name}, Marinduque.`}
            />
            <div className="min-h-screen bg-slate-950 text-slate-50">
                <div className="mx-auto max-w-[2000px] overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-100">
                    <TravelHeader />
                    <PromotionPage heroImageUrl={heroImageUrl} eventBanners={eventBanners} />

                    <section className="relative -mt-8 rounded-t-[2rem] bg-slate-100 px-4 pt-10 pb-4 text-slate-950 shadow-[0_-24px_80px_rgba(15,23,42,0.4)] sm:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-6 flex flex-col gap-2">
                                <span className="text-xs font-bold tracking-[0.35em] text-sky-700 uppercase">Explore {currentMunicipality.name}</span>
                                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Tourism destinations</h1>
                                <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                                    Discover places, views, and community destinations curated from the AGA tourism service.
                                </p>
                            </div>

                            {isLoading && (
                                <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
                                    <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
                                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="h-40 animate-pulse rounded-xl bg-slate-200" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isLoading && error && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
                                    <h2 className="text-lg font-bold">Tourism service unavailable</h2>
                                    <p className="mt-1 text-sm">{error}</p>
                                </div>
                            )}

                            {!isLoading && !error && destinations.length === 0 && (
                                <div className="rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm">
                                    <h2 className="text-xl font-bold text-slate-900">No tourist spots yet</h2>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Please check back soon for destinations in {currentMunicipality.name}.
                                    </p>
                                </div>
                            )}

                            {!isLoading && !error && destinations.length > 0 && (
                                <>
                                    {mapDestinations.length > 0 ? (
                                        <LeaftfletMapView destinationList={mapDestinations} />
                                    ) : (
                                        <div className="rounded-2xl border border-sky-100 bg-white p-6 text-slate-700 shadow-sm">
                                            Tourist spots loaded, but no map coordinates are available yet.
                                        </div>
                                    )}

                                    <DestinationCard destinationList={destinations} />
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

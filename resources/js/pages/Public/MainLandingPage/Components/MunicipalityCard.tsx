import { Card } from '@/components/ui/card';
import { getMunicipalities } from '@/Core/Api/Municipality/MunicipalityApi';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Link } from '@inertiajs/react'; // or 'react-router-dom' depending on your setup
import { useEffect, useState } from 'react';

export function MunicipalityCard() {
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (isLoading) return <p className="p-5">Loading municipalities...</p>;
    if (error) return <p className="p-5 text-red-500">{error}</p>;

    return (
        <div className="mt-10 w-full p-5">
            <h2 className="mb-2 px-4 text-[25px] font-bold">Municipalities</h2>

            <div className="px-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                    {municipalities.map((municipality) => (
                        <Card
                            key={municipality.id}
                            className="flex w-full flex-shrink-0 flex-col items-center rounded-xl bg-white p-4 text-center sm:w-[20rem]"
                        >
                            {/* Optional logo fallback */}
                            {/* <img
                                src={municipality.logo || '/default-logo.png'}
                                alt={`${municipality.name} logo`}
                                className="mb-3 h-30 w-30 object-contain"
                            /> */}

                            <h3 className="text-[25px] font-semibold">{municipality.name}</h3>
                            <h2 className="text-[10px] text-gray-500">{municipality.code}</h2>

                            <Link
                                href={route('home.show')} // adapt route if needed
                                className="mt-3 inline-block w-full rounded bg-black px-4 py-2 text-center text-white hover:shadow-md"
                            >
                                View
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

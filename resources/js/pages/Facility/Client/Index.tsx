import { absoluteUrl, SeoSharedData } from '@/components/Seo/PublicSeo';
import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { displayPeriods, FacilityPagination, FacilitySummary, Option } from '@/Core/Types/Facility/FacilityTypes';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AvailabilityStatus from '../Components/AvailabilityStatus';
import useFacilityRefresh from '../Components/useFacilityRefresh';

export default function Facilities({
    facilities,
    filters,
    types,
}: {
    facilities: FacilityPagination<FacilitySummary>;
    filters: { search?: string; type?: string };
    types: Option[];
}) {
    const { currentMunicipality, seo } = usePage<{ currentMunicipality: Municipality; seo: SeoSharedData }>().props;
    const path = `/${currentMunicipality.slug}/facility`;
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const nearest = [...facilities.data].sort((a, b) => a.availability.next_refresh_at.localeCompare(b.availability.next_refresh_at))[0]
        ?.availability;
    useFacilityRefresh('facilities', nearest);
    return (
        <PublicLayout
            title="Public Facilities & Operating Hours"
            description={`Operating hours and updates for public facilities in ${currentMunicipality.name}.`}
            canonicalUrl={absoluteUrl(path, seo.site_url)}
        >
            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
                <header>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Public Facilities & Operating Hours</h1>
                    <p className="mt-3 text-slate-600">
                        Plan your visit to {currentMunicipality.name}. All schedules use Philippine time (Asia/Manila).
                    </p>
                </header>
                <form
                    className="flex flex-wrap gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get(path, { search: search || undefined, type: type || undefined }, { preserveState: true, preserveScroll: true });
                    }}
                >
                    <Input
                        className="min-w-48 flex-1"
                        aria-label="Search facilities"
                        placeholder="Search facilities or locations"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        aria-label="Facility type"
                        className="rounded-md border bg-white px-3 py-2 text-sm"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">All types</option>
                        {types.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <Button>Search</Button>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                            setSearch('');
                            setType('');
                            router.get(path);
                        }}
                    >
                        Reset
                    </Button>
                </form>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {facilities.data.map((facility) => (
                        <article key={facility.id} className="overflow-hidden rounded-xl border bg-white">
                            <Link href={`${path}/${facility.id}`}>
                                {facility.image_url && (
                                    <img src={facility.image_url} alt={facility.name} loading="lazy" className="aspect-video w-full object-cover" />
                                )}
                            </Link>
                            <div className="space-y-4 p-5">
                                <div>
                                    <p className="text-sm text-slate-500">{facility.type.label}</p>
                                    <h2 className="mt-1 text-xl font-semibold">
                                        <Link href={`${path}/${facility.id}`} className="hover:underline">
                                            {facility.name}
                                        </Link>
                                    </h2>
                                    {(facility.location_name || facility.address) && (
                                        <p className="mt-1 text-sm text-slate-600">{facility.location_name || facility.address}</p>
                                    )}
                                </div>
                                <AvailabilityStatus availability={facility.availability} compact />
                                <p className="text-sm text-slate-600">
                                    Today's scheduled hours: {displayPeriods(facility.availability.today_periods)}
                                </p>
                                <Link className="inline-block text-sm font-medium underline" href={`${path}/${facility.id}`}>
                                    View hours and updates
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
                {!facilities.data.length && <p className="rounded-xl border p-10 text-center text-slate-500">No public facilities found.</p>}
                <Pagination links={facilities.meta?.links} />
            </main>
        </PublicLayout>
    );
}

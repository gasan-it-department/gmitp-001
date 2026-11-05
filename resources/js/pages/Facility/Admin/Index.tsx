import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { AdminFacilitySummary, displayPeriods, FacilityPagination, Option } from '@/Core/Types/Facility/FacilityTypes';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AvailabilityStatus from '../Components/AvailabilityStatus';

export default function FacilityIndex({
    facilities,
    filters,
    types,
}: {
    facilities: FacilityPagination<AdminFacilitySummary>;
    filters: { search?: string; type?: string; publication?: string };
    types: Option[];
}) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { can } = usePermissions();
    const path = `/${currentMunicipality.slug}/admin/facility`;
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [publication, setPublication] = useState(filters.publication ?? '');
    return (
        <AppLayout>
            <Head title="Public Facilities" />
            <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Public Facilities</h1>
                        <p className="mt-1 text-sm text-slate-500">Manage recurring hours and operational updates for {currentMunicipality.name}.</p>
                    </div>
                    {can('facility.manage') && (
                        <Button asChild>
                            <Link href={`${path}/create`}>Create facility</Link>
                        </Button>
                    )}
                </header>
                <form
                    className="flex flex-wrap gap-3 rounded-xl border bg-white p-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get(
                            path,
                            { search: search || undefined, type: type || undefined, publication: publication || undefined },
                            { preserveState: true },
                        );
                    }}
                >
                    <Input
                        className="min-w-48 flex-1"
                        aria-label="Search facilities"
                        placeholder="Search name or location"
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
                    <select
                        aria-label="Publication"
                        className="rounded-md border bg-white px-3 py-2 text-sm"
                        value={publication}
                        onChange={(e) => setPublication(e.target.value)}
                    >
                        <option value="">All publication states</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <Button>Search</Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setSearch('');
                            setType('');
                            setPublication('');
                            router.get(path);
                        }}
                    >
                        Reset
                    </Button>
                </form>
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="p-4">Facility</th>
                                <th className="p-4">Publication</th>
                                <th className="p-4">Today</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facilities.data.map((facility) => (
                                <tr key={facility.id} className="border-b last:border-0">
                                    <td className="p-4 align-top">
                                        <p className="font-medium">{facility.name}</p>
                                        <p className="mt-1 text-slate-500">{facility.type.label}</p>
                                        <p className="text-slate-500">{facility.location_name || facility.address}</p>
                                    </td>
                                    <td className="p-4 align-top">{facility.is_published ? 'Published' : 'Draft'}</td>
                                    <td className="max-w-sm space-y-2 p-4 align-top">
                                        <AvailabilityStatus availability={facility.availability} compact />
                                        <p className="text-xs text-slate-500">Scheduled: {displayPeriods(facility.availability.today_periods)}</p>
                                    </td>
                                    <td className="p-4 align-top">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`${path}/${facility.id}${can('facility.manage') ? '/edit' : ''}`}>
                                                {can('facility.manage') ? 'Manage' : 'View'}
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {!facilities.data.length && (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-slate-500">
                                        No facilities found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={facilities.meta?.links} />
            </main>
        </AppLayout>
    );
}

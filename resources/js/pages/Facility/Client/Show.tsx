import { absoluteUrl, SeoSharedData } from '@/components/Seo/PublicSeo';
import { Button } from '@/components/ui/button';
import { dayNames, displayDate, displayPeriods, FacilityDetails } from '@/Core/Types/Facility/FacilityTypes';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AvailabilityStatus from '../Components/AvailabilityStatus';
import useFacilityRefresh from '../Components/useFacilityRefresh';

export default function FacilityShow({ facility }: { facility: FacilityDetails }) {
    const { currentMunicipality, seo } = usePage<{ currentMunicipality: Municipality; seo: SeoSharedData }>().props;
    const path = `/${currentMunicipality.slug}/facility`;
    const [showAll, setShowAll] = useState(false);
    const upcoming = facility.exceptions.filter((exception) => exception.exception_date >= facility.availability.date);
    const held = ['delayed', 'temporarily_closed', 'permanently_closed'].includes(facility.availability.status);
    useFacilityRefresh('facility', facility.availability);
    return (
        <PublicLayout
            title={facility.name}
            description={facility.description ?? `Operating hours for ${facility.name}.`}
            canonicalUrl={absoluteUrl(`${path}/${facility.id}`, seo.site_url)}
            imageUrl={facility.image_url ?? undefined}
        >
            <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
                <Link href={path} className="text-sm text-slate-600 underline">
                    Back to facilities
                </Link>
                <header>
                    <p className="text-sm text-slate-500">{facility.type.label}</p>
                    <h1 className="mt-1 text-3xl font-semibold text-slate-900">{facility.name}</h1>
                    <p className="mt-2 text-slate-600">{facility.location_name}</p>
                </header>
                {facility.image_url && <img src={facility.image_url} alt={facility.name} className="max-h-96 w-full rounded-xl object-cover" />}
                <section className="space-y-4 rounded-xl border bg-white p-5 sm:p-6">
                    <AvailabilityStatus availability={facility.availability} />
                    <div className="border-t pt-4">
                        <h2 className="font-semibold">{held ? 'Scheduled hours today — currently on hold' : "Today's hours"}</h2>
                        <p className="mt-2 text-slate-700">{displayPeriods(facility.availability.today_periods)}</p>
                        <p className="mt-2 text-xs text-slate-500">
                            All times are Philippine time (Asia/Manila). Status follows the published schedule and operational updates.
                        </p>
                    </div>
                </section>
                {facility.description && (
                    <section className="rounded-xl border bg-white p-5 sm:p-6">
                        <h2 className="mb-3 text-lg font-semibold">About this facility</h2>
                        <p className="whitespace-pre-line text-slate-700">{facility.description}</p>
                    </section>
                )}
                <section className="rounded-xl border bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-semibold">Regular weekly hours</h2>
                    <p className="mt-1 text-sm text-slate-500">Date-specific updates and active closures take precedence.</p>
                    <dl className="mt-4 divide-y">
                        {dayNames.map((name, index) => {
                            const day = facility.weekly_days.find((day) => day.day_of_week === index + 1);
                            return (
                                <div key={name} className="grid gap-1 py-3 text-sm sm:grid-cols-3">
                                    <dt className="font-medium">{name}</dt>
                                    <dd className="text-slate-600 sm:col-span-2">
                                        {day ? (day.is_closed ? 'Closed' : displayPeriods(day.periods)) : 'Hours unavailable'}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>
                </section>
                <section className="space-y-4 rounded-xl border bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-semibold">Special hours and updates</h2>
                    {upcoming.length ? (
                        upcoming.slice(0, showAll ? undefined : 10).map((exception) => (
                            <article key={exception.id} className="border-t pt-4">
                                <h3 className="font-medium">{displayDate(exception.exception_date)}</h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    {exception.notice_type === 'cancelled'
                                        ? 'Cancelled for this date'
                                        : exception.is_closed
                                          ? 'Closed all day'
                                          : displayPeriods(exception.periods)}
                                </p>
                                <p className="mt-2 text-sm whitespace-pre-line text-slate-700">{exception.public_notice}</p>
                            </article>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500">No date-specific updates announced.</p>
                    )}
                    {upcoming.length > 10 && !showAll && (
                        <Button variant="outline" onClick={() => setShowAll(true)}>
                            Show all updates
                        </Button>
                    )}
                </section>
                {(facility.address || facility.contact_name || facility.contact_phone || facility.contact_email) && (
                    <section className="space-y-3 rounded-xl border bg-white p-5 sm:p-6">
                        <h2 className="text-lg font-semibold">Location and contact</h2>
                        {facility.address && <p className="whitespace-pre-line text-slate-700">{facility.address}</p>}
                        {facility.contact_name && <p>{facility.contact_name}</p>}
                        {facility.contact_phone && (
                            <p>
                                <a className="underline" href={`tel:${facility.contact_phone.replace(/[^+\d]/g, '')}`}>
                                    {facility.contact_phone}
                                </a>
                            </p>
                        )}
                        {facility.contact_email && (
                            <p>
                                <a className="underline" href={`mailto:${facility.contact_email}`}>
                                    {facility.contact_email}
                                </a>
                            </p>
                        )}
                    </section>
                )}
            </main>
        </PublicLayout>
    );
}

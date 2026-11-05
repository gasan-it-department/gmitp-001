import { Button } from '@/components/ui/button';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { AdminFacility, displayInstant, FacilityAddressOption, Option } from '@/Core/Types/Facility/FacilityTypes';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AvailabilityStatus from '../Components/AvailabilityStatus';
import FormErrors from '../Components/FormErrors';
import DetailsForm from './Components/DetailsForm';
import ExceptionsForm from './Components/ExceptionsForm';
import OperatingStatusForm from './Components/OperatingStatusForm';
import WeeklyHoursForm from './Components/WeeklyHoursForm';

export default function FacilityForm({
    facility,
    types,
    statuses,
    notice_types,
    address_barangays,
}: {
    facility: AdminFacility | null;
    types: Option[];
    statuses: Option[];
    notice_types: Option[];
    address_barangays: FacilityAddressOption[];
}) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const { can } = usePermissions();
    const publication = useForm({});
    const deletion = useForm({});
    return (
        <AppLayout>
            <Head title={facility ? facility.name : 'Create facility'} />
            <main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="space-y-3">
                    <Link href={`/${slug}/admin/facility`} className="text-sm text-slate-600 underline">
                        Back to facilities
                    </Link>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold">{facility?.name ?? 'Create facility'}</h1>
                            <p className="mt-1 text-sm text-slate-500">Public facilities and operating hours · Asia/Manila</p>
                        </div>
                        {facility && (
                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{facility.is_published ? 'Published' : 'Draft'}</span>
                                {facility.is_published && (
                                    <Button asChild variant="outline">
                                        <Link href={`/${slug}/facility/${facility.id}`}>View public page</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </header>
                {facility && (
                    <section className="rounded-xl border bg-white p-5">
                        <h2 className="mb-3 font-semibold">Current public status</h2>
                        <AvailabilityStatus availability={facility.availability} />
                        <p className="mt-3 text-xs text-slate-500">Calculated when this page loaded. Published changes take effect immediately.</p>
                    </section>
                )}
                <DetailsForm facility={facility} types={types} barangays={address_barangays} slug={slug} editable={can('facility.manage')} />
                {facility && (
                    <>
                        <WeeklyHoursForm facility={facility} slug={slug} editable={can('facility.manage')} />
                        <ExceptionsForm facility={facility} slug={slug} types={notice_types} editable={can('facility.manage')} />
                        <OperatingStatusForm facility={facility} slug={slug} statuses={statuses} editable={can('facility.manage')} />
                        <section className="space-y-4 rounded-xl border bg-white p-5 sm:p-6">
                            <h2 className="text-lg font-semibold">Publication</h2>
                            <p className="text-sm text-slate-600">
                                Publishing requires a location or address and a complete weekly schedule. Closed facilities can remain published so
                                residents can read their notices.
                            </p>
                            <FormErrors errors={publication.errors} />
                            {can('facility.publish') && (
                                <Button
                                    disabled={publication.processing}
                                    variant={facility.is_published ? 'outline' : 'default'}
                                    onClick={() => {
                                        publication.transform(() => ({ revision: facility.revision, is_published: !facility.is_published }));
                                        publication.patch(`/api/facility/${facility.id}/publish`, {
                                            headers: { 'X-Municipality-Slug': slug },
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    {publication.processing ? 'Saving…' : facility.is_published ? 'Unpublish facility' : 'Publish facility'}
                                </Button>
                            )}
                        </section>
                        {!!facility.audit_log?.length && (
                            <details className="rounded-xl border bg-white p-5">
                                <summary className="cursor-pointer font-medium">Recent changes</summary>
                                <ul className="mt-4 space-y-3">
                                    {facility.audit_log.map((entry) => (
                                        <li key={entry.id} className="text-sm">
                                            <p>{entry.description}</p>
                                            <p className="text-xs text-slate-500">{displayInstant(entry.created_at)}</p>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                        {can('facility.delete') && (
                            <section className="space-y-3 rounded-xl border border-red-200 bg-white p-5">
                                <h2 className="font-semibold">Delete facility</h2>
                                <p className="text-sm text-slate-600">Removes the facility from public pages while retaining its records.</p>
                                <FormErrors errors={deletion.errors} />
                                <Button
                                    variant="destructive"
                                    disabled={deletion.processing}
                                    onClick={() => {
                                        if (!window.confirm(`Delete ${facility.name}? It will no longer appear publicly.`)) return;
                                        deletion.transform(() => ({ revision: facility.revision }));
                                        deletion.delete(`/api/facility/${facility.id}`, { headers: { 'X-Municipality-Slug': slug } });
                                    }}
                                >
                                    Delete facility
                                </Button>
                            </section>
                        )}
                    </>
                )}
            </main>
        </AppLayout>
    );
}

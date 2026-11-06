import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { AdminFacility, displayInstant, FacilityAddressOption, Option } from '@/Core/Types/Facility/FacilityTypes';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AvailabilityStatus from '../Components/AvailabilityStatus';
import FormErrors from '../Components/FormErrors';
import DetailsForm from './Components/DetailsForm';
import ExceptionsForm from './Components/ExceptionsForm';
import { NotificationOptions } from './Components/FacilityNotificationControl';
import OperatingStatusForm from './Components/OperatingStatusForm';
import WeeklyHoursForm from './Components/WeeklyHoursForm';

const facilityTabs = [
    { value: 'details', label: 'Details' },
    { value: 'hours', label: 'Weekly hours' },
    { value: 'updates', label: 'Updates & status' },
    { value: 'settings', label: 'Settings' },
    { value: 'history', label: 'History' },
];

export default function FacilityForm({
    facility,
    types,
    statuses,
    notice_types,
    address_barangays,
    notification_options = { available: false, schema: 'test' },
}: {
    facility: AdminFacility | null;
    types: Option[];
    statuses: Option[];
    notice_types: Option[];
    address_barangays: FacilityAddressOption[];
    notification_options?: NotificationOptions;
}) {
    const {
        props: { currentMunicipality },
        url,
    } = usePage<{ currentMunicipality: Municipality }>();
    const selectedTab = new URL(url, 'https://inertia.local').searchParams.get('tab');
    const activeTab = facilityTabs.find((tab) => tab.value === selectedTab)?.value ?? 'details';
    const selectTab = (tab: string) => {
        const next = new URL(url, 'https://inertia.local');
        next.searchParams.set('tab', tab);
        router.replace({ url: next.pathname + next.search + next.hash, preserveState: true, preserveScroll: true });
    };
    const slug = currentMunicipality.slug;
    const { can } = usePermissions();
    const publication = useForm({});
    const deletion = useForm({});
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [confirmationName, setConfirmationName] = useState('');
    const closeDeletion = () => {
        setDeleteOpen(false);
        setConfirmationName('');
        deletion.clearErrors();
    };
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
                {!facility ? (
                    <DetailsForm facility={facility} types={types} barangays={address_barangays} slug={slug} editable={can('facility.manage')} />
                ) : (
                    <Tabs value={activeTab} onValueChange={selectTab} className="gap-5">
                        <div className="overflow-x-auto">
                            <TabsList aria-label="Facility sections" className="h-auto min-w-full justify-start sm:min-w-0">
                                {facilityTabs.map((tab) => (
                                    <TabsTrigger key={tab.value} value={tab.value} className="shrink-0 px-4 py-2">
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        {/* Keep inactive forms mounted so switching tabs preserves unsaved inputs. */}
                        <TabsContent value="details" forceMount hidden={activeTab !== 'details'}>
                            <DetailsForm
                                facility={facility}
                                types={types}
                                barangays={address_barangays}
                                slug={slug}
                                editable={can('facility.manage')}
                            />
                        </TabsContent>
                        <TabsContent value="hours" forceMount hidden={activeTab !== 'hours'}>
                            <WeeklyHoursForm facility={facility} slug={slug} editable={can('facility.manage')} />
                        </TabsContent>
                        <TabsContent value="updates" forceMount hidden={activeTab !== 'updates'} className="space-y-6">
                            <ExceptionsForm
                                notificationOptions={notification_options}
                                municipalityName={currentMunicipality.name}
                                facility={facility}
                                slug={slug}
                                types={notice_types}
                                editable={can('facility.manage')}
                            />
                            <OperatingStatusForm
                                notificationOptions={notification_options}
                                municipalityName={currentMunicipality.name}
                                facility={facility}
                                slug={slug}
                                statuses={statuses}
                                editable={can('facility.manage')}
                            />
                        </TabsContent>
                        <TabsContent value="settings" forceMount hidden={activeTab !== 'settings'} className="space-y-6">
                            <section className="space-y-4 rounded-xl border bg-white p-5 sm:p-6">
                                <h2 className="text-lg font-semibold">Publication</h2>
                                <p className="text-sm text-slate-600">
                                    Publishing requires a location or address and a complete weekly schedule. Closed facilities can remain published
                                    so residents can read their notices.
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
                            {can('facility.delete') && (
                                <section className="space-y-3 rounded-xl border border-red-200 bg-white p-5">
                                    <h2 className="font-semibold">Delete facility</h2>
                                    <p className="text-sm text-slate-600">Removes the facility from public pages while retaining its records.</p>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setConfirmationName('');
                                            deletion.clearErrors();
                                            setDeleteOpen(true);
                                        }}
                                    >
                                        Delete facility
                                    </Button>
                                    <Dialog
                                        open={deleteOpen}
                                        onOpenChange={(open) => {
                                            if (!deletion.processing && !open) closeDeletion();
                                        }}
                                    >
                                        <DialogContent showCloseButton={!deletion.processing}>
                                            <DialogHeader>
                                                <DialogTitle>Delete facility</DialogTitle>
                                                <DialogDescription>
                                                    This will remove {facility.name} from public pages while retaining its records.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form
                                                className="space-y-4"
                                                onSubmit={(event) => {
                                                    event.preventDefault();
                                                    if (deletion.processing || confirmationName !== facility.name) return;
                                                    deletion.transform(() => ({ revision: facility.revision }));
                                                    deletion.delete(`/api/facility/${facility.id}`, {
                                                        headers: { 'X-Municipality-Slug': slug },
                                                        preserveScroll: true,
                                                        onSuccess: closeDeletion,
                                                    });
                                                }}
                                            >
                                                <label className="block space-y-2 text-sm">
                                                    <span>
                                                        Type <strong className="break-words">{facility.name}</strong> to confirm deletion. The name
                                                        must match exactly.
                                                    </span>
                                                    <Input
                                                        autoFocus
                                                        autoComplete="off"
                                                        spellCheck={false}
                                                        value={confirmationName}
                                                        disabled={deletion.processing}
                                                        onChange={(event) => setConfirmationName(event.target.value)}
                                                    />
                                                </label>
                                                <FormErrors errors={deletion.errors} />
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" disabled={deletion.processing} onClick={closeDeletion}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="destructive"
                                                        disabled={deletion.processing || confirmationName !== facility.name}
                                                    >
                                                        {deletion.processing ? 'Deleting...' : 'Delete facility'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </section>
                            )}
                        </TabsContent>
                        <TabsContent value="history" forceMount hidden={activeTab !== 'history'}>
                            {facility.audit_log?.length ? (
                                <section className="rounded-xl border bg-white p-5">
                                    <h2 className="text-lg font-semibold">Recent changes</h2>
                                    <ul className="mt-4 space-y-3">
                                        {facility.audit_log.map((entry) => (
                                            <li key={entry.id} className="text-sm">
                                                <p>{entry.description}</p>
                                                <p className="text-xs text-slate-500">{displayInstant(entry.created_at)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ) : (
                                <p className="rounded-xl border bg-white p-5 text-sm text-slate-500">No recent changes.</p>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </AppLayout>
    );
}

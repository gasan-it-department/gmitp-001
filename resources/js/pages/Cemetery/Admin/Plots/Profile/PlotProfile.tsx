import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    CemeterySiteListItem,
    ChangePlotOccupancyForm,
    ChangePlotStatusForm,
    PlotOccupancyModeValue,
    PlotProfile as PlotProfileType,
    PlotStatusOption,
    PlotTypeValue,
    SelectOption,
    UpdatePlotDetailsForm,
    UpdatePlotLeaseForm,
} from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { cn } from '@/lib/utils';
import cemetery from '@/routes/cemetery';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Boxes, Edit3, History, Loader2, MapPin, Settings2, ShieldAlert, Users } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

interface Props {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    type_options: SelectOption<PlotTypeValue>[];
    status_options: PlotStatusOption[];
    occupancy_mode_options: SelectOption<Extract<PlotOccupancyModeValue, 'single' | 'shared'>>[];
}

const toneClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export default function PlotProfile({ municipality, site, plot, type_options, status_options, occupancy_mode_options }: Props) {
    const canEditDetails = plot.type !== 'apartment_niche' && plot.parent_plot_id === null && plot.occupancy_mode !== 'slotted';
    const canEditOccupancy = plot.occupancy_mode === 'single' || plot.occupancy_mode === 'shared';
    const canEditStatus = canEditOccupancy && plot.active_interments_count === 0;
    const canManageLease = plot.occupancy_mode !== 'slotted';

    return (
        <AppLayout>
            <Head title={plot.slot_label} />

            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <Link
                    href={`${cemetery.admin.sites.workspace.page.url({
                        municipality: municipality.slug,
                        cemetery_site_id: site.id,
                    })}?tab=plots`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to plot inventory
                </Link>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 bg-slate-900 p-6 text-white lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
                                <MapPin size={28} />
                            </div>
                            <div>
                                <div className="mb-2 flex flex-wrap gap-2">
                                    <Pill>{plot.type_label ?? 'Unclassified'}</Pill>
                                    <Pill>{plot.occupancy_mode_label ?? 'No occupancy mode'}</Pill>
                                    {plot.status_label && (
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                                                toneClasses[plot.status_tone ?? 'slate'],
                                            )}
                                        >
                                            {plot.status_label}
                                        </span>
                                    )}
                                </div>
                                <h1 className="font-mono text-3xl font-bold tracking-tight">{plot.slot_label}</h1>
                                <p className="mt-2 text-sm text-slate-300">
                                    {site.name} / {plot.block?.section?.name ?? 'No section'} / {plot.block?.name ?? 'No block'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {canEditDetails && (
                                <EditPlotDetailsDialog municipality={municipality} site={site} plot={plot} typeOptions={type_options} />
                            )}
                            {canEditOccupancy && (
                                <ChangeOccupancyDialog
                                    municipality={municipality}
                                    site={site}
                                    plot={plot}
                                    occupancyModeOptions={occupancy_mode_options}
                                />
                            )}
                            {canEditStatus && (
                                <ChangeStatusDialog municipality={municipality} site={site} plot={plot} statusOptions={status_options} />
                            )}
                            {canManageLease && <PlotLeaseDialog municipality={municipality} site={site} plot={plot} />}
                        </div>
                    </div>

                    <div className="grid gap-px bg-slate-100 sm:grid-cols-4">
                        <Stat label="Occupancy" value={plot.occupancy_label} />
                        <Stat label="Capacity" value={String(plot.capacity)} />
                        <Stat label="Can Still Accept" value={plot.occupancy_mode === 'shared' ? String(plot.available_capacity) : '-'} />
                        <Stat label="Profile Type" value={plot.occupancy_mode === 'slotted' ? 'Apartment container' : 'Assignable plot'} />
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <ActiveLeaseCard plot={plot} />
                        <DetailsCard plot={plot} />
                        {plot.occupancy_mode === 'slotted' ? <ChildNichesCard plot={plot} /> : <CurrentIntermentsCard plot={plot} />}
                    </div>
                    <ActivityCard plot={plot} />
                </div>
            </div>
        </AppLayout>
    );
}

function PlotLeaseDialog({ municipality, site, plot }: { municipality: MunicipalityType; site: CemeterySiteListItem; plot: PlotProfileType }) {
    const [open, setOpen] = useState(false);
    const lease = plot.active_lease;
    const mode = lease ? 'edit' : 'create';
    const form = useForm<UpdatePlotLeaseForm>({
        leaseholder_name: lease?.leaseholder_name ?? '',
        leaseholder_contact: lease?.leaseholder_contact ?? '',
        leaseholder_address: lease?.leaseholder_address ?? '',
        leaseholder_relationship: lease?.leaseholder_relationship ?? '',
        lease_start: lease?.lease_start ?? '',
        lease_end: lease?.lease_end ?? '',
        amount_paid: toNumberOrBlank(lease?.amount_paid),
        or_number: lease?.or_number ?? '',
        notes: lease?.notes ?? '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({
            leaseholder_name: lease?.leaseholder_name ?? '',
            leaseholder_contact: lease?.leaseholder_contact ?? '',
            leaseholder_address: lease?.leaseholder_address ?? '',
            leaseholder_relationship: lease?.leaseholder_relationship ?? '',
            lease_start: lease?.lease_start ?? '',
            lease_end: lease?.lease_end ?? '',
            amount_paid: toNumberOrBlank(lease?.amount_paid),
            or_number: lease?.or_number ?? '',
            notes: lease?.notes ?? '',
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };

        if (mode === 'create') {
            form.post(`/api/cemetery-sites/${site.id}/plots/${plot.id}/lease`, options);

            return;
        }

        form.patch(`/api/cemetery-sites/${site.id}/plots/${plot.id}/lease`, options);
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
                <Edit3 size={16} className="mr-2" />
                {mode === 'create' ? 'Add Lease' : 'Edit Lease'}
            </Button>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>{mode === 'create' ? 'Add Active Lease' : 'Edit Active Lease'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'create'
                                ? 'Record the responsible person and manual payment details for this physical plot.'
                                : 'Update the responsible person and manual payment details for this physical plot.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="leaseholder-name">Leaseholder name</Label>
                            <Input
                                id="leaseholder-name"
                                value={form.data.leaseholder_name}
                                onChange={(event) => form.setData('leaseholder_name', event.target.value)}
                                placeholder="e.g. JUAN DELA CRUZ"
                            />
                            {form.errors.leaseholder_name && <p className="text-sm text-red-600">{form.errors.leaseholder_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leaseholder-relationship">Relationship</Label>
                            <Input
                                id="leaseholder-relationship"
                                value={form.data.leaseholder_relationship}
                                onChange={(event) => form.setData('leaseholder_relationship', event.target.value)}
                                placeholder="e.g. SPOUSE, CHILD"
                            />
                            {form.errors.leaseholder_relationship && <p className="text-sm text-red-600">{form.errors.leaseholder_relationship}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leaseholder-contact">Contact</Label>
                            <Input
                                id="leaseholder-contact"
                                value={form.data.leaseholder_contact}
                                onChange={(event) => form.setData('leaseholder_contact', event.target.value)}
                                placeholder="Optional"
                            />
                            {form.errors.leaseholder_contact && <p className="text-sm text-red-600">{form.errors.leaseholder_contact}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leaseholder-address">Address</Label>
                            <Input
                                id="leaseholder-address"
                                value={form.data.leaseholder_address}
                                onChange={(event) => form.setData('leaseholder_address', event.target.value)}
                                placeholder="Optional"
                            />
                            {form.errors.leaseholder_address && <p className="text-sm text-red-600">{form.errors.leaseholder_address}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lease-start">Lease start</Label>
                            <Input
                                id="lease-start"
                                type="date"
                                value={form.data.lease_start}
                                onChange={(event) => form.setData('lease_start', event.target.value)}
                            />
                            {form.errors.lease_start && <p className="text-sm text-red-600">{form.errors.lease_start}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lease-end">Lease end</Label>
                            <Input
                                id="lease-end"
                                type="date"
                                value={form.data.lease_end}
                                onChange={(event) => form.setData('lease_end', event.target.value)}
                            />
                            {form.errors.lease_end && <p className="text-sm text-red-600">{form.errors.lease_end}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount-paid">Amount paid</Label>
                            <Input
                                id="amount-paid"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.amount_paid}
                                onChange={(event) => form.setData('amount_paid', event.target.value === '' ? '' : Number(event.target.value))}
                                placeholder="Optional"
                            />
                            {form.errors.amount_paid && <p className="text-sm text-red-600">{form.errors.amount_paid}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="or-number">OR number</Label>
                            <Input
                                id="or-number"
                                value={form.data.or_number}
                                onChange={(event) => form.setData('or_number', event.target.value)}
                                placeholder="Optional"
                            />
                            {form.errors.or_number && <p className="text-sm text-red-600">{form.errors.or_number}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="lease-notes">Notes</Label>
                            <Textarea
                                id="lease-notes"
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                                placeholder="Optional lease or payment notes."
                                className="min-h-24"
                            />
                            {form.errors.notes && <p className="text-sm text-red-600">{form.errors.notes}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Add Lease' : 'Save Lease'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditPlotDetailsDialog({
    municipality,
    site,
    plot,
    typeOptions,
}: {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    typeOptions: SelectOption<PlotTypeValue>[];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<UpdatePlotDetailsForm>({
        name: plot.name ?? '',
        type: plot.type ?? '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({ name: plot.name ?? '', type: plot.type ?? '' });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/api/cemetery-sites/${site.id}/plots/${plot.id}/details`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
                <Edit3 size={16} className="mr-2" />
                Edit Details
            </Button>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Edit Plot Details</DialogTitle>
                        <DialogDescription>Only standard plot labels and standard plot types are editable in this version.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plot-name">Plot name</Label>
                            <Input
                                id="plot-name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder="e.g. LOT 737"
                            />
                            {form.errors.name && <p className="text-sm text-red-600">{form.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Plot type</Label>
                            <Select value={form.data.type} onValueChange={(value) => form.setData('type', value as PlotTypeValue)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.type && <p className="text-sm text-red-600">{form.errors.type}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Details
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ChangeOccupancyDialog({
    municipality,
    site,
    plot,
    occupancyModeOptions,
}: {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    occupancyModeOptions: SelectOption<Extract<PlotOccupancyModeValue, 'single' | 'shared'>>[];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<ChangePlotOccupancyForm>({
        occupancy_mode: plot.occupancy_mode === 'shared' ? 'shared' : 'single',
        capacity: plot.capacity,
        reason: '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({
            occupancy_mode: plot.occupancy_mode === 'shared' ? 'shared' : 'single',
            capacity: plot.capacity,
            reason: '',
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/api/cemetery-sites/${site.id}/plots/${plot.id}/occupancy`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
                <Users size={16} className="mr-2" />
                Change Occupancy
            </Button>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Change Occupancy</DialogTitle>
                        <DialogDescription>
                            Shared occupancy means the same physical plot can hold more than one decedent up to its capacity.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 grid gap-4">
                        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                            Current active interments: <strong>{plot.active_interments_count}</strong>
                        </div>
                        <div className="space-y-2">
                            <Label>Occupancy mode</Label>
                            <Select
                                value={form.data.occupancy_mode}
                                onValueChange={(value) => form.setData('occupancy_mode', value as 'single' | 'shared')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select occupancy" />
                                </SelectTrigger>
                                <SelectContent>
                                    {occupancyModeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.occupancy_mode && <p className="text-sm text-red-600">{form.errors.occupancy_mode}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="plot-capacity">Capacity</Label>
                            <Input
                                id="plot-capacity"
                                type="number"
                                min={form.data.occupancy_mode === 'shared' ? 2 : 1}
                                max={50}
                                value={form.data.capacity}
                                onChange={(event) => form.setData('capacity', event.target.value === '' ? '' : Number(event.target.value))}
                            />
                            {form.errors.capacity && <p className="text-sm text-red-600">{form.errors.capacity}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="occupancy-reason">Reason</Label>
                            <Textarea
                                id="occupancy-reason"
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Explain why this plot capacity or occupancy mode is being changed."
                                className="min-h-24"
                            />
                            {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Occupancy
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ChangeStatusDialog({
    municipality,
    site,
    plot,
    statusOptions,
}: {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    plot: PlotProfileType;
    statusOptions: PlotStatusOption[];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<ChangePlotStatusForm>({
        status: plot.status === 'maintenance' ? 'maintenance' : 'available',
        reason: '',
    });

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({
            status: plot.status === 'maintenance' ? 'maintenance' : 'available',
            reason: '',
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/api/cemetery-sites/${site.id}/plots/${plot.id}/status`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
                <Settings2 size={16} className="mr-2" />
                Change Status
            </Button>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Change Plot Status</DialogTitle>
                        <DialogDescription>Only empty plots can be manually marked available or under maintenance.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 grid gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.data.status} onValueChange={(value) => form.setData('status', value as 'available' | 'maintenance')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.status && <p className="text-sm text-red-600">{form.errors.status}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status-reason">Reason</Label>
                            <Textarea
                                id="status-reason"
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Explain why the plot status is being changed."
                                className="min-h-24"
                            />
                            {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Status
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DetailsCard({ plot }: { plot: PlotProfileType }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Plot Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Section" value={plot.block?.section?.name} />
                <Detail label="Block" value={plot.block?.name} />
                <Detail label="Parent Container" value={plot.parent?.slot_label} />
                <Detail label="Raw Name" value={plot.name} />
                <Detail label="Floor / Level" value={plot.level ? `F${plot.level}` : null} />
                <Detail label="Row" value={plot.row} />
                <Detail label="Position" value={plot.position} />
                <Detail label="Available Capacity" value={plot.occupancy_mode === 'shared' ? String(plot.available_capacity) : null} />
            </div>
        </section>
    );
}

function ActiveLeaseCard({ plot }: { plot: PlotProfileType }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Active Lease / Responsible Person</h2>
                <p className="text-sm text-slate-500">Plot-level leaseholder and manual payment information for this physical place.</p>
            </div>

            {!plot.active_lease ? (
                <EmptyState icon={<Users size={20} />} text="No active lease is recorded for this plot yet." />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Detail label="Leaseholder" value={plot.active_lease.leaseholder_name} />
                    <Detail label="Relationship" value={plot.active_lease.leaseholder_relationship} />
                    <Detail label="Contact" value={plot.active_lease.leaseholder_contact} />
                    <Detail label="Address" value={plot.active_lease.leaseholder_address} />
                    <Detail label="Lease Start" value={formatDate(plot.active_lease.lease_start)} />
                    <Detail label="Lease End" value={formatDate(plot.active_lease.lease_end)} />
                    <Detail label="Amount Paid" value={formatCurrency(plot.active_lease.amount_paid)} />
                    <Detail label="OR Number" value={plot.active_lease.or_number} />
                    <div className="sm:col-span-2">
                        <Detail label="Notes" value={plot.active_lease.notes} />
                    </div>
                </div>
            )}
        </section>
    );
}

function CurrentIntermentsCard({ plot }: { plot: PlotProfileType }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Currently Interred</h2>
                    <p className="text-sm text-slate-500">Active interments attached to this physical plot.</p>
                </div>
                {plot.can_accept_more && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Can still accept {plot.available_capacity}
                    </span>
                )}
            </div>

            {plot.current_interments.length === 0 ? (
                <EmptyState icon={<Users size={20} />} text="No active interments are recorded in this plot." />
            ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Decedent</TableHead>
                                <TableHead>Interment Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plot.current_interments.map((interment) => (
                                <TableRow key={interment.id}>
                                    <TableCell>
                                        <Link href={interment.decedent_profile_url} className="font-medium text-emerald-700 hover:underline">
                                            {interment.decedent_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{formatDate(interment.interment_date)}</TableCell>
                                    <TableCell>{interment.type_label}</TableCell>
                                    <TableCell>{interment.notes ?? '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </section>
    );
}

function ChildNichesCard({ plot }: { plot: PlotProfileType }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Child Niches</h2>
                <p className="text-sm text-slate-500">This row is an apartment container. Interments must target one of its niche rows.</p>
            </div>
            {plot.child_niches.length === 0 ? (
                <EmptyState icon={<Boxes size={20} />} text="No child niches are registered under this container." />
            ) : (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {plot.child_niches.map((niche) => (
                        <Link
                            key={niche.id}
                            href={niche.profile_url}
                            className="rounded-lg border border-slate-200 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                        >
                            <div className="font-mono text-sm font-semibold text-slate-900">{niche.slot_label}</div>
                            <div className="mt-1 flex items-center justify-between text-xs">
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 font-medium ring-1 ring-inset',
                                        toneClasses[niche.status_tone ?? 'slate'],
                                    )}
                                >
                                    {niche.status_label ?? '-'}
                                </span>
                                <span className="text-slate-500">{niche.occupancy_label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

function ActivityCard({ plot }: { plot: PlotProfileType }) {
    return (
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <History size={18} className="text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
            </div>
            {plot.audit_timeline.length === 0 ? (
                <EmptyState icon={<ShieldAlert size={20} />} text="No activity has been logged for this plot yet." />
            ) : (
                <div className="space-y-4">
                    {plot.audit_timeline.map((item) => (
                        <div key={item.id} className="border-l-2 border-slate-200 pl-4">
                            <div className="text-sm font-semibold text-slate-900">{item.event ?? item.description}</div>
                            <div className="text-xs text-slate-500">
                                {formatDateTime(item.created_at)} by {item.causer ?? 'System'}
                            </div>
                            {typeof item.properties?.reason === 'string' && <p className="mt-1 text-sm text-slate-600">{item.properties.reason}</p>}
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
}

function Stat({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="bg-white p-4">
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{value ?? '-'}</div>
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{value || '-'}</div>
        </div>
    );
}

function Pill({ children }: { children: ReactNode }) {
    return <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100 ring-1 ring-white/15">{children}</span>;
}

function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            {icon}
            {text}
        </div>
    );
}

function formatDate(value: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(value));
}

function formatCurrency(value: string | number | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(Number(value));
}

function toNumberOrBlank(value: string | number | null | undefined): number | '' {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    return Number(value);
}

function formatDateTime(value: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

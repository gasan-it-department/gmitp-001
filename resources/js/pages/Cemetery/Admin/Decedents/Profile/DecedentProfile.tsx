import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DecedentDocumentTypeValue, DecedentProfile as DecedentProfileType, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ArrowRightLeft, Check, FileText, History, Loader2, MapPin, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';
import { CloseIntermentDialog } from '../../Interments/Components/CloseIntermentDialog';
import { ReverseMoveDialog } from '../../Interments/Components/ReverseMoveDialog';
import { VoidIntermentDialog } from '../../Interments/Components/VoidIntermentDialog';

interface Props {
    decedent: { data: DecedentProfileType };
    document_type_options: (SelectOption<DecedentDocumentTypeValue> & { restricted: boolean })[];
    abilities: { manage: boolean; verify: boolean; correct: boolean; override: boolean; view_documents: boolean };
}

const tone: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    rose: 'bg-rose-100 text-rose-800',
};

export default function DecedentProfile({ decedent, document_type_options, abilities }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const record = decedent.data;
    const displayName =
        record.identity_status === 'unidentified'
            ? `UNIDENTIFIED - ${record.unidentified_details?.case_reference ?? record.id}`
            : record.has_legal_name
              ? [record.last_name, record.first_name, record.middle_name, record.suffix].filter(Boolean).join(', ')
              : `${record.memorial_name ?? 'Unnamed'} (Memorial)`;

    const verify = () => router.post(`/api/decedents/${record.id}/verify`, {}, { headers: { 'X-Municipality-Slug': currentMunicipality.slug } });

    return (
        <AppLayout>
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={cemetery.admin.decedents.list.page.url(currentMunicipality.slug)}
                        className="inline-flex items-center gap-2 text-sm text-slate-600"
                    >
                        <ArrowLeft size={16} />
                        Back to registry
                    </Link>
                    <div className="flex gap-2">
                        {abilities.manage && ['draft', 'pending_review'].includes(record.registration_status) && (
                            <DeleteUnverifiedDialog record={record} municipality={currentMunicipality} displayName={displayName} />
                        )}
                        {abilities.manage && ['draft', 'pending_review'].includes(record.registration_status) && (
                            <Link href={cemetery.admin.decedents.edit.page.url([currentMunicipality.slug, record.id])}>
                                <Button variant="outline">{record.registration_status === 'draft' ? 'Edit Draft' : 'Edit Submitted Record'}</Button>
                            </Link>
                        )}
                        {abilities.correct && record.registration_status === 'verified' && (
                            <Link href={cemetery.admin.decedents.correct.page.url([currentMunicipality.slug, record.id])}>
                                <Button variant="outline">Correct Record</Button>
                            </Link>
                        )}
                        {abilities.verify && record.registration_status === 'pending_review' && (
                            <Button onClick={verify}>
                                <ShieldCheck size={16} className="mr-2" />
                                Verify Registration
                            </Button>
                        )}
                        {!record.interment && record.interment_readiness.interment_eligible && (
                            <Link href={cemetery.admin.interments.assign.page.url([currentMunicipality.slug, record.id])}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <MapPin size={16} className="mr-2" />
                                    Assign to Plot
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-6 bg-slate-900 p-7 text-white md:flex-row md:items-center">
                        <div className="flex flex-col items-start gap-3">
                            {record.avatar_url ? (
                                <img src={record.avatar_url} alt={displayName} className="h-28 w-28 rounded-xl object-cover" />
                            ) : (
                                <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-800 text-3xl font-bold">
                                    {displayName.slice(0, 1)}
                                </div>
                            )}
                            {abilities.manage && <AvatarUploadDialog record={record} municipality={currentMunicipality} />}
                        </div>
                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap gap-2">
                                <Badge text={record.vital_record_label} />
                                <Badge text={record.identity_status} />
                                {record.life_stage && <Badge text={record.life_stage} />}
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[record.registration_status_tone] ?? tone.slate}`}
                                >
                                    {record.registration_status_label}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold">{displayName}</h1>
                            <p className="mt-2 text-sm text-slate-400">
                                Registry: {record.registry_number ?? 'Not recorded'} | Record version {record.version}
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-px bg-slate-100 sm:grid-cols-4">
                        <Stat label="Date of Death" value={record.date_of_death} />
                        <Stat label="Registration Date" value={record.date_of_registration} />
                        <Stat label="Verified By" value={record.verified_by} />
                        <Stat label="Current Plot" value={record.interment?.plot?.slot_label} />
                    </div>
                </section>

                <ReadinessCard record={record} />
                <BurialLocationCard record={record} abilities={abilities} municipality={currentMunicipality} />
                <CemeteryHistoryCard record={record} />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <DetailsCard record={record} />
                        {record.unidentified_details && <UnidentifiedCard record={record} />}
                        <DocumentsCard record={record} options={document_type_options} abilities={abilities} municipality={currentMunicipality} />
                    </div>
                    <AuditCard record={record} abilities={abilities} />
                </div>
            </div>
        </AppLayout>
    );
}

function AvatarUploadDialog({ record, municipality }: { record: DecedentProfileType; municipality: Municipality }) {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<{ avatar: File | null }>({ avatar: null });

    const close = () => {
        if (form.processing) return;

        setIsOpen(false);
        form.reset();
        form.clearErrors();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post(`/api/decedents/${record.id}/avatar`, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: close,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : close())}>
            <Button type="button" size="sm" variant="secondary" onClick={() => setIsOpen(true)}>
                <Upload size={14} className="mr-2" />
                Update Photo
            </Button>

            <DialogContent className="sm:max-w-lg" showCloseButton={!form.processing}>
                <form onSubmit={submit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>Update profile photo</DialogTitle>
                        <DialogDescription>
                            Upload a private visual-identification photo for this decedent. This does not change the legal record.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="decedent-avatar">Profile photo</Label>
                        <input
                            id="decedent-avatar"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => form.setData('avatar', event.target.files?.[0] ?? null)}
                            className="block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700"
                        />
                        <p className="text-xs text-slate-500">Accepted: JPG, PNG, or WEBP. Maximum size: 5 MB.</p>
                        {form.errors.avatar && <p className="text-sm text-red-600">{form.errors.avatar}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Loader2 size={16} className="mr-2 animate-spin" />}
                            Save Photo
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CemeteryHistoryCard({ record }: { record: DecedentProfileType }) {
    const statusClasses: Record<DecedentProfileType['interment_history'][number]['lifecycle_status'], string> = {
        active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        ended: 'bg-amber-50 text-amber-700 ring-amber-200',
        moved: 'bg-amber-50 text-amber-700 ring-amber-200',
        exhumed: 'bg-orange-50 text-orange-700 ring-orange-200',
        transferred_out: 'bg-blue-50 text-blue-700 ring-blue-200',
        voided: 'bg-rose-50 text-rose-700 ring-rose-200',
    };

    const statusIcons: Record<DecedentProfileType['interment_history'][number]['lifecycle_status'], ReactNode> = {
        active: <MapPin size={18} />,
        ended: <ArrowRightLeft size={16} />,
        moved: <ArrowRightLeft size={16} />,
        exhumed: <AlertTriangle size={16} />,
        transferred_out: <ArrowRightLeft size={16} />,
        voided: <X size={18} />,
    };

    const iconBg: Record<DecedentProfileType['interment_history'][number]['lifecycle_status'], string> = {
        active: 'bg-emerald-100 text-emerald-600',
        ended: 'bg-amber-100 text-amber-600',
        moved: 'bg-amber-100 text-amber-600',
        exhumed: 'bg-orange-100 text-orange-600',
        transferred_out: 'bg-blue-100 text-blue-600',
        voided: 'bg-rose-100 text-rose-600',
    };

    return (
        <Card title="Cemetery History" icon={<History size={17} />}>
            {record.interment_history.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No cemetery interment history yet.
                </div>
            ) : (
                <div className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-[2px] before:bg-slate-100 sm:ml-2">
                    {record.interment_history.map((interment) => {
                        const plot = interment.plot;
                        const hierarchy = [plot?.cemetery_site?.name, plot?.section?.name, plot?.block?.name].filter(Boolean).join(' / ');
                        const endedOrVoidedAt = interment.voided_at ?? interment.ended_at;
                        const reason = interment.void_reason ?? interment.end_reason;

                        return (
                            <div key={interment.id} className="relative pl-14">
                                <div
                                    className={`absolute top-1.5 left-0 flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white ${iconBg[interment.lifecycle_status]}`}
                                >
                                    {statusIcons[interment.lifecycle_status]}
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase ring-1 ring-inset ${statusClasses[interment.lifecycle_status]}`}
                                                >
                                                    {interment.lifecycle_label}
                                                </span>
                                                <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold tracking-wide text-slate-600 uppercase ring-1 ring-slate-200 ring-inset">
                                                    {interment.type_label}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-semibold text-slate-900">
                                                    {hierarchy || 'Location hierarchy not recorded'}
                                                </span>
                                                {plot ? (
                                                    <Link
                                                        href={plot.profile_url}
                                                        className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                                                    >
                                                        <MapPin size={14} className="mr-1.5 opacity-70" />
                                                        {plot.slot_label}
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm text-slate-500">Plot record not available</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 text-left sm:min-w-[140px] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5 sm:text-right">
                                            <div>
                                                <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Interment Date</p>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {formatProfileDate(interment.interment_date) || '-'}
                                                </p>
                                            </div>
                                            {endedOrVoidedAt && (
                                                <div>
                                                    <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                        {interment.lifecycle_status === 'voided' ? 'Voided At' : 'Ended At'}
                                                    </p>
                                                    <p className="text-sm font-medium text-slate-800">{formatProfileDate(endedOrVoidedAt)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(reason ||
                                        interment.end_notes ||
                                        interment.notes ||
                                        interment.destination_plot_profile_url ||
                                        interment.transfer_destination ||
                                        interment.permit_reference) && (
                                        <div className="mt-5 rounded-xl bg-slate-50 p-4">
                                            {interment.destination_plot_profile_url && (
                                                <div className="mb-4 flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                        <ArrowRightLeft size={12} />
                                                    </div>
                                                    <span className="text-sm text-slate-600">Moved to</span>
                                                    <Link
                                                        href={interment.destination_plot_profile_url}
                                                        className="text-sm font-bold text-emerald-700 hover:underline"
                                                    >
                                                        {interment.destination_plot_label}
                                                    </Link>
                                                </div>
                                            )}
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {interment.transfer_destination && (
                                                    <div>
                                                        <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                            Transfer Destination
                                                        </p>
                                                        <p className="text-sm font-medium text-slate-700">{interment.transfer_destination}</p>
                                                    </div>
                                                )}
                                                {interment.permit_reference && (
                                                    <div>
                                                        <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                            Permit / Reference
                                                        </p>
                                                        <p className="text-sm font-medium text-slate-700">{interment.permit_reference}</p>
                                                    </div>
                                                )}
                                                {reason && (
                                                    <div>
                                                        <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Reason</p>
                                                        <p className="text-sm font-medium text-slate-700">{reason}</p>
                                                    </div>
                                                )}
                                                {interment.end_notes && (
                                                    <div>
                                                        <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                            End Notes
                                                        </p>
                                                        <p className="text-sm text-slate-700">{interment.end_notes}</p>
                                                    </div>
                                                )}
                                                {interment.notes && (
                                                    <div>
                                                        <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                            Interment Notes
                                                        </p>
                                                        <p className="text-sm text-slate-700">{interment.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

function BurialLocationCard({
    record,
    abilities,
    municipality,
}: {
    record: DecedentProfileType;
    abilities: Props['abilities'];
    municipality: Municipality;
}) {
    const interment = record.interment;
    const plot = interment?.plot;

    if (!interment || !plot) {
        return null;
    }

    const hierarchy = [plot.cemetery_site?.name, plot.section?.name, plot.block?.name].filter(Boolean).join(' / ');
    const intermentType = interment.type.replace('_', ' ').toUpperCase();

    return (
        <Card title="Burial Location" icon={<MapPin size={17} />}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Full Location</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{hierarchy || 'Location hierarchy not recorded'}</p>
                    <Link
                        href={plot.profile_url}
                        className="mt-2 inline-flex items-center font-mono text-sm font-semibold text-emerald-700 hover:underline"
                    >
                        {plot.slot_label}
                    </Link>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href={plot.profile_url}>
                        <Button variant="outline" className="w-full lg:w-auto">
                            View Plot Profile
                        </Button>
                    </Link>
                    {abilities.manage && (
                        <Link href={interment.move_url}>
                            <Button variant="outline" className="w-full lg:w-auto">
                                <ArrowRightLeft size={16} className="mr-2" />
                                Move Plot
                            </Button>
                        </Link>
                    )}
                    {abilities.manage && (
                        <CloseIntermentDialog
                            closeUrl={interment.close_url}
                            municipalitySlug={municipality.slug}
                            size="default"
                            className="w-full lg:w-auto"
                        />
                    )}
                    {abilities.manage && (
                        <VoidIntermentDialog
                            voidUrl={interment.void_url}
                            municipalitySlug={municipality.slug}
                            label="Void Wrong Interment"
                            size="default"
                            className="w-full border-red-200 text-red-700 hover:bg-red-50 lg:w-auto"
                        />
                    )}
                    {abilities.manage && interment.can_reverse_move && (
                        <ReverseMoveDialog reverseUrl={interment.reverse_move_url} municipalitySlug={municipality.slug} />
                    )}
                </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Cemetery Site" value={plot.cemetery_site?.name} />
                <Detail label="Section" value={plot.section?.name} />
                <Detail label="Block" value={plot.block?.name} />
                <Detail label="Plot" value={plot.slot_label} />
                <Detail label="Interment Date" value={interment.interment_date} />
                <Detail label="Interment Type" value={intermentType} />
                <Detail label="Plot Type" value={plot.type?.replace('_', ' ').toUpperCase()} />
                <Detail label="Plot Status" value={plot.status?.replace('_', ' ').toUpperCase()} />
            </div>

            {interment.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-700">{interment.notes}</p>}
        </Card>
    );
}

function DeleteUnverifiedDialog({
    record,
    municipality,
    displayName,
}: {
    record: DecedentProfileType;
    municipality: Municipality;
    displayName: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<{ reason: string }>({ reason: '' });

    const close = () => {
        if (form.processing) return;

        setIsOpen(false);
        form.reset();
        form.clearErrors();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.delete(`/api/decedents/${record.id}`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : close())}>
            <Button type="button" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsOpen(true)}>
                <Trash2 size={16} className="mr-2" />
                Delete Record
            </Button>

            <DialogContent className="border-red-100 sm:max-w-lg" showCloseButton={!form.processing}>
                <form onSubmit={submit}>
                    <DialogHeader className="mb-4 flex flex-row items-start gap-4 space-y-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="space-y-2 text-left">
                            <DialogTitle>Delete unverified Decedent?</DialogTitle>
                            <DialogDescription>
                                {displayName} will be removed from the active registry. Use this only for wrong entries before verification.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="space-y-2 py-2">
                        <Label htmlFor="delete-draft-reason">
                            Reason for deletion <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="delete-draft-reason"
                            value={form.data.reason}
                            onChange={(event) => form.setData('reason', event.target.value)}
                            placeholder="Explain why this unverified record should be removed."
                            className="min-h-24 resize-none"
                            maxLength={1000}
                            aria-invalid={Boolean(form.errors.reason)}
                            disabled={form.processing}
                            required
                        />
                        {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={form.processing || !form.data.reason.trim()}>
                            {form.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            {form.processing ? 'Deleting...' : 'Delete Record'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ReadinessCard({ record }: { record: DecedentProfileType }) {
    const statusLabel = !record.interment_readiness.registration_verified
        ? 'NEEDS VERIFICATION'
        : record.interment_readiness.document_complete
          ? 'READY'
          : 'PENDING DOCUMENTS';
    const statusHelp = !record.interment_readiness.registration_verified
        ? 'Registration must be verified before interment.'
        : record.interment_readiness.document_complete
          ? 'Required documents are complete.'
          : 'This record can still be interred by authorized staff. The reason and follow-up reference will be recorded during interment.';
    const cardTone = !record.interment_readiness.registration_verified
        ? 'border-rose-200 bg-rose-50'
        : record.interment_readiness.document_complete
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-amber-200 bg-amber-50';

    return (
        <section className={`rounded-xl border p-5 ${cardTone}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-slate-900">Interment Readiness</h2>
                    <p className="text-sm text-slate-600">{statusHelp}</p>
                </div>
                <span className="font-semibold">{statusLabel}</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {record.interment_readiness.requirements.map((item) => (
                    <div key={item.type} className="flex items-center gap-2 text-sm">
                        {item.satisfied ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-red-600" />}
                        {item.label}
                    </div>
                ))}
            </div>
            {record.interment_readiness.pending_documents && record.interment_readiness.missing.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-white/70 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Missing documents</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        {record.interment_readiness.requirements
                            .filter((item) => !item.satisfied)
                            .map((item) => (
                                <li key={item.type}>{item.label}</li>
                            ))}
                    </ul>
                    <p className="mt-3 text-xs">
                        This record can still be interred by authorized staff. The reason and follow-up reference will be recorded during interment.
                    </p>
                </div>
            )}
        </section>
    );
}

function DetailsCard({ record }: { record: DecedentProfileType }) {
    return (
        <Card title="Mortality And Identity">
            <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Legal Name" value={record.has_legal_name ? 'Yes' : 'No'} />
                <Detail label="Civil Registry Number" value={record.registry_number} />
                <Detail label="Place of Death" value={record.place_of_death} />
                <Detail label="Cause of Death" value={record.cause_of_death} />
                <Detail label="Age at Death" value={record.age_at_death?.toString()} />
                <Detail label="Sex" value={record.gender} />
            </div>
            {record.notes && <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-700">{record.notes}</p>}
        </Card>
    );
}

function UnidentifiedCard({ record }: { record: DecedentProfileType }) {
    const details = record.unidentified_details;
    return (
        <Card title="Original Unidentified Person Case">
            <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Case Reference" value={details?.case_reference} />
                <Detail label="Reporting Agency" value={details?.reporting_agency} />
                <Detail label="Found Location" value={details?.found_location} />
                <Detail label="Date Found" value={details?.date_found} />
                <Detail label="Estimated Age" value={details?.estimated_age} />
                <Detail label="Medico-Legal Required" value={details?.requires_medico_legal ? 'Yes' : 'No'} />
            </div>
            <Detail label="Physical Description" value={details?.physical_description} />
            <Detail label="Distinguishing Features" value={details?.distinguishing_features} />
        </Card>
    );
}

function DocumentsCard({
    record,
    options,
    abilities,
    municipality,
}: {
    record: DecedentProfileType;
    options: Props['document_type_options'];
    abilities: Props['abilities'];
    municipality: Municipality;
}) {
    const form = useForm<{
        type: DecedentDocumentTypeValue | '';
        document_number: string;
        issued_at: string;
        notes: string;
        file: File | null;
    }>({ type: '', document_number: '', issued_at: '', notes: '', file: null });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/api/decedents/${record.id}/documents`, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };
    const remove = (id: string) =>
        router.delete(`/api/decedents/${record.id}/documents/${id}`, { headers: { 'X-Municipality-Slug': municipality.slug }, preserveScroll: true });

    return (
        <Card title="Private Documents">
            <div className="space-y-3">
                {record.documents.map((document) => (
                    <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                        <div>
                            <p className="text-sm font-semibold">
                                {document.type_label} {document.restricted && <span className="text-xs text-rose-600">Restricted</span>}
                            </p>
                            <p className="text-xs text-slate-500">{document.document_number ?? 'No number'}</p>
                        </div>
                        <div className="flex gap-2">
                            {abilities.view_documents && (
                                <a href={document.download_url}>
                                    <Button variant="outline" size="sm">
                                        <FileText size={14} className="mr-1" />
                                        View
                                    </Button>
                                </a>
                            )}
                            {abilities.manage && (
                                <Button size="sm" variant="destructive" onClick={() => remove(document.id)}>
                                    <Trash2 size={14} />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {abilities.manage && (
                <form onSubmit={submit} className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
                    <select
                        required
                        value={form.data.type}
                        onChange={(event) => form.setData('type', event.target.value as DecedentDocumentTypeValue)}
                        className="rounded border px-3 py-2 text-sm"
                    >
                        <option value="">Document type</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <input
                        placeholder="Document number"
                        value={form.data.document_number}
                        onChange={(event) => form.setData('document_number', event.target.value)}
                        className="rounded border px-3 py-2 text-sm"
                    />
                    <input
                        required
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)}
                        className="text-sm"
                    />
                    <Button type="submit">
                        <Upload size={14} className="mr-2" />
                        Upload
                    </Button>
                </form>
            )}
        </Card>
    );
}

function AuditCard({ record, abilities }: { record: DecedentProfileType; abilities: Props['abilities'] }) {
    return (
        <Card title="Audit Timeline">
            <div className="space-y-4">
                {record.audit_timeline.map((activity) => (
                    <div key={activity.id} className="border-l-2 border-slate-200 pl-3">
                        <p className="text-sm font-semibold text-slate-800">{activity.description}</p>
                        <p className="text-xs text-slate-500">
                            {activity.causer ?? 'System'} | {new Date(activity.created_at).toLocaleString()}
                        </p>
                        {Object.keys(activity.changes ?? {}).length > 0 && (
                            <pre className="mt-1 overflow-auto text-[10px] text-slate-500">{JSON.stringify(activity.changes, null, 2)}</pre>
                        )}
                        {abilities.view_documents && activity.evidence_url && (
                            <a href={activity.evidence_url} className="mt-2 inline-block text-xs font-medium text-indigo-700">
                                View correction evidence
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}

function Card({ title, children, icon = <History size={17} /> }: { title: string; children: ReactNode; icon?: ReactNode }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                {icon}
                {title}
            </h2>
            {children}
        </section>
    );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="mb-3">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{label}</p>
            <p className="mt-1 text-sm text-slate-700">{value || '-'}</p>
        </div>
    );
}

function Stat({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="bg-white p-4">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{value || '-'}</p>
        </div>
    );
}

function formatProfileDate(value?: string | null) {
    if (!value) {
        return null;
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(value));
}

function Badge({ text }: { text: string }) {
    return <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white capitalize">{text.replace('_', ' ')}</span>;
}

import { Button } from '@/components/ui/button';
import {
    DecedentDocumentTypeValue,
    DecedentProfile as DecedentProfileType,
    IdentityStatusValue,
    SelectOption,
    VitalRecordTypeValue,
} from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, FileText, History, MapPin, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { FormEvent, ReactNode } from 'react';

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
                            <Link href={cemetery.admin.decedents.edit.page.url([currentMunicipality.slug, record.id])}>
                                <Button variant="outline">Edit Draft</Button>
                            </Link>
                        )}
                        {abilities.correct && record.registration_status === 'verified' && (
                            <a href="#correction">
                                <Button variant="outline">Correct Record</Button>
                            </a>
                        )}
                        {abilities.verify && record.registration_status === 'pending_review' && (
                            <Button onClick={verify}>
                                <ShieldCheck size={16} className="mr-2" />
                                Verify Registration
                            </Button>
                        )}
                        {!record.interment && record.interment_readiness.ready && (
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
                        {record.avatar_url ? (
                            <img src={record.avatar_url} alt={displayName} className="h-28 w-28 rounded-xl object-cover" />
                        ) : (
                            <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-800 text-3xl font-bold">
                                {displayName.slice(0, 1)}
                            </div>
                        )}
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

                <ReadinessCard record={record} abilities={abilities} municipality={currentMunicipality} />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <DetailsCard record={record} />
                        {record.unidentified_details && <UnidentifiedCard record={record} />}
                        {record.fetal_details && <FetalCard record={record} />}
                        <DocumentsCard record={record} options={document_type_options} abilities={abilities} municipality={currentMunicipality} />
                        {abilities.correct && record.registration_status === 'verified' && (
                            <div key={record.version}>
                                <CorrectionCard record={record} municipality={currentMunicipality} />
                            </div>
                        )}
                    </div>
                    <AuditCard record={record} abilities={abilities} />
                </div>
            </div>
        </AppLayout>
    );
}

function ReadinessCard({
    record,
    abilities,
    municipality,
}: {
    record: DecedentProfileType;
    abilities: Props['abilities'];
    municipality: Municipality;
}) {
    const form = useForm<{ reason: string; evidence_reference: string; legal_documents_exist: boolean }>({
        reason: '',
        evidence_reference: '',
        legal_documents_exist: false,
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/api/decedents/${record.id}/readiness-overrides`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
        });
    };

    return (
        <section
            className={`rounded-xl border p-5 ${record.interment_readiness.ready ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-slate-900">Interment Readiness</h2>
                    <p className="text-sm text-slate-600">Separate from registration verification.</p>
                </div>
                <span className="font-semibold">{record.interment_readiness.ready ? 'READY' : 'BLOCKED'}</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {record.interment_readiness.requirements.map((item) => (
                    <div key={item.type} className="flex items-center gap-2 text-sm">
                        {item.satisfied ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-red-600" />}
                        {item.label}
                    </div>
                ))}
            </div>
            {record.interment_readiness.via_override && (
                <p className="mt-3 text-xs font-medium text-amber-900">
                    Temporary override: {record.interment_readiness.override?.evidence_reference}, expires{' '}
                    {record.interment_readiness.override?.expires_at}
                </p>
            )}
            {abilities.override && record.interment_readiness.missing.length > 0 && !record.interment_readiness.via_override && (
                <form onSubmit={submit} className="mt-4 grid gap-2 sm:grid-cols-3">
                    <input
                        required
                        placeholder="Override reason"
                        value={form.data.reason}
                        onChange={(event) => form.setData('reason', event.target.value)}
                        className="rounded border px-3 py-2 text-sm"
                    />
                    <input
                        required
                        placeholder="Physical evidence/reference"
                        value={form.data.evidence_reference}
                        onChange={(event) => form.setData('evidence_reference', event.target.value)}
                        className="rounded border px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-xs text-slate-700">
                        <input
                            type="checkbox"
                            required
                            checked={form.data.legal_documents_exist}
                            onChange={(event) => form.setData('legal_documents_exist', event.target.checked)}
                        />
                        I attest the legal document or formal authorization exists.
                    </label>
                    <Button type="submit">Create 7-day Override</Button>
                </form>
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
            {record.notes && <p className="mt-5 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{record.notes}</p>}
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

function FetalCard({ record }: { record: DecedentProfileType }) {
    return (
        <Card title="Fetal Death Details">
            <div className="grid gap-4 sm:grid-cols-3">
                <Detail label="Mother's Recorded Name" value={record.fetal_details?.mother_name} />
                <Detail
                    label="Gestational Age"
                    value={record.fetal_details?.gestational_age_weeks ? `${record.fetal_details.gestational_age_weeks} weeks` : null}
                />
                <Detail
                    label="Fetal Weight"
                    value={record.fetal_details?.fetal_weight_grams ? `${record.fetal_details.fetal_weight_grams} g` : null}
                />
            </div>
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

interface CorrectionChanges {
    vital_record_type: VitalRecordTypeValue;
    identity_status: IdentityStatusValue;
    has_legal_name: boolean;
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    memorial_name: string;
    gender: string;
    date_of_birth: string;
    date_of_death: string;
    registry_number: string;
    cause_of_death: string;
    place_of_death: string;
    notes: string;
}

function CorrectionCard({ record, municipality }: { record: DecedentProfileType; municipality: Municipality }) {
    const form = useForm<{ version: number; changes: CorrectionChanges; reason: string; evidence: File | null }>({
        version: record.version,
        changes: {
            vital_record_type: record.vital_record_type,
            identity_status: record.identity_status,
            has_legal_name: record.has_legal_name,
            first_name: record.first_name ?? '',
            last_name: record.last_name ?? '',
            middle_name: record.middle_name ?? '',
            suffix: record.suffix ?? '',
            memorial_name: record.memorial_name ?? '',
            gender: record.gender ?? '',
            date_of_birth: record.date_of_birth ?? '',
            date_of_death: record.date_of_death ?? '',
            registry_number: record.registry_number ?? '',
            cause_of_death: record.cause_of_death ?? '',
            place_of_death: record.place_of_death ?? '',
            notes: record.notes ?? '',
        },
        reason: '',
        evidence: null,
    });

    const setChange = <K extends keyof CorrectionChanges>(field: K, value: CorrectionChanges[K]) => {
        form.setData('changes', { ...form.data.changes, [field]: value });
    };

    const changeIdentityStatus = (identityStatus: IdentityStatusValue) => {
        form.setData('changes', {
            ...form.data.changes,
            identity_status: identityStatus,
            ...(identityStatus === 'unidentified'
                ? {
                      has_legal_name: false,
                      first_name: '',
                      last_name: '',
                      middle_name: '',
                      suffix: '',
                      memorial_name: '',
                      gender: '',
                      date_of_birth: '',
                  }
                : {}),
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/api/decedents/${record.id}/correct`, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => form.reset('reason', 'evidence'),
        });
    };

    return (
        <div id="correction">
            <Card title="Correct Verified Record">
                <form onSubmit={submit} className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                    <select
                        value={form.data.changes.vital_record_type}
                        onChange={(event) => setChange('vital_record_type', event.target.value as VitalRecordTypeValue)}
                        className="rounded border px-3 py-2 text-sm"
                    >
                        <option value="death">Death</option>
                        <option value="fetal_death">Fetal Death</option>
                    </select>
                    <select
                        value={form.data.changes.identity_status}
                        onChange={(event) => changeIdentityStatus(event.target.value as IdentityStatusValue)}
                        className="rounded border px-3 py-2 text-sm"
                    >
                        <option value="identified">Identified</option>
                        <option value="unidentified">Unidentified</option>
                    </select>
                    {form.data.changes.identity_status === 'identified' && (
                        <label className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.changes.has_legal_name}
                                onChange={(event) => setChange('has_legal_name', event.target.checked)}
                            />
                            Has legal name
                        </label>
                    )}
                    {form.data.changes.identity_status === 'identified' && form.data.changes.has_legal_name && (
                        <>
                            <input
                                value={form.data.changes.first_name}
                                onChange={(event) => setChange('first_name', event.target.value)}
                                placeholder="First name"
                                className="rounded border px-3 py-2 text-sm"
                            />
                            <input
                                value={form.data.changes.last_name}
                                onChange={(event) => setChange('last_name', event.target.value)}
                                placeholder="Last name"
                                className="rounded border px-3 py-2 text-sm"
                            />
                            <input
                                value={form.data.changes.middle_name}
                                onChange={(event) => setChange('middle_name', event.target.value)}
                                placeholder="Middle name"
                                className="rounded border px-3 py-2 text-sm"
                            />
                            <input
                                value={form.data.changes.suffix}
                                onChange={(event) => setChange('suffix', event.target.value)}
                                placeholder="Suffix"
                                className="rounded border px-3 py-2 text-sm"
                            />
                        </>
                    )}
                    {form.data.changes.identity_status === 'identified' && !form.data.changes.has_legal_name && (
                        <input
                            value={form.data.changes.memorial_name}
                            onChange={(event) => setChange('memorial_name', event.target.value)}
                            placeholder="Memorial display name"
                            className="rounded border px-3 py-2 text-sm"
                        />
                    )}
                    {form.data.changes.identity_status === 'identified' && (
                        <>
                            <select
                                value={form.data.changes.gender}
                                onChange={(event) => setChange('gender', event.target.value)}
                                className="rounded border px-3 py-2 text-sm"
                            >
                                <option value="">Sex</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="INDETERMINATE">Indeterminate</option>
                            </select>
                            <input
                                type="date"
                                value={form.data.changes.date_of_birth}
                                onChange={(event) => setChange('date_of_birth', event.target.value)}
                                className="rounded border px-3 py-2 text-sm"
                            />
                        </>
                    )}
                    <input
                        type="date"
                        value={form.data.changes.date_of_death}
                        onChange={(event) => setChange('date_of_death', event.target.value)}
                        className="rounded border px-3 py-2 text-sm"
                    />
                    <input
                        value={form.data.changes.registry_number}
                        onChange={(event) => setChange('registry_number', event.target.value)}
                        placeholder="Civil registry number"
                        className="rounded border px-3 py-2 text-sm"
                    />
                    <input
                        value={form.data.changes.place_of_death}
                        onChange={(event) => setChange('place_of_death', event.target.value)}
                        placeholder="Place of death"
                        className="rounded border px-3 py-2 text-sm"
                    />
                    <input
                        value={form.data.changes.cause_of_death}
                        onChange={(event) => setChange('cause_of_death', event.target.value)}
                        placeholder="Cause of death"
                        className="rounded border px-3 py-2 text-sm"
                    />
                    <textarea
                        value={form.data.changes.notes}
                        onChange={(event) => setChange('notes', event.target.value)}
                        placeholder="Notes"
                        className="rounded border px-3 py-2 text-sm sm:col-span-2"
                    />
                    <textarea
                        required
                        value={form.data.reason}
                        onChange={(event) => form.setData('reason', event.target.value)}
                        placeholder="Correction reason"
                        className="rounded border px-3 py-2 text-sm"
                    />
                    <input
                        required
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(event) => form.setData('evidence', event.target.files?.[0] ?? null)}
                    />
                    {Object.keys(form.errors).length > 0 && <p className="text-sm text-rose-600 sm:col-span-2">{Object.values(form.errors)[0]}</p>}
                    <Button type="submit" disabled={form.processing}>
                        Apply Correction
                    </Button>
                </form>
            </Card>
        </div>
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

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                <History size={17} />
                {title}
            </h2>
            {children}
        </section>
    );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-sm text-slate-700">{value || '-'}</p>
        </div>
    );
}

function Stat({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{value || '-'}</p>
        </div>
    );
}

function Badge({ text }: { text: string }) {
    return <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize text-white">{text.replace('_', ' ')}</span>;
}

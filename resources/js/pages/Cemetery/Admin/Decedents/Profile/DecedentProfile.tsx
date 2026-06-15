import { Button } from '@/components/ui/button';
import {
    DecedentDocumentTypeValue,
    DecedentProfile as DecedentProfileType,
    IdentityStatusValue,
    SelectOption,
} from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, FileText, History, MapPin, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

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
    const displayName = record.identity_status === 'unidentified'
        ? `UNIDENTIFIED - ${record.unidentified_details?.case_reference ?? record.id}`
        : record.has_legal_name
          ? [record.last_name, record.first_name, record.middle_name, record.suffix].filter(Boolean).join(', ')
          : `${record.memorial_name ?? 'Unnamed'} (Memorial)`;

    const verify = () => router.post(
        `/api/decedents/${record.id}/verify`,
        {},
        { headers: { 'X-Municipality-Slug': currentMunicipality.slug } },
    );

    return (
        <AppLayout>
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={cemetery.admin.decedents.list.page.url(currentMunicipality.slug)} className="inline-flex items-center gap-2 text-sm text-slate-600">
                        <ArrowLeft size={16} />Back to registry
                    </Link>
                    <div className="flex gap-2">
                        {abilities.manage && ['draft', 'pending_review'].includes(record.registration_status) && (
                            <Link href={cemetery.admin.decedents.edit.page.url([currentMunicipality.slug, record.id])}>
                                <Button variant="outline">Edit Draft</Button>
                            </Link>
                        )}
                        {abilities.correct && record.registration_status === 'verified' && (
                            <a href="#corrections"><Button variant="outline">Request Correction</Button></a>
                        )}
                        {abilities.verify && record.registration_status === 'pending_review' && (
                            <Button onClick={verify}><ShieldCheck size={16} className="mr-2" />Verify Registration</Button>
                        )}
                        {!record.interment && record.interment_readiness.ready && (
                            <Link href={cemetery.admin.interments.assign.page.url([currentMunicipality.slug, record.id])}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700"><MapPin size={16} className="mr-2" />Assign to Plot</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-6 bg-slate-900 p-7 text-white md:flex-row md:items-center">
                        {record.avatar_url ? (
                            <img src={record.avatar_url} alt={displayName} className="h-28 w-28 rounded-xl object-cover" />
                        ) : (
                            <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-800 text-3xl font-bold">{displayName.slice(0, 1)}</div>
                        )}
                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap gap-2">
                                <Badge text={record.vital_record_label} />
                                <Badge text={record.identity_status} />
                                {record.life_stage && <Badge text={record.life_stage} />}
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[record.registration_status_tone] ?? tone.slate}`}>
                                    {record.registration_status_label}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold">{displayName}</h1>
                            <p className="mt-2 text-sm text-slate-400">Registry: {record.registry_number ?? 'Not recorded'} | Record version {record.version}</p>
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
                        <CorrectionsCard record={record} abilities={abilities} municipality={currentMunicipality} />
                    </div>
                    <AuditCard record={record} />
                </div>
            </div>
        </AppLayout>
    );
}

function ReadinessCard({ record, abilities, municipality }: { record: DecedentProfileType; abilities: Props['abilities']; municipality: Municipality }) {
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
        <section className={`rounded-xl border p-5 ${record.interment_readiness.ready ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center justify-between">
                <div><h2 className="font-semibold text-slate-900">Interment Readiness</h2><p className="text-sm text-slate-600">Separate from registration verification.</p></div>
                <span className="font-semibold">{record.interment_readiness.ready ? 'READY' : 'BLOCKED'}</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {record.interment_readiness.requirements.map((item) => (
                    <div key={item.type} className="flex items-center gap-2 text-sm">
                        {item.satisfied ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-red-600" />}{item.label}
                    </div>
                ))}
            </div>
            {record.interment_readiness.via_override && (
                <p className="mt-3 text-xs font-medium text-amber-900">Temporary override: {record.interment_readiness.override?.evidence_reference}, expires {record.interment_readiness.override?.expires_at}</p>
            )}
            {abilities.override && record.interment_readiness.missing.length > 0 && !record.interment_readiness.via_override && (
                <form onSubmit={submit} className="mt-4 grid gap-2 sm:grid-cols-3">
                    <input required placeholder="Override reason" value={form.data.reason} onChange={(event) => form.setData('reason', event.target.value)} className="rounded border px-3 py-2 text-sm" />
                    <input required placeholder="Physical evidence/reference" value={form.data.evidence_reference} onChange={(event) => form.setData('evidence_reference', event.target.value)} className="rounded border px-3 py-2 text-sm" />
                    <label className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-xs text-slate-700">
                        <input type="checkbox" required checked={form.data.legal_documents_exist} onChange={(event) => form.setData('legal_documents_exist', event.target.checked)} />
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
                <Detail label="Gestational Age" value={record.fetal_details?.gestational_age_weeks ? `${record.fetal_details.gestational_age_weeks} weeks` : null} />
                <Detail label="Fetal Weight" value={record.fetal_details?.fetal_weight_grams ? `${record.fetal_details.fetal_weight_grams} g` : null} />
            </div>
        </Card>
    );
}

function DocumentsCard({ record, options, abilities, municipality }: { record: DecedentProfileType; options: Props['document_type_options']; abilities: Props['abilities']; municipality: Municipality }) {
    const form = useForm<{
        type: DecedentDocumentTypeValue | '';
        supersedes_document_id: string;
        document_number: string;
        issued_at: string;
        notes: string;
        file: File | null;
    }>({ type: '', supersedes_document_id: '', document_number: '', issued_at: '', notes: '', file: null });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/api/decedents/${record.id}/documents`, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };
    const review = (id: string, approved: boolean) => router.post(
        `/api/decedents/${record.id}/documents/${id}/verify`,
        { approved },
        { headers: { 'X-Municipality-Slug': municipality.slug }, preserveScroll: true },
    );
    const remove = (id: string) => router.delete(
        `/api/decedents/${record.id}/documents/${id}`,
        { headers: { 'X-Municipality-Slug': municipality.slug }, preserveScroll: true },
    );
    const chooseReplacement = (id: string) => {
        const original = record.documents.find((document) => document.id === id);
        form.setData((data) => ({ ...data, supersedes_document_id: id, type: original?.type ?? '' }));
    };

    return (
        <Card title="Private Documents">
            <div className="space-y-3">
                {record.documents.map((document) => (
                    <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                        <div>
                            <p className="text-sm font-semibold">{document.type_label} {document.restricted && <span className="text-xs text-rose-600">Restricted</span>}</p>
                            <p className="text-xs text-slate-500">{document.document_number ?? 'No number'} | {document.verification_status}{document.supersedes_id ? ' | replacement' : ''}</p>
                        </div>
                        <div className="flex gap-2">
                            {abilities.view_documents && <a href={document.download_url}><Button variant="outline" size="sm"><FileText size={14} className="mr-1" />View</Button></a>}
                            {abilities.manage && document.verification_status !== 'superseded' && <Button size="sm" variant="outline" onClick={() => chooseReplacement(document.id)}>Replace</Button>}
                            {abilities.manage && ['pending', 'rejected'].includes(document.verification_status) && <Button size="sm" variant="destructive" onClick={() => remove(document.id)}><Trash2 size={14} /></Button>}
                            {abilities.verify && document.verification_status === 'pending' && (
                                <><Button size="sm" onClick={() => review(document.id, true)}>Verify</Button><Button size="sm" variant="destructive" onClick={() => review(document.id, false)}>Reject</Button></>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {abilities.manage && (
                <form onSubmit={submit} className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
                    {form.data.supersedes_document_id && <p className="text-xs font-medium text-amber-800 sm:col-span-3">This upload will supersede document {form.data.supersedes_document_id}.</p>}
                    <select required value={form.data.type} onChange={(event) => form.setData('type', event.target.value as DecedentDocumentTypeValue)} className="rounded border px-3 py-2 text-sm">
                        <option value="">Document type</option>
                        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <input placeholder="Document number" value={form.data.document_number} onChange={(event) => form.setData('document_number', event.target.value)} className="rounded border px-3 py-2 text-sm" />
                    <input required type="file" accept="image/*,application/pdf" onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)} className="text-sm" />
                    <Button type="submit"><Upload size={14} className="mr-2" />{form.data.supersedes_document_id ? 'Upload Replacement' : 'Upload'}</Button>
                    {form.data.supersedes_document_id && <Button type="button" variant="outline" onClick={() => form.setData('supersedes_document_id', '')}>Cancel Replacement</Button>}
                </form>
            )}
        </Card>
    );
}

function CorrectionsCard({ record, abilities, municipality }: { record: DecedentProfileType; abilities: Props['abilities']; municipality: Municipality }) {
    const [firstName, setFirstName] = useState(record.first_name ?? '');
    const [lastName, setLastName] = useState(record.last_name ?? '');
    const [memorialName, setMemorialName] = useState(record.memorial_name ?? '');
    const [registryNumber, setRegistryNumber] = useState(record.registry_number ?? '');
    const [dateOfDeath, setDateOfDeath] = useState(record.date_of_death ?? '');
    const [identityStatus, setIdentityStatus] = useState<IdentityStatusValue>(record.identity_status);
    const [hasLegalName, setHasLegalName] = useState(record.has_legal_name);
    const form = useForm<{ proposed_changes: Record<string, string | boolean>; reason: string; evidence: File | null }>({ proposed_changes: {}, reason: '', evidence: null });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            proposed_changes: {
                first_name: firstName,
                last_name: lastName,
                memorial_name: memorialName,
                registry_number: registryNumber,
                date_of_death: dateOfDeath,
                identity_status: identityStatus,
                has_legal_name: hasLegalName,
            },
        }));
        form.post(`/api/decedents/${record.id}/corrections`, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
        });
    };
    const review = (id: string, approved: boolean) => router.post(
        `/api/decedents/${record.id}/corrections/${id}/review`,
        { approved },
        { headers: { 'X-Municipality-Slug': municipality.slug }, preserveScroll: true },
    );

    return (
        <div id="corrections">
            <Card title="Correction Workflow">
                <div className="space-y-3">
                    {record.corrections.map((correction) => (
                        <div key={correction.id} className="rounded-lg border border-slate-200 p-3">
                            <div className="flex justify-between">
                                <p className="text-sm font-semibold">{correction.status.toUpperCase()} | {correction.requested_by}</p>
                                {abilities.verify && correction.status === 'pending' && <div className="flex gap-2"><Button size="sm" onClick={() => review(correction.id, true)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => review(correction.id, false)}>Reject</Button></div>}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{correction.reason}</p>
                            {abilities.view_documents && correction.evidence_url && <a href={correction.evidence_url} className="mt-2 inline-block text-xs font-medium text-indigo-700">View supporting evidence</a>}
                            <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(correction.proposed_changes, null, 2)}</pre>
                        </div>
                    ))}
                </div>
                {abilities.correct && record.registration_status === 'verified' && (
                    <form onSubmit={submit} className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                        <select value={identityStatus} onChange={(event) => setIdentityStatus(event.target.value as IdentityStatusValue)} className="rounded border px-3 py-2 text-sm"><option value="identified">Identified</option><option value="unidentified">Unidentified</option></select>
                        <label className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-sm"><input type="checkbox" checked={hasLegalName} onChange={(event) => setHasLegalName(event.target.checked)} />Has legal name</label>
                        <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Corrected first name" className="rounded border px-3 py-2 text-sm" />
                        <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Corrected last name" className="rounded border px-3 py-2 text-sm" />
                        <input value={memorialName} onChange={(event) => setMemorialName(event.target.value)} placeholder="Memorial display name" className="rounded border px-3 py-2 text-sm" />
                        <input value={registryNumber} onChange={(event) => setRegistryNumber(event.target.value)} placeholder="Corrected registry number" className="rounded border px-3 py-2 text-sm" />
                        <input type="date" value={dateOfDeath} onChange={(event) => setDateOfDeath(event.target.value)} className="rounded border px-3 py-2 text-sm" />
                        <textarea required value={form.data.reason} onChange={(event) => form.setData('reason', event.target.value)} placeholder="Correction reason" className="rounded border px-3 py-2 text-sm" />
                        <input required type="file" accept="image/*,application/pdf" onChange={(event) => form.setData('evidence', event.target.files?.[0] ?? null)} />
                        <Button type="submit">Request Correction</Button>
                    </form>
                )}
            </Card>
        </div>
    );
}

function AuditCard({ record }: { record: DecedentProfileType }) {
    return (
        <Card title="Audit Timeline">
            <div className="space-y-4">
                {record.audit_timeline.map((activity) => (
                    <div key={activity.id} className="border-l-2 border-slate-200 pl-3">
                        <p className="text-sm font-semibold text-slate-800">{activity.description}</p>
                        <p className="text-xs text-slate-500">{activity.causer ?? 'System'} | {new Date(activity.created_at).toLocaleString()}</p>
                        {Object.keys(activity.changes ?? {}).length > 0 && <pre className="mt-1 overflow-auto text-[10px] text-slate-500">{JSON.stringify(activity.changes, null, 2)}</pre>}
                    </div>
                ))}
            </div>
        </Card>
    );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
    return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><History size={17} />{title}</h2>{children}</section>;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
    return <div className="mb-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm text-slate-700">{value || '-'}</p></div>;
}

function Stat({ label, value }: { label: string; value?: string | null }) {
    return <div className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || '-'}</p></div>;
}

function Badge({ text }: { text: string }) {
    return <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize text-white">{text.replace('_', ' ')}</span>;
}

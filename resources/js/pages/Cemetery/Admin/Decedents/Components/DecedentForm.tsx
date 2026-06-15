import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { MunicipalitySelect } from '@/components/Shared/MunicipalitySelect';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    DecedentDocumentTypeValue,
    DecedentProfile,
    IdentityStatusValue,
    RegisterDecedentForm,
    SelectOption,
    VitalRecordTypeValue,
} from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { useForm } from '@inertiajs/react';
import { Plus, Save, Send, Trash2 } from 'lucide-react';

type DocumentOption = SelectOption<DecedentDocumentTypeValue> & { restricted: boolean };

interface Props {
    municipality: MunicipalityType;
    mode: 'create' | 'edit';
    record?: DecedentProfile;
    vitalRecordOptions: SelectOption<VitalRecordTypeValue>[];
    identityStatusOptions: SelectOption<IdentityStatusValue>[];
    documentTypeOptions: DocumentOption[];
}

const emptyDocument = () => ({ type: '' as const, document_number: '', issued_at: '', notes: '', file: null });

export default function DecedentForm({
    municipality,
    mode,
    record,
    vitalRecordOptions,
    identityStatusOptions,
    documentTypeOptions,
}: Props) {
    const form = useForm<RegisterDecedentForm>({
        vital_record_type: record?.vital_record_type ?? 'death',
        identity_status: record?.identity_status ?? 'identified',
        has_legal_name: record?.has_legal_name ?? true,
        submission_intent: 'draft',
        version: record?.version,
        first_name: record?.first_name ?? '',
        middle_name: record?.middle_name ?? '',
        last_name: record?.last_name ?? '',
        suffix: record?.suffix ?? '',
        memorial_name: record?.memorial_name ?? '',
        gender: (record?.gender as RegisterDecedentForm['gender']) ?? '',
        date_of_birth: record?.date_of_birth ?? '',
        date_of_death: record?.date_of_death ?? '',
        date_of_registration: record?.date_of_registration ?? new Date().toISOString().slice(0, 10),
        registry_number: record?.registry_number ?? '',
        cause_of_death: record?.cause_of_death ?? '',
        place_of_death: record?.place_of_death ?? '',
        notes: record?.notes ?? '',
        psgc_municipal_id: '',
        psgc_barangay_id: '',
        street_name: '',
        avatar: null,
        unidentified_details: {
            case_reference: record?.unidentified_details?.case_reference ?? '',
            found_location: record?.unidentified_details?.found_location ?? '',
            date_found: record?.unidentified_details?.date_found ?? '',
            reported_by: record?.unidentified_details?.reported_by ?? '',
            reporting_agency: record?.unidentified_details?.reporting_agency ?? '',
            estimated_age: record?.unidentified_details?.estimated_age ?? '',
            estimated_sex: (record?.unidentified_details?.estimated_sex as RegisterDecedentForm['unidentified_details']['estimated_sex']) ?? '',
            distinguishing_features: record?.unidentified_details?.distinguishing_features ?? '',
            physical_description: record?.unidentified_details?.physical_description ?? '',
            requires_medico_legal: record?.unidentified_details?.requires_medico_legal ?? true,
        },
        fetal_details: {
            gestational_age_weeks: record?.fetal_details?.gestational_age_weeks ?? '',
            fetal_weight_grams: record?.fetal_details?.fetal_weight_grams ?? '',
            mother_name: record?.fetal_details?.mother_name ?? '',
        },
        documents: [],
    });

    const errors = form.errors as Record<string, string>;
    const setNested = <K extends keyof RegisterDecedentForm>(key: K, value: RegisterDecedentForm[K]) => {
        form.setData((data) => ({ ...data, [key]: value }));
    };

    const submit = (intent: 'draft' | 'submit') => {
        form.transform((data) => ({ ...data, submission_intent: intent }));
        const options = {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
        };
        if (mode === 'create') {
            form.post('/api/decedents/store', options);
        } else if (record) {
            form.put(`/api/decedents/${record.id}`, options);
        }
    };

    const updateDocument = (index: number, patch: Partial<RegisterDecedentForm['documents'][number]>) => {
        setNested(
            'documents',
            form.data.documents.map((document, current) => (current === index ? { ...document, ...patch } : document)),
        );
    };

    return (
        <AppLayout>
            <form className="mx-auto max-w-7xl space-y-6 p-6 pb-28">
                <header className="flex items-start justify-between border-b border-slate-200 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{mode === 'create' ? 'Register Decedent' : 'Edit Decedent Draft'}</h1>
                        <p className="mt-1 text-sm text-slate-500">Cemetery operational record. Civil registry documents remain the legal source.</p>
                    </div>
                    {record && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">v{record.version}</span>}
                </header>

                {errors.record && <Alert text={errors.record} />}
                {errors.version && <Alert text={errors.version} />}

                <Card title="Record Classification" description="A child born alive uses Death; Fetal Death is a separate PSA vital record.">
                    <div className="grid gap-4 md:grid-cols-3">
                        <SelectField label="Vital Record Type" value={form.data.vital_record_type} options={vitalRecordOptions} onChange={(value) => setNested('vital_record_type', value as VitalRecordTypeValue)} />
                        <SelectField label="Identity Status" value={form.data.identity_status} options={identityStatusOptions} onChange={(value) => setNested('identity_status', value as IdentityStatusValue)} />
                        <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                            <input type="checkbox" checked={form.data.has_legal_name} onChange={(event) => setNested('has_legal_name', event.target.checked)} />
                            Has a legal registered name
                        </label>
                    </div>
                </Card>

                <Card title="Identity And Vital Information">
                    {form.data.identity_status === 'identified' && form.data.has_legal_name ? (
                        <div className="grid gap-4 md:grid-cols-4">
                            <Input label="First Name" value={form.data.first_name} onChange={(value) => setNested('first_name', value)} error={errors.first_name} />
                            <Input label="Middle Name" value={form.data.middle_name} onChange={(value) => setNested('middle_name', value)} />
                            <Input label="Last Name" value={form.data.last_name} onChange={(value) => setNested('last_name', value)} error={errors.last_name} />
                            <Input label="Suffix" value={form.data.suffix} onChange={(value) => setNested('suffix', value)} />
                        </div>
                    ) : form.data.identity_status === 'identified' ? (
                        <Input label="Memorial Display Name" value={form.data.memorial_name} onChange={(value) => setNested('memorial_name', value)} error={errors.memorial_name} />
                    ) : (
                        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">The system will generate a permanent unidentified case reference when none is supplied.</p>
                    )}

                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                        <Input type="date" label="Date of Birth" value={form.data.date_of_birth} onChange={(value) => setNested('date_of_birth', value)} />
                        <Input type="date" label="Date of Death" value={form.data.date_of_death} onChange={(value) => setNested('date_of_death', value)} error={errors.date_of_death} />
                        <Input type="date" label="Registration Date" value={form.data.date_of_registration} onChange={(value) => setNested('date_of_registration', value)} error={errors.date_of_registration} />
                        <SelectField label="Sex" value={form.data.gender} options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'INDETERMINATE', label: 'Indeterminate' }]} onChange={(value) => setNested('gender', value as RegisterDecedentForm['gender'])} />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Input label="Civil Registry Number" value={form.data.registry_number} onChange={(value) => setNested('registry_number', value)} error={errors.registry_number} />
                        <Input label="Place of Death" value={form.data.place_of_death} onChange={(value) => setNested('place_of_death', value)} />
                        <Input label="Cause of Death" value={form.data.cause_of_death} onChange={(value) => setNested('cause_of_death', value)} />
                    </div>
                </Card>

                {form.data.vital_record_type === 'fetal_death' && (
                    <Card title="Fetal Death Details" description="Certificate of Fetal Death (Municipal Form 103A) information.">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Input label="Mother's Recorded Name" value={form.data.fetal_details.mother_name} onChange={(value) => setNested('fetal_details', { ...form.data.fetal_details, mother_name: value })} error={errors['fetal_details.mother_name']} />
                            <Input type="number" label="Gestational Age (weeks)" value={String(form.data.fetal_details.gestational_age_weeks)} onChange={(value) => setNested('fetal_details', { ...form.data.fetal_details, gestational_age_weeks: value ? Number(value) : '' })} error={errors['fetal_details.gestational_age_weeks']} />
                            <Input type="number" label="Fetal Weight (grams)" value={String(form.data.fetal_details.fetal_weight_grams)} onChange={(value) => setNested('fetal_details', { ...form.data.fetal_details, fetal_weight_grams: value ? Number(value) : '' })} />
                        </div>
                    </Card>
                )}

                {form.data.identity_status === 'unidentified' && (
                    <Card title="Unidentified Person Case" description="Keep the case reference and identifying observations even after later identification.">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Input label="Case Reference (optional)" value={form.data.unidentified_details.case_reference} onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, case_reference: value })} />
                            <Input label="Found Location" value={form.data.unidentified_details.found_location} onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, found_location: value })} error={errors['unidentified_details.found_location']} />
                            <Input type="date" label="Date Found" value={form.data.unidentified_details.date_found} onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, date_found: value })} error={errors['unidentified_details.date_found']} />
                            <Input label="Reporting Agency" value={form.data.unidentified_details.reporting_agency} onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, reporting_agency: value })} error={errors['unidentified_details.reporting_agency']} />
                            <Input label="Reported By" value={form.data.unidentified_details.reported_by} onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, reported_by: value })} />
                            <Input label="Estimated Age" value={form.data.unidentified_details.estimated_age} onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, estimated_age: value })} />
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <TextField label="Physical Description" value={form.data.unidentified_details.physical_description} onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, physical_description: value })} error={errors['unidentified_details.physical_description']} />
                            <TextField label="Distinguishing Features" value={form.data.unidentified_details.distinguishing_features} onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, distinguishing_features: value })} />
                        </div>
                        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.data.unidentified_details.requires_medico_legal} onChange={(event) => setNested('unidentified_details', { ...form.data.unidentified_details, requires_medico_legal: event.target.checked })} /> Medico-legal report required</label>
                    </Card>
                )}

                <Card title="Historical Address Snapshot">
                    <div className="grid gap-4 md:grid-cols-3">
                        <MunicipalitySelect provinceId="28" value={form.data.psgc_municipal_id} onChange={(value) => setNested('psgc_municipal_id', value)} />
                        <BarangaySelect municipalityId={form.data.psgc_municipal_id} value={form.data.psgc_barangay_id} onChange={(selection) => setNested('psgc_barangay_id', selection.psgc_code)} />
                        <Input label="Street / Purok" value={form.data.street_name} onChange={(value) => setNested('street_name', value)} />
                    </div>
                </Card>

                <Card title="Private Supporting Documents" description="Images and PDFs are stored privately. Add each document with its category.">
                    <div className="space-y-4">
                        {form.data.documents.map((document, index) => (
                            <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-5">
                                <SelectField label="Document Type" value={document.type} options={documentTypeOptions} onChange={(value) => updateDocument(index, { type: value as DecedentDocumentTypeValue })} />
                                <Input label="Document Number" value={document.document_number} onChange={(value) => updateDocument(index, { document_number: value })} />
                                <Input type="date" label="Issue Date" value={document.issued_at} onChange={(value) => updateDocument(index, { issued_at: value })} />
                                <label className="text-sm font-medium text-slate-700">File<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => updateDocument(index, { file: event.target.files?.[0] ?? null })} className="mt-1 block w-full text-xs" /></label>
                                <div className="flex items-end"><Button type="button" variant="outline" onClick={() => setNested('documents', form.data.documents.filter((_, current) => current !== index))}><Trash2 size={15} /></Button></div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => setNested('documents', [...form.data.documents, emptyDocument()])}><Plus size={15} className="mr-2" />Add Document</Button>
                    </div>
                </Card>

                <Card title="Photo And Notes">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700">Private Profile Photo<input type="file" accept="image/*" onChange={(event) => setNested('avatar', event.target.files?.[0] ?? null)} className="mt-2 block" /></label>
                        <TextField label="Administrative Notes" value={form.data.notes} onChange={(value) => setNested('notes', value)} />
                    </div>
                </Card>

                <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-end gap-3 border-t bg-white/95 p-4 shadow-lg backdrop-blur md:left-64">
                    <Button type="button" variant="outline" disabled={form.processing} onClick={() => submit('draft')}><Save size={16} className="mr-2" />Save Draft</Button>
                    <Button type="button" disabled={form.processing} onClick={() => submit('submit')}><Send size={16} className="mr-2" />Submit for Review</Button>
                </div>
            </form>
        </AppLayout>
    );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="font-semibold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</div>{children}</section>;
}

function Input({ label, value, onChange, type = 'text', error }: { label: string; value: string; onChange: (value: string) => void; type?: string; error?: string }) {
    return <label className="text-sm font-medium text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}

function TextField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
    return <label className="text-sm font-medium text-slate-700">{label}<Textarea value={value} onChange={(event) => onChange(event.target.value)} className="mt-1" />{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
    return <label className="text-sm font-medium text-slate-700">{label}<Select value={value} onValueChange={onChange}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></label>;
}

function Alert({ text }: { text: string }) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{text}</div>;
}

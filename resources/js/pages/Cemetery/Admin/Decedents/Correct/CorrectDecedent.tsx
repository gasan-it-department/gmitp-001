import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DecedentProfile, IdentityStatusValue, SelectOption, VitalRecordTypeValue } from '@/Core/Types/Cemetery/cemetery';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, FileCheck2, Loader2, Save } from 'lucide-react';
import { FormEvent, ReactNode } from 'react';

interface Props {
    municipality: Municipality;
    decedent: { data: DecedentProfile };
    vital_record_options: SelectOption<VitalRecordTypeValue>[];
    identity_status_options: SelectOption<IdentityStatusValue>[];
}

interface CorrectionChanges {
    [key: string]: string | boolean;
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

function correctionValues(record: DecedentProfile): CorrectionChanges {
    return {
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
    };
}

export default function CorrectDecedent({ municipality, decedent, vital_record_options, identity_status_options }: Props) {
    const record = decedent.data;
    const original = correctionValues(record);
    const form = useForm<{ version: number; changes: CorrectionChanges; reason: string; evidence: File | null }>({
        version: record.version,
        changes: original,
        reason: '',
        evidence: null,
    });
    const displayName =
        record.identity_status === 'unidentified'
            ? `UNIDENTIFIED - ${record.unidentified_details?.case_reference ?? record.id}`
            : record.has_legal_name
              ? [record.last_name, record.first_name, record.middle_name, record.suffix].filter(Boolean).join(', ')
              : `${record.memorial_name ?? 'Unnamed'} (Memorial)`;
    const profileUrl = cemetery.admin.decedents.profile.page.url([municipality.slug, record.id]);
    const hasChanges = Object.entries(form.data.changes).some(([field, value]) => original[field] !== value);

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
        });
    };

    return (
        <AppLayout>
            <Head title={`Correct ${displayName}`} />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={profileUrl} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                        <ArrowLeft size={16} />
                        Back to profile
                    </Link>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Verified record</span>
                </div>

                <header>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950">Correct Decedent Record</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        {displayName} · Version {record.version}
                    </p>
                </header>

                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>
                        This record is already verified. Applying a correction permanently records the old and new values, your reason, and the
                        supporting evidence in the audit timeline.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <Section title="Current Verified Values">
                            <CurrentValue label="Record type" value={record.vital_record_label} />
                            <CurrentValue label="Identity status" value={record.identity_status} />
                            <CurrentValue label="Legal name" value={record.has_legal_name ? 'Yes' : 'No'} />
                            <CurrentValue label="Display name" value={displayName} />
                            <CurrentValue label="Sex" value={record.gender} />
                            <CurrentValue label="Date of birth" value={record.date_of_birth} />
                            <CurrentValue label="Date of death" value={record.date_of_death} />
                            <CurrentValue label="Registry number" value={record.registry_number} />
                            <CurrentValue label="Place of death" value={record.place_of_death} />
                            <CurrentValue label="Cause of death" value={record.cause_of_death} />
                        </Section>

                        <Section title="Proposed Corrected Values">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Vital record type">
                                    <select
                                        value={form.data.changes.vital_record_type}
                                        onChange={(event) => setChange('vital_record_type', event.target.value as VitalRecordTypeValue)}
                                        className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                    >
                                        {vital_record_options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Identity status">
                                    <select
                                        value={form.data.changes.identity_status}
                                        onChange={(event) => changeIdentityStatus(event.target.value as IdentityStatusValue)}
                                        className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                    >
                                        {identity_status_options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {form.data.changes.identity_status === 'identified' && (
                                    <label className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm sm:col-span-2">
                                        <input
                                            type="checkbox"
                                            checked={form.data.changes.has_legal_name}
                                            onChange={(event) => setChange('has_legal_name', event.target.checked)}
                                        />
                                        Has a recorded legal name
                                    </label>
                                )}

                                {form.data.changes.identity_status === 'identified' && form.data.changes.has_legal_name && (
                                    <>
                                        <Field label="First name">
                                            <Input
                                                value={form.data.changes.first_name}
                                                onChange={(event) => setChange('first_name', event.target.value)}
                                            />
                                        </Field>
                                        <Field label="Last name">
                                            <Input
                                                value={form.data.changes.last_name}
                                                onChange={(event) => setChange('last_name', event.target.value)}
                                            />
                                        </Field>
                                        <Field label="Middle name">
                                            <Input
                                                value={form.data.changes.middle_name}
                                                onChange={(event) => setChange('middle_name', event.target.value)}
                                            />
                                        </Field>
                                        <Field label="Suffix">
                                            <Input value={form.data.changes.suffix} onChange={(event) => setChange('suffix', event.target.value)} />
                                        </Field>
                                    </>
                                )}

                                {form.data.changes.identity_status === 'identified' && !form.data.changes.has_legal_name && (
                                    <Field label="Memorial display name" className="sm:col-span-2">
                                        <Input
                                            value={form.data.changes.memorial_name}
                                            onChange={(event) => setChange('memorial_name', event.target.value)}
                                        />
                                    </Field>
                                )}

                                {form.data.changes.identity_status === 'identified' && (
                                    <>
                                        <Field label="Sex">
                                            <select
                                                value={form.data.changes.gender}
                                                onChange={(event) => setChange('gender', event.target.value)}
                                                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                            >
                                                <option value="">Select sex</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="INDETERMINATE">Indeterminate</option>
                                            </select>
                                        </Field>
                                        <Field label="Date of birth">
                                            <Input
                                                type="date"
                                                value={form.data.changes.date_of_birth}
                                                onChange={(event) => setChange('date_of_birth', event.target.value)}
                                            />
                                        </Field>
                                    </>
                                )}

                                <Field label="Date of death">
                                    <Input
                                        type="date"
                                        value={form.data.changes.date_of_death}
                                        onChange={(event) => setChange('date_of_death', event.target.value)}
                                    />
                                </Field>
                                <Field label="Civil registry number">
                                    <Input
                                        value={form.data.changes.registry_number}
                                        onChange={(event) => setChange('registry_number', event.target.value)}
                                    />
                                </Field>
                                <Field label="Place of death">
                                    <Input
                                        value={form.data.changes.place_of_death}
                                        onChange={(event) => setChange('place_of_death', event.target.value)}
                                    />
                                </Field>
                                <Field label="Cause of death">
                                    <Input
                                        value={form.data.changes.cause_of_death}
                                        onChange={(event) => setChange('cause_of_death', event.target.value)}
                                    />
                                </Field>
                                <Field label="Notes" className="sm:col-span-2">
                                    <Textarea
                                        value={form.data.changes.notes}
                                        onChange={(event) => setChange('notes', event.target.value)}
                                        className="min-h-24"
                                    />
                                </Field>
                            </div>
                        </Section>
                    </div>

                    <Section title="Correction Accountability">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Reason for correction">
                                <Textarea
                                    required
                                    maxLength={2000}
                                    value={form.data.reason}
                                    onChange={(event) => form.setData('reason', event.target.value)}
                                    placeholder="Explain why the verified record must be corrected."
                                    className="min-h-28"
                                />
                            </Field>
                            <Field label="Supporting evidence">
                                <Input
                                    required
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={(event) => form.setData('evidence', event.target.files?.[0] ?? null)}
                                />
                                <p className="text-xs text-slate-500">JPEG, PNG, WebP, or PDF up to 10 MB.</p>
                            </Field>
                        </div>

                        {Object.keys(form.errors).length > 0 && (
                            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{String(Object.values(form.errors)[0])}</p>
                        )}
                    </Section>

                    <div className="flex justify-end gap-3">
                        <Link href={profileUrl}>
                            <Button type="button" variant="outline" disabled={form.processing}>
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={form.processing || !hasChanges || !form.data.reason.trim() || !form.data.evidence}>
                            {form.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {form.processing ? 'Applying Correction...' : 'Apply Correction'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileCheck2 className="h-4 w-4 text-indigo-600" />
                <h2 className="font-semibold text-slate-900">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function Field({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label>{label}</Label>
            {children}
        </div>
    );
}

function CurrentValue({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="border-b border-slate-100 py-2 last:border-0">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
            <p className="mt-1 text-sm text-slate-900">{value || 'Not recorded'}</p>
        </div>
    );
}

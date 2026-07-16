import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { MunicipalitySelect } from '@/components/Shared/MunicipalitySelect';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DecedentProfile, IdentityStatusValue, RegisterDecedentForm, SelectOption, VitalRecordTypeValue } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import cemetery from '@/routes/cemetery';
import { Link, useForm } from '@inertiajs/react';
import { FileText, Folder, HelpCircle, Image, Info, MapPin, Save, Send, User, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
    municipality: MunicipalityType;
    mode: 'create' | 'edit';
    record?: DecedentProfile;
    vitalRecordOptions: SelectOption<VitalRecordTypeValue>[];
    identityStatusOptions: SelectOption<IdentityStatusValue>[];
}

export default function DecedentForm({ municipality, mode, record, vitalRecordOptions, identityStatusOptions }: Props) {
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
        psgc_municipality_id: record?.psgc_municipality_id ?? '',
        psgc_barangay_code: record?.psgc_barangay_code ?? '',
        street_name: record?.street_name ?? '',
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
    });

    const errors = form.errors as Record<string, string>;
    const setNested = <K extends keyof RegisterDecedentForm>(key: K, value: RegisterDecedentForm[K]) => {
        form.setData((data) => ({ ...data, [key]: value }));
    };

    const submit = (intent: 'draft' | 'submit') => {
        form.transform((data) => ({
            ...data,
            submission_intent: intent,
            ...(mode === 'edit' ? { _method: 'put' } : {}),
        }));
        const options = {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
        };
        if (mode === 'create') {
            form.post('/api/decedents/store', options);
        } else if (record) {
            form.post(`/api/decedents/${record.id}`, options);
        }
    };

    const changeIdentityStatus = (value: IdentityStatusValue) => {
        form.setData((data) => ({
            ...data,
            identity_status: value,
            ...(value === 'unidentified'
                ? {
                      has_legal_name: false,
                      first_name: '',
                      middle_name: '',
                      last_name: '',
                      suffix: '',
                      memorial_name: '',
                      date_of_birth: '',
                      gender: '' as const,
                  }
                : {}),
        }));
    };

    return (
        <form className="mx-auto max-w-7xl p-6 pb-32">
            <header className="flex items-start justify-between pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {mode === 'create' ? 'Register Decedent' : 'Edit Decedent Draft'}
                    </h1>
                    <p className="mt-2 text-base text-slate-500">Cemetery operational record. Civil registry documents remain the legal source.</p>
                </div>
                {record && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 uppercase">v{record.version}</span>
                )}
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                {/* Main Content Column */}
                <div className="space-y-8 lg:col-span-3">
                    {errors.record && <Alert text={errors.record} />}
                    {errors.version && <Alert text={errors.version} />}

                    <Card
                        icon={Folder}
                        iconBg="bg-blue-600"
                        title="Record Classification"
                        description="A child born alive uses Death; Fetal Death is a separate PSA vital record."
                    >
                        <div className="grid gap-4 md:grid-cols-3">
                            <SelectField
                                label="Vital Record Type"
                                value={form.data.vital_record_type}
                                options={vitalRecordOptions}
                                onChange={(value) => setNested('vital_record_type', value as VitalRecordTypeValue)}
                            />
                            <SelectField
                                label="Identity Status"
                                value={form.data.identity_status}
                                options={identityStatusOptions}
                                onChange={(value) => changeIdentityStatus(value as IdentityStatusValue)}
                            />
                            {form.data.identity_status === 'identified' && (
                                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.has_legal_name}
                                        onChange={(event) => setNested('has_legal_name', event.target.checked)}
                                    />
                                    Has a legal registered name
                                </label>
                            )}
                        </div>
                    </Card>

                    <Card icon={User} iconBg="bg-blue-600" title="Identity And Vital Information">
                        {form.data.identity_status === 'identified' && form.data.has_legal_name ? (
                            <div className="grid gap-4 md:grid-cols-4">
                                <Input
                                    label="First Name"
                                    value={form.data.first_name}
                                    onChange={(value) => setNested('first_name', value)}
                                    error={errors.first_name}
                                />
                                <Input label="Middle Name" value={form.data.middle_name} onChange={(value) => setNested('middle_name', value)} />
                                <Input
                                    label="Last Name"
                                    value={form.data.last_name}
                                    onChange={(value) => setNested('last_name', value)}
                                    error={errors.last_name}
                                />
                                <Input label="Suffix" value={form.data.suffix} onChange={(value) => setNested('suffix', value)} />
                            </div>
                        ) : form.data.identity_status === 'identified' ? (
                            <Input
                                label="Memorial Display Name"
                                value={form.data.memorial_name}
                                onChange={(value) => setNested('memorial_name', value)}
                                error={errors.memorial_name}
                            />
                        ) : (
                            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                                The system will generate a permanent unidentified case reference when none is supplied.
                            </p>
                        )}

                        <div className="mt-4 grid gap-4 md:grid-cols-4">
                            {form.data.identity_status === 'identified' && (
                                <Input
                                    type="date"
                                    label="Date of Birth"
                                    value={form.data.date_of_birth}
                                    onChange={(value) => setNested('date_of_birth', value)}
                                />
                            )}
                            <Input
                                type="date"
                                label={form.data.identity_status === 'unidentified' ? 'Date of Death (if established)' : 'Date of Death'}
                                value={form.data.date_of_death}
                                onChange={(value) => setNested('date_of_death', value)}
                                error={errors.date_of_death}
                            />
                            <Input
                                type="date"
                                label="Registration Date"
                                value={form.data.date_of_registration}
                                onChange={(value) => setNested('date_of_registration', value)}
                                error={errors.date_of_registration}
                            />
                            {form.data.identity_status === 'identified' && (
                                <SelectField
                                    label="Sex"
                                    value={form.data.gender}
                                    options={[
                                        { value: 'MALE', label: 'Male' },
                                        { value: 'FEMALE', label: 'Female' },
                                        { value: 'INDETERMINATE', label: 'Indeterminate' },
                                    ]}
                                    onChange={(value) => setNested('gender', value as RegisterDecedentForm['gender'])}
                                />
                            )}
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <Input
                                label={form.data.identity_status === 'unidentified' ? 'LCR Registry Number (if issued)' : 'Civil Registry Number'}
                                value={form.data.registry_number}
                                onChange={(value) => setNested('registry_number', value)}
                                error={errors.registry_number}
                            />
                            <Input label="Place of Death" value={form.data.place_of_death} onChange={(value) => setNested('place_of_death', value)} />
                            <Input label="Cause of Death" value={form.data.cause_of_death} onChange={(value) => setNested('cause_of_death', value)} />
                        </div>
                    </Card>

                    {form.data.identity_status === 'unidentified' && (
                        <Card
                            icon={HelpCircle}
                            iconBg="bg-blue-600"
                            title="Unidentified Person Case"
                            description="Keep the case reference and identifying observations even after later identification."
                        >
                            <div className="grid gap-4 md:grid-cols-3">
                                <Input
                                    label="Case Reference (optional)"
                                    value={form.data.unidentified_details.case_reference}
                                    onChange={(value) =>
                                        setNested('unidentified_details', { ...form.data.unidentified_details, case_reference: value })
                                    }
                                />
                                <Input
                                    label="Found Location"
                                    value={form.data.unidentified_details.found_location}
                                    onChange={(value) =>
                                        setNested('unidentified_details', { ...form.data.unidentified_details, found_location: value })
                                    }
                                    error={errors['unidentified_details.found_location']}
                                />
                                <Input
                                    type="date"
                                    label="Date Found"
                                    value={form.data.unidentified_details.date_found}
                                    onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, date_found: value })}
                                    error={errors['unidentified_details.date_found']}
                                />
                                <Input
                                    label="Reporting Agency"
                                    value={form.data.unidentified_details.reporting_agency}
                                    onChange={(value) =>
                                        setNested('unidentified_details', { ...form.data.unidentified_details, reporting_agency: value })
                                    }
                                    error={errors['unidentified_details.reporting_agency']}
                                />
                                <Input
                                    label="Reported By"
                                    value={form.data.unidentified_details.reported_by}
                                    onChange={(value) => setNested('unidentified_details', { ...form.data.unidentified_details, reported_by: value })}
                                />
                                <Input
                                    label="Estimated Age"
                                    value={form.data.unidentified_details.estimated_age}
                                    onChange={(value) =>
                                        setNested('unidentified_details', { ...form.data.unidentified_details, estimated_age: value })
                                    }
                                />
                                <SelectField
                                    label="Estimated Sex"
                                    value={form.data.unidentified_details.estimated_sex}
                                    options={[
                                        { value: 'MALE', label: 'Male' },
                                        { value: 'FEMALE', label: 'Female' },
                                        { value: 'INDETERMINATE', label: 'Indeterminate' },
                                    ]}
                                    onChange={(value) =>
                                        setNested('unidentified_details', {
                                            ...form.data.unidentified_details,
                                            estimated_sex: value as RegisterDecedentForm['unidentified_details']['estimated_sex'],
                                        })
                                    }
                                />
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Physical Description"
                                    value={form.data.unidentified_details.physical_description}
                                    onChange={(value) =>
                                        setNested('unidentified_details', { ...form.data.unidentified_details, physical_description: value })
                                    }
                                    error={errors['unidentified_details.physical_description']}
                                />
                                <TextField
                                    label="Distinguishing Features"
                                    value={form.data.unidentified_details.distinguishing_features}
                                    onChange={(value) =>
                                        setNested('unidentified_details', { ...form.data.unidentified_details, distinguishing_features: value })
                                    }
                                />
                            </div>
                            <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={form.data.unidentified_details.requires_medico_legal}
                                    onChange={(event) =>
                                        setNested('unidentified_details', {
                                            ...form.data.unidentified_details,
                                            requires_medico_legal: event.target.checked,
                                        })
                                    }
                                />{' '}
                                Medico-legal report required
                            </label>
                        </Card>
                    )}

                    <Card icon={MapPin} iconBg="bg-blue-600" title="Historical Address Snapshot">
                        <div className="grid gap-4 md:grid-cols-3">
                            <MunicipalitySelect
                                provinceId="28"
                                value={form.data.psgc_municipality_id}
                                onChange={(value) => setNested('psgc_municipality_id', value)}
                            />
                            <BarangaySelect
                                municipalityId={form.data.psgc_municipality_id}
                                value={form.data.psgc_barangay_code}
                                onChange={(selection) => setNested('psgc_barangay_code', selection.psgc_code)}
                            />
                            <Input label="Street / Purok" value={form.data.street_name} onChange={(value) => setNested('street_name', value)} />
                        </div>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8 lg:col-span-1">
                    <Card
                        icon={FileText}
                        iconBg="bg-purple-600"
                        title="Notes / Remarks"
                        description="Add any administrative notes regarding this registry."
                    >
                        <TextField label="Administrative Notes" value={form.data.notes} onChange={(value) => setNested('notes', value)} />
                    </Card>

                    <Card icon={Image} iconBg="bg-teal-600" title="Profile Photo" description="Private profile photo for visual identification.">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => setNested('avatar', event.target.files?.[0] ?? null)}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </Card>

                    <Card icon={Info} iconBg="bg-indigo-600" title="Portal Guide" description="Important rules">
                        <ul className="ml-4 list-disc space-y-2 text-sm text-slate-600">
                            <li>
                                <strong>Identity Status:</strong> Unidentified cases auto-generate a case reference if left blank.
                            </li>
                            <li>
                                <strong>Legal Name:</strong> Uncheck if the decedent has no official LCR registration name.
                            </li>
                            <li>
                                <strong>Fetal Deaths:</strong> Must include gestational details.
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>

            <div className="fixed right-0 bottom-0 left-0 z-20 flex items-center justify-between border-t bg-white/95 p-4 shadow-lg backdrop-blur">
                <Link href={cemetery.admin.decedents.list.page.url({ municipality: municipality.slug })}>
                    <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        Cancel
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" disabled={form.processing} onClick={() => submit('draft')}>
                        <Save size={16} className="mr-2" />
                        Save Draft
                    </Button>
                    <Button type="button" disabled={form.processing} onClick={() => submit('submit')}>
                        <Send size={16} className="mr-2" />
                        Submit for Review
                    </Button>
                </div>
            </div>
        </form>
    );
}

function Card({
    icon: Icon,
    iconBg = 'bg-blue-600',
    title,
    description,
    children,
}: {
    icon: LucideIcon;
    iconBg?: string;
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-200 p-6">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white ${iconBg}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    {description && <p className="text-sm text-slate-500">{description}</p>}
                </div>
            </div>
            <div className="p-6">{children}</div>
        </section>
    );
}

function Input({
    label,
    value,
    onChange,
    type = 'text',
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    error?: string;
}) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
            {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

function TextField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}
            <Textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1.5 block min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
            {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none">
                    <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </label>
    );
}

function Alert({ text }: { text: string }) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">{text}</div>;
}

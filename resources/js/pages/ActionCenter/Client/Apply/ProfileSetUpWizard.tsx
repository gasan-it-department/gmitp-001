import { FormInput } from '@/components/FormInputField';
import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { DatePicker } from '@/components/Shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Briefcase, Home, Info, User } from 'lucide-react';
import { FormEvent } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReligionOption {
    id: string;
    name: string;
}

interface EnumOption {
    value: string;
    label: string;
}

interface Props {
    religions: ReligionOption[];
    educationalAttainment: EnumOption[];
    civilStatus: EnumOption[];
    submitUrl: string;
}

// ─── Static options ───────────────────────────────────────────────────────────

const SEX_OPTIONS = ['male', 'female'] as const;

const SUFFIX_OPTIONS = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfileSetUpWizard({ religions, submitUrl, educationalAttainment, civilStatus }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        sex: '',
        birth_date: '',
        religion_id: '',
        educational_attainment: '',
        // Civil status / employment / income — paper-form parity.
        civil_status: '',
        occupation: '',
        monthly_income: '',
        barangay: '',
        barangay_code: '',
        street: '',
        terms_consent: false as boolean,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(submitUrl, {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
        });
    };

    const canSubmit =
        data.first_name.trim().length > 0 &&
        data.last_name.trim().length > 0 &&
        data.sex.length > 0 &&
        data.birth_date.length > 0 &&
        data.civil_status.length > 0 &&
        data.occupation.trim().length > 0 &&
        // Income can be 0 (the citizen has no income) so we only require that
        // SOMETHING was entered — empty string fails, "0" passes.
        data.monthly_income.length > 0 &&
        data.barangay.trim().length > 0 &&
        data.terms_consent &&
        !processing;

    return (
        <PublicLayout title="Complete Your Profile" description="Set up your MSWD profile before applying for assistance.">
            {/* Back nav */}
            <div className="border-b border-slate-200 bg-white">
                <div className="container mx-auto max-w-2xl px-4 py-4">
                    <Link href="#" className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-[#005088]">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Action Center
                    </Link>
                </div>
            </div>

            <div className="min-h-screen bg-[#F8FAFC] pb-24">
                <div className="container mx-auto mt-8 max-w-2xl px-4">
                    {/* Header banner */}
                    <div className="mb-8 rounded-3xl bg-[#005088] p-8 text-white shadow-xl shadow-blue-900/10">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                                <User className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Complete Your Profile</h1>
                                <p className="mt-1 text-sm leading-relaxed text-blue-100 opacity-90">
                                    This is a one-time setup. Your information is used to verify your eligibility for MSWD assistance programs.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ── Section 1: Personal Information ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<User className="h-4 w-4 text-[#005088]" />} title="Personal Information" />

                            <div className="mt-6 space-y-5">
                                {/* Name row */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <FormInput
                                        id="first_name"
                                        label="First Name"
                                        required
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="e.g. Maria"
                                        error={errors.first_name}
                                    />

                                    <FormInput
                                        id="middle_name"
                                        label="Middle Name"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                        placeholder="e.g. Santos"
                                        error={errors.middle_name}
                                    />

                                    <FormInput
                                        id="last_name"
                                        label="Last Name"
                                        required
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="e.g. Dela Cruz"
                                        error={errors.last_name}
                                    />
                                </div>

                                {/* Suffix + Sex + Birth date */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <ShadcnSelectField
                                        id="suffix"
                                        label="Suffix"
                                        placeholder="None"
                                        value={data.suffix}
                                        onValueChange={(value) => setData('suffix', value)}
                                        error={errors.suffix}
                                        options={SUFFIX_OPTIONS.map((s) => ({ value: s, label: s }))}
                                    />

                                    <ShadcnSelectField
                                        id="sex"
                                        label="Sex"
                                        required
                                        placeholder="Select…"
                                        value={data.sex}
                                        onValueChange={(value) => setData('sex', value)}
                                        error={errors.sex}
                                        options={SEX_OPTIONS.map((s) => ({ value: s, label: s }))}
                                    />

                                    <DatePicker
                                        label="Date of Birth"
                                        value={data.birth_date}
                                        onChange={(dateValue) => setData('birth_date', dateValue)}
                                    />
                                </div>

                                {/* Religion + Educational attainment */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <ShadcnSelectField
                                        id="religion_id"
                                        label="Religion"
                                        placeholder="Prefer not to say"
                                        value={data.religion_id}
                                        onValueChange={(value) => setData('religion_id', value)}
                                        error={errors.religion_id}
                                        options={religions.map((r) => ({ value: r.id, label: r.name }))}
                                    />

                                    <ShadcnSelectField
                                        id="educational_attainment"
                                        label="Educational Attainment"
                                        placeholder="Select…"
                                        value={data.educational_attainment}
                                        onValueChange={(value) => setData('educational_attainment', value)}
                                        error={errors.educational_attainment}
                                        options={educationalAttainment}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Section 2: Civil Status & Employment ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader
                                icon={<Briefcase className="h-4 w-4 text-[#005088]" />}
                                title="Civil Status & Employment"
                            />

                            <div className="mt-6 space-y-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <ShadcnSelectField
                                        id="civil_status"
                                        label="Civil Status"
                                        required
                                        placeholder="Select…"
                                        value={data.civil_status}
                                        onValueChange={(value) => setData('civil_status', value)}
                                        error={errors.civil_status}
                                        options={civilStatus}
                                    />

                                    <FormInput
                                        id="occupation"
                                        label="Occupation"
                                        required
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                        placeholder='e.g. Farmer, Driver, "None"'
                                        error={errors.occupation}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormInput
                                        id="monthly_income"
                                        label="Monthly Income (₱)"
                                        required
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={data.monthly_income}
                                        onChange={(e) => setData('monthly_income', e.target.value)}
                                        placeholder="0.00"
                                        error={errors.monthly_income}
                                    />
                                </div>

                                <p className="text-xs leading-relaxed text-slate-500">
                                    Enter <strong>0</strong> if you currently have no income, or write{' '}
                                    <strong>"None"</strong> as your occupation if you are unemployed. This
                                    information is used to evaluate your eligibility for MSWD assistance
                                    programs.
                                </p>
                            </div>
                        </div>

                        {/* ── Section 3: Home Address ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<Home className="h-4 w-4 text-[#005088]" />} title="Home Address" />

                            <div className="mt-6 space-y-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <BarangaySelect
                                        municipalityId={currentMunicipality.psgc_municipal_id}
                                        value={data.barangay_code}
                                        onChange={({ name, psgc_code }) => {
                                            setData('barangay', name);
                                            setData('barangay_code', psgc_code);
                                        }}
                                    />

                                    <FormInput
                                        id="street"
                                        label="Street / Purok / Sitio"
                                        value={data.street}
                                        onChange={(e) => setData('street', e.target.value)}
                                        placeholder="e.g. Purok 3, Sitio Malaya"
                                        error={errors.street}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── ID-match advisory ── */}
                        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                            <p className="text-xs leading-relaxed text-blue-800">
                                The information you provide will be verified by MSWD staff. Please ensure all details match your valid
                                government-issued ID.
                            </p>
                        </div>

                        {/* ── Data Privacy Act consent ── */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-6">
                                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                <p className="text-xs leading-relaxed text-amber-800">
                                    <strong>Data Privacy Notice:</strong> Ang impormasyong iyong ibibigay ay gagamitin
                                    lamang ng <strong>MSWD {currentMunicipality.name}</strong> para sa pagproseso ng iyong
                                    profile at pagsusuri ng iyong pagiging karapat-dapat sa mga programa ng tulong,
                                    alinsunod sa <strong>Data Privacy Act of 2012 (RA 10173)</strong>. Hindi ibabahagi ang
                                    iyong impormasyon sa iba pang ahensya nang walang iyong pahintulot.
                                </p>
                            </div>

                            <Label
                                htmlFor="terms_consent"
                                className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200"
                            >
                                <Checkbox
                                    id="terms_consent"
                                    checked={data.terms_consent}
                                    onCheckedChange={(value) => setData('terms_consent', Boolean(value))}
                                    className="mt-0.5"
                                />
                                <span className="text-sm font-semibold text-slate-700">
                                    Sumasang-ayon ako sa Data Privacy notice at kinukumpirma ko na totoo ang lahat ng
                                    impormasyong aking ibinigay.
                                </span>
                            </Label>

                            {errors.terms_consent && (
                                <p className="text-xs font-medium text-red-500">{errors.terms_consent}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={!canSubmit}
                            className="h-16 w-full rounded-2xl bg-[#005088] text-lg font-black tracking-widest text-white uppercase shadow-xl shadow-blue-900/20 transition-all hover:bg-[#003d66] active:scale-[0.98] disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save & Continue'}
                        </Button>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#005088]/10">{icon}</div>
            <h2 className="text-base font-bold tracking-wide text-slate-900 uppercase">{title}</h2>
        </div>
    );
}

// ─── Shadcn Select Wrapper ────────────────────────────────────────────────────

interface ShadcnSelectFieldProps {
    label: string;
    id: string;
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

function ShadcnSelectField({
    label,
    id,
    value,
    onValueChange,
    options,
    placeholder = 'Select...',
    error,
    required = false,
    disabled = false,
}: ShadcnSelectFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={onValueChange} disabled={disabled} required={required}>
                <SelectTrigger
                    id={id}
                    className={`h-10 w-full bg-white ${error ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-[#005088]/30'}`}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <span className="animate-pulse text-sm text-red-500">{error}</span>}
        </div>
    );
}

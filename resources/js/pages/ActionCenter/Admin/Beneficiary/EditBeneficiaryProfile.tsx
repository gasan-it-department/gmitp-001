import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Loader2, ShieldAlert, User } from 'lucide-react';
import { FormEvent } from 'react';
// Reuse the SAME identity + civil-status sections the intake forms use, so the
// edit form can never drift from the create path or the validators.
import { CivilStatusEmploymentSection } from '../../Client/Apply/Beneficiary/Components/CivilStatusEmploymentSection';
import { PersonalInformationSection } from '../../Client/Apply/Beneficiary/Components/PersonalInformationSection';
import { SectionHeader } from '../../Client/Apply/Beneficiary/Components/SectionHeader';
import type { EnumOption, ProfileSetupFormData, ReligionOption } from '../../Client/Apply/Beneficiary/types';
import AvatarUploader from './Components/AvatarUploader';

// ─── The slice of BeneficiaryProfileResource this form pre-fills from ─────────

interface BeneficiaryEditData {
    id: string;
    beneficiary_number: string | null;
    avatar_url: string | null;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string | null;
    birth_date: string | null;
    religion_id: string | null;
    educational_attainment: string | null;
    civil_status: string | null;
    occupation: string | null;
    monthly_income: number | null;
}

interface Props {
    beneficiary: { data: BeneficiaryEditData } | BeneficiaryEditData;
    religions: ReligionOption[];
    educationalAttainment: EnumOption[];
    civilStatus: EnumOption[];
    submitUrl: string;
}

/**
 * Admin-only "correct a beneficiary's profile" form.
 *
 * Only an MSWD officer can fix a registered identity — it is snapshotted onto
 * every assistance request for COA. Saving syncs the household Head row on the
 * server (UpdateBeneficiaryProfileAction) and writes an audit entry.
 *
 * We reuse `ProfileSetupFormData` so the shared section components apply
 * verbatim; the address / household / consent fields of that shape are simply
 * left untouched here (this endpoint neither validates nor writes them).
 */
export default function EditBeneficiaryProfile({ beneficiary, religions, educationalAttainment, civilStatus, submitUrl }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const b: BeneficiaryEditData = 'data' in beneficiary ? beneficiary.data : beneficiary;

    const { data, setData, put, processing, errors } = useForm<ProfileSetupFormData>({
        first_name: b.first_name ?? '',
        middle_name: b.middle_name ?? '',
        last_name: b.last_name ?? '',
        suffix: b.suffix ?? '',
        sex: b.sex ?? '',
        birth_date: b.birth_date ?? '',
        religion_id: b.religion_id ?? '',
        educational_attainment: b.educational_attainment ?? '',
        civil_status: b.civil_status ?? '',
        occupation: b.occupation ?? '',
        monthly_income: b.monthly_income !== null ? String(b.monthly_income) : '',
        // Unused by this endpoint — kept only to satisfy the shared form shape.
        barangay: '',
        barangay_code: '',
        street: '',
        terms_consent: false,
        household_members: [],
    });

    // Non-field server error (tenant guard / domain failure) comes back here.
    const profileError = (errors as Record<string, string | undefined>).profile;

    const profileUrl = ShowBeneficiaryProfileController.url({
        municipality: currentMunicipality.slug,
        beneficiaryId: b.id,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(submitUrl, {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
        });
    };

    // Mirrors the server's required-field set (UpdateBeneficiaryProfileRequest).
    const canSubmit =
        data.first_name.trim().length > 0 &&
        data.last_name.trim().length > 0 &&
        data.sex.length > 0 &&
        data.birth_date.length > 0 &&
        data.civil_status.length > 0 &&
        data.occupation.trim().length > 0 &&
        data.monthly_income.length > 0 &&
        !processing;

    return (
        <AdminLayout>
            <div className="bg-slate-50 pb-24">
                {/* Back nav */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-3xl px-6 py-4">
                        <Link
                            href={profileUrl}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Profile
                        </Link>
                    </div>
                </div>

                <div className="container mx-auto mt-8 max-w-3xl px-6">
                    {/* Header */}
                    <div className="mb-8 flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <AvatarUploader
                            beneficiaryId={b.id}
                            avatarUrl={b.avatar_url}
                            fullName={b.full_name}
                            sizeClass="h-14 w-14"
                        />
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">Edit Beneficiary Profile</h1>
                                <span className="text-xs font-medium text-slate-400">— click the photo to change it</span>
                                {b.beneficiary_number && (
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-slate-600">
                                        {b.beneficiary_number}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Correct a mistake on <span className="font-semibold text-slate-700 capitalize">{b.full_name}</span>&rsquo;s
                                record. Changes are logged and the household head entry is updated to match.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tenant / domain error */}
                        {profileError && (
                            <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                {profileError}
                            </p>
                        )}

                        {/* ── Section 1: Personal Information ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<User className="h-4 w-4 text-[#005088]" />} title="Personal Information" />
                            <div className="mt-6">
                                <PersonalInformationSection
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    religions={religions}
                                    educationalAttainment={educationalAttainment}
                                />
                            </div>
                        </div>

                        {/* ── Section 2: Civil Status & Employment ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<Briefcase className="h-4 w-4 text-[#005088]" />} title="Civil Status & Employment" />
                            <div className="mt-6">
                                <CivilStatusEmploymentSection data={data} setData={setData} errors={errors} civilStatus={civilStatus} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={profileUrl}
                                className="inline-flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className="h-12 rounded-2xl bg-slate-900 px-8 text-sm font-bold tracking-wide text-white uppercase shadow-lg transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving…
                                    </>
                                ) : (
                                    'Save changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

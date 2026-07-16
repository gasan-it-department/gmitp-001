import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Home, IdCard, Loader2, Phone, User, UserPlus, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';
// Reuse the online profile-setup sections verbatim — same fields, same
// validators — so the two intake forms can never drift.
import { CivilStatusEmploymentSection } from '../../Client/Apply/Beneficiary/Components/CivilStatusEmploymentSection';
import { CommunicationSection } from '../../Client/Apply/Beneficiary/Components/CommunicationSection';
import { HomeAddressSection } from '../../Client/Apply/Beneficiary/Components/HomeAddressSection';
import { HouseholdMembersSection } from '../../Client/Apply/Beneficiary/Components/HouseholdMembersSection';
import { IdentityDocumentUploadSection } from '../../Client/Apply/Beneficiary/Components/IdentityDocumentUploadSection';
import { PersonalInformationSection } from '../../Client/Apply/Beneficiary/Components/PersonalInformationSection';
import { SectionHeader } from '../../Client/Apply/Beneficiary/Components/SectionHeader';
import type { EnumOption, ProfileSetupFormData, ReligionOption } from '../../Client/Apply/Beneficiary/types';
import { AdminEncodeAffirmation } from './Components/AdminEncodeAffirmation';
import { DuplicateMatchWarning, type WalkInMatch } from './Components/DuplicateMatchWarning';

// ─── Page props (from ShowCreateWalkInBeneficiaryController) ──────────────────

interface Props {
    religions: ReligionOption[];
    educationalAttainment: EnumOption[];
    civilStatus: EnumOption[];
    relationships: EnumOption[];
    submitUrl: string;
    /** Possible-duplicate matches flashed by a blocked submit (empty otherwise). */
    duplicateMatches: WalkInMatch[];
}

/**
 * Admin walk-in beneficiary intake.
 *
 * The in-office counterpart to the citizen's ProfileSetUpWizard: the admin
 * encodes someone with no portal account (the created record's user_id stays
 * NULL). Reuses the same section components; swaps the citizen consent block
 * for an admin affirmation, and adds the soft duplicate guard / override.
 *
 * `force` rides along via useForm().transform() so the shared section
 * components keep the unmodified ProfileSetupFormData type.
 */
export default function CreateWalkInBeneficiary({
    religions,
    educationalAttainment,
    civilStatus,
    relationships,
    submitUrl,
    duplicateMatches,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [lastVerifyChoice, setLastVerifyChoice] = useState(false);

    const { data, setData, post, processing, errors, transform } = useForm<ProfileSetupFormData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        sex: '',
        birth_date: '',
        religion_id: '',
        educational_attainment: '',
        identity_id_front: null,
        identity_id_back: null,
        civil_status: '',
        occupation: '',
        monthly_income: '',
        contact_phone: '',
        barangay: '',
        barangay_code: '',
        street: '',
        // Repurposed as the admin's encoder affirmation (see AdminEncodeAffirmation).
        terms_consent: false,
        household_members: [],
    });

    // Non-field server errors come back under their own keys.
    const duplicateError = (errors as Record<string, string | undefined>).duplicate;
    const walkinError = (errors as Record<string, string | undefined>).walkin;

    const submitWith = (force: boolean, verifyNow: boolean) => {
        setLastVerifyChoice(verifyNow);
        transform((d) => ({ ...d, force, verify_now: verifyNow }));
        post(submitUrl, {
            forceFormData: true,
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submitWith(false, false);
    };

    // Mirrors the server's required-field set (StoreWalkInBeneficiaryRequest).
    const canSavePending =
        data.first_name.trim().length > 0 &&
        data.last_name.trim().length > 0 &&
        data.sex.length > 0 &&
        data.birth_date.length > 0 &&
        data.civil_status.length > 0 &&
        data.barangay.trim().length > 0 &&
        data.terms_consent &&
        !processing;
    const canSaveVerified = canSavePending && data.identity_id_front instanceof File;

    // const searchUrl = ShowBeneficiarySearchController.url({ municipality: currentMunicipality.slug });

    return (
        <AdminLayout>
            <div className="bg-slate-50 pb-24">
                {/* Back nav */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-3xl px-6 py-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Beneficiary List
                        </button>
                    </div>
                </div>

                <div className="container mx-auto mt-8 max-w-3xl px-6">
                    {/* Header */}
                    <div className="mb-8 flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                            <UserPlus className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Register a Walk-in Beneficiary</h1>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Encode a person who has no online account. Make sure you searched the registry first — a new record should only be
                                created when no existing match is found.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Soft-duplicate block (only after a blocked submit) */}
                        <DuplicateMatchWarning
                            matches={duplicateMatches}
                            municipalitySlug={currentMunicipality.slug}
                            onRegisterAnyway={() => submitWith(true, lastVerifyChoice)}
                            processing={processing}
                        />

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

                        {/* ── Section 2: Identity documents ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<Phone className="h-4 w-4 text-[#005088]" />} title="Communication" />
                            <div className="mt-6">
                                <CommunicationSection data={data} setData={setData} errors={errors} />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<IdCard className="h-4 w-4 text-[#005088]" />} title="Identity Documents" />
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                Upload the applicant's ID evidence. The front ID is required when saving this walk-in as verified.
                            </p>
                            <div className="mt-6">
                                <IdentityDocumentUploadSection
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    frontRequired={false}
                                    frontEmptyHint="Required for Save Verified"
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

                        {/* ── Section 3: Home Address ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<Home className="h-4 w-4 text-[#005088]" />} title="Home Address" />
                            <div className="mt-6">
                                <HomeAddressSection
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    municipalityPsgcId={currentMunicipality.psgc_municipal_id}
                                />
                            </div>
                        </div>

                        {/* ── Section 4: Household Members ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<Users className="h-4 w-4 text-[#005088]" />} title="Household" />
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                List the other family members who live with the applicant. The applicant is counted automatically as the head of the
                                household.
                            </p>
                            <div className="mt-6">
                                <HouseholdMembersSection
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    relationships={relationships}
                                    civilStatus={civilStatus}
                                    educationalAttainment={educationalAttainment}
                                    religions={religions}
                                />
                            </div>
                        </div>

                        {/* ── Admin affirmation (replaces citizen DPA consent) ── */}
                        <AdminEncodeAffirmation
                            checked={data.terms_consent}
                            onCheckedChange={(value) => setData('terms_consent', value)}
                            error={errors.terms_consent}
                            municipalityName={currentMunicipality.name}
                        />

                        {/* Non-field server error (cap hit, etc.) */}
                        {walkinError && (
                            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{walkinError}</p>
                        )}
                        {duplicateError && duplicateMatches.length === 0 && (
                            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{duplicateError}</p>
                        )}

                        {/* Submit */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                type="submit"
                                disabled={!canSavePending}
                                variant="outline"
                                className="h-14 w-full rounded-2xl text-base font-bold tracking-wide uppercase disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving…
                                    </>
                                ) : (
                                    'Save Pending'
                                )}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => submitWith(false, true)}
                                disabled={!canSaveVerified}
                                className="h-14 w-full rounded-2xl bg-emerald-700 text-base font-bold tracking-wide text-white uppercase shadow-lg hover:bg-emerald-800 disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Save Verified'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

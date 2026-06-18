import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import actionCenter from '@/routes/actionCenter';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Briefcase, Home, IdCard, Phone, User, Users } from 'lucide-react';
import { FormEvent } from 'react';
import { CivilStatusEmploymentSection } from './Components/CivilStatusEmploymentSection';
import { CommunicationSection } from './Components/CommunicationSection';
import { DataPrivacyConsent } from './Components/DataPrivacyConsent';
import { HomeAddressSection } from './Components/HomeAddressSection';
import { HouseholdMembersSection } from './Components/HouseholdMembersSection';
import { IdentityDocumentUploadSection } from './Components/IdentityDocumentUploadSection';
import { PersonalInformationSection } from './Components/PersonalInformationSection';
import { SectionHeader } from './Components/SectionHeader';
import type { EnumOption, ExistingIdentityDocuments, ProfileSetupFormData, ReligionOption } from './types';

// ─── Page props (from ShowProfileSetupController) ────────────────────────────

interface Props {
    mode?: 'create' | 'correction';
    religions: ReligionOption[];
    educationalAttainment: EnumOption[];
    civilStatus: EnumOption[];
    relationships: EnumOption[];
    submitUrl: string;
    initialData?: ProfileSetupFormData;
    existingIdentityDocuments?: ExistingIdentityDocuments;
    rejectionReason?: string | null;
    accountContact?: {
        phone: string | null;
    };
}

// ─── Page ────────────────────────────────────────────────────────────────────

/**
 * Profile setup wizard for first-time portal users. Renders three section
 * cards (personal info, employment + income, address) plus the RA 10173
 * consent block. Submits to actionCenter.profile.setup.store.
 *
 * Each section is its own component under ./Components/ to keep this
 * file as a thin orchestrator: useForm wiring, submit handler, validity
 * gate, and the JSX composition.
 */
const emptyProfileSetupData: ProfileSetupFormData = {
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
    terms_consent: false,
    household_members: [],
};

export default function ProfileSetUpWizard({
    mode = 'create',
    religions,
    submitUrl,
    educationalAttainment,
    civilStatus,
    relationships,
    initialData,
    existingIdentityDocuments = { front: false, back: false },
    rejectionReason = null,
    accountContact = { phone: null },
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const isCorrection = mode === 'correction';
    const initialFormData: ProfileSetupFormData = initialData
        ? {
              ...emptyProfileSetupData,
              ...initialData,
          }
        : {
              ...emptyProfileSetupData,
              contact_phone: accountContact.phone ?? '',
          };

    const { data, setData, post, processing, errors } = useForm<ProfileSetupFormData>(initialFormData);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(submitUrl, {
            forceFormData: true,
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
        });
    };

    // Client-side submit gate. Mirrors the required-field set on the server
    // (StoreProfileSetupRequest) so the button accurately reflects what the
    // backend will accept. Income may be 0 — only require SOMETHING in the
    // field (empty string fails; "0" passes).
    const frontIdSatisfied = data.identity_id_front instanceof File || (isCorrection && existingIdentityDocuments.front);

    const canSubmit =
        data.first_name.trim().length > 0 &&
        data.last_name.trim().length > 0 &&
        data.sex.length > 0 &&
        data.birth_date.length > 0 &&
        frontIdSatisfied &&
        data.civil_status.length > 0 &&
        data.contact_phone.trim().length > 0 &&
        data.barangay.trim().length > 0 &&
        data.terms_consent &&
        !processing;

    return (
        <PublicLayout
            title={isCorrection ? 'Correct Your Profile' : 'Complete Your Profile'}
            description={
                isCorrection
                    ? 'Submit corrected beneficiary information for MSWD review.'
                    : 'Set up your MSWD profile before applying for assistance.'
            }
        >
            {/* Back nav */}
            <div className="border-b border-slate-200 bg-white">
                <div className="container mx-auto max-w-2xl px-4 py-4">
                    <Link
                        href={actionCenter.portal.url({ municipality: currentMunicipality.slug })}
                        className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-[#005088]"
                    >
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
                                <h1 className="text-xl font-bold tracking-tight">
                                    {isCorrection ? 'Correct Your Profile' : 'Complete Your Profile'}
                                </h1>
                                <p className="mt-1 text-sm leading-relaxed text-blue-100 opacity-90">
                                    {isCorrection
                                        ? 'Update the details MSWD could not verify. Your correction will return to pending review.'
                                        : 'This is a one-time setup. Your information is used to verify your eligibility for MSWD assistance programs.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isCorrection && rejectionReason && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
                                <p className="font-bold">Reason for rejection</p>
                                <p className="mt-1 leading-relaxed">{rejectionReason}</p>
                            </div>
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

                        {/* Communication details */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<Phone className="h-4 w-4 text-[#005088]" />} title="Communication" />
                            <div className="mt-6">
                                <CommunicationSection data={data} setData={setData} errors={errors} phoneRequired />
                            </div>
                        </div>

                        {/* ID evidence for admin intake review */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <SectionHeader icon={<IdCard className="h-4 w-4 text-[#005088]" />} title="Valid ID" />
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                {isCorrection
                                    ? 'Replace your valid ID only if the previous upload was unclear or incorrect. MSWD staff will review your correction.'
                                    : 'Upload a clear photo or PDF of your valid ID. MSWD staff will review this before your profile is verified.'}
                            </p>
                            <div className="mt-6">
                                <IdentityDocumentUploadSection
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    frontRequired={!isCorrection || !existingIdentityDocuments.front}
                                    frontEmptyHint={
                                        isCorrection && existingIdentityDocuments.front ? 'Already submitted' : 'Required for verification review'
                                    }
                                    existingFrontUploaded={isCorrection && existingIdentityDocuments.front}
                                    existingBackUploaded={isCorrection && existingIdentityDocuments.back}
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
                            <SectionHeader icon={<Users className="h-4 w-4 text-[#005088]" />} title="Your Household" />
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                {isCorrection
                                    ? 'This corrected list will replace your previous unverified submitted household members.'
                                    : 'Listing your family members helps MSWD assess your eligibility for assistance programs accurately. You can also skip this and have an admin collect it later during the interview.'}
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

                        {/* ── ID-match advisory (small, stays inline) ── */}
                        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                            <p className="text-xs leading-relaxed text-blue-800">
                                {isCorrection
                                    ? 'Your corrected information will be reviewed again by MSWD staff before you can file assistance requests.'
                                    : 'The information you provide will be verified by MSWD staff. Please ensure all details match your valid government-issued ID.'}
                            </p>
                        </div>

                        {/* ── Data Privacy Act consent ── */}
                        <DataPrivacyConsent data={data} setData={setData} errors={errors} municipalityName={currentMunicipality.name} />

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={!canSubmit}
                            className="h-16 w-full rounded-2xl bg-[#005088] text-lg font-black tracking-widest text-white uppercase shadow-xl shadow-blue-900/20 transition-all hover:bg-[#003d66] active:scale-[0.98] disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : isCorrection ? 'Submit Correction' : 'Save & Continue'}
                        </Button>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}

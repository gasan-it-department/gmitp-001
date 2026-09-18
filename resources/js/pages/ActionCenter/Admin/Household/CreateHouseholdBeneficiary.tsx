import ShowHouseholdProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Household/ShowHouseholdProfileController';
import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Briefcase, IdCard, Loader2, Phone, User, UserPlus, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CivilStatusEmploymentSection } from '../../Client/Apply/Beneficiary/Components/CivilStatusEmploymentSection';
import { CommunicationSection } from '../../Client/Apply/Beneficiary/Components/CommunicationSection';
import { IdentityDocumentUploadSection } from '../../Client/Apply/Beneficiary/Components/IdentityDocumentUploadSection';
import { PersonalInformationSection } from '../../Client/Apply/Beneficiary/Components/PersonalInformationSection';
import { SectionHeader } from '../../Client/Apply/Beneficiary/Components/SectionHeader';
import { ShadcnSelectField } from '../../Client/Apply/Beneficiary/Components/ShadcnSelectField';
import type { EnumOption, ProfileSetupFormData, ReligionOption } from '../../Client/Apply/Beneficiary/types';
import { AdminEncodeAffirmation } from '../Walkin/Components/AdminEncodeAffirmation';
import { DuplicateMatchWarning, type WalkInMatch } from '../Walkin/Components/DuplicateMatchWarning';

interface HouseholdData {
    id: string;
    household_code: string | null;
    barangay: string | null;
    street: string | null;
    head: { full_name: string } | null;
    permissions: { verify: boolean };
}

interface Props {
    household: { data: HouseholdData } | HouseholdData;
    religions: ReligionOption[];
    educationalAttainment: EnumOption[];
    civilStatus: EnumOption[];
    relationships: EnumOption[];
    submitUrl: string;
    duplicateMatches: WalkInMatch[];
}

type HouseholdBeneficiaryForm = ProfileSetupFormData & { relationship: string };

export default function CreateHouseholdBeneficiary({
    household,
    religions,
    educationalAttainment,
    civilStatus,
    relationships,
    submitUrl,
    duplicateMatches,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const profile = 'data' in household ? household.data : household;
    const [lastVerifyChoice, setLastVerifyChoice] = useState(false);
    const { data, setData, post, processing, errors, transform } = useForm<HouseholdBeneficiaryForm>({
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
        relationship: '',
    });

    const submitWith = (force: boolean, verifyNow: boolean) => {
        setLastVerifyChoice(verifyNow);
        transform((current) => ({ ...current, force, verify_now: verifyNow }));
        post(submitUrl, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
        });
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        submitWith(false, false);
    };
    const canSave =
        data.first_name.trim().length > 0 &&
        data.last_name.trim().length > 0 &&
        data.sex.length > 0 &&
        data.birth_date.length > 0 &&
        data.civil_status.length > 0 &&
        data.occupation.trim().length > 0 &&
        data.monthly_income.trim().length > 0 &&
        data.relationship.length > 0 &&
        data.terms_consent &&
        !processing;
    const canVerify = profile.permissions.verify && canSave && data.identity_id_front instanceof File;
    const serverError = (errors as Record<string, string | undefined>).beneficiary;
    const duplicateError = (errors as Record<string, string | undefined>).duplicate;
    const address = [profile.street, profile.barangay].filter(Boolean).join(', ') || 'Address unavailable';

    return (
        <AdminLayout>
            <div className="min-h-screen bg-slate-50 pb-20">
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-3xl px-4 py-4 sm:px-6">
                        <Link
                            href={ShowHouseholdProfileController.url({
                                municipality: currentMunicipality.slug,
                                householdId: profile.id,
                            })}
                            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to household
                        </Link>
                    </div>
                </div>

                <main className="container mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
                    <header className="flex items-start gap-4 rounded-md border border-slate-200 bg-white p-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                            <UserPlus className="h-5 w-5" />
                        </span>
                        <div>
                            <h1 className="text-xl font-bold text-slate-950">Register beneficiary in household</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {profile.household_code ?? 'Household'} · {address}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Current head: {profile.head?.full_name ?? 'Not assigned'}</p>
                        </div>
                    </header>

                    <form onSubmit={submit} className="space-y-5">
                        <DuplicateMatchWarning
                            matches={duplicateMatches}
                            municipalitySlug={currentMunicipality.slug}
                            onRegisterAnyway={() => submitWith(true, lastVerifyChoice)}
                            processing={processing}
                        />

                        <FormSection icon={<User className="h-4 w-4" />} title="Personal information">
                            <PersonalInformationSection
                                data={data}
                                setData={setData}
                                errors={errors}
                                religions={religions}
                                educationalAttainment={educationalAttainment}
                            />
                        </FormSection>

                        <FormSection icon={<Phone className="h-4 w-4" />} title="Contact information">
                            <CommunicationSection data={data} setData={setData} errors={errors} />
                        </FormSection>

                        <FormSection icon={<Briefcase className="h-4 w-4" />} title="Civil status and employment">
                            <CivilStatusEmploymentSection data={data} setData={setData} errors={errors} civilStatus={civilStatus} />
                        </FormSection>

                        <FormSection icon={<Users className="h-4 w-4" />} title="Household relationship">
                            <ShadcnSelectField
                                id="relationship"
                                label="Relationship to household head"
                                required
                                value={data.relationship}
                                onValueChange={(value) => setData('relationship', value)}
                                error={(errors as Record<string, string | undefined>).relationship}
                                options={relationships.map((option) => ({ value: option.value, label: option.label }))}
                                contentClassName="max-h-64"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                If a matching unlinked roster row already exists, its saved relationship will be preserved and that row will be
                                reused.
                            </p>
                        </FormSection>

                        <FormSection icon={<IdCard className="h-4 w-4" />} title="Identity documents">
                            <IdentityDocumentUploadSection
                                data={data}
                                setData={setData}
                                errors={errors}
                                frontRequired={false}
                                frontEmptyHint="Required for Save Verified"
                            />
                        </FormSection>

                        <AdminEncodeAffirmation
                            checked={data.terms_consent}
                            onCheckedChange={(value) => setData('terms_consent', value)}
                            error={errors.terms_consent}
                            municipalityName={currentMunicipality.name}
                        />

                        {serverError && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
                        {duplicateError && duplicateMatches.length === 0 && (
                            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{duplicateError}</p>
                        )}

                        <div className={`grid gap-3 ${profile.permissions.verify ? 'sm:grid-cols-2' : ''}`}>
                            <Button type="submit" variant="outline" disabled={!canSave} className="h-12">
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save as pending
                            </Button>
                            {profile.permissions.verify && (
                                <Button
                                    type="button"
                                    onClick={() => submitWith(false, true)}
                                    disabled={!canVerify}
                                    className="h-12 bg-emerald-700 hover:bg-emerald-800"
                                >
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save as verified
                                </Button>
                            )}
                        </div>
                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}

function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-md border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeader icon={icon} title={title} />
            <div className="mt-5">{children}</div>
        </section>
    );
}

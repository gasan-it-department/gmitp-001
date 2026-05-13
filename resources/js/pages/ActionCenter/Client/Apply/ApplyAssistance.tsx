import { Button } from '@/components/ui/button';
import {
    AssistanceTypeDetails,
    BeneficiarySummary,
    HouseholdSummary,
} from '@/Core/Types/ActionCenter/assistance';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, UserCheck, Users } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { BeneficiaryInfoBlock } from './Components/BeneficiaryInfoBlock';
import { DocumentUploadsGrid } from './Components/DocumentUploadsGrid';
import { OnBehalfOfData, OnBehalfOfSection, RelationshipType } from './Components/OnBehalfOfSection';
import { PrivacyConsent } from './Components/PrivacyConsent';
import { ProgramInfoSidebar } from './Components/ProgramInfoSidebar';
import { RequestReasonSection } from './Components/RequestReasonSection';

// ─────────────────────────────────────────────────────────────────────────────
// Props — Inertia controller shape
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
    assistanceType: { data: AssistanceTypeDetails } | AssistanceTypeDetails;
    beneficiary:    BeneficiarySummary;
    household:      HouseholdSummary;
    submitUrl:      string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Form data shape
// ─────────────────────────────────────────────────────────────────────────────

interface FormData {
    description:                 string;
    privacy_consent:             boolean;
    documents:                   Record<string, File | null>;
    // Representative fields — submitted for ALL programs; null = "myself"
    relationship_to_beneficiary: RelationshipType;
    on_behalf_first_name:        string;
    on_behalf_middle_name:       string;
    on_behalf_last_name:         string;
    on_behalf_suffix:            string;
    on_behalf_date_of_death:     string; // burial only
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ApplyAssistance({ assistanceType, beneficiary, household, submitUrl }: Props) {
    // The Inertia resource may arrive wrapped ({ data: … }) or raw — handle both.
    const program: AssistanceTypeDetails =
        'data' in assistanceType ? assistanceType.data : assistanceType;

    const beneficiaryData = beneficiary;
    const householdData   = household;
    const formAction      = submitUrl;

    const { props } = usePage<{ ziggy?: { url?: string } }>();
    const isBurial = program.slug === 'burial';

    // ── "Who is this for?" — separate UI state (not persisted in form data) ──
    // Burial ALWAYS files for a family member; all other programs default to self.
    const [filingFor, setFilingFor] = useState<'self' | 'family_member'>('self');
    const effectiveFilingFor = isBurial ? 'family_member' : filingFor;

    // Clear representative fields when switching back to "myself"
    const handleFilingForChange = (value: 'self' | 'family_member') => {
        setFilingFor(value);
        if (value === 'self') {
            setData('relationship_to_beneficiary', '');
            setData('on_behalf_first_name', '');
            setData('on_behalf_middle_name', '');
            setData('on_behalf_last_name', '');
            setData('on_behalf_suffix', '');
            setData('on_behalf_date_of_death', '');
        }
    };

    // ── Form ─────────────────────────────────────────────────────────────────
    const { data, setData, post, processing, errors, transform } = useForm<FormData>({
        description:                 '',
        privacy_consent:             false,
        documents:                   {},
        relationship_to_beneficiary: '',
        on_behalf_first_name:        '',
        on_behalf_middle_name:       '',
        on_behalf_last_name:         '',
        on_behalf_suffix:            '',
        on_behalf_date_of_death:     '',
    });

    transform((form) => {
        const flatDocs: Record<string, File> = {};
        Object.entries(form.documents).forEach(([key, file]) => {
            if (file) flatDocs[key] = file;
        });
        // When filing for myself, strip all representative fields before sending
        if (effectiveFilingFor === 'self') {
            return {
                ...form,
                documents:                   flatDocs,
                relationship_to_beneficiary: null,
                on_behalf_first_name:        null,
                on_behalf_middle_name:       null,
                on_behalf_last_name:         null,
                on_behalf_suffix:            null,
                on_behalf_date_of_death:     null,
            };
        }
        return { ...form, documents: flatDocs };
    });

    // ── Representative helpers ────────────────────────────────────────────────
    const onBehalfOfData: OnBehalfOfData = {
        first_name:    data.on_behalf_first_name,
        middle_name:   data.on_behalf_middle_name,
        last_name:     data.on_behalf_last_name,
        suffix:        data.on_behalf_suffix,
        date_of_death: data.on_behalf_date_of_death,
        relationship:  data.relationship_to_beneficiary,
    };

    const handleBehalfChange = <K extends keyof OnBehalfOfData>(field: K, value: OnBehalfOfData[K]) => {
        const keyMap: Record<keyof OnBehalfOfData, keyof FormData> = {
            first_name:    'on_behalf_first_name',
            middle_name:   'on_behalf_middle_name',
            last_name:     'on_behalf_last_name',
            suffix:        'on_behalf_suffix',
            date_of_death: 'on_behalf_date_of_death',
            relationship:  'relationship_to_beneficiary',
        };
        setData(keyMap[field], value as string);
    };

    // ── Validation ───────────────────────────────────────────────────────────
    const allRequiredUploaded = useMemo(
        () => program.documents.filter((d) => d.is_required).every((d) => !!data.documents[d.key]),
        [program.documents, data.documents],
    );

    // Representative info is only required when not filing for self
    const representativeInfoComplete =
        effectiveFilingFor === 'self' ||
        (
            data.on_behalf_first_name.trim().length > 0 &&
            data.on_behalf_last_name.trim().length  > 0 &&
            data.relationship_to_beneficiary        !== '' &&
            // Date of death is burial-specific
            (!isBurial || data.on_behalf_date_of_death.length > 0)
        );

    const applicantAge = beneficiaryData.birth_date
        ? Math.floor((Date.now() - new Date(beneficiaryData.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 999;
    const requiresLegalAge = ['child', 'sibling'].includes(data.relationship_to_beneficiary);
    const isUnderAge       = effectiveFilingFor === 'family_member' && requiresLegalAge && applicantAge < 18;

    const canSubmit =
        data.description.trim().length >= 10 &&
        data.privacy_consent                  &&
        allRequiredUploaded                   &&
        representativeInfoComplete            &&
        !isUnderAge                           &&
        !processing;

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(formAction, { forceFormData: true, preserveScroll: true });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // State: Apply Form
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <PublicLayout title={`Apply: ${program.name}`} description={program.description}>
            {/* Back navigation */}
            <div className="border-b border-slate-200 bg-white">
                <div className="container mx-auto max-w-6xl px-4 py-4">
                    <Link
                        href={props.ziggy?.url ? props.ziggy.url.replace(/\/apply\/.*$/, '/portal') : '#'}
                        className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-[#005088]"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Action Center
                    </Link>
                </div>
            </div>

            <div className="min-h-screen bg-[#F8FAFC] pb-24">
                <div className="container mx-auto mt-8 max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                        {/* ── LEFT: program info + document checklist ── */}
                        <aside className="lg:col-span-4">
                            <ProgramInfoSidebar assistanceType={program} />
                        </aside>

                        {/* ── RIGHT: the form ── */}
                        <div className="lg:col-span-8">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* ── 1. Who is this for? ── */}
                                <WhoIsThisForSection
                                    isBurial={isBurial}
                                    value={effectiveFilingFor}
                                    onChange={handleFilingForChange}
                                />

                                {/* ── 2. Representative info (when not self) ── */}
                                {effectiveFilingFor === 'family_member' && (
                                    <OnBehalfOfSection
                                        data={onBehalfOfData}
                                        onChange={handleBehalfChange}
                                        isBurial={isBurial}
                                        applicantBirthDate={beneficiaryData.birth_date}
                                        errors={errors as Record<string, string | undefined>}
                                    />
                                )}

                                {/* ── 3. Applicant's own identity (read-only) ── */}
                                <BeneficiaryInfoBlock
                                    beneficiary={beneficiaryData}
                                    household={householdData}
                                />

                                {/* ── 4. Reason / description ── */}
                                <RequestReasonSection
                                    value={data.description}
                                    onChange={(v) => setData('description', v)}
                                    error={errors.description}
                                />

                                {/* ── 5. Document uploads ── */}
                                <DocumentUploadsGrid
                                    documents={program.documents}
                                    files={data.documents}
                                    onFileChange={(key, file) =>
                                        setData('documents', { ...data.documents, [key]: file })
                                    }
                                    errors={errors as Record<string, string | undefined>}
                                />

                                {/* ── 6. Data privacy consent ── */}
                                <PrivacyConsent
                                    checked={data.privacy_consent}
                                    onChange={(v) => setData('privacy_consent', v)}
                                    error={errors.privacy_consent}
                                />

                                {/* ── Submit ── */}
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="h-16 w-full rounded-2xl bg-[#005088] text-lg font-black tracking-widest text-white uppercase shadow-xl shadow-blue-900/20 transition-all hover:bg-[#003d66] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {processing ? 'Submitting…' : 'Submit Request'}
                                </Button>

                                {/* Inline hints */}
                                {!allRequiredUploaded && program.documents.some((d) => d.is_required) && (
                                    <p className="text-center text-xs text-slate-500">
                                        Please upload all required documents to enable submission.
                                    </p>
                                )}
                                {effectiveFilingFor === 'family_member' && !representativeInfoComplete && (
                                    <p className="text-center text-xs text-slate-500">
                                        Please fill in the{isBurial ? " deceased person's" : " family member's"} information and your relationship to enable submission.
                                    </p>
                                )}
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: "Who is this for?" selector
// ─────────────────────────────────────────────────────────────────────────────

interface WhoIsThisForProps {
    isBurial: boolean;
    value:    'self' | 'family_member';
    onChange: (value: 'self' | 'family_member') => void;
}

function WhoIsThisForSection({ isBurial, value, onChange }: WhoIsThisForProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold tracking-widest text-slate-800 uppercase">
                Who is this request for?
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Option: Myself */}
                <button
                    type="button"
                    disabled={isBurial}
                    onClick={() => !isBurial && onChange('self')}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all
                        ${isBurial
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
                            : value === 'self'
                                ? 'border-[#005088] bg-[#005088]/5 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                        ${value === 'self' && !isBurial ? 'bg-[#005088]/10 text-[#005088]' : 'bg-slate-100 text-slate-400'}`}>
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${value === 'self' && !isBurial ? 'text-[#005088]' : 'text-slate-700'}`}>
                            Myself
                        </p>
                        <p className="text-xs text-slate-500">
                            {isBurial ? 'Not applicable for burial' : 'I need assistance for myself'}
                        </p>
                    </div>
                    {/* Radio indicator */}
                    <div className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition-colors
                        ${!isBurial && value === 'self'
                            ? 'border-[#005088] bg-[#005088]'
                            : 'border-slate-300 bg-white'
                        }`}
                    />
                </button>

                {/* Option: A family member */}
                <button
                    type="button"
                    onClick={() => onChange('family_member')}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all
                        ${value === 'family_member'
                            ? 'border-[#005088] bg-[#005088]/5 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                        ${value === 'family_member' ? 'bg-[#005088]/10 text-[#005088]' : 'bg-slate-100 text-slate-400'}`}>
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${value === 'family_member' ? 'text-[#005088]' : 'text-slate-700'}`}>
                            A family member
                        </p>
                        <p className="text-xs text-slate-500">
                            {isBurial ? 'Filing for a deceased member' : "I'm an authorized representative"}
                        </p>
                    </div>
                    {/* Radio indicator */}
                    <div className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition-colors
                        ${value === 'family_member'
                            ? 'border-[#005088] bg-[#005088]'
                            : 'border-slate-300 bg-white'
                        }`}
                    />
                </button>
            </div>

            {isBurial && (
                <p className="mt-3 text-xs text-slate-500">
                    Burial assistance is always filed by an authorized family representative on behalf of the deceased.
                </p>
            )}
        </div>
    );
}

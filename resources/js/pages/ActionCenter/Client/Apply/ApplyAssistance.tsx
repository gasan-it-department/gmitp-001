import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    AssistanceTypeDetails,
    BeneficiarySummary,
    HouseholdMemberOption,
    HouseholdSummary,
    RelationshipOption,
} from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Info, UserCheck, Users } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { BeneficiaryInfoBlock } from './Components/BeneficiaryInfoBlock';
import { DocumentUploadsGrid, IdentityDocumentPair } from './Components/DocumentUploadsGrid';
import { OnBehalfOfData, OnBehalfOfSection, RelationshipType } from './Components/OnBehalfOfSection';
import { PrivacyConsent } from './Components/PrivacyConsent';
import { ProgramInfoSidebar } from './Components/ProgramInfoSidebar';
import { RequestReasonSection } from './Components/RequestReasonSection';

// ─────────────────────────────────────────────────────────────────────────────
// Props — Inertia controller shape
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
    assistanceType: { data: AssistanceTypeDetails } | AssistanceTypeDetails;
    beneficiary: BeneficiarySummary;
    household: HouseholdSummary;
    // Driven by App\Core\ActionCenter\Enums\Relationship::toOptions() — the
    // enum is the single source of truth for both the label copy and the
    // legal-age rule that gates child/sibling representatives.
    relationships: RelationshipOption[];
    // Inertia ResourceCollection wraps the array under `data`.
    householdMembers: { data: HouseholdMemberOption[] } | HouseholdMemberOption[];
    submitUrl: string;
    storeHouseholdMemberUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Form data shape
// ─────────────────────────────────────────────────────────────────────────────

type FormData = {
    description: string;
    privacy_consent: boolean;
    documents: Record<string, File | null>;
    // Representative fields — submitted for ALL programs; null = "myself"
    relationship_to_beneficiary: RelationshipType;
    on_behalf_household_member_id: string; // FK to ac_household_members; '' when filing for self
    on_behalf_first_name: string;
    on_behalf_middle_name: string;
    on_behalf_last_name: string;
    on_behalf_suffix: string;
    on_behalf_date_of_death: string; // burial only
    recipient_id_unavailable: boolean;
    recipient_id_unavailable_reason: string;
    [key: string]: unknown;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ApplyAssistance({
    assistanceType,
    beneficiary,
    household,
    relationships,
    householdMembers,
    submitUrl,
    storeHouseholdMemberUrl,
}: Props) {
    // The Inertia resource may arrive wrapped ({ data: … }) or raw — handle both.
    const program: AssistanceTypeDetails = 'data' in assistanceType ? assistanceType.data : assistanceType;

    const beneficiaryData = beneficiary;
    const householdData = household;
    const formAction = submitUrl;

    // householdMembers may arrive as { data: [...] } (ResourceCollection) or
    // a bare array; normalise once. Newly-created members are appended via
    // setHouseholdRoster so they show up in the picker without a page reload.
    const initialMembers: HouseholdMemberOption[] = 'data' in householdMembers ? householdMembers.data : householdMembers;
    const [householdRoster, setHouseholdRoster] = useState<HouseholdMemberOption[]>(initialMembers);
    const [pendingMemberMessage, setPendingMemberMessage] = useState<string | null>(null);

    const { props } = usePage<{ currentMunicipality: Municipality; ziggy?: { url?: string } }>();
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
            setData('on_behalf_household_member_id', '');
            setData('on_behalf_first_name', '');
            setData('on_behalf_middle_name', '');
            setData('on_behalf_last_name', '');
            setData('on_behalf_suffix', '');
            setData('on_behalf_date_of_death', '');
            setData('recipient_id_unavailable', false);
            setData('recipient_id_unavailable_reason', '');
            setData('documents', {
                ...data.documents,
                recipient_valid_id_front: null,
                recipient_valid_id_back: null,
            });
        }
    };

    // ── Form ─────────────────────────────────────────────────────────────────
    const { data, setData, post, processing, errors, transform } = useForm<FormData>({
        description: '',
        privacy_consent: false,
        documents: {},
        relationship_to_beneficiary: '',
        on_behalf_household_member_id: '',
        on_behalf_first_name: '',
        on_behalf_middle_name: '',
        on_behalf_last_name: '',
        on_behalf_suffix: '',
        on_behalf_date_of_death: '',
        recipient_id_unavailable: false,
        recipient_id_unavailable_reason: '',
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
                documents: flatDocs,
                relationship_to_beneficiary: null,
                on_behalf_household_member_id: null,
                on_behalf_first_name: null,
                on_behalf_middle_name: null,
                on_behalf_last_name: null,
                on_behalf_suffix: null,
                on_behalf_date_of_death: null,
                recipient_id_unavailable: false,
                recipient_id_unavailable_reason: null,
            };
        }
        return { ...form, documents: flatDocs };
    });

    // ── Representative helpers ────────────────────────────────────────────────
    const onBehalfOfData: OnBehalfOfData = {
        household_member_id: data.on_behalf_household_member_id,
        first_name: data.on_behalf_first_name,
        middle_name: data.on_behalf_middle_name,
        last_name: data.on_behalf_last_name,
        suffix: data.on_behalf_suffix,
        date_of_death: data.on_behalf_date_of_death,
        relationship: data.relationship_to_beneficiary,
    };

    const handleBehalfChange = <K extends keyof OnBehalfOfData>(field: K, value: OnBehalfOfData[K]) => {
        const keyMap: Record<keyof OnBehalfOfData, keyof FormData> = {
            household_member_id: 'on_behalf_household_member_id',
            first_name: 'on_behalf_first_name',
            middle_name: 'on_behalf_middle_name',
            last_name: 'on_behalf_last_name',
            suffix: 'on_behalf_suffix',
            date_of_death: 'on_behalf_date_of_death',
            relationship: 'relationship_to_beneficiary',
        };
        if (field === 'household_member_id' && value !== data.on_behalf_household_member_id) {
            setData((current) => ({
                ...current,
                [keyMap[field]]: value as string,
                recipient_id_unavailable: false,
                recipient_id_unavailable_reason: '',
                documents: {
                    ...current.documents,
                    recipient_valid_id_front: null,
                    recipient_valid_id_back: null,
                },
            }));
            return;
        }

        setData((current) => ({ ...current, [keyMap[field]]: value as string }));
    };

    // ── Inline "Add a new family member" ──────────────────────────────────────
    // Posts to the API endpoint, appends the created row to the local roster,
    // and selects it so the on-behalf payload is wired up automatically.
    const handleMemberCreated = (member: HouseholdMemberOption) => {
        setHouseholdRoster((current) => [...current.filter((item) => item.id !== member.id), member]);
        setData((current) => ({
            ...current,
            on_behalf_household_member_id: member.id,
            on_behalf_first_name: member.first_name,
            on_behalf_middle_name: member.middle_name ?? '',
            on_behalf_last_name: member.last_name,
            on_behalf_suffix: member.suffix ?? '',
            relationship_to_beneficiary: member.relationship ?? '',
            recipient_id_unavailable: false,
            recipient_id_unavailable_reason: '',
            documents: {
                ...current.documents,
                recipient_valid_id_front: null,
                recipient_valid_id_back: null,
            },
        }));
        setPendingMemberMessage(
            `${member.first_name} ${member.last_name} was added to this request and is awaiting MSWD verification. The request may be submitted, but it cannot be approved until the member is verified.`,
        );
    };

    // ── Validation ───────────────────────────────────────────────────────────
    const allRequiredUploaded = useMemo(
        () => program.documents.filter((d) => d.is_required).every((d) => !!data.documents[d.key]),
        [program.documents, data.documents],
    );

    const recipientIdDocuments = useMemo(
        () => program.documents.filter((document) => ['recipient_valid_id_front', 'recipient_valid_id_back'].includes(document.key)),
        [program.documents],
    );
    const selectedRecipient = householdRoster.find((member) => member.id === data.on_behalf_household_member_id) ?? null;
    const recipientAge = selectedRecipient?.birth_date
        ? Math.floor((Date.now() - new Date(selectedRecipient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
    const filerIdRequired = program.documents.some((document) => ['valid_id_front', 'valid_id_back'].includes(document.key) && document.is_required);
    const recipientIdAutomaticallyExempt = isBurial || (recipientAge !== null && recipientAge < 18);
    const recipientIdRequired = effectiveFilingFor === 'family_member' && filerIdRequired && !recipientIdAutomaticallyExempt;
    const recipientIdFilesComplete =
        recipientIdDocuments.length === 2 && recipientIdDocuments.every((document) => Boolean(data.documents[document.key]));
    const recipientIdExceptionComplete = data.recipient_id_unavailable && data.recipient_id_unavailable_reason.trim().length >= 10;
    const recipientIdentityReady = !recipientIdRequired || recipientIdFilesComplete || recipientIdExceptionComplete;

    // Representative info is only required when not filing for self
    const representativeInfoComplete =
        effectiveFilingFor === 'self' ||
        (data.on_behalf_first_name.trim().length > 0 &&
            data.on_behalf_last_name.trim().length > 0 &&
            data.relationship_to_beneficiary !== '' &&
            // Date of death is burial-specific
            (!isBurial || data.on_behalf_date_of_death.length > 0));

    const applicantAge = beneficiaryData.birth_date
        ? Math.floor((Date.now() - new Date(beneficiaryData.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 999;
    // Lookup the matched relationship option — the enum-driven flag is the
    // single source of truth for the legal-age rule. Avoids re-hardcoding
    // ['child', 'sibling'] in three places.
    const selectedRelationship = relationships.find((r) => r.value === data.relationship_to_beneficiary);
    const requiresLegalAge = selectedRelationship?.requires_legal_age ?? false;
    const isUnderAge = effectiveFilingFor === 'family_member' && requiresLegalAge && applicantAge < 18;

    const canSubmit =
        data.description.trim().length >= 10 &&
        data.privacy_consent &&
        allRequiredUploaded &&
        recipientIdentityReady &&
        representativeInfoComplete &&
        !isUnderAge &&
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
                                <WhoIsThisForSection isBurial={isBurial} value={effectiveFilingFor} onChange={handleFilingForChange} />

                                {/* ── 2. Representative info (when not self) ── */}
                                {effectiveFilingFor === 'family_member' && (
                                    <>
                                        {pendingMemberMessage && (
                                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                                {pendingMemberMessage}
                                            </div>
                                        )}
                                        <OnBehalfOfSection
                                            data={onBehalfOfData}
                                            onChange={handleBehalfChange}
                                            relationships={relationships}
                                            isBurial={isBurial}
                                            applicantBirthDate={beneficiaryData.birth_date}
                                            householdMembers={householdRoster}
                                            storeHouseholdMemberUrl={storeHouseholdMemberUrl}
                                            municipalitySlug={props.currentMunicipality.slug}
                                            onMemberCreated={handleMemberCreated}
                                            errors={errors as Record<string, string | undefined>}
                                        />
                                    </>
                                )}

                                {/* ── 3. Applicant's own identity (read-only) ── */}
                                <BeneficiaryInfoBlock beneficiary={beneficiaryData} household={householdData} />

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
                                    onFileChange={(key, file) => setData('documents', { ...data.documents, [key]: file })}
                                    errors={errors as Record<string, string | undefined>}
                                />

                                {effectiveFilingFor === 'family_member' && filerIdRequired && (
                                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                                        {recipientIdAutomaticallyExempt ? (
                                            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                                <p className="text-sm leading-relaxed text-blue-800">
                                                    {isBurial
                                                        ? "The deceased person's ID is not required. Upload the adult filer's ID and the required burial documents."
                                                        : "The assisted person is under 18, so their government ID is not required. Upload the adult filer's ID and the required program documents."}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-5">
                                                {!data.recipient_id_unavailable && (
                                                    <IdentityDocumentPair
                                                        title="Assisted person's valid government ID"
                                                        description="Upload both sides for the adult household member receiving the assistance."
                                                        documents={recipientIdDocuments}
                                                        files={data.documents}
                                                        onFileChange={(key, file) => setData('documents', { ...data.documents, [key]: file })}
                                                        errors={errors as Record<string, string | undefined>}
                                                        required
                                                    />
                                                )}

                                                <div className="border-t border-slate-200 pt-4">
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            id="recipient_id_unavailable"
                                                            checked={data.recipient_id_unavailable}
                                                            onCheckedChange={(checked) => {
                                                                const unavailable = checked === true;
                                                                setData((current) => ({
                                                                    ...current,
                                                                    recipient_id_unavailable: unavailable,
                                                                    recipient_id_unavailable_reason: unavailable
                                                                        ? current.recipient_id_unavailable_reason
                                                                        : '',
                                                                    documents: unavailable
                                                                        ? {
                                                                              ...current.documents,
                                                                              recipient_valid_id_front: null,
                                                                              recipient_valid_id_back: null,
                                                                          }
                                                                        : current.documents,
                                                                }));
                                                            }}
                                                        />
                                                        <Label htmlFor="recipient_id_unavailable" className="text-sm leading-relaxed text-slate-700">
                                                            The assisted adult does not have an available government ID
                                                        </Label>
                                                    </div>

                                                    {data.recipient_id_unavailable && (
                                                        <div className="mt-4 space-y-2">
                                                            <Label htmlFor="recipient_id_unavailable_reason">Reason</Label>
                                                            <Textarea
                                                                id="recipient_id_unavailable_reason"
                                                                value={data.recipient_id_unavailable_reason}
                                                                onChange={(event) => setData('recipient_id_unavailable_reason', event.target.value)}
                                                                placeholder="Explain why the assisted adult cannot provide a government ID."
                                                                rows={3}
                                                            />
                                                            {errors.recipient_id_unavailable_reason && (
                                                                <p className="text-xs font-medium text-red-500">
                                                                    {errors.recipient_id_unavailable_reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                )}

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
                                    <p className="text-center text-xs text-slate-500">Please upload all required documents to enable submission.</p>
                                )}
                                {!recipientIdentityReady && (
                                    <p className="text-center text-xs text-slate-500">
                                        Upload both sides of the assisted adult's ID, or provide the no-ID reason.
                                    </p>
                                )}
                                {effectiveFilingFor === 'family_member' && !representativeInfoComplete && (
                                    <p className="text-center text-xs text-slate-500">
                                        Please fill in the{isBurial ? " deceased person's" : " family member's"} information and your relationship to
                                        enable submission.
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
    value: 'self' | 'family_member';
    onChange: (value: 'self' | 'family_member') => void;
}

function WhoIsThisForSection({ isBurial, value, onChange }: WhoIsThisForProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold tracking-widest text-slate-800 uppercase">Who is this request for?</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Option: Myself */}
                <button
                    type="button"
                    disabled={isBurial}
                    onClick={() => !isBurial && onChange('self')}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                        isBurial
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
                            : value === 'self'
                              ? 'border-[#005088] bg-[#005088]/5 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${value === 'self' && !isBurial ? 'bg-[#005088]/10 text-[#005088]' : 'bg-slate-100 text-slate-400'}`}
                    >
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${value === 'self' && !isBurial ? 'text-[#005088]' : 'text-slate-700'}`}>Myself</p>
                        <p className="text-xs text-slate-500">{isBurial ? 'Not applicable for burial' : 'I need assistance for myself'}</p>
                    </div>
                    {/* Radio indicator */}
                    <div
                        className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                            !isBurial && value === 'self' ? 'border-[#005088] bg-[#005088]' : 'border-slate-300 bg-white'
                        }`}
                    />
                </button>

                {/* Option: A family member */}
                <button
                    type="button"
                    onClick={() => onChange('family_member')}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                        value === 'family_member'
                            ? 'border-[#005088] bg-[#005088]/5 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${value === 'family_member' ? 'bg-[#005088]/10 text-[#005088]' : 'bg-slate-100 text-slate-400'}`}
                    >
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${value === 'family_member' ? 'text-[#005088]' : 'text-slate-700'}`}>A family member</p>
                        <p className="text-xs text-slate-500">{isBurial ? 'Filing for a deceased member' : "I'm an authorized representative"}</p>
                    </div>
                    {/* Radio indicator */}
                    <div
                        className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                            value === 'family_member' ? 'border-[#005088] bg-[#005088]' : 'border-slate-300 bg-white'
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

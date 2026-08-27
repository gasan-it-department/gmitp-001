import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    AssistanceRequestFormDefinition,
    HouseholdMemberOption,
    PhysicalCopyRequirement,
    RelationshipOption,
} from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useOptimizedAssistanceDocuments } from '@/hooks/use-optimized-assistance-documents';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, ArrowLeft, FileText, HandCoins, Info, Loader2, Paperclip, User, UserCheck, Users } from 'lucide-react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { IdentityDocumentPair } from '../../../Client/Apply/Components/DocumentUploadsGrid';
import { OnBehalfOfData, OnBehalfOfSection, RelationshipType } from '../../../Client/Apply/Components/OnBehalfOfSection';
import { OnBehalfAffirmation } from './Components/OnBehalfAffirmation';

// ─── Types (mirror the controller props) ──────────────────────────────────────

interface DocumentSlot {
    id: string;
    key: string;
    name: string;
    description: string | null;
    examples: string | null;
    is_required: boolean;
    physical_copy_requirement: PhysicalCopyRequirement;
    physical_copy_requirement_label: string;
}

interface AssistanceTypeOption {
    id: string;
    slug: string;
    name: string;
    description: string;
    min_amount: number | null;
    max_amount: number | null;
    request_form: AssistanceRequestFormDefinition;
    documents: DocumentSlot[];
}

interface BeneficiaryData {
    id: string;
    beneficiary_number: string | null;
    full_name: string;
    sex_label: string | null;
    birth_date: string | null;
    age: number | null;
    civil_status_label: string | null;
    household: { barangay: string | null; street: string | null } | null;
    has_account: boolean;
    account_email: string | null;
}

// Mirrors EligibilityResult::toArray() — advisory only on the admin desk.
interface Eligibility {
    eligible: boolean;
    reason: 'on_cooldown' | 'permanent_block' | 'in_flight_request' | 'blacklisted' | 'identity_unverified' | 'dependent_unverified' | null;
    message: string;
    cooldown_ends_at: string | null;
}

interface Props {
    beneficiary: { data: BeneficiaryData } | BeneficiaryData;
    assistanceTypes: { data: AssistanceTypeOption[] };
    relationships: RelationshipOption[];
    householdMembers: { data: HouseholdMemberOption[] } | HouseholdMemberOption[];
    submitUrl: string;
    storeHouseholdMemberUrl: string;
    // Per-program eligibility for THIS beneficiary. Advisory only — the admin can
    // file despite a cooldown for a verified emergency (the override is audited).
    eligibilityByType?: Record<string, Eligibility>;
}

/**
 * The exact shape Inertia's useForm manages. Declared as a `type` (not an
 * interface) so it satisfies Inertia's `FormDataType = Record<string, …>`
 * constraint, and so `privacy_consent` widens to `boolean` instead of the
 * literal `false` inferred from the initial value.
 */
type RequestFormData = {
    beneficiary_id: string;
    assistance_type_id: string;
    description: string;
    privacy_consent: boolean;
    documents: Record<string, File | null>;
    verification_override_reason: string;
    relationship_to_beneficiary: RelationshipType;
    on_behalf_household_member_id: string;
    on_behalf_first_name: string;
    on_behalf_middle_name: string;
    on_behalf_last_name: string;
    on_behalf_suffix: string;
    on_behalf_date_of_death: string;
    recipient_id_unavailable: boolean;
    recipient_id_unavailable_reason: string;
};

/**
 * Admin: file an assistance request ON BEHALF of an existing beneficiary.
 *
 * Anchored to a verified beneficiary record — identity is shown READ-ONLY and
 * never re-typed (the whole reason the flow starts from a chosen beneficiary).
 * The admin only chooses the program, writes the request, optionally attaches
 * scans, and affirms RA 10173 consent. Posts to StoreAdminAssistanceRequest-
 * Controller, which reuses the same action as the online citizen flow.
 */
export default function CreateAssistanceRequest({
    beneficiary,
    assistanceTypes,
    relationships,
    householdMembers,
    submitUrl,
    storeHouseholdMemberUrl,
    eligibilityByType,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const profile: BeneficiaryData = 'data' in beneficiary ? beneficiary.data : beneficiary;
    const types = assistanceTypes.data;
    const initialMembers = 'data' in householdMembers ? householdMembers.data : householdMembers;
    const [householdRoster, setHouseholdRoster] = useState<HouseholdMemberOption[]>(initialMembers);
    const [pendingMemberMessage, setPendingMemberMessage] = useState<string | null>(null);
    const [filingFor, setFilingFor] = useState<'self' | 'family_member'>('self');

    const { data, setData, post, processing, errors, transform } = useForm<RequestFormData>({
        beneficiary_id: profile.id,
        assistance_type_id: '',
        description: '',
        privacy_consent: false,
        documents: {},
        verification_override_reason: '',
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

    const selectedType = data.assistance_type_id ? (types.find((t) => t.id === data.assistance_type_id) ?? null) : null;
    const isOnBehalfOnly = selectedType?.request_form.filing_mode === 'on_behalf_only';
    const isDeceasedRequest = selectedType?.request_form.subject_type === 'deceased';
    const requiresDateOfDeath = selectedType?.request_form.fields.some((field) => field.key === 'on_behalf_date_of_death' && field.required) ?? false;
    const effectiveFilingFor = isOnBehalfOnly ? 'family_member' : filingFor;
    const selectedFilerIdDocuments = selectedType?.documents.filter((document) => ['valid_id_front', 'valid_id_back'].includes(document.key)) ?? [];
    const selectedRecipientIdDocuments =
        selectedType?.documents.filter((document) => ['recipient_valid_id_front', 'recipient_valid_id_back'].includes(document.key)) ?? [];
    const selectedStandardDocuments =
        selectedType?.documents.filter(
            (document) => !['valid_id_front', 'valid_id_back', 'recipient_valid_id_front', 'recipient_valid_id_back'].includes(document.key),
        ) ?? [];

    // Advisory cooldown state for the chosen program (NOT a hard block — the
    // admin may override for an emergency; the override is recorded server-side).
    const selectedEligibility = selectedType ? eligibilityByType?.[selectedType.id] : undefined;
    const selectedBlocked = selectedEligibility ? !selectedEligibility.eligible : false;
    const selectedMember = householdRoster.find((member) => member.id === data.on_behalf_household_member_id) ?? null;
    const selectedMemberNeedsOverride =
        effectiveFilingFor === 'family_member' &&
        selectedMember !== null &&
        selectedMember.relationship !== 'head' &&
        !selectedMember.is_verified_dependent;
    const requiresVerificationOverride =
        selectedEligibility?.reason === 'identity_unverified' ||
        selectedEligibility?.reason === 'dependent_unverified' ||
        selectedMemberNeedsOverride;

    const recipientAge = selectedMember?.birth_date
        ? Math.floor((Date.now() - new Date(selectedMember.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
    const filerIdRequired = selectedFilerIdDocuments.some((document) => document.is_required);
    const recipientIdAutomaticallyExempt = isDeceasedRequest || (recipientAge !== null && recipientAge < 18);

    const onBehalfOfData: OnBehalfOfData = useMemo(
        () => ({
            household_member_id: data.on_behalf_household_member_id,
            first_name: data.on_behalf_first_name,
            middle_name: data.on_behalf_middle_name,
            last_name: data.on_behalf_last_name,
            suffix: data.on_behalf_suffix,
            date_of_death: data.on_behalf_date_of_death,
            relationship: data.relationship_to_beneficiary,
        }),
        [
            data.on_behalf_household_member_id,
            data.on_behalf_first_name,
            data.on_behalf_middle_name,
            data.on_behalf_last_name,
            data.on_behalf_suffix,
            data.on_behalf_date_of_death,
            data.relationship_to_beneficiary,
        ],
    );

    // Non-field server errors come back under their own keys.
    const fieldErrors = errors as Record<string, string | undefined>;
    const requestError = fieldErrors.request;

    const storePreparedDocument = useCallback(
        (key: string, file: File | null) => {
            setData((current) => ({
                ...current,
                documents: { ...current.documents, [key]: file },
            }));
        },
        [setData],
    );
    const {
        isPreparing: isPreparingDocuments,
        notices: documentPreparationNotices,
        prepareDocument: handleFileChange,
        preparingKeys: preparingDocumentKeys,
    } = useOptimizedAssistanceDocuments(storePreparedDocument);

    const handleFilingForChange = (value: 'self' | 'family_member') => {
        setFilingFor(value);

        if (value !== 'self') return;

        setData((current) => ({
            ...current,
            relationship_to_beneficiary: '',
            on_behalf_household_member_id: '',
            on_behalf_first_name: '',
            on_behalf_middle_name: '',
            on_behalf_last_name: '',
            on_behalf_suffix: '',
            on_behalf_date_of_death: '',
            recipient_id_unavailable: false,
            recipient_id_unavailable_reason: '',
            documents: {
                ...current.documents,
                recipient_valid_id_front: null,
                recipient_valid_id_back: null,
            },
        }));
    };

    const handleBehalfChange = <K extends keyof OnBehalfOfData>(field: K, value: OnBehalfOfData[K]) => {
        const keyMap: Record<keyof OnBehalfOfData, keyof RequestFormData> = {
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
                [keyMap[field]]: value,
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

        setData((current) => ({ ...current, [keyMap[field]]: value }));
    };

    const handleMemberCreated = (member: HouseholdMemberOption) => {
        setHouseholdRoster((current) => [...current, member]);
        setPendingMemberMessage(`${formatMemberName(member)} was added as pending household verification.`);
        setData((current) => ({
            ...current,
            on_behalf_household_member_id: member.id,
            on_behalf_first_name: member.first_name,
            on_behalf_middle_name: member.middle_name ?? '',
            on_behalf_last_name: member.last_name,
            on_behalf_suffix: member.suffix ?? '',
            relationship_to_beneficiary: member.relationship ?? '',
        }));
    };

    transform((form) => {
        const documents = Object.fromEntries(Object.entries(form.documents).filter((entry): entry is [string, File] => entry[1] instanceof File));

        if (effectiveFilingFor === 'self') {
            return {
                ...form,
                documents,
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

        return { ...form, documents };
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isPreparingDocuments) return;

        post(submitUrl, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
        });
    };

    const representativeInfoComplete =
        effectiveFilingFor === 'self' ||
        (data.on_behalf_household_member_id !== '' &&
            data.relationship_to_beneficiary !== '' &&
            (!requiresDateOfDeath || data.on_behalf_date_of_death !== ''));
    const selectedRelationship = relationships.find((relationship) => relationship.value === data.relationship_to_beneficiary);
    const applicantIsUnderAge = profile.age !== null && profile.age < 18;
    const legalAgeBlocked = effectiveFilingFor === 'family_member' && Boolean(selectedRelationship?.requires_legal_age) && applicantIsUnderAge;

    const canSubmit =
        data.assistance_type_id.length > 0 &&
        data.description.trim().length >= 10 &&
        data.privacy_consent &&
        representativeInfoComplete &&
        !legalAgeBlocked &&
        (!data.recipient_id_unavailable || data.recipient_id_unavailable_reason.trim().length >= 10) &&
        (!requiresVerificationOverride || data.verification_override_reason.trim().length >= 10) &&
        !isPreparingDocuments &&
        !processing;

    const profileUrl = ShowBeneficiaryProfileController.url({
        municipality: currentMunicipality.slug,
        beneficiaryId: profile.id,
    });

    const address = [profile.household?.street, profile.household?.barangay].filter(Boolean).join(', ') || '—';

    return (
        <AdminLayout>
            <Head title={`File assistance — ${profile.full_name}`} />
            <div className="bg-slate-50 pb-24">
                {/* Back nav */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-3xl px-6 py-4">
                        <Link
                            href={profileUrl}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Bumalik sa profile ng benepisyaryo
                        </Link>
                    </div>
                </div>

                <div className="container mx-auto mt-8 max-w-3xl px-6">
                    {/* Header */}
                    <div className="mb-8 flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                            <HandCoins className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Mag-file ng Request para sa Tulong</h1>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Nagtatala ng request na ito para sa benepisyaryo sa ibaba. Ang kanilang pagkakakilanlan ay kinuha mula sa verified
                                registry record — tanging ang mga detalye ng request ang ilalagay dito.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ── Read-only beneficiary identity ── */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <User className="h-4 w-4 text-[#005088]" /> Benepisyaryo
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="text-lg font-bold text-slate-900 capitalize">{profile.full_name.toLowerCase()}</span>
                                {profile.beneficiary_number && (
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-slate-600">
                                        {profile.beneficiary_number}
                                    </span>
                                )}
                                {!profile.has_account && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Walk-in</span>
                                )}
                            </div>
                            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                                <ReadOnly label="Kasarian" value={profile.sex_label ?? '—'} />
                                <ReadOnly label="Edad" value={profile.age !== null ? `${profile.age} taon` : '—'} />
                                <ReadOnly label="Katayuang Sibil" value={profile.civil_status_label ?? '—'} />
                                <ReadOnly label="Tirahan" value={address} className="col-span-2 sm:col-span-3" capitalize />
                            </dl>
                            <input type="hidden" name="beneficiary_id" value={data.beneficiary_id} />
                        </section>

                        <AdminWhoIsThisForSection
                            isOnBehalfOnly={isOnBehalfOnly}
                            isDeceasedRequest={isDeceasedRequest}
                            value={effectiveFilingFor}
                            onChange={handleFilingForChange}
                        />

                        {effectiveFilingFor === 'family_member' && (
                            <>
                                {pendingMemberMessage && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                        {pendingMemberMessage} Enter a verification override reason to file before MSWD roster verification.
                                    </div>
                                )}
                                <OnBehalfOfSection
                                    data={onBehalfOfData}
                                    onChange={handleBehalfChange}
                                    relationships={relationships}
                                    isDeceasedRequest={isDeceasedRequest}
                                    requiresDateOfDeath={requiresDateOfDeath}
                                    applicantBirthDate={profile.birth_date}
                                    householdMembers={householdRoster}
                                    storeHouseholdMemberUrl={storeHouseholdMemberUrl}
                                    municipalitySlug={currentMunicipality.slug}
                                    onMemberCreated={handleMemberCreated}
                                    audience="admin"
                                    errors={fieldErrors}
                                />
                            </>
                        )}

                        {/* ── Request details ── */}
                        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <FileText className="h-4 w-4 text-[#005088]" /> Mga Detalye ng Request
                            </div>

                            {/* Assistance type */}
                            <div className="space-y-2">
                                <Label>
                                    Uri ng Tulong <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.assistance_type_id} onValueChange={(value) => setData('assistance_type_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pumili ng programa para sa tulong" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedType?.description && <p className="text-xs text-slate-500">{selectedType.description}</p>}
                                {errors.assistance_type_id && <p className="text-xs text-red-500">{errors.assistance_type_id}</p>}
                            </div>

                            {/* Cooldown advisory — non-blocking. The admin may proceed for a
                                verified emergency; the override is recorded in the audit trail. */}
                            {selectedBlocked && selectedEligibility && (
                                <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div>
                                        <p className="font-semibold">{advisoryText(selectedEligibility)}</p>
                                        <p className="mt-0.5 text-amber-700">
                                            Magpatuloy lamang para sa kumpirmadong emergency — ang pag-override na ito ay itatala sa audit trail.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {requiresVerificationOverride && (
                                <div className="space-y-2">
                                    <Label>
                                        Dahilan ng verification override <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        rows={3}
                                        value={data.verification_override_reason}
                                        onChange={(e) => setData('verification_override_reason', e.target.value)}
                                        placeholder="Ipaliwanag ang apurahang dahilan ng pag-file bago makumpleto ang verification."
                                    />
                                    {errors.verification_override_reason && (
                                        <p className="text-xs text-red-500">{errors.verification_override_reason}</p>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>
                                    Ano ang hinihinging tulong / sitwasyon <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    rows={4}
                                    placeholder="Ilarawan ang tulong na hinihingi ng benepisyaryo at ang kanilang sitwasyon…"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>

                            {/* Document slots (appear once a type is chosen) */}
                            {selectedType && selectedType.documents.length > 0 && (
                                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                                    <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-blue-900">
                                        <Paperclip className="h-4 w-4" /> Mga sumusuportang dokumento
                                    </h4>
                                    <p className="mb-4 text-xs text-blue-800/80">
                                        Opsyonal habang ine-encode ang request. Ilakip ngayon kung na-inspect na ng MSWD, o i-upload mamaya bago
                                        aprubahan ang request.
                                    </p>
                                    {isPreparingDocuments && (
                                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-800">
                                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                            Inihahanda at pinapaliit ang mga larawan bago i-upload...
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        {selectedFilerIdDocuments.length > 0 && (
                                            <IdentityDocumentPair
                                                title="Filer's valid government ID"
                                                description="Attach the front and back when available. Both sides are required before approval when this program requires ID evidence."
                                                documents={selectedFilerIdDocuments}
                                                files={data.documents}
                                                onFileChange={handleFileChange}
                                                errors={fieldErrors}
                                                required={false}
                                                preparingKeys={preparingDocumentKeys}
                                                preparationNotices={documentPreparationNotices}
                                            />
                                        )}

                                        {effectiveFilingFor === 'family_member' && filerIdRequired && (
                                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                {recipientIdAutomaticallyExempt ? (
                                                    <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                                                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                                        <p className="text-sm leading-relaxed text-blue-800">
                                                            {isDeceasedRequest
                                                                ? "The deceased person's ID is not required."
                                                                : 'The assisted person is under 18, so their government ID is not required.'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {!data.recipient_id_unavailable && selectedRecipientIdDocuments.length > 0 && (
                                                            <IdentityDocumentPair
                                                                title="Assisted person's valid government ID"
                                                                description="Attach both sides when available. Approval will remain blocked until the ID or an accepted exception is recorded."
                                                                documents={selectedRecipientIdDocuments}
                                                                files={data.documents}
                                                                onFileChange={handleFileChange}
                                                                errors={fieldErrors}
                                                                required={false}
                                                                preparingKeys={preparingDocumentKeys}
                                                                preparationNotices={documentPreparationNotices}
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
                                                                <Label
                                                                    htmlFor="recipient_id_unavailable"
                                                                    className="text-sm leading-relaxed text-slate-700"
                                                                >
                                                                    Walang maipapakitang government ID ang taong tinutulungan
                                                                </Label>
                                                            </div>

                                                            {data.recipient_id_unavailable && (
                                                                <div className="mt-4 space-y-2">
                                                                    <Label htmlFor="recipient_id_unavailable_reason">Dahilan</Label>
                                                                    <Textarea
                                                                        id="recipient_id_unavailable_reason"
                                                                        value={data.recipient_id_unavailable_reason}
                                                                        onChange={(event) =>
                                                                            setData('recipient_id_unavailable_reason', event.target.value)
                                                                        }
                                                                        placeholder="Ipaliwanag kung bakit walang maipakitang ID ang taong tinutulungan."
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
                                            </div>
                                        )}

                                        {selectedStandardDocuments.map((doc) => (
                                            <div key={doc.key} className="space-y-1.5">
                                                <Label className="text-sm">
                                                    {doc.name}
                                                    {doc.is_required && (
                                                        <span className="ml-1 text-[10px] font-medium text-amber-600">
                                                            (Required before approval)
                                                        </span>
                                                    )}
                                                </Label>
                                                {doc.description && <p className="text-xs text-slate-500">{doc.description}</p>}
                                                {doc.physical_copy_requirement !== 'unspecified' && (
                                                    <p className="text-xs font-medium text-blue-700">
                                                        Physical copy: {doc.physical_copy_requirement_label}
                                                    </p>
                                                )}
                                                <Input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    disabled={preparingDocumentKeys.has(doc.key)}
                                                    className="cursor-pointer bg-white file:font-medium file:text-blue-600"
                                                    onChange={(e) => void handleFileChange(doc.key, e.target.files?.[0] ?? null)}
                                                />
                                                {preparingDocumentKeys.has(doc.key) && (
                                                    <p className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing image...
                                                    </p>
                                                )}
                                                {!preparingDocumentKeys.has(doc.key) && documentPreparationNotices[doc.key] && (
                                                    <p
                                                        className={`text-xs font-medium ${
                                                            documentPreparationNotices[doc.key]?.tone === 'warning'
                                                                ? 'text-amber-700'
                                                                : 'text-emerald-700'
                                                        }`}
                                                    >
                                                        {documentPreparationNotices[doc.key]?.message}
                                                    </p>
                                                )}
                                                {fieldErrors[`documents.${doc.key}`] && (
                                                    <p className="text-xs text-red-500">{fieldErrors[`documents.${doc.key}`]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ── On-behalf affirmation ── */}
                        <OnBehalfAffirmation
                            checked={data.privacy_consent}
                            onCheckedChange={(value) => setData('privacy_consent', value)}
                            error={errors.privacy_consent}
                            beneficiaryName={profile.full_name}
                        />

                        {/* Non-field server error */}
                        {requestError && (
                            <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {requestError}
                            </p>
                        )}

                        {effectiveFilingFor === 'family_member' && !representativeInfoComplete && (
                            <p className="text-center text-xs text-slate-500">
                                Piliin ang miyembro ng pamilya na makakatanggap ng tulong bago mag-submit.
                            </p>
                        )}
                        {legalAgeBlocked && (
                            <p className="text-center text-xs text-red-600">
                                Hindi maaaring maging kinatawan ang benepisyaryong ito para sa relasyong ito kung siya ay wala pang 18 taong gulang.
                            </p>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={!canSubmit}
                            className="h-14 w-full rounded-2xl bg-slate-900 text-base font-bold tracking-wide text-white uppercase shadow-lg transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
                        >
                            {isPreparingDocuments ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Inihahanda ang mga larawan...
                                </>
                            ) : processing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Nagsa-submit…
                                </>
                            ) : (
                                'I-submit ang Request'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

function AdminWhoIsThisForSection({
    isOnBehalfOnly,
    isDeceasedRequest,
    value,
    onChange,
}: {
    isOnBehalfOnly: boolean;
    isDeceasedRequest: boolean;
    value: 'self' | 'family_member';
    onChange: (value: 'self' | 'family_member') => void;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold tracking-widest text-slate-800 uppercase">Sino ang makakatanggap ng tulong?</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    disabled={isOnBehalfOnly}
                    onClick={() => !isOnBehalfOnly && onChange('self')}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                        isOnBehalfOnly
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
                            : value === 'self'
                              ? 'border-[#005088] bg-[#005088]/5'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            value === 'self' && !isOnBehalfOnly ? 'bg-[#005088]/10 text-[#005088]' : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        <UserCheck className="h-5 w-5" />
                    </span>
                    <span>
                        <span className="block text-sm font-bold text-slate-800">Piling benepisyaryo</span>
                        <span className="block text-xs text-slate-500">Ang benepisyaryo ay nagpa-file para sa kanyang sarili</span>
                    </span>
                    <span
                        aria-hidden="true"
                        className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 ${
                            value === 'self' && !isOnBehalfOnly ? 'border-[#005088] bg-[#005088]' : 'border-slate-300 bg-white'
                        }`}
                    />
                </button>

                <button
                    type="button"
                    onClick={() => onChange('family_member')}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                        value === 'family_member' ? 'border-[#005088] bg-[#005088]/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            value === 'family_member' ? 'bg-[#005088]/10 text-[#005088]' : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        <Users className="h-5 w-5" />
                    </span>
                    <span>
                        <span className="block text-sm font-bold text-slate-800">Miyembro ng pamilya</span>
                        <span className="block text-xs text-slate-500">
                            {isDeceasedRequest ? 'Kailangan para sa namatay na tao' : 'Ang benepisyaryo ay nagpa-file bilang kinatawan'}
                        </span>
                    </span>
                    <span
                        aria-hidden="true"
                        className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 ${
                            value === 'family_member' ? 'border-[#005088] bg-[#005088]' : 'border-slate-300 bg-white'
                        }`}
                    />
                </button>
            </div>
        </section>
    );
}

function formatMemberName(member: HouseholdMemberOption): string {
    return [member.first_name, member.middle_name, member.last_name, member.suffix].filter(Boolean).join(' ');
}

// Professional, admin-facing phrasing for the cooldown advisory (the citizen
// "you…" copy in EligibilityResult is reused for the portal, not here).
function advisoryText(e: Eligibility): string {
    const date = e.cooldown_ends_at
        ? new Date(e.cooldown_ends_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
        : null;

    if (e.reason === 'on_cooldown') {
        return `This beneficiary is on cooldown for this program${date ? ` until ${date}` : ''}.`;
    }
    if (e.reason === 'in_flight_request') {
        return 'This beneficiary already has a request being processed for this program.';
    }
    if (e.reason === 'permanent_block') {
        return 'This beneficiary has already received this one-time assistance.';
    }
    if (e.reason === 'identity_unverified') {
        return 'This claimant has not completed MSWD identity verification.';
    }
    if (e.reason === 'dependent_unverified') {
        return 'The selected dependent has not completed MSWD roster verification.';
    }
    return 'This beneficiary may not be eligible for this program right now.';
}

function ReadOnly({ label, value, className = '', capitalize = false }: { label: string; value: string; className?: string; capitalize?: boolean }) {
    return (
        <div className={className}>
            <dt className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</dt>
            <dd className={`mt-0.5 font-semibold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
        </div>
    );
}

import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, ArrowLeft, FileText, HandCoins, Loader2, Paperclip, User } from 'lucide-react';
import { FormEvent } from 'react';
import { OnBehalfAffirmation } from './Components/OnBehalfAffirmation';

// ─── Types (mirror the controller props) ──────────────────────────────────────

interface DocumentSlot {
    id: string;
    key: string;
    name: string;
    description: string | null;
    examples: string | null;
    is_required: boolean;
}

interface AssistanceTypeOption {
    id: string;
    name: string;
    description: string;
    min_amount: number | null;
    max_amount: number | null;
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
    submitUrl: string;
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
export default function CreateAssistanceRequest({ beneficiary, assistanceTypes, submitUrl, eligibilityByType }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const profile: BeneficiaryData = 'data' in beneficiary ? beneficiary.data : beneficiary;
    const types = assistanceTypes.data;

    const { data, setData, post, processing, errors } = useForm<RequestFormData>({
        beneficiary_id: profile.id,
        assistance_type_id: '',
        description: '',
        privacy_consent: false,
        documents: {},
        verification_override_reason: '',
    });

    const selectedType = data.assistance_type_id ? (types.find((t) => t.id === data.assistance_type_id) ?? null) : null;

    // Advisory cooldown state for the chosen program (NOT a hard block — the
    // admin may override for an emergency; the override is recorded server-side).
    const selectedEligibility = selectedType ? eligibilityByType?.[selectedType.id] : undefined;
    const selectedBlocked = selectedEligibility ? !selectedEligibility.eligible : false;
    const requiresVerificationOverride =
        selectedEligibility?.reason === 'identity_unverified' || selectedEligibility?.reason === 'dependent_unverified';

    // Non-field server errors come back under their own keys.
    const fieldErrors = errors as Record<string, string | undefined>;
    const requestError = fieldErrors.request;

    const handleFileChange = (key: string, file: File | null) => {
        setData('documents', { ...data.documents, [key]: file });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(submitUrl, {
            forceFormData: true,
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
        });
    };

    const canSubmit =
        data.assistance_type_id.length > 0 &&
        data.description.trim().length >= 10 &&
        data.privacy_consent &&
        (!requiresVerificationOverride || data.verification_override_reason.trim().length >= 10) &&
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
                            Back to beneficiary profile
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
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">File an Assistance Request</h1>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Recording this request on behalf of the beneficiary below. Their identity is taken from the verified registry record —
                                only the request details are entered here.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ── Read-only beneficiary identity ── */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <User className="h-4 w-4 text-[#005088]" /> Beneficiary
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
                                <ReadOnly label="Sex" value={profile.sex_label ?? '—'} />
                                <ReadOnly label="Age" value={profile.age !== null ? `${profile.age} yrs` : '—'} />
                                <ReadOnly label="Civil status" value={profile.civil_status_label ?? '—'} />
                                <ReadOnly label="Address" value={address} className="col-span-2 sm:col-span-3" capitalize />
                            </dl>
                            <input type="hidden" name="beneficiary_id" value={data.beneficiary_id} />
                        </section>

                        {/* ── Request details ── */}
                        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <FileText className="h-4 w-4 text-[#005088]" /> Request Details
                            </div>

                            {/* Assistance type */}
                            <div className="space-y-2">
                                <Label>
                                    Type of Assistance <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.assistance_type_id} onValueChange={(value) => setData('assistance_type_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an assistance program" />
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
                                            Proceed only for a verified emergency — this override will be recorded in the audit trail.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {requiresVerificationOverride && (
                                <div className="space-y-2">
                                    <Label>
                                        Verification override reason <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        rows={3}
                                        value={data.verification_override_reason}
                                        onChange={(e) => setData('verification_override_reason', e.target.value)}
                                        placeholder="Explain the urgent reason for filing before verification is complete."
                                    />
                                    {errors.verification_override_reason && (
                                        <p className="text-xs text-red-500">{errors.verification_override_reason}</p>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>
                                    What is being requested / situation <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    rows={4}
                                    placeholder="Describe the assistance the beneficiary is asking for and their situation…"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>

                            {/* Document slots (appear once a type is chosen) */}
                            {selectedType && selectedType.documents.length > 0 && (
                                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                                    <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-blue-900">
                                        <Paperclip className="h-4 w-4" /> Supporting documents
                                    </h4>
                                    <p className="mb-4 text-xs text-blue-800/80">
                                        Optional — attach scans if available. You may also verify physical originals at the desk and attach later.
                                    </p>
                                    <div className="space-y-4">
                                        {selectedType.documents.map((doc) => (
                                            <div key={doc.key} className="space-y-1.5">
                                                <Label className="text-sm">
                                                    {doc.name}
                                                    {doc.is_required && (
                                                        <span className="ml-1 text-[10px] font-medium text-amber-600">(usually required)</span>
                                                    )}
                                                </Label>
                                                {doc.description && <p className="text-xs text-slate-500">{doc.description}</p>}
                                                <Input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    className="cursor-pointer bg-white file:font-medium file:text-blue-600"
                                                    onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] ?? null)}
                                                />
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

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={!canSubmit}
                            className="h-14 w-full rounded-2xl bg-slate-900 text-base font-bold tracking-wide text-white uppercase shadow-lg transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting…
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
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

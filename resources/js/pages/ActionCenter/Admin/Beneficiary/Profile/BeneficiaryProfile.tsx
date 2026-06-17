import EditBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/EditBeneficiaryProfileController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import ShowBeneficiarySearchController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiarySearchController';
import CreateAssistanceRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/CreateAssistanceRequestController';
import DownloadBeneficiaryIdentityDocumentSheetController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/DownloadBeneficiaryIdentityDocumentSheetController';
import DownloadBeneficiaryIntakeSheetController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/DownloadBeneficiaryIntakeSheetController';
import { CrossMunicipalityWarning, type CrossMunicipalityMatch } from '@/components/Shared/CrossMunicipalityWarning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import Utility from '@/pages/Utility/Utility';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BadgeCheck,
    Check,
    Clock3,
    Copy,
    Download,
    GitMerge,
    HandCoins,
    Home,
    IdCard,
    Link2,
    Mail,
    MapPin,
    OctagonX,
    Pencil,
    User,
    Users,
    Eye,
    Plus,
    Printer,
    FileUp,
} from 'lucide-react';
import { useState } from 'react';
import type { EnumOption, ReligionOption } from '../../../Client/Apply/Beneficiary/types';
import AssistanceHistoryList, { type AssistanceHistoryRow } from './Components/AssistanceHistoryList';
import AvatarUploader from './Components/AvatarUploader';
import type { HouseholdHeadState } from './Components/ChangeHouseholdHeadDialog';
import HouseholdMembersManager from './Components/HouseholdMembersManager';
import { type HouseholdMemberRow } from './Components/HouseholdMembersTable';
import IntakeReviewPanel, { type HouseholdMatch, type IdentityDocuments } from './Components/IntakeReviewPanel';
import LinkAccountDialog from './Components/LinkAccountDialog';
import { type RelationshipOption } from './Components/MemberFormDialog';
import MergeDuplicateDialog from './Components/MergeDuplicateDialog';
import ReassignHouseholdDialog from './Components/ReassignHouseholdDialog';
import ReplaceIdentityDocumentDialog from './Components/ReplaceIdentityDocumentDialog';

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror BeneficiaryProfileResource + the controller props
// ─────────────────────────────────────────────────────────────────────────────

interface BeneficiaryProfileData {
    id: string;
    beneficiary_number: string | null;
    avatar_url: string | null;
    identity_documents: IdentityDocuments;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string | null;
    sex_label: string | null;
    birth_date: string | null;
    age: number | null;
    educational_attainment: string | null;
    educational_attainment_label: string | null;
    religion: string | null;
    civil_status: string | null;
    civil_status_label: string | null;
    occupation: string | null;
    monthly_income: number | null;
    household: { id: string; household_code: string | null; barangay: string | null; street: string | null } | null;
    has_account: boolean;
    account_email: string | null;
    account_phone: string | null;
    terms_consented_at: string | null;
    registered_at: string | null;
    identity_verified: boolean;
    identity_verified_at: string | null;
    identity_verified_by: string | null;
    intake_status: 'pending' | 'verified' | 'rejected';
    intake_rejected_at: string | null;
    intake_rejected_by: string | null;
    intake_rejection_reason: string | null;
    is_active: boolean;
    household_verified: boolean;
}

interface Summary {
    total_requests: number;
    released_count: number;
    total_released_amount: number;
    active_member_count: number;
}

interface MergeRef {
    id: string;
    beneficiary_number: string | null;
    full_name: string;
}

interface MergeInfo {
    /** This record was merged away into another (read-only). */
    is_merged_duplicate: boolean;
    /** The canonical this record was merged into, when is_merged_duplicate. */
    merged_into: MergeRef | null;
    /** Duplicates that were merged INTO this (canonical) record. */
    merged_duplicates: MergeRef[];
}

interface Props {
    beneficiary: { data: BeneficiaryProfileData } | BeneficiaryProfileData;
    householdMembers: { data: HouseholdMemberRow[] };
    assistanceHistory: { data: AssistanceHistoryRow[] };
    householdTotalIncome: number;
    crossMunicipalityMatches: { data: CrossMunicipalityMatch[] };
    householdMatches: HouseholdMatch[];
    merge: MergeInfo;
    summary: Summary;
    religions: ReligionOption[];
    civilStatus: EnumOption[];
    educationalAttainment: EnumOption[];
    relationships: RelationshipOption[];
    householdHead: HouseholdHeadState;
    headDispositions: EnumOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BeneficiaryProfile({
    beneficiary,
    householdMembers,
    assistanceHistory,
    householdTotalIncome,
    crossMunicipalityMatches,
    householdMatches,
    merge,
    summary,
    religions,
    civilStatus,
    educationalAttainment,
    relationships,
    householdHead,
    headDispositions,
}: Props) {
    console.log(beneficiary);
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const utils = Utility();

    const profile: BeneficiaryProfileData = 'data' in beneficiary ? beneficiary.data : beneficiary;
    const members = householdMembers.data;
    const history = assistanceHistory.data;
    const crossMatches = crossMunicipalityMatches?.data ?? [];

    const [linkOpen, setLinkOpen] = useState(false);
    const [avatarUploadOpen, setAvatarUploadOpen] = useState(false);
    const [reassignOpen, setReassignOpen] = useState(false);
    const [mergeOpen, setMergeOpen] = useState(false);

    const address = [profile.household?.street, profile.household?.barangay].filter(Boolean).join(', ') || '—';

    return (
        <AdminLayout>
            <div className="bg-slate-50 pb-12">
                {/* Back navigation */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
                        <Link
                            href={ShowBeneficiarySearchController.url({ municipality: currentMunicipality.slug })}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Beneficiary Search
                        </Link>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Secondary action: correct a mistake on this record (admin-only) */}
                            <Link
                                href={EditBeneficiaryProfileController.url({
                                    municipality: currentMunicipality.slug,
                                    beneficiaryId: profile.id,
                                })}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit profile
                            </Link>

                            <button
                                type="button"
                                onClick={() => setReassignOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Home className="h-4 w-4" />
                                Change beneficiary residence
                            </button>

                            {/* Identity reconciliation: mark this record as a duplicate of
                                another. Hidden once it's already been merged away. */}
                            {!merge.is_merged_duplicate && (
                                <button
                                    type="button"
                                    onClick={() => setMergeOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                                >
                                    <GitMerge className="h-4 w-4" />
                                    Mark as duplicate
                                </button>
                            )}

                            {/* Primary action: file an assistance request for this person */}
                            {profile.is_active && profile.household_verified ? (
                                <Link
                                    href={CreateAssistanceRequestController.url({
                                        municipality: currentMunicipality.slug,
                                        beneficiaryId: profile.id,
                                    })}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                                >
                                    <HandCoins className="h-4 w-4" />
                                    File assistance request
                                </Link>
                            ) : (
                                <span
                                    title={!profile.is_active ? 'Beneficiary record is inactive' : 'Household has no verified active head'}
                                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                                >
                                    <HandCoins className="h-4 w-4" />
                                    Assistance on hold
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Header strip */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-6 py-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <AvatarUploader
                                    beneficiaryId={profile.id}
                                    avatarUrl={profile.avatar_url}
                                    fullName={profile.full_name}
                                    sizeClass="h-16 w-16"
                                />
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">{profile.full_name}</h1>
                                        {profile.beneficiary_number && (
                                            <CopyableBadge
                                                text={profile.beneficiary_number}
                                                className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-slate-600 hover:bg-slate-200"
                                            />
                                        )}
                                        {profile.has_account ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                <BadgeCheck className="h-3.5 w-3.5" /> Has account
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                Walk-in
                                            </span>
                                        )}
                                        {profile.intake_status === 'verified' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                <BadgeCheck className="h-3.5 w-3.5" /> Identity verified
                                            </span>
                                        ) : profile.intake_status === 'rejected' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                                                <OctagonX className="h-3.5 w-3.5" /> Intake rejected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                <Clock3 className="h-3.5 w-3.5" /> Pending intake
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {[profile.sex_label, profile.age !== null ? `${profile.age} yrs` : null, profile.civil_status_label]
                                            .filter(Boolean)
                                            .join(' • ') || '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Summary stats */}
                            <div className="flex flex-wrap gap-3">
                                <Stat label="Total Requests" value={String(summary.total_requests)} />
                                <Stat label="Released" value={String(summary.released_count)} />
                                <Stat label="Total Received" value={utils.formatCurrency(summary.total_released_amount)} highlight />
                                <Stat label="Household Size" value={String(summary.active_member_count)} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* This record was merged into a canonical — read-only notice */}
                {merge.is_merged_duplicate && merge.merged_into && (
                    <div className="container mx-auto max-w-7xl px-6 pt-6">
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <GitMerge className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                            <div className="text-sm text-amber-900">
                                <p className="font-semibold">This record was merged into a canonical beneficiary.</p>
                                <p className="mt-0.5 text-amber-800">
                                    Eligibility and history are now managed on{' '}
                                    <Link
                                        href={ShowBeneficiaryProfileController.url({
                                            municipality: currentMunicipality.slug,
                                            beneficiaryId: merge.merged_into.id,
                                        })}
                                        className="font-semibold underline underline-offset-2 hover:text-amber-950"
                                    >
                                        {merge.merged_into.beneficiary_number ?? merge.merged_into.full_name}
                                    </Link>
                                    . This profile is kept for the record.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cross-municipality double-dip advisory */}
                {crossMatches.length > 0 && (
                    <div className="container mx-auto max-w-7xl px-6 pt-6">
                        <CrossMunicipalityWarning matches={crossMatches} context="profile" />
                    </div>
                )}

                {/* Main grid */}
                <div className="container mx-auto max-w-7xl px-6 py-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Left column */}
                        <div className="space-y-6 lg:col-span-8">
                            <IntakeReviewPanel
                                beneficiaryId={profile.id}
                                identityVerified={profile.identity_verified}
                                verifiedAt={profile.identity_verified_at}
                                verifiedBy={profile.identity_verified_by}
                                intakeStatus={profile.intake_status}
                                canRejectIntake={profile.has_account}
                                rejectedAt={profile.intake_rejected_at}
                                rejectedBy={profile.intake_rejected_by}
                                rejectionReason={profile.intake_rejection_reason}
                                identityDocuments={profile.identity_documents}
                                members={members}
                                householdMatches={householdMatches ?? []}
                            />

                            {/* Identity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4 text-slate-600" /> Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Field label="Full name" value={profile.full_name || '—'} capitalize />
                                        <Field label="Sex" value={profile.sex_label ?? '—'} />
                                        <Field
                                            label="Date of birth"
                                            value={utils.formatToReadableDateNoTime(profile.birth_date ?? undefined)}
                                            sub={profile.age !== null ? `Age ${profile.age}` : undefined}
                                        />
                                        <Field label="Civil status" value={profile.civil_status_label ?? '—'} />
                                        <Field label="Educational attainment" value={profile.educational_attainment_label ?? '—'} capitalize />
                                        <Field label="Religion" value={profile.religion ?? '—'} capitalize />
                                        <Field label="Occupation" value={profile.occupation ?? '—'} capitalize />
                                        <Field
                                            label="Personal monthly income"
                                            value={profile.monthly_income !== null ? utils.formatCurrency(profile.monthly_income) : '—'}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Household */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Users className="h-4 w-4 text-slate-600" /> Household Composition
                                        </CardTitle>
                                        {profile.household?.household_code && (
                                            <CopyableBadge
                                                text={profile.household.household_code}
                                                className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-slate-700 hover:bg-slate-200"
                                            />
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400">{summary.active_member_count} active members</span>
                                </CardHeader>
                                <CardContent>
                                    <HouseholdMembersManager
                                        members={members}
                                        totalIncome={householdTotalIncome}
                                        beneficiaryId={profile.id}
                                        religions={religions}
                                        civilStatus={civilStatus}
                                        educationalAttainment={educationalAttainment}
                                        relationships={relationships}
                                        householdId={profile.household!.id}
                                        headState={householdHead}
                                        headDispositions={headDispositions}
                                    />
                                </CardContent>
                            </Card>

                            {/* Assistance history */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <HandCoins className="h-4 w-4 text-slate-600" /> Assistance History (all programs)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AssistanceHistoryList history={history} municipalitySlug={currentMunicipality.slug} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right column */}
                        <div className="space-y-6 lg:col-span-4">
                            {/* Contact / address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Home className="h-4 w-4 text-slate-600" /> Address & Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Address</p>
                                            <p className="text-sm text-slate-800 capitalize">{address}</p>
                                            {profile.household?.household_code && (
                                                <p className="mt-0.5 text-[11px] text-slate-400">HH #{profile.household.household_code}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Account</p>
                                            <p className="text-sm text-slate-800">
                                                {profile.has_account
                                                    ? profile.account_email || profile.account_phone || 'Portal Account'
                                                    : 'Walk-in (no portal account)'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setLinkOpen(true)}
                                                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                                            >
                                                <Link2 className="h-3.5 w-3.5" />
                                                {profile.has_account ? 'Change linked account' : 'Link a portal account'}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Documents</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Generated</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <a
                                                href={DownloadBeneficiaryIntakeSheetController.url({
                                                    municipality: currentMunicipality.slug,
                                                    beneficiaryId: profile.id,
                                                })}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 transition hover:border-[#005088] hover:bg-white hover:text-[#005088] hover:shadow-sm"
                                            >
                                                <Download className="h-5 w-5" />
                                                <span className="text-center text-xs">Intake Sheet</span>
                                            </a>
                                            <a
                                                href={DownloadBeneficiaryIdentityDocumentSheetController.url({
                                                    municipality: currentMunicipality.slug,
                                                    beneficiaryId: profile.id,
                                                })}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 transition hover:border-[#005088] hover:bg-white hover:text-[#005088] hover:shadow-sm"
                                            >
                                                <Printer className="h-5 w-5" />
                                                <span className="text-center text-xs">ID Sheet</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-slate-100 pt-6">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Uploaded Identity</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Front ID Card */}
                                            <div className="group relative flex h-24 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                                {profile.identity_documents?.front ? (
                                                    <>
                                                        <img
                                                            src={profile.identity_documents.front}
                                                            alt="Front ID"
                                                            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-110 group-hover:opacity-100"
                                                        />
                                                        <div className="absolute inset-0 bg-slate-900/10" />
                                                        <div className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
                                                            FRONT
                                                        </div>

                                                        {/* Hover Actions */}
                                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                                                            <a
                                                                href={profile.identity_documents.front}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-full bg-white p-2 text-slate-900 transition hover:bg-slate-100 hover:text-[#005088] hover:shadow-lg"
                                                                title="View Full Size"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </a>
                                                            <ReplaceIdentityDocumentDialog
                                                                beneficiaryId={profile.id}
                                                                side="front"
                                                                isVerified={profile.identity_verified}
                                                                hasDocument={true}
                                                                trigger={
                                                                    <button
                                                                        type="button"
                                                                        className="rounded-full bg-white p-2 text-slate-900 transition hover:bg-slate-100 hover:text-[#005088] hover:shadow-lg"
                                                                        title="Replace Photo"
                                                                    >
                                                                        <FileUp className="h-4 w-4" />
                                                                    </button>
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <p className="text-[10px] font-bold tracking-widest text-slate-400">FRONT ID</p>
                                                        <ReplaceIdentityDocumentDialog
                                                            beneficiaryId={profile.id}
                                                            side="front"
                                                            isVerified={profile.identity_verified}
                                                            hasDocument={false}
                                                            trigger={
                                                                <button
                                                                    type="button"
                                                                    className="rounded-full bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-[#005088] hover:ring-[#005088]"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </button>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Back ID Card */}
                                            <div className="group relative flex h-24 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                                {profile.identity_documents?.back ? (
                                                    <>
                                                        <img
                                                            src={profile.identity_documents.back}
                                                            alt="Back ID"
                                                            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-110 group-hover:opacity-100"
                                                        />
                                                        <div className="absolute inset-0 bg-slate-900/10" />
                                                        <div className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
                                                            BACK
                                                        </div>

                                                        {/* Hover Actions */}
                                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                                                            <a
                                                                href={profile.identity_documents.back}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-full bg-white p-2 text-slate-900 transition hover:bg-slate-100 hover:text-[#005088] hover:shadow-lg"
                                                                title="View Full Size"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </a>
                                                            <ReplaceIdentityDocumentDialog
                                                                beneficiaryId={profile.id}
                                                                side="back"
                                                                isVerified={profile.identity_verified}
                                                                hasDocument={true}
                                                                trigger={
                                                                    <button
                                                                        type="button"
                                                                        className="rounded-full bg-white p-2 text-slate-900 transition hover:bg-slate-100 hover:text-[#005088] hover:shadow-lg"
                                                                        title="Replace Photo"
                                                                    >
                                                                        <FileUp className="h-4 w-4" />
                                                                    </button>
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <p className="text-[10px] font-bold tracking-widest text-slate-400">BACK ID</p>
                                                        <ReplaceIdentityDocumentDialog
                                                            beneficiaryId={profile.id}
                                                            side="back"
                                                            isVerified={profile.identity_verified}
                                                            hasDocument={false}
                                                            trigger={
                                                                <button
                                                                    type="button"
                                                                    className="rounded-full bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-[#005088] hover:ring-[#005088]"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </button>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Merged duplicates — records absorbed into this canonical.
                                Their history is already folded into the list above. */}
                            {merge.merged_duplicates.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <GitMerge className="h-4 w-4 text-amber-600" /> Merged Duplicates
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p className="flex items-start gap-2 text-xs text-amber-700">
                                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            These records were merged into this one. Their assistance history is included above.
                                        </p>
                                        {merge.merged_duplicates.map((dup) => (
                                            <Link
                                                key={dup.id}
                                                href={ShowBeneficiaryProfileController.url({
                                                    municipality: currentMunicipality.slug,
                                                    beneficiaryId: dup.id,
                                                })}
                                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                                            >
                                                <span className="font-medium text-slate-800 capitalize">{dup.full_name}</span>
                                                {dup.beneficiary_number && (
                                                    <span className="font-mono text-[11px] text-slate-500">{dup.beneficiary_number}</span>
                                                )}
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <LinkAccountDialog
                beneficiaryId={profile.id}
                beneficiaryName={profile.full_name}
                currentEmail={profile.account_email}
                isOpen={linkOpen}
                onClose={() => setLinkOpen(false)}
            />

            <ReassignHouseholdDialog
                open={reassignOpen}
                onClose={() => setReassignOpen(false)}
                beneficiaryId={profile.id}
                members={members}
                headState={householdHead}
            />

            <MergeDuplicateDialog
                beneficiaryId={profile.id}
                beneficiaryName={profile.full_name}
                isOpen={mergeOpen}
                onClose={() => setMergeOpen(false)}
            />
        </AdminLayout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bits
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, value, sub, capitalize = false }: { label: string; value: string; sub?: string; capitalize?: boolean }) {
    return (
        <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{label}</p>
            <p className={`mt-0.5 text-sm font-semibold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
        </div>
    );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`rounded-xl border px-4 py-2 text-right ${highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <p className={`text-[10px] font-bold tracking-widest uppercase ${highlight ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</p>
            <p className={`mt-0.5 text-lg font-bold ${highlight ? 'text-emerald-900' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}

function CopyableBadge({ text, className }: { text: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`group inline-flex items-center gap-1.5 transition-colors ${className}`}
            title="Click to copy"
        >
            <span>{text}</span>
            {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
            ) : (
                <Copy className="h-3 w-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
        </button>
    );
}

import RotateBeneficiaryIdentityDocumentController from '@/actions/App/External/Documents/ActionCenter/RotateBeneficiaryIdentityDocumentController';
import EditBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/EditBeneficiaryProfileController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import CreateAssistanceRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/CreateAssistanceRequestController';
import DownloadBeneficiaryIdentityDocumentSheetController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/DownloadBeneficiaryIdentityDocumentSheetController';
import DownloadBeneficiaryIntakeSheetController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/DownloadBeneficiaryIntakeSheetController';
import { CrossMunicipalityWarning, type CrossMunicipalityMatch } from '@/components/Shared/CrossMunicipalityWarning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import Utility from '@/pages/Utility/Utility';
import actionCenter from '@/routes/actionCenter';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BadgeCheck,
    Check,
    Clock3,
    Copy,
    Download,
    Eye,
    FileUp,
    GitMerge,
    HandCoins,
    Home,
    Link2,
    Loader2,
    Mail,
    MapPin,
    MoreHorizontal,
    OctagonX,
    Pencil,
    Phone,
    Plus,
    Printer,
    RotateCcw,
    RotateCw,
    User,
    Users,
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
    contact_phone: string | null;
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
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { can } = usePermissions();
    const utils = Utility();

    const profile: BeneficiaryProfileData = 'data' in beneficiary ? beneficiary.data : beneficiary;
    const members = householdMembers.data;
    const history = assistanceHistory.data;
    const crossMatches = crossMunicipalityMatches?.data ?? [];
    const rosterMatches = householdMatches ?? [];
    const activeRosterCount = members.filter((member) => member.is_active).length;
    const canManageBeneficiaries = can('action_center.beneficiaries.manage');
    const canVerifyBeneficiaries = can('action_center.beneficiaries.verify');
    const canCorrectBeneficiaries = can('action_center.beneficiaries.correct');
    const canProcessRequests = can('action_center.requests.process');
    const canViewRequests = can('action_center.requests.view');

    const [linkOpen, setLinkOpen] = useState(false);
    const [avatarViewOpen, setAvatarViewOpen] = useState(false);
    const [reassignOpen, setReassignOpen] = useState(false);
    const [mergeOpen, setMergeOpen] = useState(false);
    const [rotatingIdentityDocument, setRotatingIdentityDocument] = useState<string | null>(null);

    const rotateIdentityDocument = (side: 'front' | 'back', direction: 'left' | 'right') => {
        const operation = `${side}-${direction}`;

        router.post(
            RotateBeneficiaryIdentityDocumentController.url({
                beneficiaryId: profile.id,
                side,
                direction,
            }),
            {},
            {
                preserveScroll: true,
                headers: {
                    'X-Municipality-Slug': currentMunicipality.slug,
                },
                onStart: () => setRotatingIdentityDocument(operation),
                onFinish: () => setRotatingIdentityDocument(null),
            },
        );
    };

    const address = [profile.household?.street, profile.household?.barangay].filter(Boolean).join(', ') || '—';

    return (
        <AdminLayout>
            <div className="bg-slate-50 pb-12">
                {/* Back navigation */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
                        <Link
                            href={actionCenter.admin.beneficiary.index.url({ municipality: currentMunicipality.slug })}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            <span className="sm:hidden">Back to beneficiaries</span>
                            <span className="hidden sm:inline">Back to Beneficiary Search</span>
                        </Link>

                        <div className="hidden flex-wrap items-center gap-2 lg:flex">
                            {/* Secondary action: correct a mistake on this record (admin-only) */}
                            {canManageBeneficiaries && (
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
                            )}

                            {canCorrectBeneficiaries && (
                                <button
                                    type="button"
                                    onClick={() => setReassignOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Home className="h-4 w-4" />
                                    Change beneficiary residence
                                </button>
                            )}

                            {/* Identity reconciliation: mark this record as a duplicate of
                                another. Hidden once it's already been merged away. */}
                            {canCorrectBeneficiaries && !merge.is_merged_duplicate && (
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
                            {canProcessRequests &&
                                (profile.is_active && profile.household_verified ? (
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
                                ))}
                        </div>

                        {(canProcessRequests || canManageBeneficiaries || canCorrectBeneficiaries) && (
                            <div className={`${canProcessRequests ? 'grid grid-cols-[minmax(0,1fr)_2.75rem]' : 'flex justify-end'} gap-2 lg:hidden`}>
                                {canProcessRequests &&
                                    (profile.is_active && profile.household_verified ? (
                                        <Link
                                            href={CreateAssistanceRequestController.url({
                                                municipality: currentMunicipality.slug,
                                                beneficiaryId: profile.id,
                                            })}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                                        >
                                            <HandCoins className="h-4 w-4" />
                                            File assistance request
                                        </Link>
                                    ) : (
                                        <span
                                            title={!profile.is_active ? 'Beneficiary record is inactive' : 'Household has no verified active head'}
                                            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                                        >
                                            <HandCoins className="h-4 w-4" />
                                            Assistance on hold
                                        </span>
                                    ))}

                                {(canManageBeneficiaries || canCorrectBeneficiaries) && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
                                                aria-label="More beneficiary actions"
                                                title="More beneficiary actions"
                                            >
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64">
                                            {canManageBeneficiaries && (
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={EditBeneficiaryProfileController.url({
                                                            municipality: currentMunicipality.slug,
                                                            beneficiaryId: profile.id,
                                                        })}
                                                        className="cursor-pointer"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Edit profile
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            {canCorrectBeneficiaries && (
                                                <DropdownMenuItem onSelect={() => setTimeout(() => setReassignOpen(true), 100)}>
                                                    <Home className="h-4 w-4" />
                                                    Change beneficiary residence
                                                </DropdownMenuItem>
                                            )}
                                            {canCorrectBeneficiaries && !merge.is_merged_duplicate && (
                                                <DropdownMenuItem
                                                    onSelect={() => setTimeout(() => setMergeOpen(true), 100)}
                                                    className="text-amber-700 focus:text-amber-800"
                                                >
                                                    <GitMerge className="h-4 w-4" />
                                                    Mark as duplicate
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Header strip */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => profile.avatar_url && setAvatarViewOpen(true)}
                                    className={
                                        profile.avatar_url
                                            ? 'cursor-pointer rounded-full transition hover:opacity-90 hover:ring-4 hover:ring-blue-100'
                                            : 'cursor-default'
                                    }
                                >
                                    <AvatarUploader
                                        beneficiaryId={profile.id}
                                        avatarUrl={profile.avatar_url}
                                        fullName={profile.full_name}
                                        sizeClass="h-14 w-14 sm:h-16 sm:w-16"
                                        editable={false}
                                    />
                                </button>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="min-w-0 text-xl font-bold break-words text-slate-900 capitalize sm:text-2xl">
                                            {profile.full_name}
                                        </h1>
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
                            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:gap-3">
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
                    <div className="container mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
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
                    <div className="container mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
                        <CrossMunicipalityWarning matches={crossMatches} context="profile" />
                    </div>
                )}

                {rosterMatches.length > 0 && (
                    <div className="container mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
                        <PossibleRosterMatchesPanel matches={rosterMatches} municipalitySlug={currentMunicipality.slug} />
                    </div>
                )}

                {/* Main grid */}
                <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                        {/* Left column */}
                        <div className="space-y-4 sm:space-y-6 lg:col-span-8">
                            {canVerifyBeneficiaries && (
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
                            )}

                            {/* Identity */}
                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4 text-slate-600" /> Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
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
                                <CardHeader className="flex flex-col items-start gap-2 space-y-0 p-4 pb-3 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-4">
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
                                        <HouseholdStatusBadge
                                            activeRosterCount={activeRosterCount}
                                            householdOnHold={householdHead.household_on_hold}
                                            householdVerified={profile.household_verified}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {activeRosterCount} active {activeRosterCount === 1 ? 'member' : 'members'}
                                    </span>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
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
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <HandCoins className="h-4 w-4 text-slate-600" /> Assistance History (all programs)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                    <AssistanceHistoryList
                                        history={history}
                                        municipalitySlug={currentMunicipality.slug}
                                        canOpenRequests={canViewRequests}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right column */}
                        <div className="space-y-4 sm:space-y-6 lg:col-span-4">
                            {/* Contact / address */}
                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Home className="h-4 w-4 text-slate-600" /> Address & Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
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
                                        <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Communication</p>
                                            <p className="text-sm text-slate-800">{profile.contact_phone || 'No contact phone encoded'}</p>
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
                                            {canCorrectBeneficiaries && (
                                                <button
                                                    type="button"
                                                    onClick={() => setLinkOpen(true)}
                                                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                                                >
                                                    <Link2 className="h-3.5 w-3.5" />
                                                    {profile.has_account ? 'Change linked account' : 'Link a portal account'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents */}
                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="text-base">Documents</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">System Generated</p>
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
                                            {canVerifyBeneficiaries && (
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
                                            )}
                                        </div>
                                    </div>

                                    {canVerifyBeneficiaries && (
                                        <div className="space-y-3 border-t border-slate-100 pt-6">
                                            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Uploaded Identity</p>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {/* Front ID Card */}
                                                <div className="group relative flex h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-24">
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

                                                            <div className="absolute right-2 bottom-2 flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                                                <a
                                                                    href={profile.identity_documents.front}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 hover:text-[#005088] sm:h-8 sm:w-8"
                                                                    title="View Full Size"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => rotateIdentityDocument('front', 'left')}
                                                                    disabled={rotatingIdentityDocument !== null}
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 hover:text-[#005088] disabled:cursor-wait disabled:opacity-60 sm:h-8 sm:w-8"
                                                                    title="Rotate left"
                                                                    aria-label="Rotate front ID left"
                                                                >
                                                                    {rotatingIdentityDocument === 'front-left' ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => rotateIdentityDocument('front', 'right')}
                                                                    disabled={rotatingIdentityDocument !== null}
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 hover:text-[#005088] disabled:cursor-wait disabled:opacity-60 sm:h-8 sm:w-8"
                                                                    title="Rotate right"
                                                                    aria-label="Rotate front ID right"
                                                                >
                                                                    {rotatingIdentityDocument === 'front-right' ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <RotateCw className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                <ReplaceIdentityDocumentDialog
                                                                    beneficiaryId={profile.id}
                                                                    side="front"
                                                                    isVerified={profile.identity_verified}
                                                                    hasDocument={true}
                                                                    trigger={
                                                                        <button
                                                                            type="button"
                                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 hover:text-[#005088] sm:h-8 sm:w-8"
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
                                                <div className="group relative flex h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-24">
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

                                                            <div className="absolute right-2 bottom-2 flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                                                <a
                                                                    href={profile.identity_documents.back}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 hover:text-[#005088] sm:h-8 sm:w-8"
                                                                    title="View Full Size"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => rotateIdentityDocument('back', 'left')}
                                                                    disabled={rotatingIdentityDocument !== null}
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 hover:text-[#005088] disabled:cursor-wait disabled:opacity-60 sm:h-8 sm:w-8"
                                                                    title="Rotate left"
                                                                    aria-label="Rotate back ID left"
                                                                >
                                                                    {rotatingIdentityDocument === 'back-left' ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => rotateIdentityDocument('back', 'right')}
                                                                    disabled={rotatingIdentityDocument !== null}
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 hover:text-[#005088] disabled:cursor-wait disabled:opacity-60 sm:h-8 sm:w-8"
                                                                    title="Rotate right"
                                                                    aria-label="Rotate back ID right"
                                                                >
                                                                    {rotatingIdentityDocument === 'back-right' ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <RotateCw className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                <ReplaceIdentityDocumentDialog
                                                                    beneficiaryId={profile.id}
                                                                    side="back"
                                                                    isVerified={profile.identity_verified}
                                                                    hasDocument={true}
                                                                    trigger={
                                                                        <button
                                                                            type="button"
                                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:bg-slate-100 hover:text-[#005088] sm:h-8 sm:w-8"
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
                                    )}
                                </CardContent>
                            </Card>

                            {/* Merged duplicates — records absorbed into this canonical.
                                Their history is already folded into the list above. */}
                            {merge.merged_duplicates.length > 0 && (
                                <Card>
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <GitMerge className="h-4 w-4 text-amber-600" /> Merged Duplicates
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 px-4 pb-4 sm:px-6 sm:pb-6">
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

            {canCorrectBeneficiaries && (
                <>
                    <LinkAccountDialog
                        beneficiaryId={profile.id}
                        beneficiaryName={profile.full_name}
                        hasAccount={profile.has_account}
                        currentEmail={profile.account_email}
                        currentPhone={profile.account_phone}
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
                </>
            )}

            <Dialog open={avatarViewOpen} onOpenChange={setAvatarViewOpen}>
                <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none">
                    {profile.avatar_url && (
                        <img src={profile.avatar_url} alt={profile.full_name} className="h-auto w-full rounded-2xl object-contain shadow-2xl" />
                    )}
                </DialogContent>
            </Dialog>
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
        <div
            className={`min-w-0 rounded-lg border px-3 py-2 text-left sm:rounded-xl sm:px-4 sm:text-right ${highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}
        >
            <p className={`text-[10px] font-bold tracking-widest uppercase ${highlight ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</p>
            <p className={`mt-0.5 text-base font-bold break-words sm:text-lg ${highlight ? 'text-emerald-900' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}

function HouseholdStatusBadge({
    activeRosterCount,
    householdOnHold,
    householdVerified,
}: {
    activeRosterCount: number;
    householdOnHold: boolean;
    householdVerified: boolean;
}) {
    if (activeRosterCount === 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                <Clock3 className="h-3 w-3" />
                Historical
            </span>
        );
    }

    if (householdOnHold) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                On hold: no active head
            </span>
        );
    }

    if (householdVerified) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <BadgeCheck className="h-3 w-3" />
                Verified household
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            <Clock3 className="h-3 w-3" />
            Pending verification
        </span>
    );
}

function PossibleRosterMatchesPanel({ matches, municipalitySlug }: { matches: HouseholdMatch[]; municipalitySlug: string }) {
    return (
        <Card className="border-amber-200 bg-amber-50/70">
            <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-amber-950">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Possible roster matches
                </CardTitle>
                <p className="text-sm text-amber-900">
                    This beneficiary may already appear as a household member in another household. Review before verifying, approving, or changing
                    household assignment.
                </p>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                {matches.map((match) => {
                    const address = [match.street, match.barangay].filter(Boolean).join(', ') || 'Address unavailable';
                    const relationship = match.relationship ? match.relationship.replace(/_/g, ' ') : 'Relationship unavailable';

                    return (
                        <div
                            key={match.member_id}
                            className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm font-bold text-slate-900 capitalize">
                                        {match.member_name || 'Unnamed roster member'}
                                    </p>
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                        Name and birth date match
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500 capitalize">
                                    {[relationship, match.birth_date].filter(Boolean).join(' · ')}
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                    {match.head_name ? `${match.head_name}'s household` : 'Household'} · {address}
                                </p>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                {match.household_code && (
                                    <CopyableBadge
                                        text={match.household_code}
                                        className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[11px] font-semibold tracking-wide text-amber-900 hover:bg-amber-100"
                                    />
                                )}

                                {match.head_beneficiary_id && (
                                    <Link
                                        href={ShowBeneficiaryProfileController.url({
                                            municipality: municipalitySlug,
                                            beneficiaryId: match.head_beneficiary_id,
                                        })}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View head profile
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
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
                <Copy className="h-3 w-3 text-slate-400 opacity-60 transition-opacity group-hover:opacity-100" />
            )}
        </button>
    );
}

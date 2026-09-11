import RefreshAssistanceHouseholdAssessmentController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/RefreshAssistanceHouseholdAssessmentController';
import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import ShowAcknowledgementReceiptGeneratorController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/ShowAcknowledgementReceiptGeneratorController';
import ShowAssistanceRequestIntakeSheetGeneratorController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/ShowAssistanceRequestIntakeSheetGeneratorController';
import ShowCertificateOfEligibilityGeneratorController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/ShowCertificateOfEligibilityGeneratorController';
import ShowDisbursementVoucherGeneratorController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/ShowDisbursementVoucherGeneratorController';
import ShowFinancialDocumentPacketGeneratorController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/ShowFinancialDocumentPacketGeneratorController';
import ShowObligationRequestGeneratorController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/ShowObligationRequestGeneratorController';
import EditAssistanceRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/EditAssistanceRequestController';
import ListAssistanceRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ListAssistanceRequestController';
import { ContactPhoneActions } from '@/components/ActionCenter/ContactPhoneActions';
import { CrossMunicipalityWarning, type CrossMunicipalityMatch } from '@/components/Shared/CrossMunicipalityWarning';
import { FlashHandler } from '@/components/Shared/FlashHandler';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import {
    AssistanceDocumentCheck,
    AssistanceGeneratedDocument,
    AssistanceMswdVerification,
    AssistanceRequestFormDefinition,
    AssistanceReviewActor,
    PresentedCopyOption,
} from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import ToastProvider from '@/pages/Utility/ToastShower';
import Utility from '@/pages/Utility/Utility';
import actionCenter from '@/routes/actionCenter';
import { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BadgeCheck,
    CalendarPlus,
    CheckCircle2,
    ClipboardCheck,
    ClockArrowUp,
    FilePenLine,
    FileText,
    Files,
    Home,
    Info,
    MapPin,
    MessageSquare,
    Pencil,
    Printer,
    ReceiptText,
    RefreshCw,
    Send,
    ShieldCheck,
    Upload,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import ApproveRequestDialog from './Components/ApproveRequestDialog';
import CancelApprovedRequestDialog from './Components/CancelApprovedRequestDialog';
import CorrectApprovedAssistanceAmountDialog from './Components/CorrectApprovedAssistanceAmountDialog';
import CorrectMissingBurialDateOfDeathDialog from './Components/CorrectMissingBurialDateOfDeathDialog';
import MswdDocuments from './Components/MswdDocuments';
import MswdVerificationBadge from './Components/MswdVerificationBadge';
import RejectRequestDialog from './Components/RejectRequestDialog';
import ReleaseRequestDialog from './Components/ReleaseRequestDialog';
import ReplaceAdditionalDocumentDialog from './Components/ReplaceAdditionalDocumentDialog';
import SyncApprovedHouseholdDialog, { type HouseholdAssessmentPreview } from './Components/SyncApprovedHouseholdDialog';

// ═════════════════════════════════════════════════════════════════════════════
// Types
// ═════════════════════════════════════════════════════════════════════════════

interface ShortUser {
    id: string;
    name: string;
}

interface AssistanceTypeBlock {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    min_amount: number | null;
    max_amount: number | null;
    cooldown_months: number;
    cooldown_type: string;
    cooldown_scope: string;
    enabled_generated_documents: AssistanceGeneratedDocument[];
    request_form: AssistanceRequestFormDefinition;
}

interface DocumentBlock {
    id: string;
    uuid: string;
    collection_name: string;
    name: string;
    file_name: string;
    mime_type: string | null;
    size: number;
    url: string;
    uploaded_at: string | null;
    custom_properties: Record<string, unknown>;
}

interface IdentitySnapshot {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    suffix: string | null;
    full_name: string;
    sex: string | null;
    birth_date: string | null;
    age_at_submission: number | null;
    educational_attainment: string | null;
    religion: string | null;
}

interface FilerNameCorrection {
    has_difference: boolean;
    current_profile_name: string;
    identity_verified: boolean;
}

interface AddressSnapshot {
    street: string | null;
    barangay: string | null;
    barangay_psgc_code: string | null;
    full_address: string;
}

interface OnBehalfBlock {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    suffix: string | null;
    full_name: string;
    birth_date: string | null;
    date_of_death: string | null;
    recipient_id_exception: string | null;
    recipient_id_exception_reason: string | null;
}

interface HouseholdMemberBlock {
    id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    relationship: string;
    relationship_label: string | null;
    birth_date: string | null;
    age: number | null;
    sex: string | null;
    civil_status: string | null;
    occupation: string | null;
    monthly_income: number;
}

interface AssistanceRequestDetail {
    id: string;
    transaction_number: string;
    status: string;
    assistance_type?: AssistanceTypeBlock;
    amount_approved: number | null;
    description: string | null;
    remarks: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    approved_at: string | null;
    released_at: string | null;
    has_release_artifacts: boolean;
    cancelled_at: string | null;
    is_walkin: boolean;
    encoded_by?: ShortUser | null;
    reviewed_by?: ShortUser | null;
    approved_by?: ShortUser | null;
    cancelled_by?: ShortUser | null;
    filed_for_self: boolean;
    relationship: { value: string; label: string } | null;
    on_behalf: OnBehalfBlock | null;
    identity_snapshot: IdentitySnapshot;
    filer_name_correction: FilerNameCorrection | null;
    address_snapshot: AddressSnapshot;
    privacy_consented_at: string | null;
    privacy_notice_version: string | null;
    beneficiary_id: string;
    contact_phone: string | null;
    household_id: string;
    household_assessment: {
        captured_at: string | null;
        member_count: number;
        source: string;
    } | null;
    documents?: DocumentBlock[];
    created_at: string | null;
    updated_at: string | null;
}

interface RecentHistoryRow {
    id: string;
    transaction_number: string;
    status: string;
    program_name: string | null;
    amount_approved: number | null;
    submitted_at: string | null;
}

interface ActivityEntry {
    id: number;
    description: string;
    changes: Record<string, unknown>;
    old: Record<string, unknown>;
    reason?: string | null;
    by: string | null;
    at: string;
}

interface Props {
    request: { data: AssistanceRequestDetail } | AssistanceRequestDetail;
    recentHistory: { data: RecentHistoryRow[] };
    activityLog: { data: ActivityEntry[] };
    householdMembers: { data: HouseholdMemberBlock[] }; // 🚀 Injected family structure
    householdAssessmentPreview: HouseholdAssessmentPreview;
    crossMunicipalityMatches: { data: CrossMunicipalityMatch[] };
    mswdVerification: AssistanceMswdVerification;
    documentChecks: AssistanceDocumentCheck[];
    presentedCopyOptions: PresentedCopyOption[];
    mswdReviewerOptions: AssistanceReviewActor[];
}

// ═════════════════════════════════════════════════════════════════════════════
// Status Design Tokens
// ═════════════════════════════════════════════════════════════════════════════

const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-amber-100   text-amber-800   ring-1 ring-amber-200',
    under_review: 'bg-sky-100     text-sky-800     ring-1 ring-sky-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    released: 'bg-blue-100    text-blue-800    ring-1 ring-blue-200',
    rejected: 'bg-rose-100    text-rose-800    ring-1 ring-rose-200',
    cancelled: 'bg-gray-100    text-gray-700    ring-1 ring-gray-200',
};

const humanizeStatus = (s: string) => (s === 'approved' ? 'Amount Approved' : s.replace(/_/g, ' '));
const statusClass = (s: string): string => STATUS_BADGE[s] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
const IDENTITY_DOCUMENT_KEYS = new Set(['valid_id_front', 'valid_id_back', 'recipient_valid_id_front', 'recipient_valid_id_back']);

export default function AssistanceRequestsDetails({
    request,
    recentHistory,
    activityLog,
    householdMembers,
    householdAssessmentPreview,
    crossMunicipalityMatches,
    mswdVerification,
    documentChecks,
    presentedCopyOptions,
    mswdReviewerOptions,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { auth } = usePage<SharedData>().props;
    const { can } = usePermissions();
    const utils = Utility();
    const detail: AssistanceRequestDetail = 'data' in request ? request.data : request;
    const recentHistoryData = recentHistory.data;
    const activityLogData = activityLog.data;
    const householdMembersData = householdMembers.data;
    const crossMatches = crossMunicipalityMatches?.data ?? [];
    const isMine = detail.reviewed_by?.id === auth.user?.id;
    const canViewBeneficiaries = can('action_center.beneficiaries.view');
    const canManageBeneficiaries = can('action_center.beneficiaries.manage');
    const canProcessRequests = can('action_center.requests.process');
    const canIntakeRequests = can('action_center.requests.intake');
    const canVerifyRequests = can('action_center.requests.verify');
    const canDecideRequests = can('action_center.requests.decide');
    const canReleaseRequests = can('action_center.requests.release');
    const canCorrectRequests = can('action_center.requests.correct');
    const [adminNote, setAdminNote] = useState<string>('');
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isCorrectAmountOpen, setIsCorrectAmountOpen] = useState(false);
    const [isCancelApprovedOpen, setIsCancelApprovedOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isReleaseOpen, setIsReleaseOpen] = useState(false);
    const [isMissingDateCorrectionOpen, setIsMissingDateCorrectionOpen] = useState(false);
    const [isRefreshingHouseholdAssessment, setIsRefreshingHouseholdAssessment] = useState(false);
    const [isApprovedHouseholdSyncOpen, setIsApprovedHouseholdSyncOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('intake');
    const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
    const [additionalDocumentToReplace, setAdditionalDocumentToReplace] = useState<DocumentBlock | null>(null);
    const [isStartingMswdReview, setIsStartingMswdReview] = useState(false);
    const isStartingMswdReviewRef = useRef(false);

    // Every upload lives in the single spatie collection "documents"; the slot
    // it fills is in custom_properties.document_key — NOT collection_name. Match
    // on that, falling back to collection_name for any legacy/unkeyed media.
    const documentKeyOf = (d: DocumentBlock) => (d.custom_properties?.document_key as string | undefined) ?? d.collection_name;
    const requiresDateOfDeath =
        detail.assistance_type?.request_form.fields.some((field) => field.key === 'on_behalf_date_of_death' && field.required) ?? false;
    const hasMissingDateOfDeath = requiresDateOfDeath && !detail.on_behalf?.date_of_death;
    const approvalBlockReason = hasMissingDateOfDeath ? 'Enter the Date of Death in Edit Request before approval.' : null;
    const requestIsEditable = detail.status === 'pending' || detail.status === 'under_review';
    const canEditRequest = requestIsEditable && (canIntakeRequests || canProcessRequests);
    const verificationIsComplete = mswdVerification.status === 'verified';
    const canUploadRequestDocuments =
        (canIntakeRequests || canProcessRequests) &&
        ['pending', 'under_review', 'needs_correction'].includes(mswdVerification.status ?? 'pending') &&
        ['pending', 'under_review', 'approved'].includes(detail.status) &&
        !detail.has_release_artifacts;
    const canRefreshAssignedHousehold =
        ['under_review', 'approved'].includes(detail.status) &&
        !detail.has_release_artifacts &&
        isMine &&
        canProcessRequests &&
        !verificationIsComplete;
    const canCorrectCompletedHousehold =
        ['under_review', 'approved'].includes(detail.status) && !detail.has_release_artifacts && verificationIsComplete && canCorrectRequests;
    const canRefreshHouseholdAssessment = canRefreshAssignedHousehold || canCorrectCompletedHousehold;
    const householdAssessmentHasChanges =
        householdAssessmentPreview.added.length > 0 || householdAssessmentPreview.removed.length > 0 || householdAssessmentPreview.changed.length > 0;
    const householdAssessmentNeedsSync = detail.household_assessment === null || householdAssessmentHasChanges;
    const canManageInterviewHousehold = canRefreshAssignedHousehold && canManageBeneficiaries;
    const canCorrectMissingDateOfDeath =
        canCorrectRequests &&
        detail.status === 'approved' &&
        requiresDateOfDeath &&
        detail.on_behalf !== null &&
        !detail.filed_for_self &&
        !detail.on_behalf.date_of_death;
    const canCorrectApprovedAmount =
        canDecideRequests && canCorrectRequests && detail.status === 'approved' && detail.amount_approved !== null && !detail.has_release_artifacts;
    const checkedDocumentKeys = new Set(documentChecks.map((check) => check.document_key));
    const extraDocuments = (detail.documents ?? []).filter((document) => !checkedDocumentKeys.has(documentKeyOf(document)));
    const receiptStatusIsEligible = detail.status === 'approved' || detail.status === 'released';
    const enabledGeneratedDocuments = new Set(detail.assistance_type?.enabled_generated_documents ?? []);
    const generatorIsEnabled = (document: AssistanceGeneratedDocument) => enabledGeneratedDocuments.has(document);
    const verificationAllowsFinalDocuments =
        (mswdVerification.status === 'verified' && mswdVerification.is_current) || (detail.status === 'released' && mswdVerification.status === null);
    const canGenerateAcknowledgementReceipt =
        generatorIsEnabled('acknowledgement_receipt') &&
        receiptStatusIsEligible &&
        detail.amount_approved !== null &&
        canProcessRequests &&
        verificationAllowsFinalDocuments;
    const canGenerateObligationRequest =
        generatorIsEnabled('obligation_request') &&
        receiptStatusIsEligible &&
        detail.amount_approved !== null &&
        canProcessRequests &&
        verificationAllowsFinalDocuments;
    const canGenerateDisbursementVoucher =
        generatorIsEnabled('disbursement_voucher') &&
        receiptStatusIsEligible &&
        detail.amount_approved !== null &&
        canProcessRequests &&
        verificationAllowsFinalDocuments;
    const processingPacketDocumentCount = ['certificate_of_eligibility', 'obligation_request', 'disbursement_voucher'].filter((document) =>
        generatorIsEnabled(document as AssistanceGeneratedDocument),
    ).length;
    const canGenerateFinancialDocumentPacket =
        processingPacketDocumentCount >= 2 &&
        receiptStatusIsEligible &&
        detail.amount_approved !== null &&
        canProcessRequests &&
        verificationAllowsFinalDocuments;
    const canGenerateCertificateOfEligibility =
        generatorIsEnabled('certificate_of_eligibility') &&
        canProcessRequests &&
        ['under_review', 'approved', 'released'].includes(detail.status) &&
        verificationAllowsFinalDocuments;
    const canGenerateRequestIntakeSheet = generatorIsEnabled('request_intake_sheet') && canProcessRequests;
    const acknowledgementReceiptUrl = ShowAcknowledgementReceiptGeneratorController.url({
        municipality: currentMunicipality.slug,
        assistanceRequestId: detail.id,
    });
    const editRequestUrl = EditAssistanceRequestController.url({
        municipality: currentMunicipality.slug,
        assistanceRequest: detail.id,
    });
    const manageInterviewHouseholdUrl = ShowBeneficiaryProfileController.url({
        municipality: currentMunicipality.slug,
        beneficiaryId: detail.beneficiary_id,
    });

    const handleAction = (label: string) => () => {
        if (label === 'Approve') {
            setIsApproveOpen(true);
            return;
        }
        if (label === 'Reject') {
            setIsRejectOpen(true);
            return;
        }
        if (label === 'Cancel Approved') {
            setIsCancelApprovedOpen(true);
            return;
        }
        if (label === 'Correct Amount') {
            setIsCorrectAmountOpen(true);
            return;
        }
        if (label === 'Mark Released') {
            setIsReleaseOpen(true);
            return;
        }
        console.warn(`[admin] action not yet wired: ${label}`, { requestId: detail.id, note: adminNote || undefined });
        alert(`"${label}" is not wired yet.`);
    };

    const stubAction = (label: string) => () => {
        console.warn(`[admin] action not yet wired: ${label}`, { requestId: detail.id, note: adminNote || undefined });
        alert(`"${label}" is not wired yet.`);
    };

    const handlePickUp = () => {
        if (isStartingMswdReviewRef.current) return;

        isStartingMswdReviewRef.current = true;
        setIsStartingMswdReview(true);

        router.post(
            actionCenter.assistance.startReview.url({ assistanceRequestId: detail.id }),
            {},
            {
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                preserveScroll: true,
                onFinish: () => {
                    isStartingMswdReviewRef.current = false;
                    setIsStartingMswdReview(false);
                },
            },
        );
    };

    const refreshHouseholdAssessment = () => {
        if (canCorrectCompletedHousehold) {
            setIsApprovedHouseholdSyncOpen(true);
            return;
        }
        router.post(
            RefreshAssistanceHouseholdAssessmentController.url({ assistanceRequestId: detail.id }),
            { assessment_fingerprint: householdAssessmentPreview.fingerprint },
            {
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                preserveScroll: true,
                onStart: () => setIsRefreshingHouseholdAssessment(true),
                onFinish: () => setIsRefreshingHouseholdAssessment(false),
            },
        );
    };

    // Calculate total family economics for validation
    const totalHouseholdIncome = householdMembersData.reduce((sum, m) => sum + m.monthly_income, 0);

    return (
        <>
            <div className="bg-slate-50 pb-12">
                {/* Back navigation */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
                        <Link
                            href={ListAssistanceRequestController.url({ municipality: currentMunicipality.slug })}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            <span className="sm:hidden">Back to requests</span>
                            <span className="hidden sm:inline">Back to Assistance Requests</span>
                        </Link>
                    </div>
                </div>

                {/* Header strip */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <h1 className="min-w-0 font-mono text-xl font-bold break-all text-slate-900 sm:text-2xl">
                                        {detail.transaction_number}
                                    </h1>
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${statusClass(detail.status)}`}
                                    >
                                        {humanizeStatus(detail.status)}
                                    </span>
                                    <MswdVerificationBadge status={mswdVerification.status} isCurrent={mswdVerification.is_current} />
                                    {detail.is_walkin && (
                                        <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-bold tracking-wide text-purple-800 uppercase ring-1 ring-purple-200">
                                            walk-in
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    {detail.assistance_type?.name ?? 'Unknown program'}
                                    {' • '}
                                    Submitted {utils.formatToReadableDate(detail.submitted_at ?? undefined)}
                                </p>

                                {/* Action Buttons moved here */}
                                <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                                    <ActionButtons
                                        status={detail.status}
                                        onAction={handleAction}
                                        onPickUp={handlePickUp}
                                        isMine={isMine}
                                        reviewerName={detail.reviewed_by?.name ?? null}
                                        acknowledgementReceiptUrl={acknowledgementReceiptUrl}
                                        approvalBlockReason={approvalBlockReason}
                                        releaseBlockReason={
                                            verificationAllowsFinalDocuments ? null : 'Complete current MSWD verification before physical release.'
                                        }
                                        canProcess={canProcessRequests}
                                        canVerify={canVerifyRequests}
                                        mswdVerificationStatus={mswdVerification.status}
                                        isStartingMswdReview={isStartingMswdReview}
                                        canDecide={canDecideRequests}
                                        canCorrectApprovedAmount={canCorrectApprovedAmount}
                                        canRelease={canReleaseRequests}
                                        canGenerateAcknowledgementReceipt={canGenerateAcknowledgementReceipt}
                                    />

                                    <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                                    {canViewBeneficiaries && (
                                        <Link
                                            href={ShowBeneficiaryProfileController.url({
                                                municipality: currentMunicipality.slug,
                                                beneficiaryId: detail.beneficiary_id,
                                            })}
                                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
                                        >
                                            <User className="h-4 w-4" />
                                            <span className="sm:hidden">Beneficiary</span>
                                            <span className="hidden sm:inline">View Beneficiary Profile</span>
                                        </Link>
                                    )}

                                    {/* Correct a mistake — only while the request is still
                                        editable (pending / under_review). Locked states show
                                        no button; the server enforces the same gate. */}
                                    {canEditRequest && (
                                        <Link
                                            href={editRequestUrl}
                                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
                                        >
                                            <Pencil className="h-4 w-4" /> Edit Request
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {detail.amount_approved !== null && (
                                <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-left sm:rounded-xl sm:px-5 lg:w-auto lg:text-right">
                                    <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                                        {detail.status === 'cancelled' ? 'Previously Approved Amount' : 'Amount Approved'}
                                    </p>
                                    <p className="mt-0.5 text-xl font-bold break-words text-emerald-900 sm:text-2xl">
                                        {utils.formatCurrency(detail.amount_approved)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {crossMatches.length > 0 && (
                    <div className="container mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:hidden">
                        <CrossMunicipalityWarning matches={crossMatches} context="release" />
                    </div>
                )}

                {mswdVerification.blockers.length > 0 && !['released', 'rejected', 'cancelled'].includes(detail.status) && (
                    <div className="container mx-auto max-w-7xl px-4 pt-4 sm:px-6">
                        <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-amber-950">MSWD verification is not yet complete</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-amber-800">{mswdVerification.blockers[0]}</p>
                                </div>
                            </div>
                            {canUploadRequestDocuments && (
                                <Button
                                    variant="outline"
                                    className="min-h-10 w-full shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-100 sm:w-auto"
                                    onClick={() => {
                                        setActiveTab('documents');
                                        setIsDocumentUploadOpen(true);
                                    }}
                                >
                                    <Upload className="mr-2 h-4 w-4" /> Upload documents
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {requestIsEditable && hasMissingDateOfDeath && (
                    <div className="container mx-auto max-w-7xl px-4 pt-4 sm:px-6">
                        <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-amber-950">Date of Death required before approval</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                                        This burial request cannot be approved until MSWD records the deceased person&apos;s date of death.
                                    </p>
                                </div>
                            </div>
                            {canProcessRequests && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="min-h-10 w-full shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-100 sm:w-auto"
                                >
                                    <Link href={editRequestUrl}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit Request
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {canCorrectMissingDateOfDeath && (
                    <div className="container mx-auto max-w-7xl px-4 pt-4 sm:px-6">
                        <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-amber-950">Missing Date of Death</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                                        This legacy burial request is missing the Date of Death. The controlled correction can add it once from the
                                        verified source document; it cannot replace an existing date or change any other request data.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="min-h-10 w-full shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-100 sm:w-auto"
                                onClick={() => setIsMissingDateCorrectionOpen(true)}
                            >
                                <CalendarPlus className="mr-2 h-4 w-4" /> Add Date of Death
                            </Button>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                        {/* ─── Tabbed Layout Left Panel ─── */}
                        <div className="lg:col-span-8">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                                <TabsList className="grid h-11 w-full grid-cols-4 bg-slate-200/70 p-1">
                                    <TabsTrigger value="intake" className="min-w-0 px-1 text-[11px] font-medium sm:px-2 sm:text-xs">
                                        <span className="sm:hidden">Summary</span>
                                        <span className="hidden sm:inline">Intake Summary</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="household"
                                        className="min-w-0 gap-1 px-1 text-[11px] font-medium sm:gap-1.5 sm:px-2 sm:text-xs"
                                    >
                                        <span className="sm:hidden">Family</span>
                                        <span className="hidden sm:inline">Household</span>
                                        <Badge variant="secondary" className="h-4 bg-slate-300 px-1 text-[10px]">
                                            {householdMembersData.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="documents" className="min-w-0 px-1 text-[11px] font-medium sm:px-2 sm:text-xs">
                                        <span className="sm:hidden">Files</span>
                                        <span className="hidden sm:inline">Documents</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="audit" className="min-w-0 px-1 text-[11px] font-medium sm:px-2 sm:text-xs">
                                        <span className="sm:hidden">Audit</span>
                                        <span className="hidden sm:inline">Audit Trails</span>
                                    </TabsTrigger>
                                </TabsList>

                                {/* TAB 1: INTAKE SUMMARY */}
                                <TabsContent value="intake" className="space-y-4 outline-none sm:space-y-6">
                                    <Card>
                                        <CardHeader className="p-4 sm:p-6">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <User className="h-4 w-4 text-slate-600" /> Subject of the Request
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                                            {detail.filed_for_self ? (
                                                <InfoLine icon={<UserCheck className="h-4 w-4" />}>Filed by the beneficiary for themselves.</InfoLine>
                                            ) : (
                                                <div className="space-y-2">
                                                    <InfoLine icon={<Info className="h-4 w-4 text-blue-600" />} variant="info">
                                                        Filed on behalf of <strong>{detail.on_behalf?.full_name}</strong> by their{' '}
                                                        <strong>{detail.relationship?.label.toLowerCase()}</strong>.
                                                        {detail.on_behalf?.date_of_death && (
                                                            <span className="ml-1">
                                                                Date of death: {utils.formatToReadableDateNoTime(detail.on_behalf.date_of_death)}.
                                                            </span>
                                                        )}
                                                    </InfoLine>
                                                    {detail.on_behalf?.recipient_id_exception && (
                                                        <InfoLine icon={<Info className="h-4 w-4" />}>
                                                            Assisted-person ID exception:{' '}
                                                            <strong>{detail.on_behalf.recipient_id_exception.replace(/_/g, ' ')}</strong>
                                                            {detail.on_behalf.recipient_id_exception_reason
                                                                ? ` — ${detail.on_behalf.recipient_id_exception_reason}`
                                                                : '.'}
                                                        </InfoLine>
                                                    )}
                                                </div>
                                            )}

                                            <div className="border-t border-slate-100 pt-4">
                                                <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Filer contact</p>
                                                <ContactPhoneActions phone={detail.contact_phone} />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                                                <Field label="Full name" value={detail.identity_snapshot.full_name || '—'} capitalize />
                                                <Field label="Sex" value={detail.identity_snapshot.sex ?? '—'} capitalize />
                                                <Field
                                                    label="Date of birth"
                                                    value={utils.formatToReadableDateNoTime(detail.identity_snapshot.birth_date ?? undefined)}
                                                    sub={
                                                        detail.identity_snapshot.age_at_submission !== null
                                                            ? `Age ${detail.identity_snapshot.age_at_submission} at submission`
                                                            : undefined
                                                    }
                                                />
                                                <Field
                                                    label="Educational attainment"
                                                    value={detail.identity_snapshot.educational_attainment ?? '—'}
                                                    capitalize
                                                />
                                                <Field label="Religion" value={detail.identity_snapshot.religion ?? '—'} capitalize />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="p-4 sm:p-6">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <MapPin className="h-4 w-4 text-slate-600" /> Home Address (at submission)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field label="Street / Purok" value={detail.address_snapshot.street ?? '—'} capitalize />
                                                <Field
                                                    label="Barangay"
                                                    value={detail.address_snapshot.barangay ?? '—'}
                                                    sub={detail.address_snapshot.barangay_psgc_code ?? undefined}
                                                    capitalize
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="p-4 sm:p-6">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <MessageSquare className="h-4 w-4 text-slate-600" /> Reason for Request
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                                                {detail.description?.trim() || <span className="text-slate-400 italic">No reason provided.</span>}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 2: HOUSEHOLD COMPOSITION (RESILIENT SIDE-BY-SIDE INTEGRATION) */}
                                <TabsContent value="household" className="outline-none">
                                    <Card>
                                        <CardHeader className="flex flex-col items-start gap-2 space-y-0 p-4 pb-3 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Users className="h-4 w-4 text-slate-600" /> Family Composition
                                            </CardTitle>
                                            <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
                                                <div className="text-left sm:text-right">
                                                    <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                        Est. Monthly Income
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {utils.formatCurrency(totalHouseholdIncome)}
                                                    </span>
                                                </div>
                                                {(canManageInterviewHousehold || canRefreshHouseholdAssessment) && (
                                                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                                        {canManageInterviewHousehold && (
                                                            <Button asChild size="sm" variant="outline" className="min-h-10 w-full sm:w-auto">
                                                                <Link href={manageInterviewHouseholdUrl}>
                                                                    <Users className="mr-2 h-4 w-4" /> Manage household
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {canRefreshHouseholdAssessment && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={householdAssessmentNeedsSync ? 'default' : 'outline'}
                                                                className={
                                                                    householdAssessmentNeedsSync
                                                                        ? 'min-h-10 w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto'
                                                                        : 'min-h-10 w-full border-emerald-200 bg-emerald-50 text-emerald-800 sm:w-auto'
                                                                }
                                                                disabled={isRefreshingHouseholdAssessment || !householdAssessmentNeedsSync}
                                                                title={
                                                                    householdAssessmentNeedsSync
                                                                        ? undefined
                                                                        : 'No household changes are available to synchronize.'
                                                                }
                                                                onClick={refreshHouseholdAssessment}
                                                            >
                                                                {householdAssessmentNeedsSync ? (
                                                                    <RefreshCw
                                                                        className={`mr-2 h-4 w-4 ${isRefreshingHouseholdAssessment ? 'animate-spin' : ''}`}
                                                                    />
                                                                ) : (
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                )}
                                                                {!householdAssessmentNeedsSync
                                                                    ? 'Household assessment is up to date'
                                                                    : verificationIsComplete
                                                                      ? 'Review household correction'
                                                                      : detail.household_assessment
                                                                        ? 'Update household assessment'
                                                                        : 'Capture household assessment'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                            {detail.household_assessment && (
                                                <div className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                                                    <span className="font-semibold">MSWD interview assessment:</span>{' '}
                                                    {detail.household_assessment.member_count} active household members captured
                                                    {detail.household_assessment.captured_at
                                                        ? ` on ${utils.formatToReadableDate(detail.household_assessment.captured_at)}`
                                                        : ''}
                                                    . The original filing snapshot remains unchanged.
                                                </div>
                                            )}
                                            {!detail.household_assessment && canRefreshHouseholdAssessment && (
                                                <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                                    <p>
                                                        No MSWD interview household has been captured yet. Review the live household, then use{' '}
                                                        <span className="font-semibold">Capture household assessment</span> before preparing the
                                                        intake sheet.
                                                    </p>
                                                </div>
                                            )}
                                            {householdMembersData.length === 0 ? (
                                                <p className="py-4 text-center text-sm text-slate-400 italic">No family profiles declared.</p>
                                            ) : (
                                                <div>
                                                    <div className="space-y-2 md:hidden">
                                                        {householdMembersData.map((member) => (
                                                            <div key={member.id} className="rounded-md border border-slate-200 bg-white p-3">
                                                                <p className="text-sm font-semibold break-words text-slate-900 capitalize">
                                                                    {member.first_name} {member.middle_name ? `${member.middle_name[0]}. ` : ''}
                                                                    {member.last_name} {member.suffix}
                                                                </p>
                                                                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3">
                                                                    <MobileDetail
                                                                        label="Relationship"
                                                                        value={member.relationship_label || member.relationship}
                                                                    />
                                                                    <MobileDetail
                                                                        label="Age / Sex"
                                                                        value={`${member.age ?? '—'} yrs / ${member.sex || '—'}`}
                                                                    />
                                                                    <MobileDetail
                                                                        label="Occupation"
                                                                        value={member.occupation?.toLowerCase() || 'none'}
                                                                        capitalize
                                                                    />
                                                                    <MobileDetail
                                                                        label="Monthly income"
                                                                        value={
                                                                            member.monthly_income > 0
                                                                                ? utils.formatCurrency(member.monthly_income)
                                                                                : '—'
                                                                        }
                                                                        strong
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="hidden overflow-hidden rounded-md border border-slate-100 md:block">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50/70">
                                                                <TableRow>
                                                                    <TableHead className="text-xs">Name</TableHead>
                                                                    <TableHead className="text-xs">Relationship</TableHead>
                                                                    <TableHead className="text-xs">Age/Sex</TableHead>
                                                                    <TableHead className="text-xs">Occupation</TableHead>
                                                                    <TableHead className="text-right text-xs">Income</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {householdMembersData.map((member) => (
                                                                    <TableRow key={member.id} className="hover:bg-slate-50/50">
                                                                        <TableCell className="text-xs font-medium text-slate-900 capitalize">
                                                                            {member.first_name}{' '}
                                                                            {member.middle_name ? `${member.middle_name[0]}. ` : ''}{' '}
                                                                            {member.last_name} {member.suffix}
                                                                        </TableCell>
                                                                        <TableCell className="text-xs text-slate-600">
                                                                            {member.relationship_label || member.relationship}
                                                                        </TableCell>
                                                                        <TableCell className="text-xs text-slate-600">
                                                                            {member.age ?? '—'} yrs / {member.sex || '—'}
                                                                        </TableCell>
                                                                        <TableCell className="max-w-[120px] truncate text-xs text-slate-500 capitalize">
                                                                            {member.occupation?.toLowerCase() || 'none'}
                                                                        </TableCell>
                                                                        <TableCell className="text-right text-xs font-semibold text-slate-700">
                                                                            {member.monthly_income > 0
                                                                                ? utils.formatCurrency(member.monthly_income)
                                                                                : '—'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 3: DOCUMENTS */}
                                <TabsContent value="documents" className="space-y-4 outline-none sm:space-y-6">
                                    <Card>
                                        <CardContent className="p-4 sm:p-6">
                                            <MswdDocuments
                                                requestId={detail.id}
                                                verification={mswdVerification}
                                                checks={documentChecks}
                                                documents={(detail.documents ?? []).map((document) => ({
                                                    id: document.id,
                                                    document_key: documentKeyOf(document),
                                                    url: document.url,
                                                    file_name: document.file_name,
                                                    mime_type: document.mime_type,
                                                    size: document.size,
                                                    uploaded_at: document.uploaded_at,
                                                }))}
                                                reviewer={detail.reviewed_by ?? null}
                                                reviewerOptions={mswdReviewerOptions}
                                                presentedCopyOptions={presentedCopyOptions}
                                                canReview={canVerifyRequests && isMine && mswdVerification.status === 'under_review'}
                                                canCorrect={canCorrectRequests}
                                                uploadOpen={isDocumentUploadOpen}
                                                onUploadOpenChange={setIsDocumentUploadOpen}
                                            />
                                        </CardContent>
                                    </Card>
                                    {extraDocuments.length > 0 && (
                                        <Card>
                                            <CardHeader className="p-4 sm:p-6">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <FileText className="h-4 w-4 text-slate-600" /> Other Supporting Documents
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                                <p className="mb-3 text-xs text-slate-500">
                                                    Attachments that are not part of the MSWD verification checklist.
                                                </p>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                                                    {extraDocuments.map((document) => (
                                                        <DocumentRow
                                                            key={document.id}
                                                            file={document}
                                                            canReplace={
                                                                canUploadRequestDocuments && !IDENTITY_DOCUMENT_KEYS.has(documentKeyOf(document))
                                                            }
                                                            isIdentityDocument={IDENTITY_DOCUMENT_KEYS.has(documentKeyOf(document))}
                                                            onReplace={() => setAdditionalDocumentToReplace(document)}
                                                        />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                {/* TAB 4: AUDIT HISTORY */}
                                <TabsContent value="audit" className="space-y-4 outline-none sm:space-y-6">
                                    <Card>
                                        <CardHeader className="p-4 sm:p-6">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <ShieldCheck className="h-4 w-4 text-slate-600" /> Core Workflow Milestones
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                                            <AuditRow
                                                label="Submitted"
                                                at={detail.submitted_at}
                                                by={
                                                    detail.is_walkin
                                                        ? `Walk-in encoded by ${detail.encoded_by?.name ?? 'admin'}`
                                                        : 'Citizen self-filed online'
                                                }
                                            />
                                            {detail.reviewed_by && <AuditRow label="Reviewed" at={detail.updated_at} by={detail.reviewed_by.name} />}
                                            {detail.approved_at && (
                                                <AuditRow label="Approved" at={detail.approved_at} by={detail.approved_by?.name ?? 'unknown'} />
                                            )}
                                            {detail.released_at && <AuditRow label="Released" at={detail.released_at} />}
                                            {detail.cancelled_at && (
                                                <AuditRow
                                                    label="Cancelled before release"
                                                    at={detail.cancelled_at}
                                                    by={detail.cancelled_by?.name ?? 'unknown'}
                                                />
                                            )}
                                            {detail.privacy_consented_at && (
                                                <AuditRow
                                                    label={`Privacy consent (${detail.privacy_notice_version ?? 'v1.0'})`}
                                                    at={detail.privacy_consented_at}
                                                    by="Stamped legally at core entry submission"
                                                />
                                            )}
                                        </CardContent>
                                    </Card>

                                    {activityLogData.length > 0 && (
                                        <Card>
                                            <CardHeader className="p-4 sm:p-6">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <ClockArrowUp className="h-4 w-4 text-slate-600" /> System Activity Log
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                                <ol className="space-y-4">
                                                    {activityLogData.map((entry) => (
                                                        <li key={entry.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                                                <p className="text-xs font-semibold text-slate-800">{entry.description}</p>
                                                                <p className="text-xs font-semibold text-slate-700">{entry.by ?? 'System'}</p>
                                                                <p className="text-[11px] text-slate-400 sm:text-right">
                                                                    {entry.at ? new Date(entry.at).toLocaleString() : '—'}
                                                                </p>
                                                            </div>
                                                            {Object.keys(entry.changes).length > 0 && (
                                                                <ul className="mt-2 space-y-1">
                                                                    {Object.entries(entry.changes).map(([field, newVal]) => (
                                                                        <li key={field} className="text-xs break-words text-slate-600">
                                                                            <span className="font-mono text-slate-500">
                                                                                {field.replace(/_/g, ' ')}
                                                                            </span>
                                                                            {': '}
                                                                            <AuditValue value={entry.old[field] ?? '—'} muted />
                                                                            {' → '}
                                                                            <AuditValue value={newVal ?? '—'} />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {entry.reason && (
                                                                <p className="mt-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                                                                    <span className="font-semibold text-slate-700">Correction reason:</span>{' '}
                                                                    {entry.reason}
                                                                </p>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Internal remarks row (renders unconditionally if populated) */}
                            {detail.remarks && (
                                <Card className="mt-4 sm:mt-6">
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <MessageSquare className="h-4 w-4 text-slate-600" /> Historical Verification Remarks
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{detail.remarks}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* ─── Right Column (Static Action Control Panel) ─── */}
                        <div className="space-y-4 sm:space-y-6 lg:col-span-4">
                            {/* Cross-municipality double-dip advisory — shown to the
                                cashier BEFORE release so they can coordinate. */}
                            {crossMatches.length > 0 && (
                                <div className="hidden lg:block">
                                    <CrossMunicipalityWarning matches={crossMatches} context="release" />
                                </div>
                            )}

                            {/* ─── Documents: printable PDFs for case folder / COA ─── */}
                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="h-4 w-4 text-slate-600" /> Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 px-4 pb-4 sm:px-6 sm:pb-6">
                                    {canGenerateFinancialDocumentPacket && (
                                        <Link
                                            href={ShowFinancialDocumentPacketGeneratorController.url({
                                                municipality: currentMunicipality.slug,
                                                assistanceRequestId: detail.id,
                                            })}
                                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-950 bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            <Files className="h-4 w-4" />
                                            Generate Processing Document Packet
                                        </Link>
                                    )}
                                    {canGenerateObligationRequest && (
                                        <Link
                                            href={ShowObligationRequestGeneratorController.url({
                                                municipality: currentMunicipality.slug,
                                                assistanceRequestId: detail.id,
                                            })}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            <FilePenLine className="h-4 w-4" />
                                            Generate Obligation Request
                                        </Link>
                                    )}
                                    {canGenerateDisbursementVoucher && (
                                        <Link
                                            href={ShowDisbursementVoucherGeneratorController.url({
                                                municipality: currentMunicipality.slug,
                                                assistanceRequestId: detail.id,
                                            })}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-blue-700 bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                                        >
                                            <ReceiptText className="h-4 w-4" />
                                            Generate Disbursement Voucher
                                        </Link>
                                    )}
                                    {canGenerateCertificateOfEligibility && (
                                        <Link
                                            href={ShowCertificateOfEligibilityGeneratorController.url({
                                                municipality: currentMunicipality.slug,
                                                assistanceRequestId: detail.id,
                                            })}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-700 bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                        >
                                            <BadgeCheck className="h-4 w-4" />
                                            Generate Certificate of Eligibility
                                        </Link>
                                    )}
                                    {canGenerateAcknowledgementReceipt && (
                                        <Link
                                            href={acknowledgementReceiptUrl}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 hover:text-blue-900"
                                        >
                                            <Printer className="h-4 w-4" />
                                            Generate Acknowledgement Receipt
                                        </Link>
                                    )}
                                    {canGenerateRequestIntakeSheet && (
                                        <Link
                                            href={ShowAssistanceRequestIntakeSheetGeneratorController.url({
                                                municipality: currentMunicipality.slug,
                                                assistanceRequestId: detail.id,
                                            })}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            <ClipboardCheck className="h-4 w-4" />
                                            Prepare Request Intake Sheet
                                        </Link>
                                    )}
                                    {/* Temporarily disabled
                                    {canViewBeneficiaries && (
                                        <a
                                            href={DownloadBeneficiaryIntakeSheetController.url({
                                                municipality: currentMunicipality.slug,
                                                beneficiaryId: detail.beneficiary_id,
                                            })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Beneficiary Intake Sheet (PDF)
                                        </a>
                                    )}
                                    */}
                                    <p className="text-[11px] leading-snug text-slate-400">
                                        Obligation Request and Disbursement Voucher values are entered for each print and are not saved. Generating a
                                        processing document does not mark the assistance as released.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Sticky context metrics below actions */}
                            {detail.assistance_type && (
                                <Card>
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Home className="h-4 w-4 text-slate-600" /> Program Parameters
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 px-4 pb-4 text-sm sm:px-6 sm:pb-6">
                                        <p className="font-semibold text-slate-900">{detail.assistance_type.name}</p>
                                        {detail.assistance_type.description && (
                                            <p className="text-xs leading-relaxed text-slate-600">{detail.assistance_type.description}</p>
                                        )}
                                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                                            <div>
                                                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Min Funding</p>
                                                <p className="font-semibold text-slate-800">
                                                    {utils.formatCurrency(detail.assistance_type.min_amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Max Funding</p>
                                                <p className="font-semibold text-slate-800">
                                                    {utils.formatCurrency(detail.assistance_type.max_amount)}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Policy Cooldown</p>
                                                <p className="text-slate-700">
                                                    {detail.assistance_type.cooldown_months} months (
                                                    {detail.assistance_type.cooldown_scope.replace('_', ' ')})
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="text-base">Filer's Case History</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                    {recentHistoryData.length === 0 ? (
                                        <p className="py-2 text-center text-sm text-slate-400 italic">First-time program applicant.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {recentHistoryData.map((row) => (
                                                <li key={row.id} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3 sm:py-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="font-mono text-xs font-semibold break-all text-slate-800">
                                                                {row.transaction_number}
                                                            </p>
                                                            <p className="line-clamp-2 text-xs text-slate-600 sm:truncate">
                                                                {row.program_name ?? '—'}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${statusClass(row.status)}`}
                                                        >
                                                            {humanizeStatus(row.status)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                        {utils.formatToReadableDateNoTime(row.submitted_at ?? undefined)}
                                                        {row.amount_approved !== null && <> · {utils.formatCurrency(row.amount_approved)}</>}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>

                            {canProcessRequests && (
                                <Card>
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="text-base">Internal Note</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                                        <div className="pt-1">
                                            <label className="mb-1.5 block text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                                                Append detail to case history
                                            </label>
                                            <Textarea
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                                placeholder="Type internal remarks here…"
                                                rows={3}
                                                className="resize-none text-sm"
                                            />
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="mt-2 w-full"
                                                disabled={!adminNote.trim()}
                                                onClick={stubAction('Add Note')}
                                            >
                                                <Send className="mr-2 h-3.5 w-3.5" /> Append Note
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {canDecideRequests && (
                <>
                    <ApproveRequestDialog
                        requestId={detail.id}
                        isOpen={isApproveOpen}
                        onClose={() => setIsApproveOpen(false)}
                        minAmount={detail.assistance_type?.min_amount}
                        maxAmount={detail.assistance_type?.max_amount}
                    />

                    <CancelApprovedRequestDialog
                        requestId={detail.id}
                        transactionNumber={detail.transaction_number}
                        amountApproved={detail.amount_approved}
                        isOpen={isCancelApprovedOpen}
                        onClose={() => setIsCancelApprovedOpen(false)}
                    />

                    <RejectRequestDialog
                        requestId={detail.id}
                        applicantName={detail.identity_snapshot?.full_name || undefined}
                        isOpen={isRejectOpen}
                        onClose={() => setIsRejectOpen(false)}
                    />
                </>
            )}
            {canCorrectApprovedAmount && detail.amount_approved !== null && (
                <CorrectApprovedAssistanceAmountDialog
                    requestId={detail.id}
                    transactionNumber={detail.transaction_number}
                    currentAmount={detail.amount_approved}
                    minAmount={detail.assistance_type?.min_amount}
                    maxAmount={detail.assistance_type?.max_amount}
                    isOpen={isCorrectAmountOpen}
                    onClose={() => setIsCorrectAmountOpen(false)}
                />
            )}

            {canReleaseRequests && (
                <ReleaseRequestDialog
                    requestId={detail.id}
                    amountApproved={detail.amount_approved}
                    isOpen={isReleaseOpen}
                    onClose={() => setIsReleaseOpen(false)}
                />
            )}
            {canCorrectMissingDateOfDeath && (
                <CorrectMissingBurialDateOfDeathDialog
                    requestId={detail.id}
                    transactionNumber={detail.transaction_number}
                    isOpen={isMissingDateCorrectionOpen}
                    onClose={() => setIsMissingDateCorrectionOpen(false)}
                />
            )}
            {canCorrectCompletedHousehold && (
                <SyncApprovedHouseholdDialog
                    requestId={detail.id}
                    transactionNumber={detail.transaction_number}
                    preview={householdAssessmentPreview}
                    isOpen={isApprovedHouseholdSyncOpen}
                    onClose={() => setIsApprovedHouseholdSyncOpen(false)}
                />
            )}
            {additionalDocumentToReplace && (
                <ReplaceAdditionalDocumentDialog
                    requestId={detail.id}
                    document={additionalDocumentToReplace}
                    label={documentKeyOf(additionalDocumentToReplace).replace(/_/g, ' ')}
                    onClose={() => setAdditionalDocumentToReplace(null)}
                />
            )}
            <FlashHandler />
            <ToastProvider position="top-right" />
        </>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sub-components & Cleaned Render Blocks
// ═════════════════════════════════════════════════════════════════════════════

function Field({ label, value, sub, capitalize = false }: { label: string; value: string; sub?: string; capitalize?: boolean }) {
    return (
        <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{label}</p>
            <p className={`mt-0.5 text-sm font-semibold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
        </div>
    );
}

function MobileDetail({
    label,
    value,
    capitalize = false,
    strong = false,
}: {
    label: string;
    value: string;
    capitalize?: boolean;
    strong?: boolean;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{label}</p>
            <p className={`mt-0.5 text-xs break-words text-slate-700 ${capitalize ? 'capitalize' : ''} ${strong ? 'font-semibold' : ''}`}>{value}</p>
        </div>
    );
}

function AuditValue({ value, muted = false }: { value: unknown; muted?: boolean }) {
    if (typeof value === 'object' && value !== null) {
        return (
            <details className="inline-block align-top">
                <summary className={`cursor-pointer ${muted ? 'text-slate-400 line-through' : 'font-medium text-slate-800'}`}>
                    View household data
                </summary>
                <pre className="mt-1 max-h-48 overflow-auto rounded bg-slate-950 p-2 text-[10px] text-slate-100">
                    {JSON.stringify(value, null, 2)}
                </pre>
            </details>
        );
    }

    return <span className={muted ? 'text-slate-400 line-through' : 'font-medium text-slate-800'}>{String(value)}</span>;
}

function InfoLine({ icon, children, variant = 'neutral' }: { icon: React.ReactNode; children: React.ReactNode; variant?: 'neutral' | 'info' }) {
    const tone = variant === 'info' ? 'border-blue-100 bg-blue-50 text-blue-900' : 'border-slate-100 bg-slate-50 text-slate-700';
    return (
        <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${tone}`}>
            <span className="mt-0.5 shrink-0">{icon}</span>
            <p className="leading-relaxed">{children}</p>
        </div>
    );
}

function AuditRow({ label, at, by }: { label: string; at: string | null; by?: string }) {
    const utils = Utility();
    return (
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">{label}</p>
                {by && <p className="mt-0.5 text-[11px] text-slate-500">{by}</p>}
            </div>
            <p className="text-[11px] text-slate-400 sm:shrink-0 sm:text-right sm:whitespace-nowrap">{at ? utils.formatToReadableDate(at) : '—'}</p>
        </div>
    );
}

function DocumentRow({
    file,
    canReplace,
    isIdentityDocument,
    onReplace,
}: {
    file: DocumentBlock;
    canReplace: boolean;
    isIdentityDocument: boolean;
    onReplace: () => void;
}) {
    const utils = Utility();
    const label = ((file.custom_properties?.document_key as string | undefined) ?? file.collection_name).replace(/_/g, ' ');
    const isImage = file.mime_type?.startsWith('image/');

    return (
        <div className="group flex min-h-20 flex-row overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-[#005088] hover:shadow-md sm:flex-col sm:rounded-xl">
            <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-r border-slate-100 bg-slate-50 sm:h-32 sm:w-full sm:border-r-0 sm:border-b"
            >
                {isImage ? (
                    <img
                        src={file.url}
                        alt={file.file_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <FileText className="h-10 w-10 text-slate-300 transition-colors group-hover:text-[#005088]" />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 hidden items-center justify-center bg-slate-900/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 sm:flex">
                    <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#005088]" /> View Document
                    </span>
                </div>
                <span className="absolute right-1 bottom-1 rounded bg-white px-1.5 py-1 text-[9px] font-bold text-slate-700 shadow-sm sm:hidden">
                    View
                </span>
            </a>

            <div className="min-w-0 flex-1 p-3">
                <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 capitalize" title={label}>
                        {label}
                    </p>
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {formatBytes(file.size)}
                    {file.uploaded_at && <> • {utils.formatToReadableDateNoTime(file.uploaded_at)}</>}
                </p>
                {canReplace && (
                    <Button type="button" variant="outline" size="sm" className="mt-3 h-8 w-full text-xs" onClick={onReplace}>
                        <Upload className="mr-2 h-3.5 w-3.5" /> Replace file
                    </Button>
                )}
                {isIdentityDocument && (
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                        Manage identity evidence from the beneficiary identity workflow.
                    </p>
                )}
            </div>
        </div>
    );
}

function ActionButtons({
    status,
    onAction,
    onPickUp,
    isMine,
    reviewerName,
    acknowledgementReceiptUrl,
    approvalBlockReason,
    releaseBlockReason,
    canProcess,
    canVerify,
    mswdVerificationStatus,
    isStartingMswdReview,
    canDecide,
    canCorrectApprovedAmount,
    canRelease,
    canGenerateAcknowledgementReceipt,
}: {
    status: string;
    onAction: (label: string) => () => void;
    onPickUp: () => void;
    isMine: boolean;
    reviewerName: string | null;
    acknowledgementReceiptUrl: string;
    approvalBlockReason: string | null;
    releaseBlockReason: string | null;
    canProcess: boolean;
    canVerify: boolean;
    mswdVerificationStatus: AssistanceMswdVerification['status'];
    isStartingMswdReview: boolean;
    canDecide: boolean;
    canCorrectApprovedAmount: boolean;
    canRelease: boolean;
    canGenerateAcknowledgementReceipt: boolean;
}) {
    const canStartOrResumeMswdReview =
        mswdVerificationStatus === null || mswdVerificationStatus === 'pending' || mswdVerificationStatus === 'needs_correction';

    switch (status) {
        case 'pending':
            return (
                <>
                    {canVerify && canStartOrResumeMswdReview && (
                        <Button className="min-h-10 w-full sm:w-auto" onClick={onPickUp} disabled={isStartingMswdReview}>
                            <UserCheck className="mr-2 h-4 w-4" /> Start MSWD Review
                        </Button>
                    )}
                    {canDecide && (
                        <Button
                            className="min-h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                            onClick={onAction('Approve')}
                            disabled={approvalBlockReason !== null}
                            title={approvalBlockReason ?? undefined}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Record Amount
                        </Button>
                    )}
                </>
            );
        case 'under_review':
            if (!isMine && !canDecide) {
                return (
                    <div className="col-span-2 flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:col-auto">
                        <UserCheck className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">Claimed by {reviewerName ?? 'another reviewer'}</span>
                    </div>
                );
            }
            return (
                <>
                    {canVerify && isMine && canStartOrResumeMswdReview && (
                        <Button variant="outline" className="min-h-10 w-full sm:w-auto" onClick={onPickUp} disabled={isStartingMswdReview}>
                            <UserCheck className="mr-2 h-4 w-4" /> Resume MSWD Review
                        </Button>
                    )}
                    {canDecide && (
                        <>
                            <Button
                                className="min-h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                                onClick={onAction('Approve')}
                                disabled={approvalBlockReason !== null}
                                title={approvalBlockReason ?? undefined}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Record Amount
                            </Button>
                            <Button variant="destructive" className="min-h-10 w-full sm:w-auto" onClick={onAction('Reject')}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </>
                    )}
                    {canProcess && isMine && (
                        <Button
                            variant="outline"
                            className="col-span-2 min-h-10 w-full sm:col-auto sm:w-auto"
                            onClick={onAction('Request More Info')}
                        >
                            <AlertTriangle className="mr-2 h-4 w-4" /> Request More Info
                        </Button>
                    )}
                </>
            );
        case 'approved':
            return (
                <>
                    {canVerify && canStartOrResumeMswdReview && (!reviewerName || isMine) && (
                        <Button variant="outline" className="min-h-10 w-full sm:w-auto" onClick={onPickUp} disabled={isStartingMswdReview}>
                            <UserCheck className="mr-2 h-4 w-4" /> {isMine ? 'Resume MSWD Review' : 'Start MSWD Review'}
                        </Button>
                    )}
                    {canRelease && (
                        <Button
                            className="min-h-10 w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
                            onClick={onAction('Mark Released')}
                            disabled={releaseBlockReason !== null}
                            title={releaseBlockReason ?? undefined}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Released
                        </Button>
                    )}
                    {canCorrectApprovedAmount && (
                        <Button
                            variant="outline"
                            className="min-h-10 w-full border-amber-200 text-amber-800 hover:bg-amber-50 hover:text-amber-900 sm:w-auto"
                            onClick={onAction('Correct Amount')}
                        >
                            <Pencil className="mr-2 h-4 w-4" /> Correct Amount
                        </Button>
                    )}
                    {canDecide && (
                        <Button
                            variant="outline"
                            className="min-h-10 w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 sm:w-auto"
                            onClick={onAction('Cancel Approved')}
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Approved Request
                        </Button>
                    )}
                    {canGenerateAcknowledgementReceipt && (
                        <Button variant="outline" className="min-h-10 w-full sm:w-auto" asChild>
                            <Link href={acknowledgementReceiptUrl}>
                                <Printer className="mr-2 h-4 w-4" />
                                <span className="sm:hidden">Receipt</span>
                                <span className="hidden sm:inline">Generate Acknowledgement Receipt</span>
                            </Link>
                        </Button>
                    )}
                </>
            );
        case 'released':
            return canGenerateAcknowledgementReceipt ? (
                <Button variant="outline" className="min-h-10 w-full sm:w-auto" asChild>
                    <Link href={acknowledgementReceiptUrl}>
                        <Printer className="mr-2 h-4 w-4" />
                        <span className="sm:hidden">Receipt</span>
                        <span className="hidden sm:inline">Generate Acknowledgement Receipt</span>
                    </Link>
                </Button>
            ) : null;
        case 'rejected':
            return canDecide ? (
                <Button variant="outline" className="min-h-10 w-full sm:w-auto" onClick={onAction('Reopen')}>
                    <AlertTriangle className="mr-2 h-4 w-4" /> Reopen
                </Button>
            ) : null;
        default:
            return <p className="text-xs text-slate-400 italic">No actions for this state.</p>;
    }
}

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

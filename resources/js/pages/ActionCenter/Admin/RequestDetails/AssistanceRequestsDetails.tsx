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
import { CrossMunicipalityWarning, type CrossMunicipalityMatch } from '@/components/Shared/CrossMunicipalityWarning';
import { FlashHandler } from '@/components/Shared/FlashHandler';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { AssistanceGeneratedDocument, AssistanceRequestFormDefinition, PhysicalCopyRequirement } from '@/Core/Types/ActionCenter/assistance';
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
    Circle,
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
import { useState } from 'react';
import ApproveRequestDialog from './Components/ApproveRequestDialog';
import CancelApprovedRequestDialog from './Components/CancelApprovedRequestDialog';
import CorrectMissingBurialDateOfDeathDialog from './Components/CorrectMissingBurialDateOfDeathDialog';
import RejectRequestDialog from './Components/RejectRequestDialog';
import ReleaseRequestDialog from './Components/ReleaseRequestDialog';

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
    address_snapshot: AddressSnapshot;
    privacy_consented_at: string | null;
    privacy_notice_version: string | null;
    beneficiary_id: string;
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

interface RequiredDocument {
    key: string;
    label: string;
    description: string | null;
    is_required: boolean;
    physical_copy_requirement: PhysicalCopyRequirement;
    physical_copy_requirement_label: string;
    sort_order: number;
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
    requiredDocuments: { data: RequiredDocument[] };
    recentHistory: { data: RecentHistoryRow[] };
    activityLog: { data: ActivityEntry[] };
    householdMembers: { data: HouseholdMemberBlock[] }; // 🚀 Injected family structure
    crossMunicipalityMatches: { data: CrossMunicipalityMatch[] };
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

const humanizeStatus = (s: string) => s.replace(/_/g, ' ');
const statusClass = (s: string): string => STATUS_BADGE[s] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';

export default function AssistanceRequestsDetails({
    request,
    requiredDocuments,
    recentHistory,
    activityLog,
    householdMembers,
    crossMunicipalityMatches,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { auth } = usePage<SharedData>().props;
    const { can } = usePermissions();
    const utils = Utility();
    const detail: AssistanceRequestDetail = 'data' in request ? request.data : request;
    const filerIdIsRequired = requiredDocuments.data.some(
        (document) => ['valid_id_front', 'valid_id_back'].includes(document.key) && document.is_required,
    );
    const recipientIdIsRequired =
        detail.on_behalf !== null &&
        filerIdIsRequired &&
        detail.assistance_type?.request_form.subject_type !== 'deceased' &&
        !detail.on_behalf.recipient_id_exception;
    const requiredDocumentsData = requiredDocuments.data
        .filter((document) => !document.key.startsWith('recipient_valid_id_') || detail.on_behalf !== null)
        .map((document) => (document.key.startsWith('recipient_valid_id_') && recipientIdIsRequired ? { ...document, is_required: true } : document));
    const recentHistoryData = recentHistory.data;
    const activityLogData = activityLog.data;
    const householdMembersData = householdMembers.data;
    const crossMatches = crossMunicipalityMatches?.data ?? [];
    const isMine = detail.reviewed_by?.id === auth.user?.id;
    const canViewBeneficiaries = can('action_center.beneficiaries.view');
    const canManageBeneficiaries = can('action_center.beneficiaries.manage');
    const canProcessRequests = can('action_center.requests.process');
    const canDecideRequests = can('action_center.requests.decide');
    const canReleaseRequests = can('action_center.requests.release');
    const canCorrectRequests = can('action_center.requests.correct');
    const [adminNote, setAdminNote] = useState<string>('');
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isCancelApprovedOpen, setIsCancelApprovedOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isReleaseOpen, setIsReleaseOpen] = useState(false);
    const [isMissingDateCorrectionOpen, setIsMissingDateCorrectionOpen] = useState(false);
    const [isRefreshingHouseholdAssessment, setIsRefreshingHouseholdAssessment] = useState(false);

    // Every upload lives in the single spatie collection "documents"; the slot
    // it fills is in custom_properties.document_key — NOT collection_name. Match
    // on that, falling back to collection_name for any legacy/unkeyed media.
    const documentKeyOf = (d: DocumentBlock) => (d.custom_properties?.document_key as string | undefined) ?? d.collection_name;
    const uploadedByKey = new Map((detail.documents ?? []).map((d) => [documentKeyOf(d), d]));
    const missingRequiredDocuments = requiredDocumentsData.filter((document) => document.is_required && !uploadedByKey.has(document.key));
    const hasMissingRequiredDocuments = missingRequiredDocuments.length > 0;
    const requiresDateOfDeath =
        detail.assistance_type?.request_form.fields.some((field) => field.key === 'on_behalf_date_of_death' && field.required) ?? false;
    const hasMissingDateOfDeath = requiresDateOfDeath && !detail.on_behalf?.date_of_death;
    const approvalBlockReason = hasMissingDateOfDeath
        ? 'Enter the Date of Death in Edit Request before approval.'
        : hasMissingRequiredDocuments
          ? 'Upload all required documents before approval.'
          : null;
    const requestIsEditable = detail.status === 'pending' || detail.status === 'under_review';
    const canEditRequest = requestIsEditable && canProcessRequests;
    const canRefreshHouseholdAssessment = detail.status === 'under_review' && isMine && canProcessRequests;
    const canManageInterviewHousehold = canRefreshHouseholdAssessment && canManageBeneficiaries;
    const canCorrectMissingDateOfDeath =
        canCorrectRequests &&
        detail.status === 'approved' &&
        requiresDateOfDeath &&
        detail.on_behalf !== null &&
        !detail.filed_for_self &&
        !detail.on_behalf.date_of_death;
    const extraDocuments = (detail.documents ?? []).filter((d) => !requiredDocumentsData.some((r) => r.key === documentKeyOf(d)));
    const receiptStatusIsEligible = detail.status === 'approved' || detail.status === 'released';
    const enabledGeneratedDocuments = new Set(detail.assistance_type?.enabled_generated_documents ?? []);
    const generatorIsEnabled = (document: AssistanceGeneratedDocument) => enabledGeneratedDocuments.has(document);
    const canGenerateAcknowledgementReceipt =
        generatorIsEnabled('acknowledgement_receipt') && receiptStatusIsEligible && detail.amount_approved !== null && canProcessRequests;
    const canGenerateObligationRequest =
        generatorIsEnabled('obligation_request') && receiptStatusIsEligible && detail.amount_approved !== null && canProcessRequests;
    const canGenerateDisbursementVoucher =
        generatorIsEnabled('disbursement_voucher') && receiptStatusIsEligible && detail.amount_approved !== null && canProcessRequests;
    const processingPacketDocumentCount = ['certificate_of_eligibility', 'obligation_request', 'disbursement_voucher'].filter((document) =>
        generatorIsEnabled(document as AssistanceGeneratedDocument),
    ).length;
    const canGenerateFinancialDocumentPacket =
        processingPacketDocumentCount >= 2 && receiptStatusIsEligible && detail.amount_approved !== null && canProcessRequests;
    const canGenerateCertificateOfEligibility =
        generatorIsEnabled('certificate_of_eligibility') &&
        canProcessRequests &&
        ['under_review', 'approved', 'released'].includes(detail.status) &&
        (detail.status !== 'under_review' || detail.reviewed_at !== null);
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
        router.post(
            actionCenter.assistance.startReview.url({ assistanceRequestId: detail.id }),
            {},
            {
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                preserveScroll: true,
            },
        );
    };

    const refreshHouseholdAssessment = () => {
        router.post(
            RefreshAssistanceHouseholdAssessmentController.url({ assistanceRequestId: detail.id }),
            {},
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
                                        canProcess={canProcessRequests}
                                        canDecide={canDecideRequests}
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

                {requestIsEditable && hasMissingRequiredDocuments && (
                    <div className="container mx-auto max-w-7xl px-4 pt-4 sm:px-6">
                        <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-amber-950">Awaiting required documents</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                                        {missingRequiredDocuments.length} required{' '}
                                        {missingRequiredDocuments.length === 1 ? 'document is' : 'documents are'} still missing:{' '}
                                        {missingRequiredDocuments.map((document) => document.label).join(', ')}. Approval remains unavailable until
                                        MSWD records them.
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
                                        <Upload className="mr-2 h-4 w-4" /> Upload documents
                                    </Link>
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
                            <Tabs defaultValue="intake" className="space-y-4 sm:space-y-6">
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
                                                                className="min-h-10 w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto"
                                                                disabled={isRefreshingHouseholdAssessment}
                                                                onClick={refreshHouseholdAssessment}
                                                            >
                                                                <RefreshCw
                                                                    className={`mr-2 h-4 w-4 ${isRefreshingHouseholdAssessment ? 'animate-spin' : ''}`}
                                                                />
                                                                {detail.household_assessment
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
                                        <CardHeader className="p-4 sm:p-6">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <FileText className="h-4 w-4 text-slate-600" /> Supporting Certificates & Verification Layouts
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                                                {requiredDocumentsData.map((req) => {
                                                    const uploaded = uploadedByKey.get(req.key);
                                                    return <DocumentRow key={req.key} required={req} file={uploaded} />;
                                                })}
                                            </div>

                                            {extraDocuments.length > 0 && (
                                                <>
                                                    <p className="mt-6 mb-3 border-t border-slate-100 pt-6 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                                        Extra attachments
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                                                        {extraDocuments.map((doc) => (
                                                            <DocumentRow key={doc.id} file={doc} />
                                                        ))}
                                                    </div>
                                                </>
                                            )}

                                            {requiredDocumentsData.length === 0 && (detail.documents ?? []).length === 0 && (
                                                <p className="py-2 text-center text-sm text-slate-400 italic">No verifying files attached.</p>
                                            )}
                                        </CardContent>
                                    </Card>
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
                                                                            <span className="text-slate-400 line-through">
                                                                                {String(entry.old[field] ?? '—')}
                                                                            </span>
                                                                            {' → '}
                                                                            <span className="font-medium text-slate-800">
                                                                                {String(newVal ?? '—')}
                                                                            </span>
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

function DocumentRow({ required, file }: { required?: RequiredDocument; file?: DocumentBlock }) {
    const utils = Utility();
    const isMissing = required && !file;
    const isOptional = required && !required.is_required;
    const label = required?.label ?? ((file?.custom_properties?.document_key as string | undefined) ?? file?.collection_name)?.replace(/_/g, ' ');

    if (isMissing && !isOptional) {
        return (
            <div className="flex flex-row overflow-hidden rounded-lg border border-rose-200 bg-rose-50/50 transition hover:shadow-sm sm:flex-col sm:rounded-xl">
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 border-r border-rose-100 bg-white p-2 text-center sm:h-32 sm:w-full sm:gap-2 sm:border-r-0 sm:border-b sm:p-4">
                    <XCircle className="h-8 w-8 text-rose-300" />
                    <p className="text-[10px] font-bold tracking-widest text-rose-600 uppercase">Missing Required</p>
                </div>
                <div className="min-w-0 flex-1 p-3">
                    <p className="truncate text-sm font-semibold text-slate-900 capitalize" title={label}>
                        {label}
                    </p>
                    <p className="mt-0.5 text-xs text-rose-500">Action required</p>
                    {required.physical_copy_requirement !== 'unspecified' && (
                        <p className="mt-1 text-[11px] font-medium text-blue-700">Bring: {required.physical_copy_requirement_label}</p>
                    )}
                </div>
            </div>
        );
    }

    if (isMissing && isOptional) {
        return (
            <div className="flex flex-row overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition hover:shadow-sm sm:flex-col sm:rounded-xl">
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 border-r border-slate-100 bg-white p-2 text-center opacity-60 sm:h-32 sm:w-full sm:gap-2 sm:border-r-0 sm:border-b sm:p-4">
                    <Circle className="h-8 w-8 text-slate-300" />
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Optional</p>
                </div>
                <div className="min-w-0 flex-1 p-3 opacity-60">
                    <p className="truncate text-sm font-medium text-slate-500 capitalize" title={label}>
                        {label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">Not provided</p>
                    {required.physical_copy_requirement !== 'unspecified' && (
                        <p className="mt-1 text-[11px] text-slate-500">Bring: {required.physical_copy_requirement_label}</p>
                    )}
                </div>
            </div>
        );
    }

    if (!file) return null;

    const isImage = file.mime_type?.startsWith('image/');

    return (
        <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-20 flex-row overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-[#005088] hover:shadow-md sm:flex-col sm:rounded-xl"
        >
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-r border-slate-100 bg-slate-50 sm:h-32 sm:w-full sm:border-r-0 sm:border-b">
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
            </div>

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
                {required && required.physical_copy_requirement !== 'unspecified' && (
                    <p className="mt-1 text-[11px] font-medium text-blue-700">Physical copy: {required.physical_copy_requirement_label}</p>
                )}
            </div>
        </a>
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
    canProcess,
    canDecide,
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
    canProcess: boolean;
    canDecide: boolean;
    canRelease: boolean;
    canGenerateAcknowledgementReceipt: boolean;
}) {
    switch (status) {
        case 'pending':
            return canProcess ? (
                <Button className="col-span-2 min-h-10 w-full sm:col-auto sm:w-auto" onClick={onPickUp}>
                    <UserCheck className="mr-2 h-4 w-4" /> Pick Up Case
                </Button>
            ) : null;
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
                    {canDecide && (
                        <>
                            <Button
                                className="min-h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                                onClick={onAction('Approve')}
                                disabled={approvalBlockReason !== null}
                                title={approvalBlockReason ?? undefined}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
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
                    {canRelease && (
                        <Button className="min-h-10 w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto" onClick={onAction('Mark Released')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Released
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

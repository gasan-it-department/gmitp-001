import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import DownloadBeneficiaryIntakeSheetController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/DownloadBeneficiaryIntakeSheetController';
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
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import ToastProvider from '@/pages/Utility/ToastShower';
import Utility from '@/pages/Utility/Utility';
import actionCenter from '@/routes/actionCenter';
import { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Circle,
    ClockArrowUp,
    Download,
    FileText,
    Home,
    Info,
    MapPin,
    MessageSquare,
    Pencil,
    Printer,
    Send,
    ShieldCheck,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import ApproveRequestDialog from './Components/ApproveRequestDialog';
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
}

interface DocumentBlock {
    id: string;
    uuid: string;
    collection_name: string;
    name: string;
    file_name: string;
    mime_type: string | null;
    size: number;
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
    date_of_death: string | null;
}

interface HouseholdMemberBlock {
    id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    relationship: string;
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
    approved_at: string | null;
    released_at: string | null;
    is_walkin: boolean;
    encoded_by?: ShortUser | null;
    reviewed_by?: ShortUser | null;
    approved_by?: ShortUser | null;
    filed_for_self: boolean;
    relationship: { value: string; label: string } | null;
    on_behalf: OnBehalfBlock | null;
    identity_snapshot: IdentitySnapshot;
    address_snapshot: AddressSnapshot;
    privacy_consented_at: string | null;
    privacy_notice_version: string | null;
    beneficiary_id: string;
    household_id: string;
    documents?: DocumentBlock[];
    created_at: string | null;
    updated_at: string | null;
}

interface RequiredDocument {
    key: string;
    label: string;
    description: string | null;
    is_required: boolean;
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
    console.log(request);
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { auth } = usePage<SharedData>().props;
    const utils = Utility();
    const requiredDocumentsData = requiredDocuments.data;
    const recentHistoryData = recentHistory.data;
    const activityLogData = activityLog.data;
    const householdMembersData = householdMembers.data;
    const crossMatches = crossMunicipalityMatches?.data ?? [];
    const detail: AssistanceRequestDetail = 'data' in request ? request.data : request;

    const isMine = detail.reviewed_by?.id === auth.user?.id;
    const [adminNote, setAdminNote] = useState<string>('');
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isReleaseOpen, setIsReleaseOpen] = useState(false);

    // Every upload lives in the single spatie collection "documents"; the slot
    // it fills is in custom_properties.document_key — NOT collection_name. Match
    // on that, falling back to collection_name for any legacy/unkeyed media.
    const documentKeyOf = (d: DocumentBlock) => (d.custom_properties?.document_key as string | undefined) ?? d.collection_name;
    const uploadedByKey = new Map((detail.documents ?? []).map((d) => [documentKeyOf(d), d]));
    const extraDocuments = (detail.documents ?? []).filter((d) => !requiredDocumentsData.some((r) => r.key === documentKeyOf(d)));

    const handleAction = (label: string) => () => {
        if (label === 'Approve') {
            setIsApproveOpen(true);
            return;
        }
        if (label === 'Reject') {
            setIsRejectOpen(true);
            return;
        }
        if (label === 'Mark Released') {
            setIsReleaseOpen(true);
            return;
        }
        // eslint-disable-next-line no-console
        console.warn(`[admin] action not yet wired: ${label}`, { requestId: detail.id, note: adminNote || undefined });
        alert(`"${label}" is not wired yet.`);
    };

    const stubAction = (label: string) => () => {
        // eslint-disable-next-line no-console
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

    // Calculate total family economics for validation
    const totalHouseholdIncome = householdMembersData.reduce((sum, m) => sum + m.monthly_income, 0);

    return (
        <>
            <div className="bg-slate-50 pb-12">
                {/* Back navigation */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-6 py-4">
                        <Link
                            href={ListAssistanceRequestController.url({ municipality: currentMunicipality.slug })}
                            className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Assistance Requests
                        </Link>
                    </div>
                </div>

                {/* Header strip */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-6 py-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-900">{detail.transaction_number}</h1>
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
                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <ActionButtons
                                        status={detail.status}
                                        onAction={handleAction}
                                        onPickUp={handlePickUp}
                                        isMine={isMine}
                                        reviewerName={detail.reviewed_by?.name ?? null}
                                    />

                                    <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                                    <Link
                                        href={ShowBeneficiaryProfileController.url({
                                            municipality: currentMunicipality.slug,
                                            beneficiaryId: detail.beneficiary_id,
                                        })}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <User className="h-4 w-4" /> View Beneficiary Profile
                                    </Link>

                                    {/* Correct a mistake — only while the request is still
                                        editable (pending / under_review). Locked states show
                                        no button; the server enforces the same gate. */}
                                    {(detail.status === 'pending' || detail.status === 'under_review') && (
                                        <Link
                                            href={EditAssistanceRequestController.url({
                                                municipality: currentMunicipality.slug,
                                                assistanceRequest: detail.id,
                                            })}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            <Pencil className="h-4 w-4" /> Edit Request
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {detail.amount_approved !== null && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-right">
                                    <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">Amount Approved</p>
                                    <p className="mt-0.5 text-2xl font-bold text-emerald-900">{utils.formatCurrency(detail.amount_approved)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="container mx-auto max-w-7xl px-6 py-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* ─── Tabbed Layout Left Panel ─── */}
                        <div className="lg:col-span-8">
                            <Tabs defaultValue="intake" className="space-y-6">
                                <TabsList className="grid w-full grid-cols-4 bg-slate-200/70 p-1">
                                    <TabsTrigger value="intake" className="text-xs font-medium">
                                        Intake Summary
                                    </TabsTrigger>
                                    <TabsTrigger value="household" className="flex items-center gap-1.5 text-xs font-medium">
                                        Household{' '}
                                        <Badge variant="secondary" className="h-4 bg-slate-300 px-1 text-[10px]">
                                            {householdMembersData.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="documents" className="text-xs font-medium">
                                        Documents
                                    </TabsTrigger>
                                    <TabsTrigger value="audit" className="text-xs font-medium">
                                        Audit Trails
                                    </TabsTrigger>
                                </TabsList>

                                {/* TAB 1: INTAKE SUMMARY */}
                                <TabsContent value="intake" className="space-y-6 outline-none">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <User className="h-4 w-4 text-slate-600" /> Subject of the Request
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {detail.filed_for_self ? (
                                                <InfoLine icon={<UserCheck className="h-4 w-4" />}>Filed by the beneficiary for themselves.</InfoLine>
                                            ) : (
                                                <InfoLine icon={<Info className="h-4 w-4 text-blue-600" />} variant="info">
                                                    Filed on behalf of <strong>{detail.on_behalf?.full_name}</strong> by their{' '}
                                                    <strong>{detail.relationship?.label.toLowerCase()}</strong>.
                                                    {detail.on_behalf?.date_of_death && (
                                                        <span className="ml-1">
                                                            Date of death: {utils.formatToReadableDateNoTime(detail.on_behalf.date_of_death)}.
                                                        </span>
                                                    )}
                                                </InfoLine>
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
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <MapPin className="h-4 w-4 text-slate-600" /> Home Address (at submission)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
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
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <MessageSquare className="h-4 w-4 text-slate-600" /> Reason for Request
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                                                {detail.description?.trim() || <span className="text-slate-400 italic">No reason provided.</span>}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 2: HOUSEHOLD COMPOSITION (RESILIENT SIDE-BY-SIDE INTEGRATION) */}
                                <TabsContent value="household" className="outline-none">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Users className="h-4 w-4 text-slate-600" /> Family Composition
                                            </CardTitle>
                                            <div className="text-right">
                                                <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                    Est. Monthly Income
                                                </span>
                                                <span className="text-sm font-bold text-slate-700">{utils.formatCurrency(totalHouseholdIncome)}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {householdMembersData.length === 0 ? (
                                                <p className="py-4 text-center text-sm text-slate-400 italic">No family profiles declared.</p>
                                            ) : (
                                                <div className="overflow-hidden rounded-md border border-slate-100">
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
                                                                        {member.first_name} {member.middle_name ? `${member.middle_name[0]}. ` : ''}{' '}
                                                                        {member.last_name} {member.suffix}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs text-slate-600 capitalize">
                                                                        {member.relationship.toLowerCase()}
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
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 3: DOCUMENTS */}
                                <TabsContent value="documents" className="space-y-6 outline-none">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <FileText className="h-4 w-4 text-slate-600" /> Supporting Certificates & Verification Layouts
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {requiredDocumentsData.map((req) => {
                                                const uploaded = uploadedByKey.get(req.key);
                                                return <DocumentRow key={req.key} required={req} file={uploaded} />;
                                            })}

                                            {extraDocuments.length > 0 && (
                                                <>
                                                    <p className="mt-4 mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                                        Extra attachments
                                                    </p>
                                                    {extraDocuments.map((doc) => (
                                                        <DocumentRow key={doc.id} file={doc} />
                                                    ))}
                                                </>
                                            )}

                                            {requiredDocumentsData.length === 0 && (detail.documents ?? []).length === 0 && (
                                                <p className="py-2 text-center text-sm text-slate-400 italic">No verifying files attached.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 4: AUDIT HISTORY */}
                                <TabsContent value="audit" className="space-y-6 outline-none">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <ShieldCheck className="h-4 w-4 text-slate-600" /> Core Workflow Milestones
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
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
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <ClockArrowUp className="h-4 w-4 text-slate-600" /> System Activity Log
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ol className="space-y-4">
                                                    {activityLogData.map((entry) => (
                                                        <li key={entry.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-xs font-semibold text-slate-700">{entry.by ?? 'System'}</p>
                                                                <p className="text-[11px] text-slate-400">
                                                                    {entry.at ? new Date(entry.at).toLocaleString() : '—'}
                                                                </p>
                                                            </div>
                                                            {Object.keys(entry.changes).length > 0 && (
                                                                <ul className="mt-2 space-y-1">
                                                                    {Object.entries(entry.changes).map(([field, newVal]) => (
                                                                        <li key={field} className="text-xs text-slate-600">
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
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <MessageSquare className="h-4 w-4 text-slate-600" /> Historical Verification Remarks
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{detail.remarks}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* ─── Right Column (Static Action Control Panel) ─── */}
                        <div className="space-y-6 lg:col-span-4">
                            {/* Cross-municipality double-dip advisory — shown to the
                                cashier BEFORE release so they can coordinate. */}
                            {crossMatches.length > 0 && <CrossMunicipalityWarning matches={crossMatches} context="release" />}

                            {/* ─── Documents: printable PDFs for case folder / COA ─── */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="h-4 w-4 text-slate-600" /> Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
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
                                        Download Intake Sheet (PDF)
                                    </a>
                                    <p className="text-[11px] leading-snug text-slate-400">
                                        Generates the official beneficiary intake sheet for the case folder. Opens in a new tab.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Sticky context metrics below actions */}
                            {detail.assistance_type && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Home className="h-4 w-4 text-slate-600" /> Program Parameters
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
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
                                <CardHeader>
                                    <CardTitle className="text-base">Filer's Case History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentHistoryData.length === 0 ? (
                                        <p className="py-2 text-center text-sm text-slate-400 italic">First-time program applicant.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {recentHistoryData.map((row) => (
                                                <li key={row.id} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="font-mono text-xs font-semibold text-slate-800">{row.transaction_number}</p>
                                                            <p className="truncate text-xs text-slate-600">{row.program_name ?? '—'}</p>
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

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Internal Note</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
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
                        </div>
                    </div>
                </div>
            </div>

            <ApproveRequestDialog
                requestId={detail.id}
                isOpen={isApproveOpen}
                onClose={() => setIsApproveOpen(false)}
                minAmount={detail.assistance_type?.min_amount}
                maxAmount={detail.assistance_type?.max_amount}
            />

            <RejectRequestDialog
                requestId={detail.id}
                applicantName={detail.identity_snapshot?.full_name || undefined}
                isOpen={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
            />

            <ReleaseRequestDialog
                requestId={detail.id}
                amountApproved={detail.amount_approved}
                isOpen={isReleaseOpen}
                onClose={() => setIsReleaseOpen(false)}
            />
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
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">{label}</p>
                {by && <p className="mt-0.5 text-[11px] text-slate-500">{by}</p>}
            </div>
            <p className="shrink-0 text-[11px] whitespace-nowrap text-slate-400">{at ? utils.formatToReadableDate(at) : '—'}</p>
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
            <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/50 px-4 py-3">
                <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                    <div>
                        <p className="text-sm font-semibold text-rose-900 capitalize">{label}</p>
                        <p className="text-xs text-rose-700">Required Document — Missing</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isMissing && isOptional) {
        return (
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/30 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                    <div>
                        <p className="text-sm font-medium text-slate-500 capitalize">{label}</p>
                        <p className="text-xs text-slate-400">Optional Document — Not Provided</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!file) return null;

    return (
        <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/40 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 capitalize">{label}</p>
                    <p className="truncate text-xs text-slate-500">
                        {file.file_name} · {formatBytes(file.size)}
                        {file.uploaded_at && <> · Uploaded {utils.formatToReadableDateNoTime(file.uploaded_at)}</>}
                    </p>
                </div>
            </div>
            <Button
                size="sm"
                variant="ghost"
                className="ml-3 shrink-0 text-slate-700 hover:bg-emerald-100"
                onClick={() => alert(`Download trigger for ${file.file_name}`)}
            >
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </Button>
        </div>
    );
}

function ActionButtons({
    status,
    onAction,
    onPickUp,
    isMine,
    reviewerName,
}: {
    status: string;
    onAction: (label: string) => () => void;
    onPickUp: () => void;
    isMine: boolean;
    reviewerName: string | null;
}) {
    switch (status) {
        case 'pending':
            return (
                <Button className="w-full sm:w-auto" onClick={onPickUp}>
                    <UserCheck className="mr-2 h-4 w-4" /> Pick Up Case
                </Button>
            );
        case 'under_review':
            if (!isMine) {
                return (
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <UserCheck className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">Claimed by {reviewerName ?? 'another reviewer'}</span>
                    </div>
                );
            }
            return (
                <>
                    <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto" onClick={onAction('Approve')}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button variant="destructive" className="w-full sm:w-auto" onClick={onAction('Reject')}>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={onAction('Request More Info')}>
                        <AlertTriangle className="mr-2 h-4 w-4" /> Request More Info
                    </Button>
                </>
            );
        case 'approved':
            return (
                <>
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto" onClick={onAction('Mark Released')}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Released
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={onAction('Print Voucher')}>
                        <Printer className="mr-2 h-4 w-4" /> Print Voucher
                    </Button>
                </>
            );
        case 'released':
            return (
                <Button variant="outline" className="w-full sm:w-auto" onClick={onAction('Print Receipt')}>
                    <Printer className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
            );
        case 'rejected':
            return (
                <Button variant="outline" className="w-full sm:w-auto" onClick={onAction('Reopen')}>
                    <AlertTriangle className="mr-2 h-4 w-4" /> Reopen
                </Button>
            );
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

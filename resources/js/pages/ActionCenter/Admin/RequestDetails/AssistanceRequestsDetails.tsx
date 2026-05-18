import ListAssistanceRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ListAssistanceRequestController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import Utility from '@/pages/Utility/Utility';
import { Link, usePage } from '@inertiajs/react';
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
    Printer,
    Send,
    ShieldCheck,
    User,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

// ═════════════════════════════════════════════════════════════════════════════
// Types — mirror AssistanceRequestDetailsResource + controller props exactly
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
    /** New values — keyed by column name. */
    changes: Record<string, unknown>;
    /** Previous values for the same keys. */
    old: Record<string, unknown>;
    by: string | null;
    at: string;
}

interface Props {
    request: { data: AssistanceRequestDetail } | AssistanceRequestDetail;
    requiredDocuments: RequiredDocument[];
    recentHistory: RecentHistoryRow[];
    activityLog: ActivityEntry[];
}

// ═════════════════════════════════════════════════════════════════════════════
// Status palette & workflow
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

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

export default function AssistanceRequestsDetails({ request, requiredDocuments, recentHistory, activityLog }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const utils = Utility();

    // Inertia resources can arrive wrapped ({data:…}) — handle both shapes.
    const detail: AssistanceRequestDetail = 'data' in request ? request.data : request;

    // ── Local UI state ───────────────────────────────────────────────────────
    const [adminNote, setAdminNote] = useState<string>('');

    // Pair the uploaded docs with the required-docs catalog so the reviewer
    // sees one row per *expected* document (uploaded or missing) plus any
    // extra files attached outside the catalog.
    const uploadedByKey = new Map((detail.documents ?? []).map((d) => [d.collection_name, d]));
    const extraDocuments = (detail.documents ?? []).filter((d) => !requiredDocuments.some((r) => r.key === d.collection_name));

    // ── Stubbed action handlers ──────────────────────────────────────────────
    // Each one is a placeholder for a future dedicated controller. They're
    // wired as named handlers here so swapping them out later is a one-line
    // change at the call site.
    const stubAction = (label: string) => () => {
        // eslint-disable-next-line no-console
        console.warn(`[admin] action not yet wired: ${label}`, {
            requestId: detail.id,
            note: adminNote || undefined,
        });
        alert(`"${label}" is not wired yet. The future POST controller will own this.`);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AdminLayout>
            <div className="bg-slate-50 pb-12">
                {/* ── Back navigation ── */}
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

                {/* ── Header strip ── */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="container mx-auto max-w-7xl px-6 py-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
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

                {/* ── Main grid ── */}
                <div className="container mx-auto max-w-7xl px-6 py-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* ─── Left column (main details) ─── */}
                        <div className="space-y-6 lg:col-span-8">
                            {/* Subject & on-behalf */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4 text-slate-600" />
                                        Subject of the Request
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

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                            {/* Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <MapPin className="h-4 w-4 text-slate-600" />
                                        Home Address (at submission)
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

                            {/* Citizen's stated reason */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <MessageSquare className="h-4 w-4 text-slate-600" />
                                        Reason for Request
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                                        {detail.description?.trim() || <span className="text-slate-400 italic">No reason provided.</span>}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Documents — required + extras */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="h-4 w-4 text-slate-600" />
                                        Supporting Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {requiredDocuments.map((req) => {
                                        const uploaded = uploadedByKey.get(req.key);
                                        return <DocumentRow key={req.key} required={req} file={uploaded} />;
                                    })}

                                    {extraDocuments.length > 0 && (
                                        <>
                                            <p className="mt-4 mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Extra files</p>
                                            {extraDocuments.map((doc) => (
                                                <DocumentRow key={doc.id} file={doc} />
                                            ))}
                                        </>
                                    )}

                                    {requiredDocuments.length === 0 && (detail.documents ?? []).length === 0 && (
                                        <p className="text-sm text-slate-400 italic">No documents uploaded.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Audit trail */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ShieldCheck className="h-4 w-4 text-slate-600" />
                                        Audit Trail
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
                                    {detail.reviewed_by && (
                                        <AuditRow
                                            label="Reviewed"
                                            at={null /* TODO: a reviewed_at column would be nice */}
                                            by={detail.reviewed_by.name}
                                        />
                                    )}
                                    {detail.approved_at && (
                                        <AuditRow label="Approved" at={detail.approved_at} by={detail.approved_by?.name ?? 'unknown'} />
                                    )}
                                    {detail.released_at && <AuditRow label="Released" at={detail.released_at} />}
                                    {detail.privacy_consented_at && (
                                        <AuditRow
                                            label={`Privacy consent (${detail.privacy_notice_version ?? 'v1.0'})`}
                                            at={detail.privacy_consented_at}
                                            by="Stamped by citizen at submission"
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Change History — spatie/laravel-activitylog */}
                            {activityLog.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <ClockArrowUp className="h-4 w-4 text-slate-600" />
                                            Change History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ol className="space-y-4">
                                            {activityLog.map((entry) => (
                                                <li key={entry.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-semibold text-slate-700">
                                                            {entry.by ?? 'System'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            {entry.at ? new Date(entry.at).toLocaleString() : '—'}
                                                        </p>
                                                    </div>
                                                    {Object.keys(entry.changes).length > 0 && (
                                                        <ul className="mt-2 space-y-1">
                                                            {Object.entries(entry.changes).map(([field, newVal]) => (
                                                                <li key={field} className="text-xs text-slate-600">
                                                                    <span className="font-mono text-slate-500">{field.replace(/_/g, ' ')}</span>
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

                            {/* Admin remarks (existing) */}
                            {detail.remarks && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <MessageSquare className="h-4 w-4 text-slate-600" />
                                            Internal Remarks
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{detail.remarks}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* ─── Right column (action panel + context) ─── */}
                        <div className="space-y-6 lg:col-span-4">
                            {/* Action panel — status-aware */}
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-base">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <ActionButtons status={detail.status} onAction={stubAction} />

                                    <div className="border-t border-slate-100 pt-3">
                                        <label className="mb-1.5 block text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                                            Internal note
                                        </label>
                                        <Textarea
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Add a note that will be appended to remarks…"
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
                                            <Send className="mr-2 h-3.5 w-3.5" />
                                            Append Note
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Program details */}
                            {detail.assistance_type && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Home className="h-4 w-4 text-slate-600" />
                                            Program
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <p className="font-semibold text-slate-900">{detail.assistance_type.name}</p>
                                        {detail.assistance_type.description && (
                                            <p className="text-xs leading-relaxed text-slate-600">{detail.assistance_type.description}</p>
                                        )}
                                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                                            <div>
                                                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Min</p>
                                                <p className="font-semibold text-slate-800">
                                                    {utils.formatCurrency(detail.assistance_type.min_amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Max</p>
                                                <p className="font-semibold text-slate-800">
                                                    {utils.formatCurrency(detail.assistance_type.max_amount)}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Cooldown</p>
                                                <p className="text-slate-700">
                                                    {detail.assistance_type.cooldown_months} months (
                                                    {detail.assistance_type.cooldown_scope.replace('_', ' ')})
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recent history */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Recent activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentHistory.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic">First request from this beneficiary.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {recentHistory.map((row) => (
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
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sub-components
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
    const label = required?.label ?? file?.collection_name.replace(/_/g, ' ');

    if (isMissing && !isOptional) {
        return (
            <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/50 px-4 py-3">
                <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                    <div>
                        <p className="text-sm font-semibold text-rose-900 capitalize">{label}</p>
                        <p className="text-xs text-rose-700">Required — not uploaded</p>
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
                        <p className="text-xs text-slate-400">Optional — not uploaded</p>
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
                        {file.file_name}
                        {' · '}
                        {formatBytes(file.size)}
                        {file.uploaded_at && <> · uploaded {utils.formatToReadableDateNoTime(file.uploaded_at)}</>}
                    </p>
                </div>
            </div>
            <Button
                size="sm"
                variant="ghost"
                className="ml-3 shrink-0 text-slate-700 hover:bg-emerald-100"
                onClick={() => {
                    // TODO: wire to a signed download route, e.g.:
                    //   router.get(route('admin.media.download', { media: file.uuid }))
                    // eslint-disable-next-line no-console
                    console.warn('[admin] download not yet wired', file);
                    alert(`Download not yet wired. File: ${file.name}`);
                }}
            >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
            </Button>
        </div>
    );
}

function ActionButtons({ status, onAction }: { status: string; onAction: (label: string) => () => void }) {
    switch (status) {
        case 'pending':
            return (
                <>
                    <Button className="w-full" onClick={onAction('Move to Under Review')}>
                        <FileText className="mr-2 h-4 w-4" /> Move to Under Review
                    </Button>
                    <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={onAction('Approve')}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={onAction('Reject')}>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                </>
            );

        case 'under_review':
            return (
                <>
                    <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={onAction('Approve')}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={onAction('Reject')}>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onAction('Request More Info')}>
                        <AlertTriangle className="mr-2 h-4 w-4" /> Request More Info
                    </Button>
                </>
            );

        case 'approved':
            return (
                <>
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={onAction('Mark Released')}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Released
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onAction('Print Voucher')}>
                        <Printer className="mr-2 h-4 w-4" /> Print Voucher
                    </Button>
                </>
            );

        case 'released':
            return (
                <Button variant="outline" className="w-full" onClick={onAction('Print Receipt')}>
                    <Printer className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
            );

        case 'rejected':
            return (
                <Button variant="outline" className="w-full" onClick={onAction('Reopen')}>
                    <AlertTriangle className="mr-2 h-4 w-4" /> Reopen
                </Button>
            );

        default:
            return <p className="text-xs text-slate-400 italic">No further actions for this status.</p>;
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

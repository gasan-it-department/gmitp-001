import { AssistanceDocumentRequirement } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import actionCenter from '@/routes/actionCenter';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    CalendarDays,
    Check,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Clock3,
    Copy,
    FileCheck2,
    FileText,
    GraduationCap,
    Heart,
    HelpingHand,
    Info,
    MapPin,
    ShieldCheck,
    UserRound,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface AssistanceRequestDetails {
    id: string;
    transaction_number: string;
    status: string;
    assistance_type: {
        id: string;
        name: string;
        slug: string;
        description: string;
        documents: AssistanceDocumentRequirement[];
    } | null;
    amount_approved: number | null;
    description: string;
    privacy_consented_at: string | null;
    submitted_at: string;
    approved_at: string | null;
    released_at: string | null;
    cancelled_at: string | null;
    filed_for_self: boolean;
    relationship: {
        value: string;
        label: string;
    } | null;
    on_behalf: {
        full_name: string;
        date_of_death: string | null;
        recipient_id_exception: string | null;
    } | null;
    identity_snapshot: {
        full_name: string;
        sex: string | null;
        birth_date: string | null;
        age_at_submission: number | null;
        educational_attainment: string | null;
        religion: string | null;
    };
    address_snapshot: {
        full_address: string;
        barangay: string | null;
    };
    documents: Array<{
        id: number;
        name: string;
        mime_type: string;
        size: number;
        uploaded_at: string;
        custom_properties: {
            document_key?: string;
        };
    }>;
}

interface Props {
    request: {
        data: AssistanceRequestDetails;
    };
}

interface StatusPresentation {
    label: string;
    title: string;
    description: string;
    icon: LucideIcon;
    accentClass: string;
    badgeClass: string;
    bannerClass: string;
    iconClass: string;
}

interface TimelineEntry {
    label: string;
    detail: string;
    date?: string | null;
    state: 'complete' | 'current' | 'upcoming' | 'closed';
}

const RECIPIENT_ID_KEYS = ['recipient_valid_id_front', 'recipient_valid_id_back'];

const STATUS_PRESENTATIONS: Record<string, StatusPresentation> = {
    pending: {
        label: 'Awaiting documents / MSWD visit',
        title: 'Prepare your requirements and visit MSWD',
        description: 'Bring the documents listed below and present your transaction number so the staff can begin the interview and assessment.',
        icon: ClipboardList,
        accentClass: 'bg-amber-500',
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
        bannerClass: 'border-amber-200 bg-amber-50',
        iconClass: 'bg-amber-100 text-amber-700',
    },
    under_review: {
        label: 'Under review',
        title: 'MSWD is reviewing your request',
        description:
            'Your case has been picked up for assessment. Attend the interview and provide any remaining documents requested by the MSWD staff.',
        icon: Clock3,
        accentClass: 'bg-blue-600',
        badgeClass: 'border-blue-200 bg-blue-50 text-blue-800',
        bannerClass: 'border-blue-200 bg-blue-50',
        iconClass: 'bg-blue-100 text-blue-700',
    },
    approved: {
        label: 'Approved',
        title: 'Your assistance request was approved',
        description:
            'Wait for the release instructions from MSWD. Bring a valid ID and your transaction number when you are asked to claim the assistance.',
        icon: CheckCircle2,
        accentClass: 'bg-emerald-500',
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        bannerClass: 'border-emerald-200 bg-emerald-50',
        iconClass: 'bg-emerald-100 text-emerald-700',
    },
    released: {
        label: 'Released',
        title: 'The assistance has been released',
        description: 'This request is complete. Keep the transaction number for your records and for any future inquiry with MSWD.',
        icon: HelpingHand,
        accentClass: 'bg-cyan-600',
        badgeClass: 'border-cyan-200 bg-cyan-50 text-cyan-800',
        bannerClass: 'border-cyan-200 bg-cyan-50',
        iconClass: 'bg-cyan-100 text-cyan-700',
    },
    rejected: {
        label: 'Not approved',
        title: 'This request was not approved',
        description: 'Visit or contact MSWD and present your transaction number if you need clarification about the result.',
        icon: XCircle,
        accentClass: 'bg-rose-500',
        badgeClass: 'border-rose-200 bg-rose-50 text-rose-800',
        bannerClass: 'border-rose-200 bg-rose-50',
        iconClass: 'bg-rose-100 text-rose-700',
    },
    cancelled: {
        label: 'Cancelled',
        title: 'This request is closed',
        description: 'The cancelled request will no longer be processed. You may visit MSWD if you need help with a new request.',
        icon: XCircle,
        accentClass: 'bg-slate-500',
        badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
        bannerClass: 'border-slate-200 bg-slate-100',
        iconClass: 'bg-white text-slate-600',
    },
    default: {
        label: 'Status unavailable',
        title: 'Check with MSWD for an update',
        description: 'Present your transaction number when contacting the office so the staff can locate your request.',
        icon: Info,
        accentClass: 'bg-slate-400',
        badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
        bannerClass: 'border-slate-200 bg-slate-100',
        iconClass: 'bg-white text-slate-600',
    },
};

function formatDateTime(value: string | null): string {
    if (!value) {
        return 'Not available';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not available';
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatCurrency(amount: number | null): string {
    if (amount === null) {
        return 'Pending assessment';
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

function formatFileSize(bytes: number): string {
    if (bytes <= 0) {
        return '0 KB';
    }

    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildTimeline(data: AssistanceRequestDetails): TimelineEntry[] {
    const entries: TimelineEntry[] = [
        {
            label: 'Request submitted',
            detail: 'Your request was received by the Action Center.',
            date: data.submitted_at,
            state: 'complete',
        },
    ];

    switch (data.status.toLowerCase()) {
        case 'pending':
            entries.push({
                label: 'MSWD visit and interview',
                detail: 'Bring the required documents to continue.',
                state: 'current',
            });
            break;
        case 'under_review':
            entries.push({
                label: 'MSWD assessment',
                detail: 'Your documents and circumstances are being reviewed.',
                state: 'current',
            });
            break;
        case 'approved':
            entries.push({
                label: 'Request approved',
                detail: 'The approved amount has been recorded.',
                date: data.approved_at,
                state: 'complete',
            });
            entries.push({
                label: 'Release of assistance',
                detail: 'Wait for the release instructions from MSWD.',
                state: 'current',
            });
            break;
        case 'released':
            entries.push({
                label: 'Request approved',
                detail: 'The approved amount was recorded.',
                date: data.approved_at,
                state: 'complete',
            });
            entries.push({
                label: 'Assistance released',
                detail: 'The assistance was physically released.',
                date: data.released_at,
                state: 'complete',
            });
            break;
        case 'rejected':
            entries.push({
                label: 'Request not approved',
                detail: 'Visit MSWD if you need clarification.',
                state: 'closed',
            });
            break;
        case 'cancelled':
            entries.push({
                label: 'Request cancelled',
                detail: 'This request is no longer being processed.',
                date: data.cancelled_at,
                state: 'closed',
            });
            break;
        default:
            entries.push({
                label: 'Status unavailable',
                detail: 'Contact MSWD for the latest update.',
                state: 'current',
            });
    }

    return entries;
}

function DetailRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
    return (
        <div className="grid gap-2 px-4 py-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-5 sm:px-5">
            <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
            </dt>
            <dd className="min-w-0 text-sm font-medium break-words text-slate-900">{children}</dd>
        </div>
    );
}

function RequirementsSection({
    documents,
    requireRecipientIdentity,
    recordedDocumentKeys,
}: {
    documents: AssistanceDocumentRequirement[];
    requireRecipientIdentity: boolean;
    recordedDocumentKeys: string[];
}) {
    const visibleDocuments = documents.filter((document) => !RECIPIENT_ID_KEYS.includes(document.key) || requireRecipientIdentity);
    const recordedKeys = new Set(recordedDocumentKeys);
    const recordedCount = visibleDocuments.filter((document) => recordedKeys.has(document.key)).length;
    const requiredCount = visibleDocuments.filter((document) => document.is_required || RECIPIENT_ID_KEYS.includes(document.key)).length;

    return (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                        <ClipboardList className="h-5 w-5 text-amber-600" aria-hidden="true" />
                        Documents to bring to MSWD
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">Bring the indicated physical copy together with your transaction number.</p>
                </div>
                {visibleDocuments.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span>{requiredCount} required</span>
                        <span className="text-slate-300" aria-hidden="true">
                            /
                        </span>
                        <span className="text-emerald-700">{recordedCount} recorded</span>
                    </div>
                )}
            </div>

            {visibleDocuments.length === 0 ? (
                <div className="px-4 py-8 text-center sm:px-5">
                    <FileCheck2 className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-slate-700">No additional documents are configured for this assistance type.</p>
                </div>
            ) : (
                <ol className="divide-y divide-slate-200">
                    {visibleDocuments.map((document, index) => {
                        const isRecipientIdentity = RECIPIENT_ID_KEYS.includes(document.key);
                        const isRequired = document.is_required || (isRecipientIdentity && requireRecipientIdentity);
                        const isRecorded = recordedKeys.has(document.key);

                        return (
                            <li key={document.id} className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        isRecorded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {isRecorded ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold break-words text-slate-950">{document.name}</p>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                isRequired ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {isRequired ? 'Required before approval' : 'If applicable'}
                                        </span>
                                        {document.physical_copy_requirement !== 'unspecified' && (
                                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                                {document.physical_copy_requirement_label}
                                            </span>
                                        )}
                                    </div>

                                    {document.description && <p className="mt-1 text-sm leading-6 text-slate-600">{document.description}</p>}
                                    {document.examples && (
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            <span className="font-semibold text-slate-600">Examples:</span> {document.examples}
                                        </p>
                                    )}
                                    <p
                                        className={`mt-2 flex items-center gap-1.5 text-xs font-semibold sm:hidden ${
                                            isRecorded ? 'text-emerald-700' : 'text-amber-700'
                                        }`}
                                    >
                                        {isRecorded ? (
                                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <MapPin className="h-4 w-4" aria-hidden="true" />
                                        )}
                                        {isRecorded ? 'Recorded by MSWD' : 'Bring to MSWD'}
                                    </p>
                                </div>

                                <div
                                    className={`hidden shrink-0 items-center gap-1.5 text-xs font-semibold sm:flex ${
                                        isRecorded ? 'text-emerald-700' : 'text-amber-700'
                                    }`}
                                >
                                    {isRecorded ? (
                                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <MapPin className="h-4 w-4" aria-hidden="true" />
                                    )}
                                    {isRecorded ? 'Recorded by MSWD' : 'Bring to MSWD'}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}

            <div className="flex items-start gap-3 border-t border-blue-100 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900 sm:px-5">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>MSWD staff will inspect the physical documents and record the official copies in this request.</p>
            </div>
        </section>
    );
}

function RequestTimeline({ entries }: { entries: TimelineEntry[] }) {
    const markerClasses: Record<TimelineEntry['state'], string> = {
        complete: 'border-emerald-600 bg-emerald-600',
        current: 'border-blue-600 bg-white',
        upcoming: 'border-slate-300 bg-white',
        closed: 'border-rose-500 bg-rose-500',
    };

    return (
        <ol className="relative ml-2 border-l border-slate-200">
            {entries.map((entry, index) => (
                <li key={`${entry.label}-${index}`} className="relative pb-7 pl-6 last:pb-0">
                    <span
                        className={`absolute top-1 -left-[7px] h-3.5 w-3.5 rounded-full border-2 ${markerClasses[entry.state]}`}
                        aria-hidden="true"
                    />
                    <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{entry.detail}</p>
                    {entry.date && <p className="mt-1 text-xs font-medium text-slate-500">{formatDateTime(entry.date)}</p>}
                </li>
            ))}
        </ol>
    );
}

export default function AssistanceDetails({ request }: Props) {
    const data = request.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [copied, setCopied] = useState(false);
    const status = STATUS_PRESENTATIONS[data.status?.toLowerCase()] ?? STATUS_PRESENTATIONS.default;
    const StatusIcon = status.icon;
    const recordedDocumentKeys = data.documents
        .map((document) => document.custom_properties?.document_key)
        .filter((key): key is string => Boolean(key));
    const requireRecipientIdentity = data.on_behalf !== null && data.assistance_type?.slug !== 'burial' && !data.on_behalf.recipient_id_exception;
    const recipientName = data.filed_for_self ? data.identity_snapshot.full_name : data.on_behalf?.full_name || 'Recipient not available';
    const timeline = buildTimeline(data);

    const copyTransactionNumber = async () => {
        try {
            await navigator.clipboard.writeText(data.transaction_number);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(false);
        }
    };

    return (
        <PublicLayout title="Action Center" description="View the status and requirements of your assistance request">
            <Head title={`${data.transaction_number} - Assistance Request`} />

            <main className="min-h-screen bg-slate-50 py-6 sm:py-9">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href={actionCenter.index.url({ municipality: currentMunicipality.slug })}
                        className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to Action Center
                    </Link>

                    <header className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className={`h-1.5 ${status.accentClass}`} />
                        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_230px] md:items-center">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badgeClass}`}
                                    >
                                        <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                        {status.label}
                                    </span>
                                    <span className="text-xs text-slate-500">Submitted {formatDateTime(data.submitted_at)}</span>
                                </div>

                                <h1 className="mt-4 text-2xl font-bold break-words text-slate-950">
                                    {data.assistance_type?.name ?? 'Assistance Request'}
                                </h1>

                                <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-slate-600">
                                    <span className="shrink-0">Transaction no.</span>
                                    <code className="min-w-0 truncate rounded bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-900">
                                        {data.transaction_number}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={copyTransactionNumber}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                                        aria-label="Copy transaction number"
                                        title="Copy transaction number"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                    <span className="sr-only" aria-live="polite">
                                        {copied ? 'Transaction number copied' : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <Banknote className="h-4 w-4" aria-hidden="true" />
                                    {data.status === 'cancelled' && data.amount_approved !== null
                                        ? 'Previously approved assistance'
                                        : 'Approved assistance'}
                                </p>
                                <p
                                    className={`mt-2 font-bold break-words ${data.amount_approved === null ? 'text-base text-slate-700' : 'text-2xl text-emerald-700'}`}
                                >
                                    {formatCurrency(data.amount_approved)}
                                </p>
                                {data.amount_approved === null && (
                                    <p className="mt-1 text-xs leading-5 text-slate-500">The final amount is set after MSWD assessment.</p>
                                )}
                            </div>
                        </div>
                    </header>

                    <section className={`mt-5 flex items-start gap-4 rounded-lg border p-4 sm:p-5 ${status.bannerClass}`} role="status">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${status.iconClass}`}>
                            <StatusIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-600">What happens next</p>
                            <h2 className="mt-1 text-base font-semibold text-slate-950">{status.title}</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-700">{status.description}</p>
                        </div>
                    </section>

                    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="min-w-0 space-y-6">
                            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                                    <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                        <ClipboardCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
                                        Request summary
                                    </h2>
                                </div>

                                <dl className="divide-y divide-slate-200">
                                    <DetailRow icon={HelpingHand} label="Assistance recipient">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span>{recipientName}</span>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                                {data.filed_for_self ? 'Filed for self' : (data.relationship?.label ?? 'Filed on behalf')}
                                            </span>
                                        </div>
                                    </DetailRow>

                                    {!data.filed_for_self && (
                                        <DetailRow icon={UserRound} label="Filed by">
                                            {data.identity_snapshot.full_name}
                                        </DetailRow>
                                    )}

                                    <DetailRow icon={MapPin} label="Address at submission">
                                        {data.address_snapshot.full_address || data.address_snapshot.barangay || 'Not available'}
                                    </DetailRow>

                                    <DetailRow icon={CalendarDays} label="Submitted">
                                        {formatDateTime(data.submitted_at)}
                                    </DetailRow>
                                </dl>

                                <div className="border-t border-slate-200 px-4 py-4 sm:px-5">
                                    <p className="text-xs font-semibold text-slate-500">Reason for requesting assistance</p>
                                    <p className="mt-2 text-sm leading-6 break-words whitespace-pre-wrap text-slate-800">
                                        {data.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="border-t border-slate-200 bg-slate-50 px-4 pt-3 text-xs font-semibold text-slate-500 sm:px-5">
                                    {data.filed_for_self ? 'Applicant details at submission' : 'Filer details at submission'}
                                </div>
                                <div className="grid bg-slate-50 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="border-b border-slate-200 px-4 py-3 sm:border-r xl:border-b-0">
                                        <p className="text-xs text-slate-500">Age at submission</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {data.identity_snapshot.age_at_submission !== null
                                                ? `${data.identity_snapshot.age_at_submission} years old`
                                                : 'Not available'}
                                        </p>
                                    </div>
                                    <div className="border-b border-slate-200 px-4 py-3 xl:border-r xl:border-b-0">
                                        <p className="text-xs text-slate-500">Sex</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">
                                            {data.identity_snapshot.sex || 'Not available'}
                                        </p>
                                    </div>
                                    <div className="border-b border-slate-200 px-4 py-3 sm:border-r sm:border-b-0">
                                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> Education
                                        </p>
                                        <p className="mt-1 text-sm font-semibold break-words text-slate-900">
                                            {data.identity_snapshot.educational_attainment || 'Not available'}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Heart className="h-3.5 w-3.5" aria-hidden="true" /> Religion
                                        </p>
                                        <p className="mt-1 text-sm font-semibold break-words text-slate-900">
                                            {data.identity_snapshot.religion || 'Not available'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <RequirementsSection
                                documents={data.assistance_type?.documents ?? []}
                                requireRecipientIdentity={requireRecipientIdentity}
                                recordedDocumentKeys={recordedDocumentKeys}
                            />

                            {data.documents.length > 0 && (
                                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
                                        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                            <FileCheck2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                                            Recorded documents
                                        </h2>
                                        <span className="text-xs font-semibold text-slate-500">
                                            {data.documents.length} {data.documents.length === 1 ? 'file' : 'files'}
                                        </span>
                                    </div>
                                    <ul className="divide-y divide-slate-200">
                                        {data.documents.map((document) => (
                                            <li key={document.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                                                <FileText className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-slate-900">{document.name}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {formatFileSize(document.size)} / Recorded {formatDateTime(document.uploaded_at)}
                                                    </p>
                                                </div>
                                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-label="Recorded by MSWD" />
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        <aside className="space-y-6 lg:sticky lg:top-24">
                            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-5 py-4">
                                    <h2 className="text-base font-semibold text-slate-950">Request progress</h2>
                                    <p className="mt-1 text-sm text-slate-600">Updates recorded for this case.</p>
                                </div>
                                <div className="p-5">
                                    <RequestTimeline entries={timeline} />
                                </div>
                                {data.privacy_consented_at && (
                                    <div className="flex items-start gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700">Privacy consent recorded</p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">{formatDateTime(data.privacy_consented_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-950">Need help with this request?</h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Visit MSWD and present transaction number{' '}
                                            <span className="font-mono font-semibold text-slate-900">{data.transaction_number}</span>.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}

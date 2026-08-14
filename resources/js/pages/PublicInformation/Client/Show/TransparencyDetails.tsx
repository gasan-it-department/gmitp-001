import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import {
    getProcurementCategoryLabel,
    getProcurementStatusLabel,
    getProcurementValue,
    ProcurementLabeledValue,
} from '@/Core/Types/Procurement/procurement';
import PublicLayout from '@/layouts/Public/PublicLayout';
import transparency from '@/routes/transparency';
import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Award, Banknote, Building2, CalendarDays, CheckCircle2, ExternalLink, FileText, Landmark, Tag } from 'lucide-react';

interface PublicDocument {
    id: string | number;
    name?: string;
    file_name?: string;
    url?: string | null;
    download_url?: string | null;
    type_label?: string;
    mime_type?: string;
    size?: string | number;
}

interface PublicProcurementDetail {
    id: string;
    reference_number?: string | null;
    title: string;
    description?: string | null;
    category: ProcurementLabeledValue;
    status: ProcurementLabeledValue;
    department_name?: string | null;
    funding_source?: string | { name?: string; label?: string } | null;
    abc_amount: number;
    published_at?: string | null;
    pre_bid_date?: string | null;
    closing_date?: string | null;
    winning_bidder?: string | null;
    contract_amount?: number | null;
    awarded_date?: string | null;
    failure_reason?: string | null;
    failed_date?: string | null;
    cancellation_reason?: string | null;
    outcome_date?: string | null;
    documents?: PublicDocument[];
}

interface Props {
    procurement: { data: PublicProcurementDetail };
}

const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) return 'Not reported';

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(Number(amount));
};

const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Not recorded';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: date.includes(':') ? 'numeric' : undefined,
        minute: date.includes(':') ? '2-digit' : undefined,
    }).format(parsedDate);
};

const formatFileSize = (size: string | number | undefined) => {
    if (typeof size === 'string') return size;
    if (typeof size !== 'number' || size <= 0) return 'PDF';

    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    return `${(size / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const safeDocumentUrl = (url: string | null | undefined) => {
    if (!url) return null;

    try {
        const parsed = new URL(url, 'https://municipality.local');
        return ['http:', 'https:'].includes(parsed.protocol) ? url : null;
    } catch {
        return null;
    }
};

const getFundingSourceLabel = (source: PublicProcurementDetail['funding_source']) => {
    if (!source) return 'Not specified';
    if (typeof source === 'string') return source;
    return source.label || source.name || 'Not specified';
};

export default function TransparencyDetails({ procurement }: Props) {
    const item = procurement.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const statusValue = getProcurementValue(item.status);
    const isAwarded = statusValue === 'awarded';
    const isFailed = statusValue === 'failed';
    const isCancelled = statusValue === 'cancelled';
    const outcomeReason = isCancelled ? item.cancellation_reason : item.failure_reason;
    const outcomeDate = isAwarded ? item.awarded_date : isFailed ? item.failed_date || item.outcome_date : null;
    const reportedSavings =
        isAwarded && item.contract_amount !== null && item.contract_amount !== undefined
            ? Math.max(Number(item.abc_amount) - Number(item.contract_amount), 0)
            : null;

    const statusClasses = isAwarded
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : isFailed
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : isCancelled
            ? 'border-slate-300 bg-slate-100 text-slate-700'
            : statusValue === 'evaluating'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-sky-200 bg-sky-50 text-sky-700';

    const timeline = [
        { label: 'Published for public viewing', date: item.published_at },
        { label: 'Pre-bid conference', date: item.pre_bid_date, optional: true },
        { label: statusValue === 'open' ? 'Bidding closes' : 'Bidding closed', date: item.closing_date },
        ...(isAwarded || isFailed || isCancelled
            ? [
                  {
                      label: isAwarded ? 'Contract awarded' : isCancelled ? 'Procurement cancelled' : 'Bidding declared failed',
                      date: outcomeDate,
                      hideDate: isCancelled,
                  },
              ]
            : []),
    ];

    return (
        <PublicLayout title={item.title} description={`Official procurement record ${item.reference_number || ''} from ${currentMunicipality.name}.`}>
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        href={transparency.index.url({ municipality: currentMunicipality.slug })}
                        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-4 focus-visible:ring-sky-100 focus-visible:outline-none"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to {currentMunicipality.name} transparency records
                    </Link>
                </div>
            </div>

            <main className="bg-slate-50">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="p-6 sm:p-10">
                            <div className="flex flex-wrap items-center gap-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${statusClasses}`}
                                >
                                    {isAwarded && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                                    {(isFailed || isCancelled) && <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                                    {getProcurementStatusLabel(item.status)}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                                    {getProcurementCategoryLabel(item.category)}
                                </span>
                            </div>

                            <h1 className="mt-5 max-w-4xl font-heading text-3xl leading-tight font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                {item.title}
                            </h1>
                            <p className="mt-3 font-mono text-xs font-semibold tracking-wide text-slate-500">
                                PhilGEPS / procurement reference: {item.reference_number || 'Not yet reported'}
                            </p>

                            {item.description ? (
                                <div className="mt-7 max-w-4xl border-t border-slate-100 pt-6">
                                    <h2 className="text-xs font-bold tracking-[0.14em] text-slate-500 uppercase">What public money is for</h2>
                                    <p className="mt-2 text-base leading-7 whitespace-pre-line text-slate-700">{item.description}</p>
                                </div>
                            ) : (
                                <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    A plain-language project description has not yet been published for this record.
                                </div>
                            )}
                        </div>

                        <div className="grid border-t border-slate-200 bg-slate-50 sm:grid-cols-3">
                            <div className="p-5 sm:border-r sm:p-6">
                                <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
                                    <Building2 className="h-4 w-4" aria-hidden="true" /> Responsible office
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                    {item.department_name || 'Municipal office not specified'}
                                </p>
                            </div>
                            <div className="border-t border-slate-200 p-5 sm:border-t-0 sm:border-r sm:p-6">
                                <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
                                    <Landmark className="h-4 w-4" aria-hidden="true" /> Source of funds
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{getFundingSourceLabel(item.funding_source)}</p>
                            </div>
                            <div className="border-t border-slate-200 p-5 sm:border-t-0 sm:p-6">
                                <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
                                    <Banknote className="h-4 w-4" aria-hidden="true" /> Approved ceiling
                                </p>
                                <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(item.abc_amount)}</p>
                            </div>
                        </div>
                    </section>

                    {isAwarded && (
                        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8" aria-labelledby="award-heading">
                            <div className="flex items-center gap-2 text-emerald-800">
                                <Award className="h-5 w-5" aria-hidden="true" />
                                <h2 id="award-heading" className="font-heading text-lg font-semibold">
                                    Contract award
                                </h2>
                            </div>
                            <div className="mt-5 grid gap-5 border-t border-emerald-200/70 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-bold tracking-wide text-emerald-700 uppercase">Winning supplier</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-950">{item.winning_bidder || 'Not reported'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-wide text-emerald-700 uppercase">Contract amount</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(item.contract_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-wide text-emerald-700 uppercase">Award date</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(item.awarded_date)}</p>
                                </div>
                            </div>
                            {reportedSavings !== null && (
                                <p className="mt-5 text-sm text-emerald-900">
                                    The reported contract is <span className="font-semibold">{formatCurrency(reportedSavings)}</span> below the
                                    approved budget ceiling.
                                </p>
                            )}
                        </section>
                    )}

                    {(isFailed || isCancelled) && (
                        <section
                            className={`mt-6 rounded-2xl border p-6 sm:p-8 ${isCancelled ? 'border-slate-300 bg-slate-100' : 'border-rose-200 bg-rose-50/70'}`}
                            aria-labelledby="outcome-heading"
                        >
                            <div className="flex items-center gap-2 text-slate-900">
                                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                                <h2 id="outcome-heading" className="font-heading text-lg font-semibold">
                                    {isCancelled ? 'Procurement cancelled' : 'Bidding declared failed'}
                                </h2>
                            </div>
                            <dl className="mt-5 grid gap-5 border-t border-current/10 pt-5 sm:grid-cols-[1fr_auto]">
                                <div>
                                    <dt className="text-xs font-bold tracking-wide text-slate-600 uppercase">Official reason</dt>
                                    <dd className="mt-1 text-sm leading-6 whitespace-pre-line text-slate-900">
                                        {outcomeReason || 'No public reason was reported.'}
                                    </dd>
                                </div>
                                {outcomeDate && (
                                    <div>
                                        <dt className="text-xs font-bold tracking-wide text-slate-600 uppercase">Outcome date</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900">{formatDate(outcomeDate)}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    )}

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="timeline-heading">
                            <h2 id="timeline-heading" className="flex items-center gap-2 font-heading text-lg font-semibold text-slate-950">
                                <CalendarDays className="h-5 w-5 text-sky-700" aria-hidden="true" /> Record timeline
                            </h2>
                            <ol className="mt-7 space-y-6">
                                {timeline.map((event, index) => (
                                    <li key={event.label} className="relative grid grid-cols-[16px_1fr] gap-3">
                                        <span
                                            className={`mt-1.5 h-2.5 w-2.5 rounded-full ${index === timeline.length - 1 ? 'bg-sky-600 ring-4 ring-sky-100' : 'bg-slate-300'}`}
                                        />
                                        <div>
                                            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{event.label}</p>
                                            {!event.hideDate && (
                                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                                    {event.optional && !event.date ? 'Not applicable or not recorded' : formatDate(event.date)}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="documents-heading">
                            <h2 id="documents-heading" className="flex items-center gap-2 font-heading text-lg font-semibold text-slate-950">
                                <FileText className="h-5 w-5 text-sky-700" aria-hidden="true" /> Public documents
                            </h2>
                            <div className="mt-6 space-y-3">
                                {!item.documents?.length ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                                        <p className="text-sm font-medium text-slate-600">No public documents are attached to this record.</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Contact the responsible office if a required procurement document is missing.
                                        </p>
                                    </div>
                                ) : (
                                    item.documents.map((document) => {
                                        const documentUrl = safeDocumentUrl(document.download_url || document.url);
                                        const documentName = document.file_name || document.name || 'Procurement document';
                                        const content = (
                                            <>
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <span className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500">
                                                        <FileText className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold text-slate-900">{documentName}</span>
                                                        <span className="mt-0.5 block text-xs text-slate-500">
                                                            {document.type_label || 'Supporting document'} · {formatFileSize(document.size)}
                                                        </span>
                                                    </span>
                                                </span>
                                                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                                            </>
                                        );

                                        return documentUrl ? (
                                            <a
                                                key={document.id}
                                                href={documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Download ${documentName} in a new tab`}
                                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-sky-300 hover:bg-sky-50/50 focus-visible:ring-4 focus-visible:ring-sky-100 focus-visible:outline-none"
                                            >
                                                {content}
                                            </a>
                                        ) : (
                                            <div
                                                key={document.id}
                                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70"
                                                aria-disabled="true"
                                            >
                                                {content}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}

import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    Building2,
    Calendar,
    CheckCircle2,
    Eye,
    FileText,
    MapPin,
    Tag,
    Trophy,
} from 'lucide-react';

interface Props {
    procurement: any;
}

export default function TransparencyDetails({ procurement }: Props) {
    const item = procurement.data;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    // Safely check the status
    const statusString = typeof item.status === 'string' ? item.status : item.status?.value || '';
    const isAwarded = statusString.toLowerCase() === 'awarded';
    const isFailed = statusString.toLowerCase() === 'failed';

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Optional fallback if they opened the link directly in a new tab
            window.location.href = '/transparency';
        }
    };

    return (
        <PublicLayout title={item.title} description={`View details for ${item.reference_number}`}>
            {/* 1. TOP NAVIGATION BAR */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Procurements List
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* 2. THE HEADER SECTION */}
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="p-6 sm:p-10">
                        {/* Status & Category */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase ${
                                    isAwarded
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : isFailed
                                          ? 'border-red-200 bg-red-50 text-red-700'
                                          : 'border-blue-200 bg-blue-50 text-blue-700'
                                }`}
                            >
                                {isAwarded && <CheckCircle2 className="h-3 w-3" />}
                                {isFailed && <AlertCircle className="h-3 w-3" />}
                                {statusString}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                <Tag className="h-3 w-3" />
                                {typeof item.category === 'string' ? item.category : item.category?.label || 'Unknown Category'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl leading-tight">{item.title}</h1>

                        {/* Meta Info */}
                        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="text-sm">{item.department_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Banknote className="h-4 w-4 text-slate-400" />
                                <span className="text-sm">{item.funding_source}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="font-mono text-sm tracking-wide">REF: {item.reference_number}</span>
                            </div>
                        </div>
                    </div>

                    {/* The Budget Banner */}
                    <div className="border-t border-slate-100 bg-slate-50 px-6 py-6 sm:px-10 rounded-b-xl">
                        <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Approved Budget for the Contract (ABC)</p>
                        <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {formatCurrency(item.abc_amount)}
                        </p>
                    </div>
                </div>

                {/* 3A. CONDITIONAL AWARDED SECTION */}
                {isAwarded && (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-600" />
                                <h2 className="text-base font-bold text-amber-900">Contract Awarded</h2>
                            </div>
                            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-t border-amber-200/60 pt-5">
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">Winning Bidder</p>
                                    <p className="mt-1 text-lg font-bold text-slate-900">{item.winning_bidder}</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">Final Contract Amount</p>
                                    <p className="mt-1 font-mono text-xl font-bold text-amber-700">{formatCurrency(item.contract_amount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3B. CONDITIONAL FAILED SECTION */}
                {isFailed && item.failure_reason && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50/50">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <h2 className="text-base font-bold text-red-900">Bidding Failed / Cancelled</h2>
                            </div>
                            <div className="mt-5 border-t border-red-200/60 pt-5">
                                <p className="text-[11px] font-bold tracking-widest text-red-700 uppercase">Reason for Failure</p>
                                <p className="mt-1 text-sm text-slate-900 leading-relaxed">{item.failure_reason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. GRID: TIMELINE & DOCUMENTS */}
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left Column: Timeline */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            Bidding Timeline
                        </h3>
                        <div className="mt-8 space-y-8 pl-2">
                            {/* Published */}
                            <div className="relative border-l border-slate-200 pl-5">
                                <div className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-slate-300"></div>
                                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Published Date</p>
                                <p className="mt-1 text-sm text-slate-900">{item.published_at}</p>
                            </div>
                            {/* Pre-Bid */}
                            <div className="relative border-l border-slate-200 pl-5">
                                <div className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-slate-300"></div>
                                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Pre-Bid Conference</p>
                                <p className="mt-1 text-sm text-slate-900">{item.pre_bid_date || 'Not Applicable'}</p>
                            </div>
                            {/* Closing */}
                            <div className="relative border-l border-transparent pl-5">
                                <div className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-slate-900 ring-4 ring-white"></div>
                                <p className="text-[11px] font-bold tracking-widest text-slate-900 uppercase">Closing Date</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{item.closing_date}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Public Documents */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <FileText className="h-4 w-4 text-slate-500" />
                            Public Documents
                        </h3>

                        <div className="mt-6 flex flex-col gap-3">
                            {!item.documents || item.documents.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                                    <p className="text-sm text-slate-500">No documents uploaded yet.</p>
                                </div>
                            ) : (
                                item.documents.map((doc: any) => (
                                    <a
                                        key={doc.id}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="rounded border border-slate-200 bg-white p-2">
                                                <FileText className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                            </div>
                                            <div className="truncate">
                                                <p className="truncate text-sm font-medium text-slate-900">
                                                    {doc.file_name || doc.name}
                                                </p>
                                                <div className="mt-0.5 flex items-center gap-2">
                                                    <span className="inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-600 uppercase">
                                                        {doc.type_label || 'Document'}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">{doc.size || 'PDF'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 group-hover:text-slate-900">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

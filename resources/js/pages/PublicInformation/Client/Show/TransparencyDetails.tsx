import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import {
    AlertCircle, // 👈 Added for the Failed Status banner
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Download,
    FileText,
    MapPin,
    Tag,
    Trophy,
} from 'lucide-react';

interface Props {
    // Using any as requested, you can swap to ProcurementDetail later
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
            <div className="bg-slate-900 px-4 py-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Procurements List
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* 2. THE HEADER SECTION (White Card) */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-6 sm:p-10">
                        {/* Status & Category */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${
                                    isAwarded
                                        ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                                        : isFailed
                                          ? 'border-red-200 bg-red-100 text-red-800'
                                          : 'border-blue-200 bg-blue-100 text-blue-800'
                                }`}
                            >
                                {isAwarded && <CheckCircle2 className="h-3.5 w-3.5" />}
                                {isFailed && <AlertCircle className="h-3.5 w-3.5" />}
                                {statusString}
                            </span>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500">
                                <Tag className="h-4 w-4" />
                                {/* 🌟 FIX: Mapped to flat string instead of nested object */}
                                {typeof item.category === 'string' ? item.category : item.category?.label || 'Unknown Category'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">{item.title}</h1>

                        {/* Meta Info */}
                        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Building2 className="h-5 w-5 text-slate-400" />
                                {/* 🌟 FIX: Uses the flat department_name from your Resource */}
                                <span>{item.department_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="h-5 w-5 text-slate-400" />
                                <span className="font-mono text-sm tracking-wide">REF: {item.reference_number}</span>
                            </div>
                        </div>
                    </div>

                    {/* The Budget Banner */}
                    <div className="bg-slate-50 px-6 py-6 sm:px-10">
                        <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Approved Budget for the Contract (ABC)</p>
                        <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {formatCurrency(item.abc_amount)}
                        </p>
                    </div>
                </div>

                {/* 3A. CONDITIONAL AWARDED SECTION */}
                {isAwarded && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-amber-600" />
                                <h2 className="text-lg font-bold text-amber-900">Contract Awarded</h2>
                            </div>
                            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-amber-700">Winning Bidder</p>
                                    <p className="mt-1 text-xl font-bold text-slate-900">{item.winning_bidder}</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-sm font-medium text-amber-700">Final Contract Amount</p>
                                    <p className="mt-1 font-mono text-2xl font-bold text-amber-700">{formatCurrency(item.contract_amount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3B. CONDITIONAL FAILED SECTION (NEW!) */}
                {isFailed && item.failure_reason && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                                <h2 className="text-lg font-bold text-red-900">Bidding Failed / Cancelled</h2>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-red-700">Reason for Failure</p>
                                <p className="mt-1 text-slate-900">{item.failure_reason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. GRID: TIMELINE & DOCUMENTS */}
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left Column: Timeline */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            Bidding Timeline
                        </h3>
                        <div className="mt-6 space-y-6 pl-2">
                            {/* Published */}
                            <div className="relative border-l-2 border-slate-200 pl-4">
                                <div className="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full bg-slate-300"></div>
                                <p className="text-sm font-semibold text-slate-900">Published Date</p>
                                <p className="text-sm text-slate-500">{item.published_at}</p>
                            </div>
                            {/* Pre-Bid */}
                            <div className="relative border-l-2 border-slate-200 pl-4">
                                <div className="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full bg-slate-300"></div>
                                <p className="text-sm font-semibold text-slate-900">Pre-Bid Conference</p>
                                <p className="text-sm text-slate-500">{item.pre_bid_date || 'Not Applicable'}</p>
                            </div>
                            {/* Closing */}
                            <div className="relative border-l-2 border-transparent pl-4">
                                <div className="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                                <p className="text-sm font-semibold text-indigo-900">Closing Date</p>
                                <p className="text-sm font-medium text-indigo-700">{item.closing_date}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Public Documents */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Public Documents
                        </h3>

                        <div className="mt-6 space-y-3">
                            {!item.documents || item.documents.length === 0 ? (
                                <p className="py-4 text-center text-sm text-slate-500">No documents uploaded yet.</p>
                            ) : (
                                item.documents.map((doc: any) => (
                                    <a
                                        key={doc.id}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="rounded-lg bg-slate-100 p-2 group-hover:bg-indigo-100">
                                                <FileText className="h-5 w-5 text-slate-600 group-hover:text-indigo-600" />
                                            </div>
                                            <div className="truncate">
                                                <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-900">
                                                    {doc.file_name || doc.name}
                                                </p>
                                                <p className="text-xs text-slate-500">{doc.size || 'PDF Document'}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 group-hover:text-indigo-600">
                                            <Download className="h-4 w-4" />
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

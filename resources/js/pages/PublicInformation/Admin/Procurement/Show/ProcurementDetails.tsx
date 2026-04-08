import { Button } from '@/components/ui/button';
import { ProcurementDetail } from '@/Core/Types/Procurement/procurement';
import AppLayout from '@/layouts/App/AppLayout';
import ToastProvider from '@/pages/Utility/ToastShower';
import { router } from '@inertiajs/react';
import { Building2, Calendar, CheckCircle2, MoveLeft, StickyNote, Tag, Wallet } from 'lucide-react';
import { useState } from 'react';
import OpenBiddingDialog from './Components/OpenBiddingDialog';
import ProcurementDocumentSection from './Components/ProcurementDocumentSection';

interface Props {
    procurement: {
        data: ProcurementDetail;
    };
    documentTypes: any;
}

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function ProcurementDetails({ procurement, documentTypes }: Props) {
    // Extract the actual procurement object from the Laravel Resource wrapper
    const data = procurement.data;
    const [isOpenBiddingDialogOpen, setIsOpenBiddingDialogOpen] = useState(false);

    // Status Badge Styling Helper
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'open':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'evaluating':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'awarded':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'failed':
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleBack = () => {
        router.visit(window.history.state.url, {
            preserveScroll: true,
            preserveState: true, // ← this preserves filters, pagination, search state
        });
    };
    return (
        <AppLayout>
            <Button onClick={handleBack} className="m-4 mb-0 max-w-20 rounded-full bg-accent text-gray-600 hover:bg-gray-300">
                <MoveLeft />
            </Button>
            <ToastProvider position="top-right" />

            <div className="space-y-6 p-6">
                {/* 1. HEADER SECTION */}
                <header className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                    {/* Left Side: Main Details */}
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <span
                                className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase ${getStatusStyles(data.status)}`}
                            >
                                {data.status}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-medium text-slate-500">
                                <Tag className="h-4 w-4" /> {data.category}
                            </span>
                        </div>
                        <h1 className="text-3xl leading-tight font-bold text-slate-900">{data.title}</h1>
                        <p className="mt-2 font-mono text-sm text-slate-500">PhilGEPS Ref: {data.reference_number || 'Pending Publication'}</p>
                    </div>

                    {/* Right Side: Metadata (Date & Author) */}
                    <div className="flex shrink-0 flex-col gap-2 md:text-right">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 md:justify-end">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <p>Uploaded: {formatDate(data.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 md:justify-end">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <p>Prepared by: {data.prepared_by}</p>
                        </div>
                    </div>
                </header>

                {/* 2. THE ACTION BAR (State Machine Enforcer) */}
                <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
                    <span className="mr-2 text-sm font-semibold text-slate-500">Actions:</span>

                    {data.status === 'draft' && (
                        <>
                            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                                Edit Draft
                            </button>
                            <Button
                                onClick={() => setIsOpenBiddingDialogOpen(true)}
                                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                            >
                                Open
                            </Button>
                            <button className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
                                Cancel Project
                            </button>
                        </>
                    )}

                    {data.status === 'open' && (
                        <>
                            <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
                                Close Bidding & Evaluate
                            </button>
                            <button className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
                                Declare Failure
                            </button>
                        </>
                    )}
                </div>

                {/* 3. MAIN GRID */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* --- LEFT COLUMN (Spans 2 cols) --- */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Financials & Source */}
                        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b bg-slate-50/50 px-6 py-4">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                                <h3 className="font-bold text-slate-900">Financials & End-User</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Approved Budget (ABC)</p>
                                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.abc_amount)}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Funding Source</p>
                                    <p className="text-base font-medium text-slate-900">{data.funding_source_name}</p>
                                </div>
                                <div className="border-t pt-4 sm:col-span-2">
                                    <p className="mb-1 text-sm text-slate-500">Requesting Department</p>
                                    <div className="flex items-center gap-2 font-medium text-slate-900">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        {data.department_name}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Timeline */}
                        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b bg-slate-50/50 px-6 py-4">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-slate-900">Procurement Timeline</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Pre-Bid Conference</p>
                                    <p className="text-sm font-medium text-slate-900">{formatDate(data.pre_bid_date)}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Closing Date / Deadline</p>
                                    <p className="text-sm font-medium text-slate-900">{formatDate(data.closing_date)}</p>
                                </div>
                            </div>
                        </section>

                        {/* Notes */}
                        {data.notes && (
                            <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b bg-slate-50/50 px-6 py-4">
                                    <StickyNote className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-bold text-slate-900">Remarks / BAC Notes</h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{data.notes}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN (Spans 1 col) --- */}
                    <div className="space-y-6">
                        {/* Award Information (Restored!) */}
                        {data.status === 'awarded' && (
                            <section className="overflow-hidden rounded-2xl border border-green-600 bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md">
                                <div className="flex items-center gap-3 border-b border-white/20 px-6 py-4">
                                    <CheckCircle2 className="h-5 w-5 text-green-100" />
                                    <h3 className="font-bold">Award Information</h3>
                                </div>
                                <div className="space-y-4 p-6">
                                    <div>
                                        <p className="mb-1 text-xs tracking-wider text-green-100 uppercase">Winning Bidder</p>
                                        <p className="text-lg font-bold">{data.winning_bidder}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs tracking-wider text-green-100 uppercase">Contract Amount</p>
                                        <p className="text-xl font-bold">{formatCurrency(data.contract_amount || 0)}</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* The Extracted Document Component! */}
                        <ProcurementDocumentSection
                            procurementId={data.id}
                            documents={data.documents}
                            status={data.status}
                            documentTypes={documentTypes}
                        />
                    </div>
                </div>
            </div>

            <OpenBiddingDialog isOpen={isOpenBiddingDialogOpen} onClose={() => setIsOpenBiddingDialogOpen(false)} procurement={data} />
        </AppLayout>
    );
}

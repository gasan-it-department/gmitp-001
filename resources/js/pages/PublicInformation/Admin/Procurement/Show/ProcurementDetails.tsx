import { Button } from '@/components/ui/button';
import { ProcurementDetail } from '@/Core/Types/Procurement/procurement';
import AppLayout from '@/layouts/App/AppLayout';
import axios from '@/lib/axios';
import ToastProvider from '@/pages/Utility/ToastShower';
import { AlertCircle, Building2, Calendar, CheckCircle2, Download, FileText, MoveLeft, StickyNote, Tag, Wallet } from 'lucide-react';
import { useState } from 'react';
import OpenBiddingDialog from './Components/OpenBiddingDialog';
import { ProcurementUploadDialog } from './Components/ProcurementUploadDialog';

interface Props {
    // Laravel Resources usually wrap the payload in a 'data' object
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

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ProcurementDetails({ procurement, documentTypes }: Props) {
    // Extract the actual procurement object from the Laravel Resource wrapper
    const data = procurement.data;
    const [isOpenBiddingDialogOpen, setIsOpenBiddingDialogOpen] = useState(false);
    const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
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
    const downloadDocument = async (url: string, fileName: string) => {
        try {
            // Optional: Trigger a "Downloading..." toast here

            const response = await axios.get(url, {
                responseType: 'blob', // Critical: tells Axios to expect a binary file, not JSON
            });

            // Create a temporary URL for the downloaded blob
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

            // Create a fake, invisible anchor tag to trigger the browser's download UI
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
            // Show your error toast
            // toast.error('Failed to download document. It may have been removed.');
        }
    };
    const handleBack = () => window.history.back();
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
                        {/* Uploaded Date */}
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 md:justify-end">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            <p>Uploaded: {formatDate(data.created_at)}</p>
                        </div>

                        {/* Prepared By */}
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 md:justify-end">
                            {/* Standard User/Avatar Icon */}
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
                    {/* LEFT COLUMN (Details & Timeline - Spans 2 cols) */}
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

                    {/* RIGHT COLUMN (Documents & Award Info - Spans 1 col) */}
                    <div className="space-y-6">
                        {/* Award Information (Only shows if Awarded) */}
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

                        {/* Attached Documents */}
                        <section className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b bg-slate-50/50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-orange-500" />
                                    <h3 className="font-bold text-slate-900">Bidding Documents</h3>
                                </div>
                                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">{data.documents.length}</span>
                            </div>
                            <div className="flex-1 p-4">
                                {data.documents.length === 0 ? (
                                    <div className="flex flex-col items-center py-8 text-center text-slate-500">
                                        <AlertCircle className="mb-2 h-8 w-8 text-slate-300" />
                                        <p className="text-sm">No documents attached yet.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-3">
                                        {data.documents.map((doc) => (
                                            <li
                                                key={doc.id}
                                                className="group flex items-start gap-3 rounded-lg border p-3 transition hover:border-blue-300 hover:bg-blue-50"
                                            >
                                                <div className="mt-1 rounded bg-red-100 p-2 pt-1 text-red-600">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-900" title={doc.file_name}>
                                                        {doc.file_name}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="font-medium tracking-wide uppercase">{doc.type.replace(/_/g, ' ')}</span>
                                                        <span>•</span>
                                                        <span>{formatBytes(doc.file_size)}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                                                    type="button"
                                                    className="rounded-md p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-600"
                                                    title="Download Document"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <a
                                                    href={doc.file_path}
                                                    download={doc.file_name} // Add this to explicitly tell the browser to save the file
                                                    className="rounded-md p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-600"
                                                    title="Download Document"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Optional: Add Document button if Draft/Open */}
                            {(data.status === 'draft' || data.status === 'open') && (
                                <div className="border-t bg-slate-50 p-4">
                                    <button
                                        onClick={() => setIsDocumentUploadOpen(true)}
                                        className="w-full rounded-lg border-2 border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
                                    >
                                        + Attach New Document
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
            <ProcurementUploadDialog
                onSuccess={handleBack}
                isOpen={isDocumentUploadOpen}
                docTypes={documentTypes}
                onOpenChange={setIsDocumentUploadOpen}
                procurementId={data.id}
            />
            {/* Mount the dialog at the bottom of your component */}
            <OpenBiddingDialog isOpen={isOpenBiddingDialogOpen} onClose={() => setIsOpenBiddingDialogOpen(false)} procurement={data} />
        </AppLayout>
    );
}

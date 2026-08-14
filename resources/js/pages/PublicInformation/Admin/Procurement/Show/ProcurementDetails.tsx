import ConfirmDialog from '@/components/Shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { ProcurementDetail } from '@/Core/Types/Procurement/procurement';
import AppLayout from '@/layouts/App/AppLayout';
import ToastProvider from '@/pages/Utility/ToastShower';
import procurementRoute from '@/routes/procurement';
import { Link, router, usePage } from '@inertiajs/react';
import { Ban, Building2, Calendar, CheckCircle2, EyeOff, Globe2, LockKeyhole, MoveLeft, StickyNote, Tag, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { AwardBiddingDialog } from './Components/AwardBiddingDialog';
import { CancelProcurementDialog } from './Components/CancelProcurementDialog';
import CloseBiddingDialog from './Components/CloseBiddingDialog';
import { FailureBiddingDialog } from './Components/FailureBiddingDialog';
import OpenBiddingDialog from './Components/OpenBiddingDialog';
import ProcurementDocumentSection, { ProcurementDocumentOption } from './Components/ProcurementDocumentSection';
import { PublishProcurementDialog } from './Components/PublishProcurementDialog';
import { UnpublishProcurementDialog } from './Components/UnpublishProcurementDialog';

interface Props {
    procurement: {
        data: ProcurementDetail;
    };
    documentTypes: ProcurementDocumentOption[];
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
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isAwarding, setIsAwarding] = useState<boolean>(false);
    const [isFailedOpen, setIsFailedOpen] = useState<boolean>(false);
    const [isCancelProcurementOpen, setIsCancelProcurementOpen] = useState(false);
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [isUnpublishOpen, setIsUnpublishOpen] = useState(false);
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const isPublished = Boolean(data.published_at);
    const canChangeWorkflow = !isPublished;
    const canCancel = canChangeWorkflow && ['open', 'evaluating'].includes(data.status);
    const canPublishRecord = !isPublished && data.status !== 'draft';
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

    const handleDelete = () => {
        router.delete(procurementRoute.delete.draft.url(data.id), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setIsDeleteOpen(false);
            },
            onError: () => setIsDeleteOpen(false),
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit(procurementRoute.admin.page.url({ municipality: currentMunicipality.slug }));
        }
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
                                <Tag className="h-4 w-4" /> {data.category.label}
                            </span>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                                    isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
                                }`}
                            >
                                {isPublished ? (
                                    <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                                ) : (
                                    <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                {isPublished ? 'Visible to citizens' : 'Private record'}
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
                            <p>Prepared by: {data.prepared_by?.full_name || 'Account unavailable'}</p>
                        </div>
                    </div>
                </header>

                {/* 2. THE ACTION BAR (State Machine Enforcer) */}
                {/* 2. THE ACTION BAR (State Machine Enforcer) */}
                <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
                    <span className="mr-2 text-sm font-semibold text-slate-500">Actions:</span>

                    {/* 🌟 UX Fix 1: Make Edit an 'Outline' button so it doesn't fight the primary colors */}

                    {!isPublished ? (
                        <Link
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            href={procurementRoute.admin.edit.url({ municipality: currentMunicipality.slug, id: data.id })}
                        >
                            Edit Details
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800">
                            <LockKeyhole className="h-4 w-4" aria-hidden="true" /> Public record locked
                        </span>
                    )}

                    {canPublishRecord && (
                        <Button onClick={() => setIsPublishOpen(true)} className="gap-2 bg-sky-700 text-white hover:bg-sky-800">
                            <Globe2 className="h-4 w-4" aria-hidden="true" /> Publish to Citizens
                        </Button>
                    )}

                    {isPublished && (
                        <Button
                            variant="outline"
                            onClick={() => setIsUnpublishOpen(true)}
                            className="gap-2 border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900"
                        >
                            <EyeOff className="h-4 w-4" aria-hidden="true" /> Unpublish for Correction
                        </Button>
                    )}

                    {/* --- DRAFT STATE --- */}
                    {canChangeWorkflow && data.status === 'draft' && (
                        <>
                            {/* Primary Action (Solid Blue) */}
                            <Button
                                onClick={() => setIsOpenBiddingDialogOpen(true)}
                                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Open Bidding
                            </Button>
                        </>
                    )}

                    {/* --- OPEN STATE --- */}
                    {canChangeWorkflow && data.status === 'open' && (
                        <>
                            {/* Primary Action (Solid Amber) */}
                            <button
                                onClick={() => setIsEvaluating(true)}
                                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
                            >
                                Close Bidding & Evaluate
                            </button>
                            <button
                                onClick={() => setIsFailedOpen(true)}
                                className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                                Declare Failure
                            </button>
                        </>
                    )}

                    {/* --- EVALUATING STATE --- */}
                    {canChangeWorkflow && data.status === 'evaluating' && (
                        <>
                            {/* Primary Action (Solid Green) */}
                            <button
                                onClick={() => setIsAwarding(true)}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                            >
                                Award Project
                            </button>
                            <button
                                onClick={() => setIsFailedOpen(true)}
                                className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                                Declare Failure
                            </button>
                        </>
                    )}

                    {canCancel && (
                        <button
                            onClick={() => setIsCancelProcurementOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                            <Ban className="h-4 w-4" aria-hidden="true" /> Cancel procurement
                        </button>
                    )}

                    {/* Any private mistake can be discarded; public records are retained. */}
                    {!isPublished && (
                        <button
                            onClick={() => setIsDeleteOpen(true)}
                            className="ml-auto flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete unpublished record
                        </button>
                    )}

                    {/* --- AWARDED STATE --- */}
                    {data.status === 'awarded' && (
                        <span className="text-sm text-slate-500 italic">
                            {isPublished ? 'Project lifecycle complete' : 'Workflow complete — review before publishing'}
                        </span>
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
                                    <p className="text-base font-medium text-slate-900">
                                        {data.funding_source?.code === 'OTHERS' && data.custom_funding_source
                                            ? data.custom_funding_source
                                            : data.funding_source?.label || data.funding_source?.name}
                                    </p>
                                </div>
                                <div className="border-t pt-4 sm:col-span-2">
                                    <p className="mb-1 text-sm text-slate-500">Requesting Department</p>
                                    <div className="flex items-center gap-2 font-medium text-slate-900">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        {data.department?.name || 'Department not assigned'}
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
                                    <h3 className="font-bold text-slate-900">
                                        {data.status === 'cancelled' ? 'Public cancellation reason' : 'Remarks / BAC Notes'}
                                    </h3>
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
                            documents={data.media || []}
                            status={data.status}
                            documentTypes={documentTypes}
                            isPublished={isPublished}
                        />
                    </div>
                </div>
            </div>
            <ConfirmDialog
                title="Delete Procurement?"
                isOpen={isDeleteOpen}
                onCancel={() => setIsDeleteOpen(false)}
                confirmText="Yes, Delete Record"
                onConfirm={handleDelete}
                isProcessing={isDeleting} // 🌟 Use the new state
                variant="destructive" // 🌟 Make the confirm button Red!
                message={'Are you sure you want to permanently delete this unpublished procurement record? This action cannot be undone.'}
            />
            <OpenBiddingDialog isOpen={isOpenBiddingDialogOpen} onClose={() => setIsOpenBiddingDialogOpen(false)} procurement={data} />
            <CloseBiddingDialog isOpen={isEvaluating} onClose={() => setIsEvaluating(false)} procurement={data} />
            <AwardBiddingDialog isOpen={isAwarding} onClose={() => setIsAwarding(false)} procurement={data} />
            <FailureBiddingDialog isOpen={isFailedOpen} onClose={() => setIsFailedOpen(false)} procurement={data} />
            <CancelProcurementDialog isOpen={isCancelProcurementOpen} onClose={() => setIsCancelProcurementOpen(false)} procurementId={data.id} />
            <PublishProcurementDialog
                isOpen={isPublishOpen}
                onClose={() => setIsPublishOpen(false)}
                procurementId={data.id}
                title={data.title}
                hasSupportingDocuments={Boolean(data.media?.length)}
            />
            <UnpublishProcurementDialog
                isOpen={isUnpublishOpen}
                onClose={() => setIsUnpublishOpen(false)}
                procurementId={data.id}
                title={data.title}
            />
        </AppLayout>
    );
}

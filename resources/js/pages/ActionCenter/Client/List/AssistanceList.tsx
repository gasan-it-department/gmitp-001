import { Pagination } from '@/components/Shared/Pagination';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import actionCenter from '@/routes/actionCenter';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    ArrowUp,
    Banknote,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    Clock,
    FileText,
    HelpingHand,
    User,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AssistanceDetailsDialog from './AssistanceRequestDialog';

// ----------------------------------------------------------------------
// TYPES (Based on AssistanceRequestListResource)
// ----------------------------------------------------------------------
interface AssistanceRequest {
    id: string;
    transaction_number: string;
    status: string;
    assistance_type_id: string;
    assistance_type: {
        id: string;
        name: string;
        slug: string;
    } | null;
    amount_approved: number | null;
    submitted_at: string;
    approved_at: string | null;
    released_at: string | null;
    filed_for_self: boolean;
    relationship: {
        value: string;
        label: string;
    } | null;
    subject_full_name: string;
    is_walkin: boolean;
    snapshot_barangay: string | null;
    snapshot_barangay_psgc_code: string | null;
    municipal_id: string;
    beneficiary_id: string;
    household_id: string;
    documents_count?: number;
    documents_uploaded?: string[];
    created_at: string;
    updated_at: string;
}

interface Props {
    requests: {
        data: AssistanceRequest[];
        meta?: any;
        links?: any;
    };
}

// ----------------------------------------------------------------------
// STYLES CONFIGURATION
// ----------------------------------------------------------------------
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
    approved: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle2,
        label: 'Approved',
    },
    released: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: HelpingHand,
        label: 'Released',
    },
    rejected: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
        label: 'Rejected',
    },
    pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock,
        label: 'Pending',
    },
    under_review: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: Clock,
        label: 'Under Review',
    },
    cancelled: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: XCircle,
        label: 'Cancelled',
    },
    default: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: AlertCircle,
        label: 'Unknown',
    },
};

export default function AssistanceList({ requests }: Props) {
    const data = requests.data || [];
    const totalCount = requests?.meta?.total || data.length || 0;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    // --- State ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // --- Handlers ---
    const handleViewDetails = (request: AssistanceRequest) => {
        router.visit(actionCenter.show.url({ municipality: currentMunicipality.slug, assistanceRequestId: request.id }));
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => setSelectedRequest(null), 300);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // --- Effects ---
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- Helpers ---
    const getStyle = (status: string) => STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.default;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'Pending Assessment';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <PublicLayout title="Action Center" description="Track your assistance requests">
            <Head title="My Requests - Action Center" />

            <div className="relative min-h-screen bg-muted/30 py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {/* Main Card Container */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        {/* THEMED CARD HEADER */}
                        <div className="sticky top-0 z-20 border-b border-border bg-card/50 p-5 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => window.history.back()}
                                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:border-primary hover:text-primary active:scale-95"
                                    title="Go Back"
                                >
                                    <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                                </button>

                                <div className="h-8 w-px bg-border" />

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                                    <HelpingHand className="h-5 w-5" />
                                </div>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <h3 className="hidden text-xl font-black tracking-widest text-foreground uppercase sm:block">My Requests</h3>
                                        <h3 className="text-xl font-black tracking-widest text-foreground uppercase sm:hidden">Requests</h3>

                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="hidden text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:block sm:text-xs">
                                        History of your submitted applications
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="space-y-4 p-4 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {data.map((req) => {
                                    const style = getStyle(req.status);
                                    const StatusIcon = style.icon;

                                    return (
                                        <div
                                            key={req.id}
                                            onClick={() => handleViewDetails(req)}
                                            className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg`}
                                        >
                                            <div className="flex h-full flex-col">
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                        <FileText className="h-3 w-3 text-primary" />
                                                        <span className="font-mono">{req.transaction_number}</span>
                                                    </div>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wide uppercase shadow-sm ${style.bg} ${style.text} ${style.border}`}
                                                    >
                                                        <StatusIcon className="h-3 w-3" />
                                                        {style.label}
                                                    </span>
                                                </div>

                                                <div className="mb-4">
                                                    <h3 className="text-lg font-black tracking-tight text-foreground uppercase transition-colors group-hover:text-primary">
                                                        {req.assistance_type?.name || 'Assistance'}
                                                    </h3>

                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <User className="h-4 w-4 text-primary" />
                                                            <span className="font-bold text-foreground">{req.subject_full_name}</span>
                                                            {req.snapshot_barangay && (
                                                                <span className="text-xs text-muted-foreground uppercase">
                                                                    ({req.snapshot_barangay})
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Banknote className="h-4 w-4 text-primary" />
                                                            <span
                                                                className={`${req.amount_approved ? 'font-bold text-green-600' : 'text-muted-foreground italic'}`}
                                                            >
                                                                {formatCurrency(req.amount_approved)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {formatDate(req.submitted_at)}
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(req);
                                                        }}
                                                        className="group flex items-center gap-1 text-xs font-black tracking-wide text-primary uppercase decoration-2 underline-offset-4 transition-all hover:underline"
                                                    >
                                                        View Details
                                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {data.length === 0 && (
                                <div className="rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-muted p-4">
                                            <HelpingHand className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <h3 className="mt-4 text-lg font-black tracking-wide text-foreground uppercase">No requests found</h3>
                                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                                        You haven't submitted any assistance requests yet.
                                    </p>
                                </div>
                            )}

                            {requests.links && (
                                <div className="mt-8">
                                    <Pagination links={requests.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={scrollToTop}
                    className={`fixed right-8 bottom-8 z-40 rounded-full bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-primary/50 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none ${showScrollTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'} `}
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
            </div>

            <AssistanceDetailsDialog isOpen={isDialogOpen} onClose={handleCloseDialog} request={selectedRequest} />
        </PublicLayout>
    );
}

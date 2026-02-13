import { useState, useEffect } from 'react';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head } from '@inertiajs/react'; 
import { Pagination } from '@/components/Shared/Pagination';
import { 
    AlertCircle, 
    Calendar, 
    CheckCircle2, 
    ArrowRight, // Changed from ChevronRight to match CommunityReport
    Clock, 
    FileText, 
    User, 
    XCircle,
    Banknote,
    HelpingHand,
    ChevronLeft, 
    ArrowUp 
} from 'lucide-react';
import AssistanceDetailsDialog from './AssistanceRequestDialog';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface AssistanceRequest {
    id: string;
    municipal_id: string;
    user_id: string;
    assistance_type: string;
    transaction_number: string;
    description: string;
    status: 'pending' | 'approved' | 'released' | 'rejected';
    amount: number | null;
    created_at: string;
    updated_at: string;
    beneficiary: {
        id: string;
        first_name: string;
        last_name: string;
        name: string;
        barangay: string;
        municipality: string;
        province: string;
        contact_number?: string | null;
        email?: string | null;
    } | null;
}

interface Props {
    assistance: {
        data: AssistanceRequest[];
        meta: any;
        links: any;
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
        label: 'Approved'
    },
    released: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: HelpingHand,
        label: 'Released'
    },
    rejected: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
        label: 'Rejected'
    },
    pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock,
        label: 'In Review'
    },
    default: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: AlertCircle,
        label: 'Unknown'
    },
};

export default function AssistanceList({ assistance }: Props) {
    const requests = assistance.data || [];
    const totalCount = assistance?.meta?.total || requests.length || 0;

    // --- State ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // --- Handlers ---
    const handleViewDetails = (request: AssistanceRequest) => {
        setSelectedRequest(request);
        setIsDialogOpen(true);
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

    const formatType = (typeString: string) => {
        if (!typeString) return 'Assistance';
        return typeString
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <PublicLayout title="" description="">
            <Head title="Action Center" />

            <div className="py-12 relative min-h-screen bg-muted/30">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    
                    {/* Main Card Container */}
                    <div className="rounded-xl shadow-sm border border-border bg-card overflow-hidden">
                        
                        {/* THEMED CARD HEADER (Integrated Toolbar) */}
                        <div className="border-b border-border p-5 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                
                                {/* 1. Integrated Back Button */}
                                <button
                                    onClick={() => window.history.back()}
                                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:border-primary hover:text-primary active:scale-95"
                                    title="Go Back"
                                >
                                    <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                                </button>

                                {/* Divider */}
                                <div className="h-8 w-px bg-border" />

                                {/* Icon */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                                    <HelpingHand className="h-5 w-5" />
                                </div>
                                
                                {/* Title Text */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground hidden sm:block">Action Center</h3>
                                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground sm:hidden">Assistance</h3>
                                        
                                        {/* Count Badge */}
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary border border-primary/20">
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:block">
                                        Track your assistance requests
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 sm:p-6 space-y-4">

                            {/* Grid Layout for Items */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {requests.map((req) => {
                                    const style = getStyle(req.status);
                                    const StatusIcon = style.icon;

                                    return (
                                        <div
                                            key={req.id}
                                            onClick={() => handleViewDetails(req)}
                                            className={`
                                                group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border p-5 transition-all duration-300 cursor-pointer
                                                bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1
                                            `}
                                        >
                                            <div className="flex flex-col h-full">
                                                
                                                {/* Top Row: Transaction ID & Status */}
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        <FileText className="h-3 w-3 text-primary" />
                                                        <span className="font-mono">{req.transaction_number}</span>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-sm ${style.bg} ${style.text} ${style.border}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {style.label}
                                                    </span>
                                                </div>

                                                {/* Middle: Content */}
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                                                        {formatType(req.assistance_type)} Assistance
                                                    </h3>
                                                    
                                                    <div className="mt-3 space-y-2">
                                                        {/* Beneficiary */}
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <User className="h-4 w-4 text-primary" />
                                                            <span className="font-bold text-foreground">
                                                                {req.beneficiary?.name || 'Self'}
                                                            </span>
                                                            {req.beneficiary?.barangay && (
                                                                <span className="text-xs text-muted-foreground uppercase">
                                                                    ({req.beneficiary.barangay})
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Amount (if available) */}
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Banknote className="h-4 w-4 text-primary" />
                                                            <span className={`${req.amount ? 'font-bold text-green-600' : 'text-muted-foreground italic'}`}>
                                                                {formatCurrency(req.amount)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="mt-4 line-clamp-2 text-xs font-medium text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border italic">
                                                        "{req.description}"
                                                    </p>
                                                </div>

                                                {/* Bottom: Date & Action */}
                                                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {formatDate(req.created_at)}
                                                    </div>

                                                    {/* VIEW DETAILS BUTTON (Updated to match CommunityReport) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent double trigger
                                                            handleViewDetails(req);
                                                        }}
                                                        className="group flex items-center gap-1 text-xs font-black uppercase tracking-wide text-primary hover:underline decoration-2 underline-offset-4 transition-all"
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

                            {/* EMPTY STATE */}
                            {requests.length === 0 && (
                                <div className="rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-muted p-4">
                                            <HelpingHand className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <h3 className="mt-4 text-lg font-black uppercase tracking-wide text-foreground">No requests found</h3>
                                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                                        You haven't submitted any assistance requests yet.
                                    </p>
                                </div>
                            )}

                            {/* PAGINATION */}
                            {assistance.meta?.links && (
                                <div className="mt-8">
                                    <Pagination links={assistance.meta.links} />
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* SCROLL TO TOP FLOATING BUTTON */}
                <button
                    onClick={scrollToTop}
                    className={`
                        fixed bottom-8 right-8 z-40 rounded-full bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/30 
                        transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}
                    `}
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>

            </div>

            {/* MODAL / DIALOG COMPONENT */}
            <AssistanceDetailsDialog 
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                request={selectedRequest}
            />

        </PublicLayout>
    );
}
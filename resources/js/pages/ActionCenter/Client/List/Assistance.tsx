import { useState, useEffect } from 'react';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head } from '@inertiajs/react'; // Link removed as we use Modal now
import { Pagination } from '@/components/Shared/Pagination';
import { 
    AlertCircle, 
    Calendar, 
    CheckCircle2, 
    ChevronRight, 
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
// 👇 Import the specific dialog for Assistance Requests

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
        contact_number?: string | null; // Added based on dialog requirements
        email?: string | null;         // Added based on dialog requirements
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
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
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

    // --- State for Dialog ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // Renamed to 'selectedRequest' for semantic correctness
    const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
    
    // --- State for Scroll Top ---
    const [showScrollTop, setShowScrollTop] = useState(false);

    // --- Handlers ---
    const handleViewDetails = (request: AssistanceRequest) => {
        setSelectedRequest(request);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => setSelectedRequest(null), 300); // Clear data after animation
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

            <div className="py-12 relative min-h-screen">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    
                    {/* Back Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => window.history.back()}
                            className="group flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-orange-800/80 transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back
                        </button>
                    </div>

                    {/* Main Card Container */}
                    <div className="rounded-2xl shadow-xl border border-red-200/60 bg-white overflow-hidden">
                        
                        {/* Card Header */}
                        <div className="border-b border-orange-200 p-6 bg-white">
                            <div className="flex items-center gap-3">
                                {/* Icon with gradient background */}
                                <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md flex-shrink-0">
                                    <HelpingHand className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-extrabold text-red-800">Action Center</h3>
                                        {/* TOTAL COUNT BADGE */}
                                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-bold text-red-600 border border-red-200">
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="text-sm text-orange-800/90 mt-1">
                                        Track the status of your financial and material assistance requests.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-6">

                            {/* Grid Layout for Items */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {requests.map((req) => {
                                    const style = getStyle(req.status);
                                    const StatusIcon = style.icon;

                                    return (
                                        <div
                                            key={req.id}
                                            // Changed from Link to div with onClick to open dialog
                                            onClick={() => handleViewDetails(req)}
                                            className={`
                                                group relative flex flex-col justify-between overflow-hidden rounded-xl border border-red-200/60 p-5 transition-all duration-300 cursor-pointer
                                                bg-gradient-to-br from-red-50/40 via-orange-50/40 to-amber-50/40
                                                hover:shadow-md hover:border-red-400 hover:-translate-y-1
                                            `}
                                        >
                                            <div className="flex flex-col h-full">
                                                
                                                {/* Top Row: Transaction ID & Status */}
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div className="flex items-center gap-2 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-gray-600 border border-red-100/50">
                                                        <FileText className="h-3 w-3 text-orange-500" />
                                                        <span className="font-mono tracking-wide">{req.transaction_number}</span>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide shadow-sm ${style.bg} ${style.text} ${style.border}`}>
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        {style.label}
                                                    </span>
                                                </div>

                                                {/* Middle: Content */}
                                                <div className="mb-4">
                                                    <h3 className="text-xl font-bold text-red-900 capitalize group-hover:text-red-700 transition-colors">
                                                        {formatType(req.assistance_type)} Assistance
                                                    </h3>
                                                    
                                                    <div className="mt-3 space-y-2">
                                                        {/* Beneficiary */}
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <User className="h-4 w-4 text-orange-400" />
                                                            <span className="font-medium">
                                                                {req.beneficiary?.name || 'Self'}
                                                            </span>
                                                            {req.beneficiary?.barangay && (
                                                                <span className="text-xs text-orange-800/60">
                                                                    ({req.beneficiary.barangay})
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Amount (if available) */}
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Banknote className="h-4 w-4 text-orange-400" />
                                                            <span className={`${req.amount ? 'font-bold text-green-600' : 'text-orange-800/60 italic'}`}>
                                                                {formatCurrency(req.amount)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="mt-4 line-clamp-2 text-sm text-gray-600 bg-white/60 p-3 rounded-lg border border-red-100/30 italic">
                                                        "{req.description}"
                                                    </p>
                                                </div>

                                                {/* Bottom: Date & Action */}
                                                <div className="mt-auto flex items-center justify-between border-t border-red-200/30 pt-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-orange-800/60">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        Requested: {formatDate(req.created_at)}
                                                    </div>

                                                    <div className="flex items-center gap-1 text-sm font-bold text-red-600 transition-all group-hover:text-red-800 group-hover:underline decoration-2 underline-offset-4">
                                                        View Details
                                                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* EMPTY STATE */}
                            {requests.length === 0 && (
                                <div className="rounded-xl border border-dashed border-red-200 bg-red-50/30 py-20 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-red-100 p-3">
                                            <HelpingHand className="h-8 w-8 text-red-400" />
                                        </div>
                                    </div>
                                    <h3 className="mt-4 text-lg font-medium text-red-900">No requests found</h3>
                                    <p className="mt-2 text-sm text-orange-800/70">
                                        You haven't submitted any assistance requests yet.
                                    </p>
                                </div>
                            )}

                            {/* PAGINATION */}
                            {/* {assistance.meta?.links && (
                                <div className="mt-8">
                                    <Pagination links={assistance.meta.links} />
                                </div>
                            )} */}

                        </div>
                    </div>
                </div>

                {/* SCROLL TO TOP FLOATING BUTTON */}
                <button
                    onClick={scrollToTop}
                    className={`
                        fixed bottom-8 right-8 z-40 rounded-full bg-gradient-to-r from-orange-500 to-red-600 p-2 text-white shadow-lg shadow-orange-500/30 
                        transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-orange-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
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
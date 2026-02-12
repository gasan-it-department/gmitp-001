import { useEffect } from 'react';
import { 
    X, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    HelpingHand, 
    Banknote,
    User,
    MapPin,
    FileText,
    Phone,
    Mail,
    XCircle
} from 'lucide-react';

interface AssistanceRequest {
    id: string;
    transaction_number: string;
    assistance_type: string;
    description: string;
    status: string;
    amount: number | null;
    created_at: string;
    beneficiary: {
        name: string;
        contact_number?: string | null;
        email?: string | null;
        barangay: string;
        municipality: string;
        province: string;
    } | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: AssistanceRequest | null; 
}

// --- Status Badge Helper ---
const DialogStatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, any> = {
        approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, label: 'Approved' },
        released: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: HelpingHand, label: 'Released' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Rejected' },
        pending:  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'In Review' },
        default:  { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle, label: status },
    };

    const config = styles[status?.toLowerCase()] || styles.default;
    const Icon = config.icon;

    return (
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm ${config.bg} ${config.text} ${config.border}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
};

export default function AssistanceDetailsDialog({ isOpen, onClose, request }: Props) {
    
    // Prevent body scroll
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !request) return null;

    // --- Formatters ---
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'Pending Assessment';
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4">
                    <div>
                        <h3 className="text-xl font-bold text-red-900">Request Details</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-red-800 border border-red-100">
                                <FileText className="h-3 w-3" />
                                {request.transaction_number}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-orange-400 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[80vh] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                    
                    {/* Status Bar */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
                        <DialogStatusBadge status={request.status} />
                        <span className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            Submitted: <span className="font-medium text-gray-700">{formatDate(request.created_at)}</span>
                        </span>
                    </div>

                    <div className="grid gap-6">
                        
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Type */}
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">Assistance Type</label>
                                <div className="flex items-center gap-2 text-lg font-bold text-gray-900 capitalize">
                                    <HelpingHand className="h-5 w-5 text-orange-500" />
                                    {request.assistance_type}
                                </div>
                            </div>
                            
                            {/* Amount */}
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">Approved Amount</label>
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    <Banknote className="h-5 w-5 text-green-600" />
                                    <span className={request.amount ? 'text-green-700' : 'text-gray-400 italic text-base'}>
                                        {formatCurrency(request.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Purpose / Description</label>
                            <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-5">
                                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap italic">
                                    "{request.description}"
                                </p>
                            </div>
                        </div>

                        {/* Beneficiary Card */}
                        <div>
                            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-400">Beneficiary Information</label>
                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-bold text-gray-700">Profile Details</span>
                                </div>
                                <div className="p-5 space-y-4">
                                    
                                    {/* Name */}
                                    <div>
                                        <p className="text-xs text-gray-400">Full Name</p>
                                        <p className="text-base font-bold text-gray-900">{request.beneficiary?.name || 'N/A'}</p>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Address</p>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                                            <span className="text-sm font-medium text-gray-700">
                                                {request.beneficiary?.barangay}, {request.beneficiary?.municipality}, {request.beneficiary?.province}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact (Optional Grid) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-sm text-gray-600">{request.beneficiary?.contact_number || 'No contact #'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-sm text-gray-600">{request.beneficiary?.email || 'No email'}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
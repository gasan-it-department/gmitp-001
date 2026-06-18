import { Pagination } from '@/components/Shared/Pagination';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import actionCenter from '@/routes/actionCenter';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    ArrowUp,
    Banknote,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Clock4,
    FileText,
    HelpingHand,
    ShieldAlert,
    ShieldCheck,
    User,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AssistanceDetailsDialog from '../List/AssistanceRequestDialog';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface ProfileState {
    id: string;
    full_name: string;
    is_verified: boolean;
    is_rejected: boolean;
    rejection_reason: string | null;
    identity_verified_at: string | null;
    intake_rejected_at: string | null;
}

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
    created_at: string;
    updated_at: string;
}

interface Props {
    profile: ProfileState | null;
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

export default function ActionCenterDashboard({ profile, requests }: Props) {
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

    // --- Profile Status Card Renderer ---
    const renderProfileStatus = () => {
        if (!profile) {
            return (
                <div className="mb-6 rounded-[24px] bg-gradient-to-br from-blue-500 to-blue-700 p-6 shadow-lg shadow-blue-500/20 text-white">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                            <UserPlus className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 pt-1">
                            <h3 className="text-lg font-bold tracking-tight text-white">Complete Profile</h3>
                            <p className="mt-1 text-sm text-blue-100 leading-snug">
                                Required before applying for assistance.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('actionCenter.profile.setup', { municipality: currentMunicipality.slug })}
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-600 transition-transform active:scale-95"
                    >
                        Set up profile
                    </Link>
                </div>
            );
        }

        if (profile.is_rejected) {
            return (
                <div className="mb-6 rounded-[24px] bg-gradient-to-br from-red-500 to-rose-600 p-6 shadow-lg shadow-red-500/20 text-white">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                            <ShieldAlert className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 pt-1">
                            <h3 className="text-lg font-bold tracking-tight text-white">Action Required</h3>
                            <p className="mt-1 text-sm text-red-100 leading-snug">
                                {profile.rejection_reason || 'Profile needs correction.'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={actionCenter.profile.correction.url({ municipality: currentMunicipality.slug })}
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-red-600 transition-transform active:scale-95"
                    >
                        Submit Correction
                    </Link>
                </div>
            );
        }

        if (!profile.is_verified) {
            return (
                <div className="mb-6 rounded-[24px] border-2 border-amber-100 bg-amber-50 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-200/50">
                            <Clock4 className="h-6 w-6 text-amber-700" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight text-amber-900">Pending Review</h3>
                            <p className="text-sm text-amber-700">Waiting for MSWD verification.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-6 rounded-[24px] border-2 border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-200/50">
                        <ShieldCheck className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold tracking-tight text-emerald-900">Verified</h3>
                        <p className="text-sm text-emerald-700">You can now apply for assistance.</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PublicLayout title="Action Center" description="Action Center Dashboard">
            <Head title="Dashboard" />

            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-md px-4 py-6 sm:px-6">
                    {/* Header */}
                    <div className="mb-8 mt-2 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Action Center</p>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                        </div>
                    </div>

                    {/* Render Profile Status Card */}
                    {renderProfileStatus()}

                    {/* Section Title */}
                    <div className="mb-4 mt-8 flex items-end justify-between px-1">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Requests</h2>
                        {totalCount > 0 && (
                            <span className="text-sm font-semibold text-slate-500">
                                {totalCount} total
                            </span>
                        )}
                    </div>

                    {/* Feed Content */}
                    <div className="space-y-3">
                        {data.map((req) => {
                            const style = getStyle(req.status);
                            
                            return (
                                <button
                                    key={req.id}
                                    onClick={() => handleViewDetails(req)}
                                    className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 shadow-sm transition-all active:scale-95 active:bg-slate-50 text-left border border-slate-100"
                                >
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                                        <style.icon className={`h-6 w-6 ${style.text}`} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="truncate text-base font-bold text-slate-900">
                                            {req.assistance_type?.name || 'Assistance'}
                                        </h3>
                                        <p className="truncate text-sm text-slate-500 font-medium">
                                            {formatDate(req.submitted_at)} • {req.subject_full_name}
                                        </p>
                                    </div>

                                    {req.amount_approved !== null && (
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-black text-green-600">
                                                {formatCurrency(req.amount_approved)}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            );
                        })}

                        {data.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 py-16 px-6 text-center">
                                <div className="mb-4 rounded-full bg-slate-100 p-5">
                                    <HelpingHand className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No requests</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    You haven't applied for any assistance yet.
                                </p>
                            </div>
                        )}

                        {requests.links && data.length > 0 && (
                            <div className="pt-6">
                                <Pagination links={requests.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AssistanceDetailsDialog isOpen={isDialogOpen} onClose={handleCloseDialog} request={selectedRequest} />
        </PublicLayout>
    );
}

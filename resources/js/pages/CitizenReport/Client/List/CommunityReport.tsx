import { useState, useEffect } from 'react';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head } from '@inertiajs/react';
import { Pagination } from '@/components/Shared/Pagination';
import { 
    Megaphone, 
    MapPin, 
    Calendar, 
    ArrowRight, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    ChevronLeft,
    ArrowUp 
} from 'lucide-react';
import ReportDetailsDialog from './ReportDetailsDialog';

// ----------------------------------------------------------------------
// HELPER COMPONENT: Status Badge
// ----------------------------------------------------------------------
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
        resolved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons: Record<string, any> = {
        pending: Clock,
        in_progress: Clock,
        resolved: CheckCircle2,
        rejected: AlertCircle,
    };

    const labels: Record<string, string> = {
        pending: 'Waiting for Action',
        in_progress: 'Action in Progress',
        resolved: 'Fixed / Done',
        rejected: 'Declined',
    };

    const currentStyle = styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    const label = labels[status] || status;
    const Icon = icons[status] || AlertCircle;

    return (
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm ${currentStyle}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
};

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
export default function CommunityReport({ reports }: { reports: any }) {
    const reportList = reports?.data || [];
    const totalCount = reports?.meta?.total || reportList.length || 0;

    // --- State for Dialog ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    
    // --- State for Scroll Top ---
    const [showScrollTop, setShowScrollTop] = useState(false);

    // --- Handlers ---
    const handleViewDetails = (report: any) => {
        setSelectedReport(report);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => setSelectedReport(null), 300); // Clear data after animation
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
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatType = (typeString: string) => {
        if (!typeString) return 'Report';
        return typeString
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <PublicLayout title="" description="">
            <Head title="Community Reports" />
            <div className="py-12">
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
                                <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md flex-shrink-0">
                                    <Megaphone className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-extrabold text-red-800">Community Reports</h3>
                                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-bold text-red-600 border border-red-200">
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="text-sm text-orange-800/90 mt-1">
                                        Report damage, issues, or concerns in your barangay.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-6">
                            
                            {/* Grid of Reports */}
                            <div className="grid gap-4">
                                {reportList.map((report: any) => (
                                    <div
                                        key={report.id}
                                        className={`
                                            group flex flex-col gap-6 rounded-xl border border-red-200/60 p-4 transition-all duration-300 sm:p-5
                                            bg-gradient-to-br from-red-50/70 via-orange-50/70 to-amber-100/70
                                            hover:shadow-lg hover:border-red-400
                                        `}
                                    >
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <h4 className="text-lg font-bold text-red-900 group-hover:text-red-700 transition-colors">
                                                        {formatType(report.type)}
                                                    </h4>
                                                    <div>
                                                        <StatusBadge status={report.status} />
                                                    </div>
                                                </div>

                                                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-orange-800/80">
                                                    <MapPin className="h-4 w-4 text-red-500" />
                                                    {report.location}
                                                </p>

                                                <p className="line-clamp-2 text-sm text-gray-600">
                                                    {report.description}
                                                </p>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-red-200/50 pt-3">
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-orange-800/60">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Submitted: {formatDate(report.created_at)}
                                                </span>

                                                <button
                                                    onClick={() => handleViewDetails(report)}
                                                    className="group flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-800 hover:underline decoration-2 underline-offset-4 transition-all"
                                                >
                                                    View Details 
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {reportList.length === 0 && (
                                <div className="rounded-xl border border-dashed border-red-200 bg-red-50/30 py-20 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-red-100 p-3">
                                            <Megaphone className="h-6 w-6 text-red-400" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium text-red-900">
                                        You haven't reported any issues yet.
                                    </p>
                                    <p className="text-sm text-orange-800/70">
                                        See a problem in your area? Let us know!
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {reports?.meta?.links && (
                                <Pagination links={reports.meta.links} />
                            )}
                        </div>
                    </div>
                </div>

                {/* SCROLL TO TOP FLOATING BUTTON - REDUCED SIZE */}
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
            <ReportDetailsDialog 
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                report={selectedReport}
            />

        </PublicLayout>
    );
}
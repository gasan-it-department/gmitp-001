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

    const currentStyle = styles[status] || 'bg-muted text-muted-foreground border-border';
    const label = labels[status] || status;
    const Icon = icons[status] || AlertCircle;

    return (
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black tracking-wide uppercase shadow-sm ${currentStyle}`}>
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

    // --- State ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // --- Handlers ---
    const handleViewDetails = (report: any) => {
        setSelectedReport(report);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => setSelectedReport(null), 300);
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
            <div className="py-12 bg-muted/30 min-h-screen">
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
                                    <Megaphone className="h-5 w-5" />
                                </div>
                                
                                {/* Title Text */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground hidden sm:block">Community Reports</h3>
                                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground sm:hidden">Reports</h3>
                                        
                                        {/* Count Badge */}
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary border border-primary/20">
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:block">
                                        Report damage and issues in your area
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 sm:p-6 space-y-4">
                            
                            {/* Grid of Reports */}
                            <div className="grid gap-4">
                                {reportList.map((report: any) => (
                                    <div
                                        key={report.id}
                                        className={`
                                            group flex flex-col gap-6 rounded-xl border border-border p-4 transition-all duration-300 sm:p-5
                                            bg-card hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 cursor-pointer
                                        `}
                                        onClick={() => handleViewDetails(report)}
                                    >
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <h4 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                                                        {formatType(report.type)}
                                                    </h4>
                                                    <div>
                                                        <StatusBadge status={report.status} />
                                                    </div>
                                                </div>

                                                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    {report.location}
                                                </p>

                                                <p className="line-clamp-2 text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-border">
                                                    "{report.description}"
                                                </p>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Submitted: {formatDate(report.created_at)}
                                                </span>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent double trigger
                                                        handleViewDetails(report);
                                                    }}
                                                    className="group flex items-center gap-1 text-xs font-black uppercase tracking-wide text-primary hover:underline decoration-2 underline-offset-4 transition-all"
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
                                <div className="rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-muted p-4">
                                            <Megaphone className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-black uppercase tracking-wide text-foreground">
                                        You haven't reported any issues yet.
                                    </p>
                                    <p className="text-sm font-medium text-muted-foreground">
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
            <ReportDetailsDialog 
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                report={selectedReport}
            />

        </PublicLayout>
    );
}
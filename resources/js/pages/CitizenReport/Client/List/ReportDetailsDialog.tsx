import { useEffect, useState } from 'react';
import { 
    X, 
    MapPin, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Tag, 
    FileText,
    ExternalLink,
    Globe,
    ChevronLeft,
    ChevronRight,
    ImageIcon
} from 'lucide-react';

interface ReportDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    report: any; 
}

// Helper: Status Badge (Themed)
const DialogStatusBadge = ({ status }: { status: string }) => {
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

export default function ReportDetailsDialog({ isOpen, onClose, report }: ReportDetailsDialogProps) {
    // State for Image Carousel
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reset image index when modal opens or report changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [report, isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !report) return null;

    // --- Helpers ---
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatType = (typeString: string) => {
        if (!typeString) return 'Report';
        return typeString
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // --- Get ALL Images ---
    const getImages = (attachments: any[]) => {
        if (!attachments || attachments.length === 0) return [];
        return attachments.map((file) => {
             return file.view_url || file.url || file.path || file.download_url;
        }).filter(Boolean);
    };

    const images = getImages(report.attachments);
    const hasImages = images.length > 0;
    
    // --- Carousel Handlers ---
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    // Check if coordinates exist
    const hasCoordinates = report.latitude !== null && report.longitude !== null;
    const googleMapsUrl = hasCoordinates 
        ? `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`
        : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            
            {/* Backdrop / Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-background shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 border border-border flex flex-col max-h-[90vh]">
                
                {/* Header (Themed) */}
                <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-primary">Report Details</h3>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID: #{report.id}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    
                    {/* Status & Date Row */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
                        <DialogStatusBadge status={report.status} />
                        <span className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground border border-border">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {formatDate(report.created_at)}
                        </span>
                    </div>

                    {/* --- IMAGE CAROUSEL SECTION --- */}
                    {hasImages ? (
                        <div className="group mb-8 relative overflow-hidden rounded-xl border border-border bg-black shadow-sm">
                            
                            {/* Image Counter Pill */}
                            <div className="absolute top-3 left-3 z-10">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm border border-white/10">
                                    <ImageIcon className="h-3 w-3" />
                                    {currentImageIndex + 1} / {images.length}
                                </span>
                            </div>

                            {/* Main Image */}
                            <div className="aspect-video w-full flex items-center justify-center bg-black/90">
                                <img 
                                    src={images[currentImageIndex]} 
                                    alt={`Evidence ${currentImageIndex + 1}`} 
                                    className="h-full w-full object-contain max-h-[300px] sm:max-h-[400px]"
                                />
                            </div>

                            {/* Navigation Buttons (Only if > 1 image) */}
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white shadow-md backdrop-blur-sm border border-white/10 transition-all hover:bg-black/70 hover:scale-110 active:scale-95"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white shadow-md backdrop-blur-sm border border-white/10 transition-all hover:bg-black/70 hover:scale-110 active:scale-95"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                            
                            {/* Dots Indicator (Bottom) */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                    {images.map((_, idx) => (
                                        <div 
                                            key={idx}
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                                idx === currentImageIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/30'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // No Image Placeholder
                        <div className="mb-8 flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/10 text-muted-foreground">
                            <div className="rounded-full bg-muted p-3">
                                <FileText className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide opacity-70">No photo evidence attached</span>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="space-y-6">
                        
                        {/* Title/Type */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <Tag className="h-3.5 w-3.5" />
                                Issue Category
                            </label>
                            <div className="text-lg font-black uppercase tracking-tight text-foreground">
                                {formatType(report.type)}
                            </div>
                        </div>

                        {/* Location & Coordinates Grid */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Location Name */}
                            <div className="flex flex-col h-full">
                                <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Location
                                </label>
                                <div className="rounded-xl border border-border bg-card p-4 flex-1">
                                    <p className="font-bold text-foreground leading-snug text-sm">
                                        {report.location}
                                    </p>
                                </div>
                            </div>

                            {/* Coordinates */}
                            <div className="flex flex-col h-full">
                                <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <Globe className="h-3.5 w-3.5" />
                                    GPS Coordinates
                                </label>
                                
                                {hasCoordinates ? (
                                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex-1 flex flex-col justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-background p-2 shadow-sm border border-border text-primary">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black tracking-wider text-primary">Lat / Long</span>
                                                <span className="font-mono text-xs font-bold text-foreground">
                                                    {parseFloat(report.latitude).toFixed(6)}, {parseFloat(report.longitude).toFixed(6)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <a 
                                            href={googleMapsUrl!} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-background border border-border py-2 text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md active:scale-[0.98]"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Open in Maps
                                        </a>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 flex-1 flex flex-col items-center justify-center text-center gap-2">
                                        <Globe className="h-5 w-5 text-muted-foreground/40" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">
                                            No GPS data
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Description
                            </label>
                            <div className="rounded-xl border border-border bg-muted/20 p-5">
                                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words font-medium">
                                    {report.description}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer (Themed) */}
                <div className="shrink-0 border-t border-border bg-muted/10 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-border bg-background px-6 py-2.5 text-xs font-black uppercase tracking-widest text-foreground shadow-sm transition-all hover:bg-muted hover:text-primary active:scale-[0.98]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
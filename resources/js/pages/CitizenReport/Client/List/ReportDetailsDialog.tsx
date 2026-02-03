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

// Helper: Status Badge
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

    // --- NEW: Get ALL Images ---
    const getImages = (attachments: any[]) => {
        if (!attachments || attachments.length === 0) return [];
        
        // Map through all attachments and return valid URLs
        return attachments.map((file) => {
             return file.view_url || file.url || file.path || file.download_url;
        }).filter(Boolean); // Remove null/undefined
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            
            {/* Backdrop / Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4">
                    <div>
                        <h3 className="text-xl font-bold text-red-900">Report Details</h3>
                        <p className="text-xs font-medium text-orange-800/60">ID: #{report.id}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="rounded-full p-2 text-orange-400 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="max-h-[80vh] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    
                    {/* Status & Date Row */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
                        <DialogStatusBadge status={report.status} />
                        <span className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-100">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            {formatDate(report.created_at)}
                        </span>
                    </div>

                    {/* --- IMAGE CAROUSEL SECTION --- */}
                    {hasImages ? (
                        <div className="group mb-8 relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 shadow-sm">
                            
                            {/* Image Counter Pill */}
                            <div className="absolute top-3 left-3 z-10">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    {currentImageIndex + 1} / {images.length}
                                </span>
                            </div>

                            {/* Main Image */}
                            <div className="aspect-video w-full flex items-center justify-center bg-gray-100">
                                <img 
                                    src={images[currentImageIndex]} 
                                    alt={`Evidence ${currentImageIndex + 1}`} 
                                    className="h-full w-full object-contain max-h-[400px]"
                                />
                            </div>

                            {/* Navigation Buttons (Only if > 1 image) */}
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95"
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
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // No Image Placeholder
                        <div className="mb-8 flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-gray-400">
                            <div className="rounded-full bg-gray-100 p-3">
                                <FileText className="h-5 w-5 text-gray-300" />
                            </div>
                            <span className="text-sm font-medium">No photo evidence attached</span>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="space-y-6">
                        
                        {/* Title/Type */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                <Tag className="h-3.5 w-3.5" />
                                Issue Category
                            </label>
                            <div className="text-lg font-bold text-gray-900">
                                {formatType(report.type)}
                            </div>
                        </div>

                        {/* Location & Coordinates Grid */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Location Name */}
                            <div className="flex flex-col">
                                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Location
                                </label>
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 h-full">
                                    <p className="font-medium text-gray-800 leading-snug">
                                        {report.location}
                                    </p>
                                </div>
                            </div>

                            {/* Coordinates */}
                            <div className="flex flex-col">
                                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <Globe className="h-3.5 w-3.5" />
                                    GPS Coordinates
                                </label>
                                
                                {hasCoordinates ? (
                                    <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3 h-full flex flex-col justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-white p-2 shadow-sm border border-blue-100 text-blue-500">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-blue-400">Lat / Long</span>
                                                <span className="font-mono text-sm font-semibold text-gray-700">
                                                    {parseFloat(report.latitude).toFixed(6)}, {parseFloat(report.longitude).toFixed(6)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <a 
                                            href={googleMapsUrl!} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 py-2 text-xs font-bold text-gray-700 shadow-sm transition-all hover:border-red-200 hover:text-red-600 hover:shadow-md active:scale-[0.98]"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Open in Maps
                                        </a>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 h-full flex flex-col items-center justify-center text-center gap-2">
                                        <Globe className="h-5 w-5 text-gray-300" />
                                        <span className="text-xs font-medium text-gray-400">
                                            No GPS data available
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
                                Description
                            </label>
                            <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-5">
                                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
                                    {report.description}
                                </p>
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
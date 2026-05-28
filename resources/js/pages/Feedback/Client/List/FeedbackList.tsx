import { Pagination } from '@/components/Shared/Pagination';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head } from '@inertiajs/react';
import {
    ArrowUp,
    Building2,
    ChevronLeft,
    Clock,
    Image as ImageIcon,
    MessageCircle,
    MessageSquareQuote,
    Star,
    User,
    UserCircle,
    VenetianMask,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface Attachment {
    id: string;
    name: string;
    mime_type: string;
    size: number;
    url: string;
}

interface FeedbackData {
    id: string;
    subject: string;
    message: string;
    rating: number | null;
    is_anonymous: boolean;
    citizen_name: string | null;
    employee_name: string | null;
    department: { id: string; name: string } | null;
    created_at: string;
    attachments: Attachment[];
}

interface FeedbackListProps {
    feedback: {
        data: FeedbackData[];
        meta: any;
        links: any;
    };
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: Lightbox
// ----------------------------------------------------------------------
const Lightbox = ({ url, onClose }: { url: string; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90"
            >
                <X className="h-6 w-6" />
            </button>
            <img
                src={url}
                alt="Full size feedback attachment"
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Image Gallery
// ----------------------------------------------------------------------
const FeedbackImageGallery = ({ attachments }: { attachments: Attachment[] }) => {
    const images = attachments.filter((a) => a.mime_type.startsWith('image/'));
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (images.length === 0) return null;

    return (
        <div className="mt-4">
            <div className="flex flex-wrap gap-2">
                {images.map((img) => (
                    <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.url)}
                        className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-primary active:scale-95 sm:h-24 sm:w-24"
                    >
                        <img
                            src={img.url}
                            alt={img.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                            <ImageIcon className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                    </button>
                ))}
            </div>

            {selectedImage && <Lightbox url={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Star Rating
// ----------------------------------------------------------------------
const StarRating = ({ rating }: { rating: number | null }) => {
    if (rating === null) {
        return <span className="text-[10px] font-bold tracking-wide text-muted-foreground/60 uppercase italic">No rating</span>;
    }

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted/30 text-muted-foreground/30'}`}
                />
            ))}
            <span className="ml-1.5 text-xs font-bold text-foreground">({rating}.0)</span>
        </div>
    );
};

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
export default function FeedbackList({ feedback }: FeedbackListProps) {
    const feedbackList = feedback.data || [];
    const totalCount = feedback?.meta?.total || feedbackList.length || 0;
    console.log(feedbackList);
    // --- State for Scroll Top ---
    const [showScrollTop, setShowScrollTop] = useState(false);

    // --- Scroll Handlers ---
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- Helpers ---
    const formatTargetLabel = (target: string) => {
        return target.charAt(0).toUpperCase() + target.slice(1);
    };

    return (
        <PublicLayout title="" description="">
            <Head title="Citizen Feedback" />

            <div className="relative min-h-screen bg-muted/30 py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {/* Main Card Container */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        {/* THEMED CARD HEADER (Integrated Toolbar) */}
                        <div className="sticky top-0 z-20 border-b border-border bg-card/50 p-5 backdrop-blur-sm">
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
                                    <MessageSquareQuote className="h-5 w-5" />
                                </div>

                                {/* Title Text */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <h3 className="hidden text-xl font-black tracking-widest text-foreground uppercase sm:block">
                                            Citizen Feedback
                                        </h3>
                                        <h3 className="text-xl font-black tracking-widest text-foreground uppercase sm:hidden">Feedback</h3>

                                        {/* Count Badge */}
                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="hidden text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:block sm:text-xs">
                                        Reviews & Suggestions from the community
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="space-y-4 p-4 sm:p-6">
                            {/* Feedback List Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {feedbackList.map((item) => {
                                    const displayName = item.is_anonymous ? 'Anonymous Citizen' : item.citizen_name;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg`}
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row">
                                                {/* Avatar Section */}
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-colors ${
                                                            item.is_anonymous
                                                                ? 'border-border bg-muted/50 text-muted-foreground'
                                                                : 'border-primary/20 bg-primary/5 text-primary'
                                                        } `}
                                                    >
                                                        {item.is_anonymous ? <VenetianMask className="h-6 w-6" /> : <User className="h-6 w-6" />}
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-1">
                                                    {/* Header Row */}
                                                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <h4
                                                                className={`text-base font-black tracking-tight uppercase transition-colors ${item.is_anonymous ? 'text-muted-foreground italic' : 'text-foreground group-hover:text-primary'}`}
                                                            >
                                                                {displayName}
                                                            </h4>
                                                            {item.subject && (
                                                                <div className="mb-1 text-xs font-bold text-foreground/70">{item.subject}</div>
                                                            )}
                                                            <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{item.created_at}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 sm:mt-0">
                                                            <StarRating rating={item.rating} />
                                                        </div>
                                                    </div>

                                                    {/* Message Bubble */}
                                                    <div className="relative mt-2 rounded-xl border border-border bg-muted/30 p-4 text-sm font-medium text-foreground/80 italic">
                                                        <MessageSquareQuote className="absolute top-2 left-2 h-4 w-4 -translate-x-1 -translate-y-1 text-primary/20" />
                                                        <span className="relative z-10">"{item.message}"</span>
                                                    </div>

                                                    {/* Image Gallery */}
                                                    <FeedbackImageGallery attachments={item.attachments} />

                                                    {/* Target / Context (Employee or Department) */}
                                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                                        <span className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                                                            Regarding:
                                                        </span>

                                                        {item.employee_name && (
                                                            // EMPLOYEE BADGE
                                                            <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-100/50 bg-blue-50/50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue-700 uppercase">
                                                                <UserCircle className="h-3.5 w-3.5" />
                                                                {item.employee_name}
                                                            </span>
                                                        )}

                                                        {item.department && (
                                                            // DEPARTMENT BADGE
                                                            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                                                <Building2 className="h-3.5 w-3.5" />
                                                                {item.department.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Empty State */}
                            {feedbackList.length === 0 && (
                                <div className="rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-muted p-4">
                                            <MessageCircle className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <h3 className="mt-4 text-lg font-black tracking-wide text-foreground uppercase">No feedback yet</h3>
                                    <p className="mt-2 text-sm font-medium text-muted-foreground">Be the first to share your thoughts!</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {feedback.meta?.links && (
                                <div className="mt-8 border-t border-border pt-6">
                                    <Pagination links={feedback.meta.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SCROLL TO TOP FLOATING BUTTON */}
                <button
                    onClick={scrollToTop}
                    className={`fixed right-8 bottom-8 z-40 rounded-full bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-primary/50 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none ${showScrollTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'} `}
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
            </div>
        </PublicLayout>
    );
}

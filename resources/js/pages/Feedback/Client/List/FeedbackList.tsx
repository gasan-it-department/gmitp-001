import { useState, useEffect } from 'react';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head } from '@inertiajs/react';
import { Pagination } from '@/components/Shared/Pagination';
import { 
    MessageSquareQuote, 
    Star, 
    Clock, 
    ChevronLeft, 
    ArrowUp, 
    MessageCircle,
    Building2,
    UserCircle,
    User,           
    VenetianMask    
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface FeedbackData {
    id: string;
    sender_name: string | null;
    message: string;
    rating: number | null;
    feedback_target: 'employee' | 'department' | string; 
    employee_name: string | null;
    department_id: string | null;
    created_at: string;
    attachments: any[];
}

interface FeedbackListProps {
    feedback: {
        data: FeedbackData[];
        meta: any;
        links: any;
    };
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: Star Rating
// ----------------------------------------------------------------------
const StarRating = ({ rating }: { rating: number | null }) => {
    if (rating === null) {
        return (
            <span className="text-[10px] font-bold italic text-muted-foreground/60 uppercase tracking-wide">No rating</span>
        );
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
                                    <MessageSquareQuote className="h-5 w-5" />
                                </div>
                                
                                {/* Title Text */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground hidden sm:block">Citizen Feedback</h3>
                                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground sm:hidden">Feedback</h3>
                                        
                                        {/* Count Badge */}
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary border border-primary/20">
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:block">
                                        Reviews & Suggestions from the community
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 sm:p-6 space-y-4">
                            
                            {/* Feedback List Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {feedbackList.map((item) => {
                                    // LOGIC: Check if name is null OR string "null"
                                    const isAnonymous = !item.sender_name || item.sender_name === 'null';
                                    const displayName = isAnonymous ? 'Anonymous Citizen' : item.sender_name;

                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`
                                                group relative overflow-hidden rounded-xl border border-border p-5 transition-all duration-300
                                                bg-card hover:shadow-lg hover:border-primary/50 hover:-translate-y-1
                                            `}
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row">
                                                
                                                {/* Avatar Section */}
                                                <div className="flex-shrink-0">
                                                    <div className={`
                                                        flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-colors
                                                        ${isAnonymous 
                                                            ? 'bg-muted/50 text-muted-foreground border-border' 
                                                            : 'bg-primary/5 text-primary border-primary/20' 
                                                        }
                                                    `}>
                                                        {isAnonymous ? (
                                                            <VenetianMask className="h-6 w-6" />
                                                        ) : (
                                                            <User className="h-6 w-6" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-1">
                                                    
                                                    {/* Header Row */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                                        <div>
                                                            <h4 className={`text-base font-black uppercase tracking-tight transition-colors ${isAnonymous ? 'text-muted-foreground italic' : 'text-foreground group-hover:text-primary'}`}>
                                                                {displayName}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 mt-0.5 font-bold uppercase tracking-wider">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{item.created_at}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 sm:mt-0">
                                                            <StarRating rating={item.rating} />
                                                        </div>
                                                    </div>

                                                    {/* Message Bubble */}
                                                    <div className="relative mt-2 rounded-xl bg-muted/30 p-4 text-sm font-medium text-foreground/80 italic border border-border">
                                                        <MessageSquareQuote className="absolute top-2 left-2 h-4 w-4 text-primary/20 -translate-x-1 -translate-y-1" />
                                                        <span className="relative z-10">"{item.message}"</span>
                                                    </div>

                                                    {/* Target / Context (Employee or Department) */}
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Regarding:</span>
                                                        
                                                        {item.feedback_target === 'employee' && item.employee_name ? (
                                                            // EMPLOYEE BADGE
                                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 border border-blue-100/50">
                                                                <UserCircle className="h-3.5 w-3.5" />
                                                                {item.employee_name}
                                                            </span>
                                                        ) : (
                                                            // DEPARTMENT BADGE
                                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground border border-border">
                                                                <Building2 className="h-3.5 w-3.5" />
                                                                {formatTargetLabel(item.feedback_target)}
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
                                    <h3 className="mt-4 text-lg font-black uppercase tracking-wide text-foreground">No feedback yet</h3>
                                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                                        Be the first to share your thoughts!
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {feedback.meta?.links && (
                                <div className="mt-8 pt-6 border-t border-border">
                                    <Pagination links={feedback.meta.links} />
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
        </PublicLayout>
    );
}
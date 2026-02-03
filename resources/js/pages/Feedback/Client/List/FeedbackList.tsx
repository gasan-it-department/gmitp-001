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
            <span className="text-xs italic text-gray-400">No rating provided</span>
        );
    }

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                    key={star} 
                    className={`h-3.5 w-3.5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-300'}`} 
                />
            ))}
            <span className="ml-1.5 text-xs font-bold text-gray-700">({rating}.0)</span>
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
                                    <MessageSquareQuote className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-extrabold text-red-800">Citizen Feedback</h3>
                                        {/* Total Count Badge */}
                                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-bold text-red-600 border border-red-200">
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="text-sm text-orange-800/90 mt-1">
                                        Reviews, suggestions, and comments from the community.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-6">
                            
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
                                                group relative overflow-hidden rounded-xl border border-red-200/60 p-5 transition-all duration-300
                                                bg-gradient-to-br from-red-50/40 via-orange-50/40 to-amber-50/40
                                                hover:shadow-md hover:border-red-400
                                            `}
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row">
                                                
                                                {/* Avatar Section */}
                                                <div className="flex-shrink-0">
                                                    <div className={`
                                                        flex h-12 w-12 items-center justify-center rounded-full border shadow-sm
                                                        ${isAnonymous 
                                                            ? 'bg-gray-100 text-gray-500 border-gray-200' // Anonymous Style
                                                            : 'bg-white text-orange-600 border-red-100/50' // Named Style
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
                                                            <h4 className={`text-base font-bold transition-colors ${isAnonymous ? 'text-gray-600 italic' : 'text-red-900 group-hover:text-red-700'}`}>
                                                                {displayName}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-orange-800/60 mt-0.5 font-medium">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{item.created_at}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 sm:mt-0">
                                                            <StarRating rating={item.rating} />
                                                        </div>
                                                    </div>

                                                    {/* Message Bubble */}
                                                    <div className="relative mt-2 rounded-lg bg-white/60 p-4 text-sm text-gray-700 leading-relaxed italic border border-red-100/30">
                                                        <MessageSquareQuote className="absolute top-2 left-2 h-4 w-4 text-orange-200 -translate-x-1 -translate-y-1 opacity-70" />
                                                        <span className="relative z-10">"{item.message}"</span>
                                                    </div>

                                                    {/* Target / Context (Employee or Department) */}
                                                    <div className="mt-3 flex items-center gap-3 text-xs">
                                                        <span className="font-bold text-orange-800/60 uppercase tracking-wide">Regarding:</span>
                                                        
                                                        {item.feedback_target === 'employee' && item.employee_name ? (
                                                            // EMPLOYEE BADGE
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 font-medium text-blue-700 border border-blue-100 shadow-sm">
                                                                <UserCircle className="h-3 w-3" />
                                                                {item.employee_name}
                                                            </span>
                                                        ) : (
                                                            // DEPARTMENT BADGE
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 font-medium text-gray-600 border border-gray-200 shadow-sm">
                                                                <Building2 className="h-3 w-3" />
                                                                {/* Display 'Department' or format the target string if generic */}
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
                                <div className="rounded-xl border border-dashed border-red-200 bg-red-50/30 py-20 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-red-100 p-3">
                                            <MessageCircle className="h-8 w-8 text-red-400" />
                                        </div>
                                    </div>
                                    <h3 className="mt-4 text-lg font-medium text-red-900">No feedback yet</h3>
                                    <p className="mt-2 text-sm text-orange-800/70">
                                        Be the first to share your thoughts!
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {feedback.meta?.links && (
                                <div className="mt-8 pt-6 border-t border-red-100">
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
                        fixed bottom-8 right-8 z-40 rounded-full bg-gradient-to-r from-orange-500 to-red-600 p-2 text-white shadow-lg shadow-orange-500/30 
                        transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-orange-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
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
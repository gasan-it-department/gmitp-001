import { Pagination } from '@/components/Shared/Pagination'; // Assuming you have this from previous steps
import { FeedbackData } from '@/Core/Types/Feedback/FeedbackTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/PaginationTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';

interface FeedbackListProps {
    feedback: PaginatedResponse<FeedbackData>;
}
// --- 1. Star Rating Helper Component ---
const StarRating = ({ rating }: { rating?: number }) => {
    if (!rating) return null;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="ml-2 text-xs font-semibold text-gray-600">({rating}/5)</span>
        </div>
    );
};

// --- 2. The Main Feedback Card ---
const FeedbackCard = ({ data }: { data: FeedbackData }) => {
    // Logic: If anonymous, hide the name and use a neutral color
    const isAnon = data.is_anonymous;
    const displayName = isAnon ? 'Concerned Citizen' : data.sender_name || 'Unknown';
    const initial = displayName.charAt(0).toUpperCase();

    // Visual styling based on anonymity
    const avatarClass = isAnon ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700';

    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            {/* Top Row: Avatar, Name, Date */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {/* Avatar Circle */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${avatarClass}`}>
                        {isAnon ? '?' : initial}
                    </div>

                    {/* Name & Meta */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            {displayName}
                            {isAnon && (
                                <span className="ml-2 inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 uppercase">
                                    Anonymous
                                </span>
                            )}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                            <time dateTime={data.created_at}>{data.created_at}</time>
                            <span>•</span>
                            <span className="font-medium text-gray-700">{data.feedback_target}</span>
                        </div>
                    </div>
                </div>

                {/* Optional Status Indicator (Example) */}
                <div className="shrink-0">
                    <StarRating rating={data.rating} />
                </div>
            </div>

            {/* Middle: The Message */}
            <div className="mb-5 pl-16">
                {/* pl-16 aligns text with the name, not the avatar, for a cleaner read */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-600">
                    {data.message || <span className="text-gray-400 italic">No written comment provided.</span>}
                </p>
            </div>

            {/* Bottom: Context/Employee Info */}
            {data.employee_name && (
                <div className="mt-4 ml-16 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span>Refers to employee:</span>
                        <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-900">{data.employee_name}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 3. The List Container ---
const FeedbackList = ({ feedback }: FeedbackListProps) => {
    // Empty State
    if (!feedback.data.length) {
        return (
            <PublicLayout title="" description="">
                <div className="m-4 flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center">
                    <div className="rounded-full bg-gray-200 p-3">
                        <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No feedback found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by collecting feedback from citizens.</p>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout title="" description="">
            <div className="mx-auto max-w-5xl py-6">
                {/* Page Header */}
                <div className="mb-6 flex items-baseline justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold tracking-tight text-gray-800">Citizen Feedback</h2>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Total: {feedback.meta.total}</span>
                </div>

                {/* The Grid of Cards */}
                <div className="grid grid-cols-1 gap-6">
                    {feedback.data.map((item) => (
                        <FeedbackCard key={item.id} data={item} />
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                    {/* Passing the correct links array to your component */}
                    <Pagination links={feedback.meta.links} />
                </div>
            </div>
        </PublicLayout>
    );
};

export default FeedbackList;

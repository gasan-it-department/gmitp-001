import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Utility from '@/pages/Utility/Utility';
import { Star } from 'lucide-react';
import { FeedbackFormData } from '@/Core/Types/Feedback/FeedbackTypes';
import { dummy_departments } from '@/pages/Utility/Offices';

interface ViewFeedbackDialogProps {
    isOpen: boolean;
    data: FeedbackFormData | null;
    onClose: () => void;
}

export default function ViewFeedbackDialog({ isOpen, data, onClose }: ViewFeedbackDialogProps) {
    if (!data) return null;

    const getSenderName = (name?: string | null) =>
        name && name !== "null" && name.trim() !== "" ? name : "Anonymous";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] sm:max-w-md w-full min-w-[150vh] overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl">

                {/* HEADER */}
                <DialogHeader className="border-b border-orange-200 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Feedback Details
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        {Utility().formatToReadableDate(data.created_at)}
                    </p>
                </DialogHeader>

                {/* BODY */}
                <div className="custom-scrollbar max-h-[60vh] overflow-hidden px-4 py-3 space-y-5">
                    {/* EMPLOYEE */}
                    {data.feedback_target === 'employee' && (
                        <Card label="Reported Employee" value={data.employee_name} />
                    )}

                    {/* DEPARTMENT */}
                    {data.department_id && (
                        <Card
                            label="Department"
                            value={
                                dummy_departments.find(
                                    d => d.id === data.department_id!.trim()
                                )?.name ?? "Unknown"
                            }
                        />
                    )}


                    {/* SENDER */}
                    <Card label="Sender" value={getSenderName(data.sender_name)} />

                    {/* RATING (only for department) */}
                    {data.feedback_target === 'department' && data.rating !== undefined && (
                        <div>
                            <span className="text-xs font-semibold text-orange-700 uppercase">Rating</span>
                            <div className="flex gap-1 mt-2">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star
                                        key={idx}
                                        className={`w-5 h-5 ${idx < (data.rating ?? 0) ? "text-orange-400" : "text-gray-300"}`}
                                    />
                                ))}
                            </div>
                            <a>
                                {data.rating} out of 5 stars
                            </a>
                        </div>
                    )}

                    {/* MESSAGE */}
                    <div>
                        <span className="text-xs font-semibold text-orange-700 uppercase">Message</span>
                        <div className="mt-2 p-3 rounded-md bg-gray-50 border border-orange-200 text-gray-800 max-h-[35vh] overflow-y-auto">
                            {data.message || "No message provided."}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-orange-200 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-md hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Simple card component for repeated fields
function Card({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 rounded-md bg-white border border-orange-200 shadow-sm">
            <span className="text-xs font-semibold text-orange-700 uppercase">{label}</span>
            <p className="text-gray-800 mt-1">{value}</p>
        </div>
    );
}

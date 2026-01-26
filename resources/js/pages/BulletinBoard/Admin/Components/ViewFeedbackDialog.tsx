import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FeedbackFormData } from '@/Core/Types/Feedback/FeedbackTypes';
import { dummy_departments } from '@/pages/Utility/Offices';
import Utility from '@/pages/Utility/Utility';
import { Star } from 'lucide-react';

interface ViewFeedbackDialogProps {
    isOpen: boolean;
    data: FeedbackFormData | null;
    onClose: () => void;
}

export default function ViewFeedbackDialog({ isOpen, data, onClose }: ViewFeedbackDialogProps) {
    if (!data) return null;

    const getSenderName = (name?: string | null) => (name && name !== 'null' && name.trim() !== '' ? name : 'Anonymous');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl sm:max-w-[70vh]">
                {/* HEADER */}
                <DialogHeader className="border-b border-orange-200 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">Feedback Details</DialogTitle>
                    <p className="mt-1 text-sm text-gray-500">{Utility().formatToReadableDate(data.created_at)}</p>
                </DialogHeader>

                {/* BODY */}
                <div className="custom-scrollbar max-h-[60vh] space-y-5 overflow-hidden px-4 py-3">
                    {/* EMPLOYEE */}
                    {data.feedback_target === 'employee' && <Card label="Reported Employee" value={data.employee_name} />}

                    {/* DEPARTMENT */}
                    {data.department_id && (
                        <Card label="Department" value={dummy_departments.find((d) => d.id === data.department_id!.trim())?.name ?? 'Unknown'} />
                    )}

                    {/* SENDER */}
                    <Card label="Sender" value={getSenderName(data.sender_name)} />

                    {/* RATING (only for department) */}
                    {data.feedback_target === 'department' && data.rating !== undefined && (
                        <div>
                            <span className="text-xs font-semibold text-orange-700 uppercase">Rating</span>
                            <div className="mt-2 flex gap-1">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star key={idx} className={`h-5 w-5 ${idx < (data.rating ?? 0) ? 'text-orange-400' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <a>{data.rating} out of 5 stars</a>
                        </div>
                    )}

                    {/* MESSAGE */}
                    <div>
                        <span className="text-xs font-semibold text-orange-700 uppercase">Message</span>
                        <div className="mt-2 max-h-[35vh] overflow-y-auto rounded-md border border-orange-200 bg-gray-50 p-3 text-gray-800">
                            {data.message || 'No message provided.'}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end border-t border-orange-200 p-4">
                    <button
                        onClick={onClose}
                        className="rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2 font-medium text-white shadow-md transition-all hover:from-orange-600 hover:to-red-600"
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
        <div className="rounded-md border border-orange-200 bg-white p-3 shadow-sm">
            <span className="text-xs font-semibold text-orange-700 uppercase">{label}</span>
            <p className="mt-1 text-gray-800">{value}</p>
        </div>
    );
}

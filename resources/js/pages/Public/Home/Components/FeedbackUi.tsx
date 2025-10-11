import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";
import ComplaintPopupForm from "./FeedbackFormDialog";

export default function ComplaintUi() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <>
            <Card className="p-5 m-1 h-full flex flex-col bg-gradient-to-br from-red-50 via-orange-50 to-orange-100 dark:from-red-900/30 dark:via-orange-900/20 dark:to-gray-900 rounded-xl shadow-sm">
                {/* Header */}
                <div className="flex items-center">
                    <Star className="w-12 h-12 text-orange-500 shrink-0" />
                    <span className="ml-4 font-bold text-lg sm:text-xl md:text-2xl text-red-800 dark:text-orange-100">
                        Feedback Form
                    </span>
                </div>

                {/* Description */}
                <span className="block mt-3 mb-5 text-sm sm:text-base text-orange-800/80 dark:text-orange-200/80 leading-snug">
                    Share your thoughts, suggestions, or issues to help us improve our services and better serve you.
                </span>

                {/* Button wrapper pushed to bottom */}
                <div className="mt-auto flex justify-end">
                    <Button
                        className="p-3 flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-500 text-white border-none"
                        size="sm"
                        onClick={() => setIsPopupOpen(true)}
                    >
                        Create Feedback
                        <ArrowRight size={20} />
                    </Button>
                </div>
            </Card>


            <ComplaintPopupForm
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
            />
        </>
    );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";
import ComplaintPopupForm from "./FeedbackFormDialog";

export default function ComplaintUi() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <>
            <Card className="p-5 m-1 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center">
                    <Star className="w-12 h-12 text-yellow-500 shrink-0" />
                    <span className="ml-4 font-bold text-lg sm:text-xl md:text-2xl">
                        Feedback Form
                    </span>
                </div>

                {/* Description */}
                <span className="block mt-3 mb-5 text-sm sm:text-base text-gray-600">
                    Share your thoughts, suggestions, or issues to help us improve our services and better serve you.
                </span>

                {/* Button wrapper pushed to bottom */}
                <div className="mt-auto flex justify-end">
                    <Button
                        className="p-3 flex items-center justify-center gap-2 w-full sm:w-auto"
                        variant="outline"
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

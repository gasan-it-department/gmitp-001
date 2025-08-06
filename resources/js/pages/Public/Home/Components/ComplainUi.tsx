import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";
import ComplaintPopupForm from "./ComplaintPopupForm";

export default function ComplaintUi() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <div className="px-4 sm:px-6 md:px-10 lg:px-16">
            <Card className="p-5 m-1 max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full">
                <div className="flex items-center">
                    <Star className="w-12 h-12 text-yellow-500" />
                    <a className="ml-4 font-bold text-lg sm:text-xl md:text-2xl">
                        Feedback Form
                    </a>
                </div>

                <span className="block mt-2 mb-4 text-sm sm:text-base">
                    Share your thoughts, suggestions, or issues to help us improve our services and better serve you.
                </span>
                <Button
                    className="p-3 w-full sm:w-fit flex items-center justify-center gap-2"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPopupOpen(true)}
                >
                    Create Feedback
                    <ArrowRight size={20} />
                </Button>
            </Card>

            <ComplaintPopupForm isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </div>

    );
}

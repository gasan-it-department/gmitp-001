import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import { FeedbackFormDialog } from './FeedbackFormDialog';

export default function ComplaintUi() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <Card className="m-1 flex h-full flex-col rounded-xl bg-gradient-to-br from-red-50 via-orange-50 to-orange-100 p-5 shadow-sm dark:from-red-900/30 dark:via-orange-900/20 dark:to-gray-900">
                {/* Header */}
                <div className="flex items-center">
                    <Star className="h-12 w-12 shrink-0 text-orange-500" />
                    <span className="ml-4 text-lg font-bold text-red-800 sm:text-xl md:text-2xl dark:text-orange-100">Feedback Form</span>
                </div>

                {/* Description */}
                <span className="mt-3 mb-5 block text-sm leading-snug text-orange-800/80 sm:text-base dark:text-orange-200/80">
                    Share your thoughts, suggestions, or issues to help us improve our services and better serve you.
                </span>

                {/* Button wrapper pushed to bottom */}
                <div className="mt-auto flex justify-end">
                    <Button
                        className="flex w-full items-center justify-center gap-2 border-none bg-gradient-to-r from-red-500 to-orange-500 p-3 text-white sm:w-auto"
                        size="sm"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        Create Feedback
                        <ArrowRight size={20} />
                    </Button>
                </div>
            </Card>
            <FeedbackFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    );
}

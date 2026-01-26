import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Utility from '@/pages/Utility/Utility';
import { CalendarDays } from 'lucide-react';

interface EventDataList {
    title: string;
    event_date: string;
    description: string;
    id: string;
}

type Props = {
    isOpen: boolean;
    data: EventDataList | null;
    onClose: () => void;
};

export function ViewEventDetails({ isOpen, data, onClose }: Props) {
    if (!data) return null;

    return (
        <Dialog open={isOpen}>
            <DialogContent
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
                className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl border bg-gradient-to-br from-red-50 via-orange-50 to-white p-6 shadow-2xl transition-all duration-300 sm:h-[75vh] sm:max-w-3xl lg:h-[70vh] lg:max-w-4xl dark:bg-neutral-900 dark:from-[#2a0a0a] dark:via-[#3a1200] dark:to-neutral-900"
            >
                {/* Header */}
                <DialogHeader className="flex-shrink-0 space-y-3">
                    <DialogTitle className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-red-400 dark:to-orange-300">
                        {data.title || 'Untitled Event'}
                    </DialogTitle>

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-red-600 dark:text-orange-300">
                            <CalendarDays className="h-4 w-4" />
                            <span>{Utility().calculateArrivingDays(data.event_date)}</span>
                        </div>
                    </div>

                    <div className="mt-3 mb-2 h-[1px] bg-gradient-to-r from-red-400 to-orange-400 dark:from-red-700 dark:to-orange-700" />
                </DialogHeader>

                {/* Scrollable Description */}
                <div
                    className="scrollbar-thin scrollbar-thumb-orange-400 dark:scrollbar-thumb-orange-700 scrollbar-track-transparent w-full flex-1 overflow-x-hidden overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 leading-relaxed break-words whitespace-pre-line text-gray-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200"
                    dangerouslySetInnerHTML={{
                        __html: Utility().linkify(data.description || 'No description provided.'),
                    }}
                />

                {/* Footer */}
                <DialogFooter className="mt-4 flex flex-shrink-0 justify-end">
                    <Button
                        onClick={onClose}
                        className="rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-6 py-2.5 text-base font-medium text-white shadow-md transition-all duration-200 hover:from-red-700 hover:to-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

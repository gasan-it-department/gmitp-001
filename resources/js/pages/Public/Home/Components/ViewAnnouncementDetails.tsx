import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnnouncementData } from '@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes';
import Utility from '@/pages/Utility/Utility';
import { CalendarDays, Megaphone } from 'lucide-react';

type Props = {
    isOpen: boolean;
    data: AnnouncementData | null;
    onClose: () => void;
};

export function ViewAnnouncementDetails({ isOpen, data, onClose }: Props) {
    if (!data) return null;

    const linkifyText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        return text.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${url}</a>`;
        });
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
                className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl border bg-gradient-to-br from-orange-50 via-red-50 to-white p-6 shadow-2xl transition-all duration-300 sm:h-[75vh] sm:max-w-3xl lg:h-[70vh] lg:max-w-4xl dark:bg-neutral-900 dark:from-[#1a0a0a] dark:via-[#2a0f00] dark:to-neutral-900"
            >
                {/* Header */}
                <DialogHeader className="flex-shrink-0 space-y-3">
                    <div className="flex w-full min-w-0 items-start gap-3">
                        <div className="shrink-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-3 shadow-md">
                            <Megaphone className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="line-clamp-3 overflow-hidden bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-left text-xl leading-tight font-bold tracking-tight break-words text-transparent sm:text-2xl dark:from-red-400 dark:to-orange-300">
                                {data.title || 'Untitled Announcement'}
                            </DialogTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CalendarDays className="h-4 w-4 text-orange-500 dark:text-orange-300" />
                        <span>{Utility().formatToReadableDate(data.created_at)}</span>
                        <span className="mx-1 text-gray-400">•</span>
                        <span className="text-gray-500 dark:text-gray-400">{Utility().formatTimeAgo(data.created_at)}</span>
                    </div>
                    <div className="mt-3 mb-2 h-[1px] bg-gradient-to-r from-orange-400 to-red-400 dark:from-orange-700 dark:to-red-700" />
                </DialogHeader>

                {/* Scrollable Textarea */}
                {/* Scrollable Message Container */}
                <div
                    className="scrollbar-thin scrollbar-thumb-orange-400 dark:scrollbar-thumb-orange-700 scrollbar-track-transparent w-full flex-1 overflow-x-hidden overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 leading-relaxed break-words whitespace-pre-line text-gray-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200"
                    dangerouslySetInnerHTML={{
                        __html: linkifyText(data.message || 'No message provided for this announcement.'),
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

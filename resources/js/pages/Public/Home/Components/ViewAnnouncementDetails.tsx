import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Megaphone } from "lucide-react";
import Utility from "@/pages/Utility/Utility";
import { AnnouncementData } from "@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes";

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
                className="
        w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl
        h-[80vh] sm:h-[75vh] lg:h-[70vh] 
        p-6 rounded-2xl border
        shadow-2xl bg-gradient-to-br from-orange-50 via-red-50 to-white
        dark:bg-neutral-900 dark:from-[#1a0a0a] dark:via-[#2a0f00] dark:to-neutral-900
        transition-all duration-300
        flex flex-col
    "
            >
                {/* Header */}
                <DialogHeader className="space-y-3 flex-shrink-0">
                    <div className="flex items-start gap-3 w-full min-w-0">
                        <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-md shrink-0">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="
                    text-left text-xl sm:text-2xl font-bold
                    bg-gradient-to-r from-red-600 to-orange-500
                    dark:from-red-400 dark:to-orange-300
                    bg-clip-text text-transparent tracking-tight
                    line-clamp-3 overflow-hidden break-words leading-tight
                ">
                                {data.title || "Untitled Announcement"}
                            </DialogTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CalendarDays className="w-4 h-4 text-orange-500 dark:text-orange-300" />
                        <span>{Utility().formatToReadableDate(data.created_at)}</span>
                        <span className="text-gray-400 mx-1">•</span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {Utility().formatTimeAgo(data.created_at)}
                        </span>
                    </div>
                    <div className="h-[1px] bg-gradient-to-r from-orange-400 to-red-400 dark:from-orange-700 dark:to-red-700 mt-3 mb-2" />
                </DialogHeader>

                {/* Scrollable Textarea */}
                {/* Scrollable Message Container */}
                <div
                    className="
        flex-1 w-full
        p-4 border border-gray-200 dark:border-neutral-700
        rounded-lg bg-gray-50 dark:bg-neutral-800
        text-gray-800 dark:text-gray-200
        leading-relaxed whitespace-pre-line break-words
        overflow-y-auto overflow-x-hidden
        scrollbar-thin scrollbar-thumb-orange-400 dark:scrollbar-thumb-orange-700
        scrollbar-track-transparent
    "
                    dangerouslySetInnerHTML={{
                        __html: linkifyText(data.message || "No message provided for this announcement."),
                    }}
                />

                {/* Footer */}
                <DialogFooter className="mt-4 flex-shrink-0 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="
                px-6 py-2.5 text-base font-medium
                rounded-lg transition-all duration-200
                bg-gradient-to-r from-red-600 to-orange-500
                hover:from-red-700 hover:to-orange-600
                text-white shadow-md
                focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900
            "
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    );
}
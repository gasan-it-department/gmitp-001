import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import Utility from "@/pages/Utility/Utility";

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
                className="
                    w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl
                    h-[80vh] sm:h-[75vh] lg:h-[70vh]
                    p-6 rounded-2xl border
                    shadow-2xl bg-gradient-to-br from-red-50 via-orange-50 to-white
                    dark:bg-neutral-900 dark:from-[#2a0a0a] dark:via-[#3a1200] dark:to-neutral-900
                    transition-all duration-300
                    flex flex-col
                "
            >
                {/* Header */}
                <DialogHeader className="space-y-3 flex-shrink-0">
                    <DialogTitle className="
                        text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500
                        dark:from-red-400 dark:to-orange-300
                        bg-clip-text text-transparent tracking-tight
                    ">
                        {data.title || "Untitled Event"}
                    </DialogTitle>

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-red-600 dark:text-orange-300">
                            <CalendarDays className="w-4 h-4" />
                            <span>{Utility().calculateArrivingDays(data.event_date)}</span>
                        </div>
                    </div>

                    <div className="h-[1px] bg-gradient-to-r from-red-400 to-orange-400 dark:from-red-700 dark:to-orange-700 mt-3 mb-2" />
                </DialogHeader>

                {/* Scrollable Description */}
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
                        __html: Utility().linkify(data.description || "No description provided."),
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

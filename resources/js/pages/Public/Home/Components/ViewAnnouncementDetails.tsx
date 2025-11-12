import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarDays, Megaphone } from "lucide-react";
import Utility from "@/pages/Utility/Utility";
import { AnnouncementFormData } from "@/Core/Types/AdminAnnouncementPage/AdminAnnouncementPageTypes";

type Props = {
    isOpen: boolean;
    data: AnnouncementFormData | null;
    onClose: () => void;
};

export function ViewAnnouncementDetails({ isOpen, data, onClose }: Props) {
    if (!data) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent
                className="
          max-w-2xl w-[90vw]
          p-6 rounded-2xl border
          shadow-2xl 
          bg-gradient-to-br from-orange-50 via-red-50 to-white
          dark:from-[#1a0a0a] dark:via-[#2a0f00] dark:to-neutral-900
          transition-all duration-300
        "
            >
                {/* Header Section */}
                <AlertDialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>

                        <AlertDialogTitle
                            className="
                text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 
                dark:from-red-400 dark:to-orange-300
                bg-clip-text text-transparent tracking-tight
              "
                        >
                            {data.title || "Untitled Announcement"}
                        </AlertDialogTitle>
                    </div>

                    {/* Date Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CalendarDays className="w-4 h-4 text-orange-500 dark:text-orange-300" />
                        <span>{Utility().formatToReadableDate(data.created_at)}</span>
                        <span className="text-gray-400 mx-1">•</span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {Utility().formatTimeAgo(data.created_at)}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-gradient-to-r from-orange-400 to-red-400 dark:from-orange-700 dark:to-red-700 mt-3 mb-2" />
                </AlertDialogHeader>

                {/* Message Section */}
                <AlertDialogDescription
                    className="
            mt-2 text-gray-800 dark:text-gray-200
            leading-relaxed whitespace-pre-line 
            max-h-[60vh] overflow-y-auto pr-3
            scrollbar-thin 
            scrollbar-thumb-orange-400 dark:scrollbar-thumb-orange-700
            scrollbar-track-transparent
          "
                >
                    {data.message || "No message provided for this announcement."}
                </AlertDialogDescription>

                {/* Footer */}
                <AlertDialogFooter className="mt-6 flex justify-end">
                    <AlertDialogAction
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
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

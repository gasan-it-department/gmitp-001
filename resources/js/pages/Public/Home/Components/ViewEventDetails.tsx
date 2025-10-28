import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Utility from "@/pages/Utility/Utility";
import { CalendarDays, MapPin } from "lucide-react"; // optional icon

interface EventDataList {
    eventName: string;
    date: string;
    eventDescription: string;
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
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent
                className="
          max-w-3xl w-[90vw]
          p-6 rounded-2xl border
          shadow-2xl 
          bg-gradient-to-br from-red-50 via-orange-50 to-white
          dark:from-[#2a0a0a] dark:via-[#3a1200] dark:to-neutral-900
          transition-all duration-300
        "
            >
                {/* Header Section */}
                <AlertDialogHeader className="space-y-3">
                    <AlertDialogTitle
                        className="
              text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 
              dark:from-red-400 dark:to-orange-300
              bg-clip-text text-transparent tracking-tight
            "
                    >
                        {data.eventName || "Untitled Event"}
                    </AlertDialogTitle>

                    {/* Event Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-red-600 dark:text-orange-300">
                            <CalendarDays className="w-4 h-4" />
                            <span>{Utility().calculateArrivingDays(data.date)}</span>
                        </div>

                        {/* {data.location && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span>{data.location}</span>
                            </div>
                        )} */}
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-gradient-to-r from-red-400 to-orange-400 dark:from-red-700 dark:to-orange-700 mt-3 mb-2" />
                </AlertDialogHeader>

                {/* Description Section */}
                <AlertDialogDescription
                    className="
            mt-2 
            text-gray-800 dark:text-gray-200
            leading-relaxed whitespace-pre-line 
            max-h-[60vh] overflow-y-auto pr-3
            scrollbar-thin 
            scrollbar-thumb-orange-400 dark:scrollbar-thumb-orange-700
            scrollbar-track-transparent
          "
                >
                    {data.eventDescription || "No description provided."}
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

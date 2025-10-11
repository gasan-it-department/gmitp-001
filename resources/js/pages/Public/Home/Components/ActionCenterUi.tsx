import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { router } from "@inertiajs/react";
import { ArrowRight, LifeBuoy } from "lucide-react";

export default function ActionCenterUi() {
    return (
        <Card className="p-5 m-1 h-full flex flex-col bg-gradient-to-br from-red-50 via-orange-50 to-orange-100 dark:from-red-900/30 dark:via-orange-900/20 dark:to-gray-900 rounded-xl shadow-sm">
            {/* Header */}
            <div className="flex items-center">
                <LifeBuoy className="w-12 h-12 text-orange-500 shrink-0" />
                <span className="ml-4 font-bold text-lg sm:text-xl md:text-2xl text-red-800 dark:text-orange-100">
                    Action Center
                </span>
            </div>

            {/* Description */}
            <span className="block mt-3 mb-5 text-sm sm:text-base text-orange-800/80 dark:text-orange-200/80 leading-snug">
                One-stop help desk that provides quick access to services like medical,
                financial, food, and transportation assistance for residents.
            </span>

            {/* Button anchored at bottom-right */}
            <div className="mt-auto flex justify-end">
                <Button
                    className="p-3 flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-500 text-white border-none"
                    size="sm"
                    onClick={() => router.visit(route("action.center.show"))}
                >
                    View Services
                    <ArrowRight size={20} />
                </Button>
            </div>
        </Card>


    );
}

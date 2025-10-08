import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { router } from "@inertiajs/react";
import { ArrowRight, LifeBuoy } from "lucide-react";

export default function ActionCenterUi() {
    return (
        <Card className="p-5 m-1 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center">
                <LifeBuoy className="w-12 h-12 text-blue-600 shrink-0" />
                <span className="ml-4 font-bold text-lg sm:text-xl md:text-2xl">
                    Action Center
                </span>
            </div>

            {/* Description */}
            <span className="block mt-3 mb-5 text-sm sm:text-base text-gray-600">
                One-stop help desk that provides quick access to services like medical,
                financial, food, and transportation assistance for residents.
            </span>

            {/* Button anchored at bottom-right */}
            <div className="mt-auto flex justify-end">
                <Button
                    className="p-3 w-full sm:w-auto flex items-center justify-center gap-2"
                    variant="outline"
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

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { router } from "@inertiajs/react";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function ActionCenterUi() {
    return (
        <Card
            className="
    m-3 flex flex-col h-full rounded-2xl
    bg-gradient-to-br from-orange-50 via-amber-50 to-red-100 
    p-6 sm:p-7
    border border-orange-200/60 dark:border-red-900/40
    shadow-md hover:shadow-lg transition-all duration-300
    dark:from-red-900/30 dark:via-orange-900/20 dark:to-gray-900
  "
        >
            <CardContent className="flex flex-col justify-between h-full p-0">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center justify-center p-3
        rounded-2xl bg-gradient-to-br from-orange-500 to-red-500
        text-white shadow-lg
      "
                    >
                        <LayoutDashboard className="h-8 w-8" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-100">
                            Action Center
                        </h2>
                        <p className="text-sm text-orange-800/80 dark:text-orange-200/80 italic"> Get the support you need — access assistance programs for food, financial aid, burial services, and more. </p>
                    </div>
                </div>

                {/* Footer Button */}
                <div className="mt-auto flex justify-end pt-6">
                    <Button
                        className="
          flex w-full sm:w-auto items-center justify-center gap-2
          rounded-lg border-none
          bg-gradient-to-r from-orange-500 to-red-500
          text-white font-medium 
          px-6 py-3 sm:px-8 sm:py-3
          transition-all duration-300
          hover:from-orange-600 hover:to-red-600 hover:shadow-md
          active:scale-[0.98]
        "
                        onClick={() => router.visit(route('action.center.show'))}
                    >
                        Open Action Center
                        <ArrowRight size={18} className="sm:size-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>


    );
}

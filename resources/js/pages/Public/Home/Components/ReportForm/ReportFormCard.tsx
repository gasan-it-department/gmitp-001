import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { ReportFormDialog } from "./ReportFormDialog";
import { useState } from "react";

export default function ReportIssueCard() {
    const [isReportDialogShown, setIsReportDialogShown] = useState(false);
    return (
        <Card
            className="
    m-3 flex flex-col h-full
    rounded-2xl 
    bg-gradient-to-br from-red-50 via-orange-50 to-orange-100 
    p-6 sm:p-7
    border border-red-200/60 dark:border-red-900/40
    shadow-md hover:shadow-lg transition-all duration-300
    dark:from-red-900/30 dark:via-orange-900/20 dark:to-gray-900
  "
        >
            <CardContent className="flex flex-col justify-between h-full p-0">
                {/* Header + Description */}
                <div className="flex items-center gap-4">
                    <div
                        className="p-3 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg"
                    >
                        <AlertTriangle className="h-8 w-8" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-red-800 dark:text-orange-100">
                            Report Community Issue
                        </h2>
                        <p className="text-sm text-orange-800/80 dark:text-orange-200/80 italic"> Help keep our community safe and clean — report damaged roads, broken street lights, garbage, and other local issues. </p>
                    </div>
                </div>

                {/* Footer Button (stays bottom right) */}
                <div className="mt-auto flex justify-end pt-6">
                    <Button
                        className="
                          flex w-full sm:w-auto items-center justify-center gap-2
                          rounded-lg border-none
                          bg-gradient-to-r from-red-500 to-orange-500 
                          text-white font-medium 
                          px-6 py-3 sm:px-8 sm:py-3
                          transition-all duration-300
                          hover:from-red-600 hover:to-orange-600 hover:shadow-md
                          active:scale-[0.98]
                        "
                        onClick={() => setIsReportDialogShown(true)}
                    >
                        Submit Report
                        <ArrowRight size={18} className="sm:size-5" />
                    </Button>
                </div>
                {/* <div className="flex justify-end mt-auto pt-6">
                    <Button
                        className="
          flex items-center justify-center gap-2
          rounded-lg border-none
          bg-gradient-to-r from-red-500 to-orange-500
          text-white font-medium
          px-6 py-3 sm:px-8 sm:py-3
          transition-all duration-300
          hover:from-red-600 hover:to-orange-600 hover:shadow-md
          active:scale-[0.98]
          self-end
        "
                        onClick={() => setIsReportDialogShown(true)}
                    >
                        Report Issue
                        <ArrowRight size={18} className="sm:size-5" />
                    </Button>
                </div> */}

                <ReportFormDialog open={isReportDialogShown} onOpenChange={setIsReportDialogShown} />
            </CardContent>
        </Card>

    );
}

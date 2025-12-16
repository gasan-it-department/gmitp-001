import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface CommunityReportStatusDialogProps {
    isOpen: boolean;
    onClose: () => void;
    status: string;
    onUpdateButtonClicked: (remarks: string) => void;
}

export default function CommunityReportStatusDialog({
    isOpen,
    onClose,
    onUpdateButtonClicked,
    status,
}: CommunityReportStatusDialogProps) {
    const [remarks, setRemarks] = useState("");

    // ✅ Clear textarea every time dialog opens
    useEffect(() => {
        if (isOpen) {
            setRemarks("");
        }
    }, [isOpen]);

    const suggestedRemarks =
        status === "failed"
            ? [
                "Description is not clear.",
                "Issue is not within the jurisdiction of the Municipality.",
                "Insufficient information provided to proceed.",
            ]
            : [
                "Issue has been successfully resolved.",
                "Concern addressed by the responsible department.",
                "Action completed and verified.",
            ];

    const handleUpdate = () => {
        onUpdateButtonClicked(remarks);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
                className="
                    max-w-lg w-[90vw] p-6 rounded-2xl border
                    shadow-2xl bg-white dark:bg-neutral-900
                "
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                        {status === "failed" ? "Mark as Failed" : "Mark as Resolved"}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <Textarea
                        placeholder="Enter remarks here..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="min-h-[120px]"
                    />

                    {/* Suggested Remarks */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Suggested remarks
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {suggestedRemarks.map((text, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setRemarks(text)}
                                    className="
                                        rounded-full border px-3 py-1.5 text-xs font-medium
                                        bg-gray-50 text-gray-700
                                        hover:bg-gray-100 hover:border-gray-300
                                        transition
                                    "
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="gap-2 pl-0 text-red-600 hover:bg-transparent hover:text-orange-600"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleUpdate}
                            disabled={!remarks.trim()}
                            className="
                                bg-emerald-600 text-white
                                hover:bg-emerald-700
                                disabled:bg-gray-300 disabled:text-gray-500
                            "
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

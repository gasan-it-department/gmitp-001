import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type ClassicDialogProps = {
  title: string;
  message: string;
  hideNegativeButton?: boolean;
  open: boolean;
  positiveButtonText?: string;
  negativeButtonText?: string;
  onPositiveClick?: () => void;
  onNegativeClick?: () => void;
};

export default function ClassicDialog({
  title,
  message,
  hideNegativeButton = false,
  open,
  positiveButtonText = "OK",
  negativeButtonText = "Cancel",
  onPositiveClick,
  onNegativeClick,
}: ClassicDialogProps) {
  // Disable body scroll when dialog is open
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()} // prevent closing outside click
        className="
          max-w-lg w-[90vw] p-6 rounded-2xl border
          shadow-2xl bg-white dark:bg-neutral-900
          transition-all duration-300
        "
      >
        {/* ✅ Hidden accessible title for screen readers */}
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>

        {/* Visible header */}
        <DialogHeader>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h2>
          <DialogDescription
            className="
              mt-4 max-h-[65vh] overflow-y-auto 
              text-gray-700 dark:text-gray-300 
              leading-relaxed whitespace-pre-line pr-2
            "
          >
            {message}
          </DialogDescription>
        </DialogHeader>

        {/* Footer buttons */}
        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          {!hideNegativeButton && (
            <Button
              variant="outline"
              onClick={onNegativeClick}
              className="
                px-6 py-2.5 text-base font-medium rounded-lg
                bg-gray-100 hover:bg-gray-200
                dark:bg-gray-800 dark:hover:bg-gray-700
                transition-colors duration-200
              "
            >
              {negativeButtonText}
            </Button>
          )}

          <Button
            onClick={onPositiveClick}
            className="
              px-6 py-2.5 text-base font-medium
              rounded-lg transition-all duration-200
              bg-gradient-to-r from-red-600 to-orange-500 
              hover:from-red-700 hover:to-orange-600
              text-white shadow-md
              focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 
              dark:focus:ring-offset-neutral-900
            "
          >
            {positiveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

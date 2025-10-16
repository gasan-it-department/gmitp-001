import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type ClassicDialogProps = {
  title: string;
  message: string;
  hideNegativeButton: boolean
  open: boolean;
  positiveButtonText?: string;
  negativeButtonText?: string;
  onPositiveClick?: () => void;
  onNegativeClick?: () => void;
};

export default function ClassicDialog({ title, message, hideNegativeButton, open, positiveButtonText, negativeButtonText, onPositiveClick, onNegativeClick }: ClassicDialogProps) {
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  if (!open) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="
      max-w-lg w-[90vw] p-6 rounded-2xl border
      shadow-2xl bg-white dark:bg-neutral-900
      transition-all duration-300
    "
      >
        {/* Header */}
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription
            className="
          mt-4 max-h-[65vh] overflow-y-auto 
          text-gray-700 dark:text-gray-300 
          leading-relaxed whitespace-pre-line pr-2
        "
          >
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Footer */}
        <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          {!hideNegativeButton && (
            <AlertDialogCancel
              onClick={onNegativeClick}
              className="
            px-6 py-2.5 text-base font-medium rounded-lg
            bg-gray-100 hover:bg-gray-200
            dark:bg-gray-800 dark:hover:bg-gray-700
            transition-colors duration-200
          "
            >
              {negativeButtonText}
            </AlertDialogCancel>
          )}

          <AlertDialogAction
            onClick={onPositiveClick}
            className="
              px-6 py-2.5 text-base font-medium
              rounded-lg transition-all duration-200
              bg-gradient-to-r from-red-600 to-orange-500 
              hover:from-red-700 hover:to-orange-600
              text-white shadow-md
              focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900
            "
          >
            {positiveButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>


  );
}
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LoadingDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export default function LoadingDialog({
  isOpen,
  title = "Please wait",
  description = "",
}: LoadingDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="
          w-[90vw] sm:w-[80vw] md:w-[400px] 
          max-w-md rounded-2xl p-6
          border shadow-lg 
          bg-white dark:bg-neutral-900
          flex flex-col items-center text-center gap-5
          transition-all duration-300 ease-in-out
        "
      >
        {/* Spinner */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
          <svg
            className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>

        {/* Title & Description */}
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LoadingSpinner from "./LoadingSpinner";

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

        <LoadingSpinner />

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

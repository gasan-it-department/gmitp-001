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
        onInteractOutside={(e) => e.preventDefault()}
        // Theme Update: 'bg-background', 'border-border'
        className="
          max-w-lg w-[90vw] p-6 rounded-2xl border border-border
          shadow-2xl bg-background
          transition-all duration-300
        "
      >
        {/* ✅ Hidden accessible title for screen readers */}
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>

        {/* Visible header */}
        <DialogHeader>
          {/* Theme Update: 'text-foreground' */}
          <h2 className="text-2xl font-semibold text-foreground">
            {title}
          </h2>
          <DialogDescription
            // Theme Update: 'text-muted-foreground'
            className="
              mt-4 max-h-[65vh] overflow-y-auto 
              text-muted-foreground
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
              // Theme Update: Uses muted text that darkens on hover
              className="
                px-6 py-2.5 text-base font-medium rounded-lg
                border-border text-muted-foreground hover:bg-secondary hover:text-foreground
                transition-colors duration-200
              "
            >
              {negativeButtonText}
            </Button>
          )}

          <Button
            onClick={onPositiveClick}
            // Theme Update: 'bg-primary', 'text-primary-foreground'
            className="
              px-6 py-2.5 text-base font-medium
              rounded-lg transition-all duration-200
              bg-primary text-primary-foreground 
              hover:bg-primary/90 shadow-md
              focus:ring-2 focus:ring-ring focus:ring-offset-2
            "
          >
            {positiveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
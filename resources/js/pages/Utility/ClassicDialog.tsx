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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!hideNegativeButton && <AlertDialogCancel onClick={onNegativeClick}>{negativeButtonText}</AlertDialogCancel>}
          <AlertDialogAction onClick={onPositiveClick}>{positiveButtonText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
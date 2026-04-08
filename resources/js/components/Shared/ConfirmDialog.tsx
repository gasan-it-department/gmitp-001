import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing?: boolean;
    variant?: 'default' | 'destructive';
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isProcessing = false,
    variant = 'default',
}: Props) {
    // Dynamically set colors based on the variant
    const isDestructive = variant === 'destructive';

    const iconColors = isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';

    const actionButtonColors = isDestructive
        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600'
        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600';

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => {
                // Only allow closing if we aren't currently processing a request
                if (!open && !isProcessing) {
                    onCancel();
                }
            }}
        >
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-start gap-4">
                        <div className={`flex shrink-0 items-center justify-center rounded-full p-3 ${iconColors}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <AlertDialogTitle className="text-lg font-bold text-slate-900">{title}</AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 text-sm text-slate-500">{message}</AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel
                        disabled={isProcessing}
                        onClick={onCancel}
                        className="mt-0" // Prevents weird margin issues on mobile
                    >
                        {cancelText}
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={isProcessing}
                        onClick={(e) => {
                            // Prevent the dialog from auto-closing instantly.
                            // This allows your parent component to keep it open while `isProcessing` is true.
                            e.preventDefault();
                            onConfirm();
                        }}
                        className={actionButtonColors}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

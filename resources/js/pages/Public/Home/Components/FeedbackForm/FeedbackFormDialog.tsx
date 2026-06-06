import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { useState } from 'react';
import { DepartmentOption, FeedbackFormContent } from '../../../../Feedback/Client/Create/Components/FeedbackFormContent';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusChange?: (status: 'success' | 'failed', message: string) => void;
    departments?: DepartmentOption[];
    feedbackTypes?: { value: string; label: string }[];
}

export function FeedbackFormDialog({ open, onOpenChange, onStatusChange, departments = [], feedbackTypes = [] }: FeedbackDialogProps) {
    const [classicDialogOpen, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        hideNegativeButton: false,
    });

    const handleSuccess = (message: string) => {
        onOpenChange(false);
        setClassicDialog({
            isOpen: true,
            title: 'Feedback Submitted',
            message: message || 'Thank you for your feedback! We appreciate you taking the time to help us improve.',
            positiveButtonText: 'Close',
            negativeButtonText: '',
            hideNegativeButton: true,
        });
        onStatusChange?.('success', message);
    };

    const handleError = (message: string) => {
        setClassicDialog({
            isOpen: true,
            title: 'Something went wrong!',
            message: message,
            positiveButtonText: 'Close',
            negativeButtonText: '',
            hideNegativeButton: true,
        });
        onStatusChange?.('failed', message);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    showCloseButton={false}
                    className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 bg-background p-0 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-xl sm:rounded-2xl sm:border sm:border-border lg:max-w-2xl"
                >
                    <div className="sticky top-0 z-50 border-b border-border bg-background px-6 py-5 sm:px-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-foreground">Citizen Feedback Form</DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="space-y-6 overflow-auto px-6 py-6 sm:px-8 sm:py-8">
                        <FeedbackFormContent
                            departments={departments}
                            feedbackTypes={feedbackTypes}
                            onCancel={() => onOpenChange(false)}
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <ClassicDialog
                title={classicDialogOpen.title}
                message={classicDialogOpen.message}
                open={classicDialogOpen.isOpen}
                positiveButtonText={classicDialogOpen.positiveButtonText}
                negativeButtonText={classicDialogOpen.negativeButtonText}
                hideNegativeButton={classicDialogOpen.hideNegativeButton}
                onPositiveClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));
                }}
                onNegativeClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));
                }}
            />
        </>
    );
}

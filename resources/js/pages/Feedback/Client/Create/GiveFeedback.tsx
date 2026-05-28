import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { DepartmentOption, FeedbackFormContent } from '../../../Public/Home/Components/FeedbackForm/FeedbackFormContent';

interface GiveFeedbackProps {
    departments: DepartmentOption[];
}

export default function GiveFeedback({ departments }: GiveFeedbackProps) {
    const [classicDialogOpen, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        hideNegativeButton: false,
    });

    const handleSuccess = (message: string) => {
        setClassicDialog({
            isOpen: true,
            title: 'Feedback Submitted',
            message: message || 'Thank you for your feedback! We appreciate you taking the time to help us improve.',
            positiveButtonText: 'Close',
            negativeButtonText: '',
            hideNegativeButton: true,
        });
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
    };

    return (
        <PublicLayout description="" title="">
            <Head title="Give Feedback" />

            <div className="container mx-auto max-w-2xl py-8">
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Share Your Feedback</CardTitle>
                        <p className="text-sm text-muted-foreground">Your input helps us improve our services. Please fill out the form below.</p>
                    </CardHeader>
                    <CardContent>
                        <FeedbackFormContent departments={departments} onSuccess={handleSuccess} onError={handleError} />
                    </CardContent>
                </Card>
            </div>

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
        </PublicLayout>
    );
}

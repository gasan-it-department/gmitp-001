import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LogInSignUpDialog from '@/pages/Auth/LogInSignUpDialog';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FeedbackFormDialog } from './FeedbackFormDialog';

export default function FeedbackUi() {
    const { auth } = usePage<SharedData>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLogInSignUpDialogVisible, setLogInSignUpDialogVisible] = useState(false);
    const [classicDialogOpen, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        hideNegativeButton: false,
        action: '',
    });

    useEffect(() => {
        if (auth.user !== null) {
            setLogInSignUpDialogVisible(false);
        }
    }, [auth.user]);

    return (
        <Card className="m-3 flex h-full flex-col rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 via-orange-50 to-orange-100 p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:p-7 dark:border-red-900/40 dark:from-red-900/30 dark:via-orange-900/20 dark:to-gray-900">
            <CardContent className="flex h-full flex-col justify-between p-0">
                {/* Header + Description */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-3 text-white shadow-lg">
                        <MessageSquare className="h-8 w-8" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-red-800 dark:text-orange-100">We’d Love Your Feedback</h2>
                        <p className="text-sm text-orange-800/80 italic dark:text-orange-200/80">
                            Tell us what you think — your feedback helps us improve your experience.
                        </p>
                    </div>
                </div>

                {/* Footer Button (stays bottom-right) */}
                <div className="mt-auto flex justify-end pt-6">
                    <Button
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-none bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-medium text-white transition-all duration-300 hover:from-red-600 hover:to-orange-600 hover:shadow-md active:scale-[0.98] sm:w-auto sm:px-8 sm:py-3"
                        onClick={() => {
                            if (auth.user === null) {
                                setLogInSignUpDialogVisible(true);
                                return;
                            }

                            setIsDialogOpen(true);
                        }}
                    >
                        Submit Feedback
                        <ArrowRight size={18} className="sm:size-5" />
                    </Button>
                </div>

                {/* Feedback Form Modal */}
                <FeedbackFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onStatusChange={(status, message) => {
                        if (status === 'success') {
                            setClassicDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                title: 'Feedback Submitted',
                                message: message || 'Thank you for your feedback! We appreciate you taking the time to help us improve.',
                                positiveButtonText: 'Close',
                                negativeButtonText: '',
                                hideNegativeButton: true,
                            }));
                        } else {
                            setClassicDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                title: 'Something went wrong!',
                                message: message || 'Thank you for your feedback! We appreciate you taking the time to help us improve.',
                                positiveButtonText: 'Close',
                                negativeButtonText: '',
                                hideNegativeButton: true,
                            }));
                        }
                    }}
                />

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
                            action: '',
                        }));
                    }}
                    onNegativeClick={() => {
                        setClassicDialog((prev) => ({
                            ...prev,
                            isOpen: false,
                            action: '',
                        }));
                    }}
                />

                <LogInSignUpDialog isOpen={isLogInSignUpDialogVisible} onClose={() => setLogInSignUpDialogVisible(false)} />
            </CardContent>
        </Card>
    );
}
// <FeedbackFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

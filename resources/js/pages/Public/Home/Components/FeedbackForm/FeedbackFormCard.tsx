import { Card, CardContent } from '@/components/ui/card';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import LogInSignUpDialog from '@/pages/Auth/LogInSignUpDialog';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import feedback from '@/routes/feedback';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FeedbackFormDialog } from './FeedbackFormDialog';

export default function FeedbackUi() {
    const { currentMunicipality } = useMunicipality();
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

    const feedbackPage = () => {
        feedback.create.url(currentMunicipality.slug);
    };

    return (
        <Card className="m-3 flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-7">
            <CardContent className="flex h-full flex-col justify-between p-0">
                {/* Header + Description */}
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-lg bg-slate-100 p-3 text-slate-700">
                        <MessageSquare className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">We’d Love Your Feedback</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            Tell us what you think — your feedback helps us improve your experience.
                        </p>
                    </div>
                </div>

                {/* Footer Button (stays bottom-right) */}
                <div className="mt-6 flex justify-end">
                    <Link
                        href={feedback.create.url(currentMunicipality.slug)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
                        onClick={(e) => {
                            // If the user isn't logged in, intercept the click, stop the navigation, and show the modal
                            if (auth.user === null) {
                                e.preventDefault();
                                setLogInSignUpDialogVisible(true);
                            }
                        }}
                    >
                        Submit Feedback
                        <ArrowRight size={16} />
                    </Link>
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

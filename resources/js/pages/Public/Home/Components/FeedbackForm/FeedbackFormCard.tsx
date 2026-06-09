import { Card, CardContent } from '@/components/ui/card';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import LogInSignUpDialog from '@/pages/Auth/LogInSignUpDialog';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import feedback from '@/routes/feedback';
import login from '@/routes/login';
import { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
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
        <Card className="group flex h-full flex-col rounded-xl border border-teal-200/80 bg-white p-6 shadow-sm shadow-teal-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md hover:shadow-teal-900/10 sm:p-7">
            <CardContent className="flex h-full flex-col justify-between p-0">
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-lg bg-teal-50 p-3 text-teal-700 ring-1 ring-teal-100 transition-colors group-hover:bg-teal-100">
                        <MessageSquare className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-950">We'd Love Your Feedback</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            Tell us what you think - your feedback helps us improve your experience.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Link
                        href={feedback.create.url(currentMunicipality.slug)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
                        onClick={(e) => {
                            if (auth.user === null) {
                                e.preventDefault();
                                router.visit(login.page.url({ municipality: currentMunicipality.slug }));
                            }
                        }}
                    >
                        Submit Feedback
                        <ArrowRight size={16} />
                    </Link>
                </div>

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

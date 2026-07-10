import { Card, CardContent } from '@/components/ui/card';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import feedback from '@/routes/feedback';
import { Link } from '@inertiajs/react';
import { ArrowRight, MessageSquare, Star } from 'lucide-react';
import { useState } from 'react';
import { FeedbackFormDialog } from './FeedbackFormDialog';

export default function FeedbackUi() {
    const { currentMunicipality } = useMunicipality();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [classicDialogOpen, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        hideNegativeButton: false,
        action: '',
    });

    const ratingsUrl = `/${currentMunicipality.slug}/feedback/client/department-ratings`;

    return (
        <Card className="group flex h-full flex-col rounded-xl border border-primary/20 bg-white p-6 shadow-sm shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10 sm:p-7">
            <CardContent className="flex h-full flex-col justify-between p-0">
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-lg bg-primary/5 p-3 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/10">
                        <MessageSquare className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="font-heading text-xl font-bold text-slate-950">Nais Naming Malaman ang Iyong Feedback</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            Sabihin sa amin ang iyong naiisip - ang iyong feedback ay makakatulong upang mapabuti ang aming serbisyo.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Link
                        href={ratingsUrl}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                    >
                        <Star size={16} />
                        Tingnan ang Ratings
                    </Link>
                    <Link
                        href={feedback.create.url(currentMunicipality.slug)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
                    >
                        Magpadala ng Feedback
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
            </CardContent>
        </Card>
    );
}

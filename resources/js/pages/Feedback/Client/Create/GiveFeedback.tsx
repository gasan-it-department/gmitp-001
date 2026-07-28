import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, HeartHandshake, MessageCircleHeart, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { DepartmentOption, FeedbackFormContent } from './Components/FeedbackFormContent';

interface GiveFeedbackProps {
    departments: DepartmentOption[];
    feedbackTypes: { value: string; label: string }[];
    is_eligible: boolean;
}

export default function GiveFeedback({ departments, feedbackTypes, is_eligible }: GiveFeedbackProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

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
            title: 'Salamat sa iyong Feedback!',
            message: message || 'Lubos kaming nagpapasalamat sa iyong oras upang matulungan kaming mapabuti ang aming serbisyo.',
            positiveButtonText: 'Isara',
            negativeButtonText: '',
            hideNegativeButton: true,
        });
    };

    const handleError = (message: string) => {
        setClassicDialog({
            isOpen: true,
            title: 'May mali sa pagpapadala!',
            message,
            positiveButtonText: 'Isara',
            negativeButtonText: '',
            hideNegativeButton: true,
        });
    };

    return (
        <PublicLayout description="" title="Feedback">
            <Head title="I-abot ang iyong Feedback" />

            <div className="min-h-[calc(100vh-5rem)] bg-muted/20">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                    <Link
                        href={`/${slug}/home`}
                        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Bumalik sa Home
                    </Link>

                    <div className="grid overflow-hidden rounded-lg border border-border/70 bg-background shadow-xl shadow-primary/5 lg:grid-cols-[0.72fr_1.35fr]">
                        <aside className="flex flex-col bg-primary p-7 text-primary-foreground sm:p-9 lg:min-h-[760px] lg:p-10">
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10">
                                <MessageCircleHeart className="h-7 w-7" />
                            </div>

                            <div className="mt-8">
                                <p className="text-xs font-bold tracking-widest text-primary-foreground/70 uppercase">Boses ng Mamamayan</p>
                                <h1 className="mt-3 text-3xl leading-tight font-black sm:text-4xl">Mahalaga ang iyong karanasan.</h1>
                                <p className="mt-4 max-w-md text-sm leading-7 text-primary-foreground/80 sm:text-base">
                                    Ibahagi ang iyong papuri, suhestiyon, o concern upang mas mapabuti pa ang serbisyo ng ating munisipyo.
                                </p>
                            </div>

                            <div className="mt-9 space-y-4 border-t border-primary-foreground/15 pt-7">
                                <div className="flex gap-3">
                                    <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground/80" />
                                    <div>
                                        <p className="text-sm font-bold">Tapat na pakikinig</p>
                                        <p className="mt-1 text-xs leading-5 text-primary-foreground/65">
                                            Ang bawat feedback ay tumutulong sa mas maayos na serbisyo.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground/80" />
                                    <div>
                                        <p className="text-sm font-bold">May opsyon kang maging anonymous</p>
                                        <p className="mt-1 text-xs leading-5 text-primary-foreground/65">
                                            Ang personal na detalye ay maaari mong iwanang blangko.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <blockquote className="mt-auto hidden border-l-2 border-primary-foreground/30 pl-4 text-sm leading-6 text-primary-foreground/70 lg:block">
                                “Sa sama-samang malasakit, mas napapabuti natin ang ating bayan.”
                            </blockquote>
                        </aside>

                        <main className="p-5 sm:p-8 lg:p-10">
                            <div className="mb-7 border-b border-border pb-5">
                                <p className="text-xs font-bold tracking-widest text-primary uppercase">Feedback Form</p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">I-abot ang iyong Feedback</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Sabihin sa amin kung ano ang naging karanasan mo. Ang mga field na may asterisk (*) lamang ang kinakailangan.
                                </p>
                            </div>

                            {!is_eligible ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                        <AlertCircle className="h-7 w-7" />
                                    </div>
                                    <div className="mt-4 max-w-lg space-y-2">
                                        <h3 className="text-lg font-bold text-amber-950">Naabot mo na ang limitasyon</h3>
                                        <p className="text-sm leading-6 text-amber-800">
                                            Paumanhin, ang bawat mamamayan ay pinapayagan lamang ng hanggang <b>3 feedback kada araw</b>. Maaari kang
                                            muling mag-abot ng feedback bukas. Maraming salamat sa iyong malasakit!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <FeedbackFormContent
                                    departments={departments}
                                    feedbackTypes={feedbackTypes}
                                    onSuccess={handleSuccess}
                                    onError={handleError}
                                />
                            )}
                        </main>
                    </div>

                    <p className="mt-6 text-center text-[11px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                        Ligtas at mabilis na serbisyo para sa mga mamamayan
                    </p>
                </div>
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

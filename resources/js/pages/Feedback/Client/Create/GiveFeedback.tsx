import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Heart } from 'lucide-react';
import { useState } from 'react';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { DepartmentOption, FeedbackFormContent } from '../../../Public/Home/Components/FeedbackForm/FeedbackFormContent';

interface GiveFeedbackProps {
    departments: DepartmentOption[];
    feedbackTypes: { value: string; label: string }[];
}

export default function GiveFeedback({ departments, feedbackTypes }: GiveFeedbackProps) {
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
            message: message,
            positiveButtonText: 'Isara',
            negativeButtonText: '',
            hideNegativeButton: true,
        });
    };

    return (
        <PublicLayout description="" title="">
            <Head title="I-abot ang iyong Feedback" />

            <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href={`/${slug}/home`}>
                        <button className="flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Bumalik sa Home
                        </button>
                    </Link>
                </div>

                <Card className="border-none shadow-xl sm:border sm:shadow-lg">
                    <CardHeader className="space-y-2 pb-6 text-center sm:text-left">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mx-0">
                            <Heart className="h-8 w-8 fill-current" />
                        </div>
                        <CardTitle className="text-xl font-extrabold tracking-tight sm:text-2xl">
                            I-abot ang iyong Feedback
                        </CardTitle>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Ang iyong opinyon ay mahalaga sa amin. Tulungan kaming mapabuti ang aming serbisyo para sa buong bayan.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <FeedbackFormContent 
                            departments={departments} 
                            feedbackTypes={feedbackTypes}
                            onSuccess={handleSuccess} 
                            onError={handleError} 
                        />
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Ligtas at Mabilis na Serbisyo para sa mga Mamamayan
                </p>
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


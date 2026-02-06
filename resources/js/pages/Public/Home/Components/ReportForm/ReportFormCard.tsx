import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LogInSignUpDialog from '@/pages/Auth/LogInSignUpDialog';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReportFormDialog } from './ReportFormDialog';

export default function ReportIssueCard() {
    const { auth } = usePage<SharedData>().props;
    const [isReportDialogShown, setIsReportDialogShown] = useState(false);
    const [isLogInSignUpDialogVisible, setLogInSignUpDialogVisible] = useState(false);
    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
    });

    useEffect(() => {
        if (auth.user !== null) {
            setLogInSignUpDialogVisible(false);
        }
    }, [auth.user]);

    return (
        <Card className="m-3 flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-7">
            <CardContent className="flex h-full flex-col justify-between p-0">
                {/* Header + Description */}
                <div className="flex items-start gap-4">
                    {/* Icon Box: Slate background for a professional look */}
                    <div className="flex items-center justify-center rounded-lg bg-slate-100 p-3 text-slate-700">
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <div>
                        {/* Title: Dark Slate (Official/Serious) */}
                        <h2 className="text-xl font-bold text-slate-900">Report Community Issue</h2>
                        
                        {/* Description: Muted Slate text */}
                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                            Help keep our community safe and clean — report damaged roads, broken street lights, garbage, and other local issues.
                        </p>
                    </div>
                </div>

                {/* Footer Button (stays bottom right) */}
                <div className="mt-6 flex justify-end">
                    <Button
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
                        onClick={() => {
                            if (auth.user === null) {
                                setLogInSignUpDialogVisible(true);
                                return;
                            }
                            setIsReportDialogShown(true);
                        }}
                    >
                        Submit Report
                        <ArrowRight size={16} />
                    </Button>
                </div>

                <ReportFormDialog
                    open={isReportDialogShown}
                    onOpenChange={setIsReportDialogShown}
                    onFailed={(errorMessage) => {
                        setClassicDialog((prev) => ({
                            ...prev,
                            isOpen: true,
                            title: 'Failed to Submit Report',
                            message: errorMessage,
                            positiveButtonText: 'OK',
                            negativeButtonText: '',
                            isNegativeButtonHidden: true,
                        }));
                    }}
                    onSuccess={() => {
                        setClassicDialog((prev) => ({
                            ...prev,
                            isOpen: true,
                            title: 'Report Submitted',
                            message: 'Thank you for your report! We appreciate your effort in helping us improve our community.',
                            positiveButtonText: 'OK',
                            negativeButtonText: '',
                            isNegativeButtonHidden: true,
                        }));
                    }}
                />
            </CardContent>

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                open={classicDialog.isOpen}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
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

            <LogInSignUpDialog isOpen={isLogInSignUpDialogVisible} onClose={() => setLogInSignUpDialogVisible(false)} />
        </Card>
    );
}
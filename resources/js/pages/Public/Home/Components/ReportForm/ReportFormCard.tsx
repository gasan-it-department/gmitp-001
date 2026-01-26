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
        <Card className="m-3 flex h-full flex-col rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 via-orange-50 to-orange-100 p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:p-7 dark:border-red-900/40 dark:from-red-900/30 dark:via-orange-900/20 dark:to-gray-900">
            <CardContent className="flex h-full flex-col justify-between p-0">
                {/* Header + Description */}
                <div className="flex items-center gap-4">
                    <div className="items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-3 text-white shadow-lg">
                        <AlertTriangle className="h-8 w-8" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-red-800 dark:text-orange-100">Report Community Issue</h2>
                        <p className="text-sm text-orange-800/80 italic dark:text-orange-200/80">
                            {' '}
                            Help keep our community safe and clean — report damaged roads, broken street lights, garbage, and other local issues.{' '}
                        </p>
                    </div>
                </div>

                {/* Footer Button (stays bottom right) */}
                <div className="mt-auto flex justify-end pt-6">
                    <Button
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-none bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-medium text-white transition-all duration-300 hover:from-red-600 hover:to-orange-600 hover:shadow-md active:scale-[0.98] sm:w-auto sm:px-8 sm:py-3"
                        onClick={() => {
                            if (auth.user === null) {
                                setLogInSignUpDialogVisible(true);
                                return;
                            }
                            setIsReportDialogShown(true);
                        }}
                    >
                        Submit Report
                        <ArrowRight size={18} className="sm:size-5" />
                    </Button>
                </div>
                {/* <div className="flex justify-end mt-auto pt-6">
                    <Button
                        className="
          flex items-center justify-center gap-2
          rounded-lg border-none
          bg-gradient-to-r from-red-500 to-orange-500
          text-white font-medium
          px-6 py-3 sm:px-8 sm:py-3
          transition-all duration-300
          hover:from-red-600 hover:to-orange-600 hover:shadow-md
          active:scale-[0.98]
          self-end
        "
                        onClick={() => setIsReportDialogShown(true)}
                    >
                        Report Issue
                        <ArrowRight size={18} className="sm:size-5" />
                    </Button>
                </div> */}

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

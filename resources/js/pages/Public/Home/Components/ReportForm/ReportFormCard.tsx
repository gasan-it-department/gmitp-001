import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LogInSignUpDialog from '@/pages/Auth/LogInSignUpDialog';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import communityReport from '@/routes/communityReport';
import login from '@/routes/login';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ReportIssueCard() {
    const { auth, currentMunicipality } = usePage<SharedData>().props;
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
        <Card className="group flex h-full flex-col rounded-xl border border-amber-200/90 bg-white p-6 shadow-sm shadow-amber-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md hover:shadow-amber-900/10 sm:p-7">
            <CardContent className="flex h-full flex-col justify-between p-0">
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-lg bg-amber-50 p-3 text-amber-700 ring-1 ring-amber-100 transition-colors group-hover:bg-amber-100">
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-950">Report Community Issue</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            Help keep our community safe and clean - report damaged roads, broken street lights, garbage, and other local issues.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
                        onClick={() => {
                            if (auth.user === null) {
                                router.visit(login.page.url({ municipality: currentMunicipality.slug }));
                                return;
                            }
                            router.visit(communityReport.create.url({ municipality: currentMunicipality.slug }));
                        }}
                    >
                        Submit Report
                        <ArrowRight size={16} />
                    </Button>
                </div>
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

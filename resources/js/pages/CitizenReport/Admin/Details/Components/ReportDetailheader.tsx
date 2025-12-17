import { Button } from '@/components/ui/button';
import { CommunityReportApi } from '@/Core/Api/CommunityReport/CommunityReportApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import ToastProvider from '@/pages/Utility/ToastShower';
import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CommunityReportStatusDialog from '../../List/Components/CommunityReportStatusDialog';

interface Props {
    report: CommunityReportData;
    onClose: () => void;
    onUpdate: () => void;
}

export function ReportDetailsHeader({ report, onClose }: Props) {
    const { currentMunicipality } = useMunicipality();
    const [isLoading, setIsLoading] = useState(false);
    const [updateResultDialog, setUpdateResultDialog] = useState({
        isOpen: false,
        reportId: '',
        status: '',
    });
    const [isResolved, setIsResolved] = useState(false);
    const [statusLabel, setStatusLabel] = useState('Pending');
    const badgeColorClass = isResolved ? 'border-green-300 bg-green-50 text-green-700' : 'border-orange-300 bg-orange-50 text-orange-700';

    useEffect(() => {
        setIsResolved(report.status === 'resolve');
        setStatusLabel(report.status);
    }, [report]);

    const handleResolve = async (id: string, remarks: string, status: string) => {
        try {
            // UPDATE THE REMARKS TO THE DATABASE.
            // UPDATE THE STATUS OF THE
            console.log('Remarks: ', remarks);
            setIsLoading(true);
            let response: { success: boolean };
            if (status === 'failed') {
                // CALL FAILED API HERE
                // response = await CommunityReportApi.failReport(id, currentMunicipality.slug);
            } else {
                response = await CommunityReportApi.resolveReport(id, currentMunicipality.slug, remarks);
            }

            if (response!.success) {
                toast.success(status === 'failed' ? 'Report marked as failed' : 'Report resolved');
                router.reload({ only: ['reports'] });
                setIsResolved(true);
                setStatusLabel('resolve');
            }
        } catch (error) {
            toast.error('Failed to resolve report.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Button variant="ghost" className="gap-2 pl-0 text-red-600 hover:bg-transparent hover:text-orange-600" onClick={() => onClose()}>
                    <ArrowLeft size={18} />
                    Back to Requests
                </Button>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${badgeColorClass}`}>
                        {isResolved ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        {statusLabel === 'resolve'
                            ? 'Resolved'
                            : statusLabel === 'failed'
                              ? 'Failed'
                              : statusLabel === 'pending'
                                ? 'Pending'
                                : 'Unknown'}
                    </div>
                    {!isResolved && (
                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    setUpdateResultDialog((prev) => ({
                                        ...prev,
                                        isOpen: true,
                                        reportId: report.id,
                                        status: 'failed',
                                    }))
                                }
                                disabled={isLoading}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                                Reject
                            </Button>

                            <Button
                                onClick={() =>
                                    setUpdateResultDialog((prev) => ({
                                        ...prev,
                                        isOpen: true,
                                        reportId: report.id,
                                        status: 'resolve',
                                    }))
                                }
                                disabled={isLoading}
                                className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-sm hover:from-emerald-700 hover:to-green-600"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resolving...
                                    </>
                                ) : (
                                    'Resolve'
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <CommunityReportStatusDialog
                    status={updateResultDialog.status}
                    isOpen={updateResultDialog.isOpen}
                    onUpdateButtonClicked={(remarks) => {
                        handleResolve(updateResultDialog.reportId, remarks, updateResultDialog.status);
                    }}
                    onClose={() =>
                        setUpdateResultDialog((prev) => ({
                            ...prev,
                            isOpen: false,
                            reportId: '',
                        }))
                    }
                />
            </div>

            <ToastProvider />

            <LoadingDialog isOpen={isLoading} />
        </div>
    );
}

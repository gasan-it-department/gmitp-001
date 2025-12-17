import { Button } from '@/components/ui/button';
import { CommunityReportApi } from '@/Core/Api/CommunityReport/CommunityReportApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import LoadingDialog from '@/pages/Utility/LoadingDialog';
import ToastProvider from '@/pages/Utility/ToastShower';
import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react';
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

    // Dialog state
    const [updateResultDialog, setUpdateResultDialog] = useState({
        isOpen: false,
        reportId: '',
        status: '', // This will be 'resolve' or 'failed'
    });

    const [currentStatus, setCurrentStatus] = useState(report.status);

    useEffect(() => {
        setCurrentStatus(report.status);
    }, [report]);

    // 1. Single Handler for BOTH Resolve and Reject
    const handleStatusUpdate = async (id: string, remarks: string, status: string) => {
        try {
            setIsLoading(true);
            let response;

            // 2. Switch logic based on the status passed from the Dialog
            if (status === 'failed') {
                // ✅ REJECT LOGIC (Using the object syntax we fixed)
                response = await CommunityReportApi.reject({
                    id: id,
                    municipalSlug: currentMunicipality.slug,
                    remarks: remarks,
                });
            } else {
                // ✅ RESOLVE LOGIC
                response = await CommunityReportApi.resolveReport(id, currentMunicipality.slug, remarks);
            }

            // 3. Handle Success
            if (response && response.success) {
                const message = status === 'failed' ? 'Report rejected successfully' : 'Report resolved successfully';
                toast.success(message);

                // Update local state to reflect change immediately
                setCurrentStatus(status);

                // Refresh data
                router.reload({ only: ['reports'] });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update report status.');
        } finally {
            setIsLoading(false);
            // Close dialog
            setUpdateResultDialog((prev) => ({ ...prev, isOpen: false }));
        }
    };

    // Helper to determine badge color
    const getBadgeColor = () => {
        switch (currentStatus) {
            case 'resolve':
                return 'border-green-300 bg-green-50 text-green-700';
            case 'failed':
                return 'border-red-300 bg-red-50 text-red-700';
            default:
                return 'border-orange-300 bg-orange-50 text-orange-700';
        }
    };

    // Helper to check if actions should be hidden (if resolved OR failed)
    const isProcessed = currentStatus === 'resolve' || currentStatus === 'failed';

    return (
        <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Button variant="ghost" className="gap-2 pl-0 text-red-600 hover:bg-transparent hover:text-orange-600" onClick={() => onClose()}>
                    <ArrowLeft size={18} />
                    Back to Requests
                </Button>

                <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${getBadgeColor()}`}>
                        {currentStatus === 'resolve' && <CheckCircle className="h-4 w-4" />}
                        {currentStatus === 'failed' && <XCircle className="h-4 w-4" />}
                        {currentStatus === 'pending' && <AlertTriangle className="h-4 w-4" />}

                        {currentStatus === 'resolve' ? 'Resolved' : currentStatus === 'failed' ? 'Rejected' : 'Pending'}
                    </div>

                    {/* Action Buttons - Only show if Pending */}
                    {!isProcessed && (
                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    setUpdateResultDialog({
                                        isOpen: true,
                                        reportId: report.id,
                                        status: 'failed', // Sets mode to Reject
                                    })
                                }
                                disabled={isLoading}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                                Reject
                            </Button>

                            <Button
                                onClick={() =>
                                    setUpdateResultDialog({
                                        isOpen: true,
                                        reportId: report.id,
                                        status: 'resolve', // Sets mode to Resolve
                                    })
                                }
                                disabled={isLoading}
                                className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-sm hover:from-emerald-700 hover:to-green-600"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Resolve'
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Shared Dialog for Both Actions */}
                <CommunityReportStatusDialog
                    status={updateResultDialog.status}
                    isOpen={updateResultDialog.isOpen}
                    onUpdateButtonClicked={(remarks) => {
                        // Calls the shared handler
                        handleStatusUpdate(updateResultDialog.reportId, remarks, updateResultDialog.status);
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

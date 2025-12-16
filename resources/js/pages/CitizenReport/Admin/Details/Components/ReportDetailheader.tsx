import { Button } from '@/components/ui/button';
import { CommunityReportApi } from '@/Core/Api/CommunityReport/CommunityReportApi';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    report: CommunityReportData;
}

export function ReportDetailsHeader({ report }: Props) {
    const { currentMunicipality } = useMunicipality();
    const [isLoading, setIsLoading] = useState(false);
    // 1. Define "Is Resolved" clearly
    const isResolved = report.resolved_at !== null; // or report.status === 'RESOLVED'

    // 2. Define Display Labels/Colors based on that state
    const statusLabel = report.status || 'PENDING';

    // Logic: If resolved -> Green. If pending -> Orange.
    const badgeColorClass = isResolved
        ? 'border-green-300 bg-green-50 text-green-700' // Green for Success
        : 'border-orange-300 bg-orange-50 text-orange-700'; // Orange for Warning

    const handleResolve = async (id: string) => {
        try {
            setIsLoading(true);
            const reponse = await CommunityReportApi.resolveReport(id, currentMunicipality.slug);
            toast.success('Report Resolved');

            router.reload({ only: ['report'] });
        } catch (error) {
            toast.error('Failed to resolve report.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button
                variant="ghost"
                className="gap-2 pl-0 text-red-600 hover:bg-transparent hover:text-orange-600"
                onClick={() => window.history.back()}
            >
                <ArrowLeft size={18} />
                Back to Requests
            </Button>

            <div className="flex items-center gap-3">
                {/* STATUS BADGE */}
                <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${badgeColorClass}`}>
                    {/* Icon Logic: Checked if resolved, Alert if pending */}
                    {isResolved ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {statusLabel}
                </div>

                {/* ACTION BUTTON */}
                {/* Logic: Only show 'Mark as Resolved' if it is NOT resolved yet */}
                {!isResolved && (
                    <Button
                        onClick={() => handleResolve(report.id)}
                        className="bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-sm hover:from-red-700 hover:to-orange-600"
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
                )}
            </div>
        </div>
    );
}

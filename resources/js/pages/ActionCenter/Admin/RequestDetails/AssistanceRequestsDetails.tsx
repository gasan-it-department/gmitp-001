import { Button } from '@/components/ui/button';
import { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import BeneficiaryCard from './Components/BeneficiaryCard';
import ProcessRequestDialog from './Components/ProcessRequestDialog';
import RequestHeader from './Components/RequestHeader';
import RequestInfoCard from './Components/RequestInfoCard';
import PrintView from '../RequestList/Components/PrintView';

interface AssistanceRequestDetailsProps {
    data: AssistanceRequest | null;
    onBackPressed: () => void;
}

export default function AssistanceRequestDetails({ data, onBackPressed }: AssistanceRequestDetailsProps) {
    // 1. Initialize State
    const [requestData, setRequestData] = useState<AssistanceRequest | null>(data);
    const [isProcessOpen, setIsProcessOpen] = useState(false);

    useEffect(() => {
        setRequestData(data);
    }, [data]);

    const handleSuccess = (newAmount: number | string) => {
        setRequestData((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                amount: newAmount.toString(),
                status: 'approved',
            };
        });
    };

    const [printDialogState, setPrintDialogState] = useState<{
        isVisible: boolean;
        request: AssistanceRequest | null;
    }>({ isVisible: false, request: null });

    if (!requestData) return null;
    return (
        <div className="space-y-6 p-6 bg-white/50 animate-in fade-in duration-300">
            <Head title={`Request #${requestData.transaction_number}`} />

            {/* Back Button */}
            <div className="mb-4">
                <Button
                    variant="ghost"
                    className="gap-2 pl-0 hover:bg-transparent hover:text-blue-600"
                    onClick={onBackPressed} // ✅ Wired to prop
                >
                    <ArrowLeft size={18} />
                    Back to Requests
                </Button>
            </div>

            <RequestHeader
                onPrintClicked={() => {
                    setPrintDialogState({ isVisible: true, request: data })
                }}
                request={requestData}
                onProcess={() => setIsProcessOpen(true)}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    {/* Safe to access beneficiary because of the Guard Clause above */}
                    <BeneficiaryCard beneficiary={requestData.beneficiary} />
                </div>
                <div className="lg:col-span-2">
                    <RequestInfoCard request={requestData} />
                </div>
            </div>

            <ProcessRequestDialog
                isOpen={isProcessOpen}
                onClose={() => setIsProcessOpen(false)}
                request={requestData}
                onSuccess={handleSuccess}
            />

            <PrintView
                isOpen={printDialogState.isVisible}
                onClose={() => setPrintDialogState({ isVisible: false, request: null })}
                data={printDialogState.request}
            />
        </div>
    );
}
import { Button } from '@/components/ui/button';
import { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import BeneficiaryCard from './Components/BeneficiaryCard';
import ProcessRequestDialog from './Components/ProcessRequestDialog';
import RequestHeader from './Components/RequestHeader';
import RequestInfoCard from './Components/RequestInfoCard';

export default function AssistanceRequestDetails() {
    const { data } = usePage<{ data: AssistanceRequest }>().props;
    const [isProcessOpen, setIsProcessOpen] = useState(false);

    return (
        <AdminLayout>
            <Head title={`Request #${data?.transaction_number}`} />

            <div className="space-y-6 p-6">
                <div className="mb-4">
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-blue-600" onClick={() => window.history.back()}>
                        <ArrowLeft size={18} />
                        Back to Requests
                    </Button>
                </div>

                {/* This triggers the state change to TRUE */}
                <RequestHeader request={data} onProcess={() => setIsProcessOpen(true)} />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <BeneficiaryCard beneficiary={data.beneficiary} />
                    </div>

                    <div className="lg:col-span-2">
                        <RequestInfoCard request={data} />
                    </div>
                </div>
            </div>

            <ProcessRequestDialog isOpen={isProcessOpen} onClose={() => setIsProcessOpen(false)} request={data} />
        </AdminLayout>
    );
}

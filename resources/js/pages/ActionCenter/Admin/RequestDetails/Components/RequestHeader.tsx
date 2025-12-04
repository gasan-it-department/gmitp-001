import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { CheckCircle2, Printer, XCircle } from 'lucide-react';

interface Props {
    request: AssistanceRequest;
    onProcess: () => void; // <--- New Prop
}

export default function RequestHeader({ request, onProcess }: Props) {
    // ... (keep your existing color logic) ...
    const getStatusColor = (status: string) => {
        /*...*/ return '';
    };

    return (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
                {/* ... (keep existing title/transaction number info) ... */}
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{request.transaction_number}</h1>
                    <Badge className={`border-none ${getStatusColor(request.status)}`}>{request.status.toUpperCase()}</Badge>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                    <Printer size={16} /> Print
                </Button>

                {/* LOGIC: Only show "Process" if it's Pending */}
                {request.status === 'pending' && (
                    <>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                            <XCircle size={16} className="mr-1" /> Reject
                        </Button>

                        <Button onClick={onProcess} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <CheckCircle2 size={16} /> Process Request
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

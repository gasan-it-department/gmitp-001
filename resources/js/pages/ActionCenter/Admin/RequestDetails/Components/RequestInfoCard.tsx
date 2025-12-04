import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssistanceRequest } from '../AssistanceRequestsDetails';

export default function RequestInfoCard({ request }: { request: AssistanceRequest }) {
    // Formatter for Currency (PHP)
    const formatCurrency = (amount: string | null) => {
        if (!amount) return '—';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(parseFloat(amount));
    };

    return (
        <Card className="h-full border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-medium text-gray-500">Assistance Type</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{request.assistance_type}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-medium text-gray-500">Allocated Amount</p>
                        <p className="mt-1 text-lg font-semibold text-green-700">{formatCurrency(request.amount)}</p>
                    </div>
                </div>

                {/* Description Section */}
                <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-500">Case Description</h4>
                    <div className="rounded-lg border border-gray-100 p-4 text-sm leading-relaxed text-gray-700">{request.description}</div>
                </div>

                {/* Additional Metadata (Timeline) */}
                <div className="pt-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-500">Timeline</h4>
                    <ol className="relative ml-2 border-l border-gray-200">
                        <li className="mb-6 ml-4">
                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-blue-600"></div>
                            <time className="mb-1 text-sm leading-none font-normal text-gray-400">
                                {new Date(request.created_at).toLocaleString()}
                            </time>
                            <h3 className="text-sm font-semibold text-gray-900">Request Submitted</h3>
                        </li>
                        {/* You can add more timeline items here later based on backend logs */}
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
}

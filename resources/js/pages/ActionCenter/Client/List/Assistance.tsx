import { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/PaginationTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle2, ChevronRight, Clock, FileText, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    assistance: PaginatedResponse<AssistanceRequest>;
}

// Configuration for Status Styles
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    approved: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-l-emerald-500',
        icon: CheckCircle2,
    },
    released: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-l-blue-500',
        icon: CheckCircle2,
    },
    rejected: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-l-red-500',
        icon: XCircle,
    },
    pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-l-amber-500',
        icon: Clock,
    },
    default: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-l-gray-300',
        icon: AlertCircle,
    },
};

export default function AssistanceList({ assistance }: Props) {
    const requests = assistance.data;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [classicDialog, setClassicDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        positiveButtonText: string;
        negativeButtonText: string;
        isNegativeButtonHidden: boolean;
        action: string | null;
    }>({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
        action: null,
    });
    const getStyle = (status: string) => STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.default;

    return (
        <PublicLayout title="Action Center" description="Track your assistance requests">
            <Head title="My Assistance Requests" />

            <div className="min-h-screen bg-gray-50/50">
                {/* CONTENT SECTION */}
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Grid Layout for Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                        {requests.map((req) => {
                            const style = getStyle(req.status);
                            const StatusIcon = style.icon;

                            return (
                                <Link
                                    key={req.id}
                                    href={`/assistance/${req.id}`}
                                    className={`group relative flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-md hover:ring-gray-900/10 ${style.border} border-l-4`}
                                >
                                    {/* Card Header: Type & Status */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <h3 className="line-clamp-1 font-extrabold text-gray-900 uppercase">{req.assistance_type} Assistance</h3>
                                            <div className="mt-1 flex items-center gap-2 font-mono text-xs text-gray-500">
                                                <FileText className="h-3 w-3" />
                                                {req.transaction_number}
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
                                        >
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {req.status}
                                        </span>
                                    </div>

                                    {/* Card Body: Beneficiary & Desc */}
                                    <div className="mb-6 space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Beneficiary</p>
                                                <p className="font-medium text-gray-900">{req.beneficiary?.name || 'Self'}</p>
                                            </div>
                                        </div>

                                        <div className="line-clamp-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 italic">"{req.description}"</div>
                                    </div>

                                    {/* Card Footer: Date & Link */}
                                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {req.created_at}
                                        </div>

                                        <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:underline">
                                            Details
                                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* EMPTY STATE */}
                    {requests.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">No requests found</h3>
                            <p className="mt-2 max-w-sm text-gray-500">You haven't submitted any assistance requests yet.</p>
                            {/* <Button
                                size="lg"
                                className="bg-orange-500 font-semibold text-white hover:bg-orange-600"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                Request Assistance
                            </Button>

                            <ActionCenterForm
                                onSubmitSuccess={(title, message) => {
                                    setClassicDialog((prev) => ({
                                        ...prev,
                                        isOpen: true,
                                        title: title,
                                        message: message,
                                        positiveButtonText: 'Close',
                                        isNegativeButtonHidden: true,
                                    }));
                                }}
                                isOpen={isDialogOpen}
                                onClose={() => setIsDialogOpen(false)}
                            /> */}
                        </div>
                    )}

                    {/* PAGINATION */}
                    {assistance.meta.total > assistance.meta.per_page && (
                        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium">{assistance.meta.from}</span> to{' '}
                                <span className="font-medium">{assistance.meta.to}</span> of{' '}
                                <span className="font-medium">{assistance.meta.total}</span> results
                            </p>

                            <div className="flex gap-2">
                                {assistance.links.prev && (
                                    <Link
                                        href={assistance.links.prev}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {assistance.links.next && (
                                    <Link
                                        href={assistance.links.next}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
                        action: null,
                        isOpen: false,
                    }));
                }}
                onNegativeClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        action: null,
                        isOpen: false,
                    }));
                }}
            />
        </PublicLayout>
    );
}

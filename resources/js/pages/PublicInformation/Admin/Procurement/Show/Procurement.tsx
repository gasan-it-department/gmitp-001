import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProcurementData } from '@/Core/Types/PublicInformation/PublicInformationTypes';
import AppLayout from '@/layouts/App/AppLayout';
// 👇 Added missing icons here
import { ArrowLeft, Calendar, Download, Eye, FileText } from 'lucide-react';

// 👇 FIX: The prop name passed from Laravel is 'procurement', not 'data'
interface Props {
    procurement: {
        data: ProcurementData;
    };
}

export default function Procurement({ procurement: resource }: Props) {
    // 👇 FIX: Unwrap the data immediately so you can use 'procurement.title' easily
    const procurement = resource.data;

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return '-';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleBack = () => window.history.back();
    console.log(procurement);
    return (
        <AppLayout>
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* 1. HEADER & ACTIONS */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                            <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 h-8 w-8 p-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">Back to List</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{procurement.title}</h1>
                        <div className="mt-2 flex items-center gap-4">
                            <Badge variant={procurement.status === 'OPEN' ? 'default' : 'secondary'}>{procurement.status}</Badge>
                            <span className="text-sm text-gray-500">Ref: {procurement.reference_number}</span>
                            <span className="text-sm text-gray-500">Category: {procurement.category}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* 2. MAIN DETAILS (Left Column) */}
                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Approved Budget (ABC)</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(procurement.approved_budget)}</p>
                                </div>
                                {procurement.contract_amount && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Contract Amount</p>
                                        <p className="text-xl font-bold text-green-700">{formatCurrency(procurement.contract_amount)}</p>
                                    </div>
                                )}
                                {procurement.winning_bidder && (
                                    <div className="sm:col-span-2">
                                        <Separator className="my-2" />
                                        <p className="text-sm font-medium text-gray-500">Winning Bidder</p>
                                        <p className="text-lg font-medium text-gray-900">{procurement.winning_bidder}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. ATTACHMENTS SECTION (UNCOMMENTED & FIXED) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Documents ({procurement.files?.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!procurement.files || procurement.files.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No documents uploaded.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {procurement.files.map((file) => (
                                            <li key={file.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded bg-blue-100 p-2">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                        <Badge variant="outline" className="mt-1 text-[10px]">
                                                            {file.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {/* VIEW BUTTON */}
                                                    <Button variant="ghost" size="icon" asChild>
                                                        {/* 👇 Using view_link from your Interface */}
                                                        <a href={file.view_url} target="_blank" rel="noopener noreferrer" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>

                                                    {/* DOWNLOAD BUTTON */}
                                                    <Button variant="ghost" size="icon" asChild>
                                                        {/* 👇 Using download_link from your Interface */}
                                                        <a href={file.download_url} title="Download">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* 4. TIMELINE (Right Sidebar) */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <TimelineItem label="Pre-Bid Conference" date={formatDate(procurement.pre_bid_date)} />
                                <TimelineItem label="Closing Date" date={formatDate(procurement.closing_date)} />
                                <TimelineItem label="Award Date" date={formatDate(procurement.award_date)} />
                                <Separator />
                                <TimelineItem label="Date Posted" date={formatDate(procurement.created_at)} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Tiny helper component for the timeline
const TimelineItem = ({ label, date }: { label: string; date: string }) => (
    <div className="flex items-start gap-3">
        <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
        <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-500">{date}</p>
        </div>
    </div>
);

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProcurementData } from '@/Core/Types/PublicInformation/PublicInformationTypes';
import AppLayout from '@/layouts/App/AppLayout';
import {
    ArrowLeft, Calendar, Download, Eye, FileText,
    Info, Landmark, Receipt, Pencil
} from 'lucide-react';
import { Link } from '@inertiajs/react'; // Assuming you use Inertia for routing

interface Props {
    procurement: {
        data: ProcurementData;
    };
}

export default function Procurement({ procurement: resource }: Props) {
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

    const handleEditButton = () => {
        // Navigate to the edit page
        console.log('Edit button clicked');
        
    }

    return (
        <AppLayout>
            <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">

                {/* 1. TOP NAVIGATION & HEADER */}
                <div className="mb-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="group flex items-center gap-2 hover:bg-transparent p-0 text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Back</span>
                        </Button>

                        {/* EDIT BUTTON - Positioned top right for admin accessibility */}
                        <Button
                            variant="outline"
                            className="border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                            onClick={handleEditButton}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Procurement
                        </Button>
                    </div>

                    <div className="flex flex-col justify-between gap-4 border-b pb-6 lg:flex-row lg:items-end">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                                    {procurement.category}
                                </Badge>
                                <Badge
                                    className={procurement.status === 'OPEN'
                                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}
                                >
                                    {procurement.status}
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
                                {procurement.title}
                            </h1>
                            <p className="text-lg text-slate-500">
                                Reference No: <span className="font-mono font-semibold text-slate-700">{procurement.reference_number}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. DASHBOARD GRID */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">

                    {/* LEFT SIDE: MAIN CONTENT (3 Columns) */}
                    <div className="space-y-8 lg:col-span-3">

                        {/* Summary Cards Row */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="border-l-4 border-l-blue-600 shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                                            <Landmark className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Approved Budget (ABC)</p>
                                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(procurement.approved_budget)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {procurement.contract_amount && (
                                <Card className="border-l-4 border-l-green-600 shadow-sm">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-full bg-green-50 p-3 text-green-600">
                                                <Receipt className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Contract Amount</p>
                                                <p className="text-2xl font-bold text-green-700">{formatCurrency(procurement.contract_amount)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {procurement.winning_bidder && (
                                <Card className="border-l-4 border-l-slate-800 shadow-sm lg:col-span-1">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-full bg-slate-100 p-3 text-slate-700">
                                                <Info className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-500">Winning Bidder</p>
                                                <p className="truncate text-lg font-bold text-slate-900">{procurement.winning_bidder}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Documents Section */}
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-slate-50/50">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Associated Documents</CardTitle>
                                    <p className="text-sm text-muted-foreground">Official procurement files and transparency records</p>
                                </div>
                                <Badge variant="secondary" className="h-6">{procurement.files?.length || 0} Files</Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                {!procurement.files || procurement.files.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <FileText className="h-12 w-12 opacity-20" />
                                        <p className="mt-2 italic">No documents available.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y overflow-hidden">
                                        {procurement.files.map((file) => (
                                            <div key={file.id} className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50/80">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-white text-blue-600 shadow-sm group-hover:border-blue-200">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{file.name}</p>
                                                        <p className="text-xs uppercase tracking-tighter text-slate-500">{file.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={file.view_url} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </a>
                                                    </Button>
                                                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800" asChild>
                                                        <a href={file.download_url}>
                                                            <Download className="mr-2 h-4 w-4" /> Download
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT SIDE: TIMELINE (1 Column) */}
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-slate-50/50">
                                <CardTitle className="text-lg">Project Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-200">
                                    <TimelineItem label="Pre-Bid Conference" date={formatDate(procurement.pre_bid_date)} color="text-blue-500" />
                                    <TimelineItem label="Closing Date" date={formatDate(procurement.closing_date)} color="text-red-500" />
                                    <TimelineItem label="Award Date" date={formatDate(procurement.award_date)} color="text-green-500" />
                                    <div className="pt-2">
                                        <Separator className="mb-4" />
                                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-400">
                                            <span>Date Posted</span>
                                            <span>{formatDate(procurement.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

const TimelineItem = ({ label, date, color }: { label: string; date: string; color: string }) => (
    <div className="relative flex items-start gap-4 pl-1">
        <div className={`mt-1.5 h-3 w-3 rounded-full border-2 border-white ring-2 ring-current ${color} z-10 bg-white`} />
        <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-900">{date}</p>
        </div>
    </div>
);
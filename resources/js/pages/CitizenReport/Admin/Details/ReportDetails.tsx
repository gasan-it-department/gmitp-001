import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/layouts/App/AppLayout';
import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle, ExternalLink, MapPin, Phone, User } from 'lucide-react';

// 1. Define Interface based on your data
interface ReportData {
    id: string;
    sender_name: string;
    contact: string;
    type: string;
    location: string;
    latitude: string;
    longitude: string;
    description: string;
    status: string | null; // Data says null, so we handle that
    created_at: string;
    resolved_at: string | null;
    // Assuming there might be images later, but optional for now
    images?: { url: string }[];
}

interface Props {
    report: ReportData;
}

export default function ReportDetailsPage({ report }: Props) {
    // Helper: Format Date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Helper: Google Maps Link
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;

    // Helper: Status Color Logic
    const isResolved = report.status === 'RESOLVED';
    const statusLabel = report.status || 'PENDING'; // Handle null as Pending

    return (
        <AdminLayout>
            <div className="space-y-6 p-6">
                {/* --- HEADER --- */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-500">
                            <Link href="/admin/community-reports" className="flex items-center transition-colors hover:text-gray-900">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to Reports
                            </Link>
                            <span>/</span>
                            <span className="font-mono text-xs uppercase">{report.id}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div
                            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${
                                isResolved ? 'border-green-200 bg-green-50 text-green-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            }`}
                        >
                            {isResolved ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            {statusLabel}
                        </div>

                        {/* Action Button (Example) */}
                        {!isResolved && <Button className="bg-green-600 text-white hover:bg-green-700">Mark as Resolved</Button>}
                    </div>
                </div>

                {/* --- CONTENT GRID --- */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN (Details) */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* 1. Description Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Issue Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{report.description}</p>
                            </CardContent>
                        </Card>

                        {/* 2. Location & Map Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    Location Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                    <p className="font-medium text-gray-900">{report.location}</p>
                                    <p className="mt-1 font-mono text-sm text-gray-500">
                                        Lat: {report.latitude}, Long: {report.longitude}
                                    </p>
                                </div>

                                {/* External Map Button */}
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open in Google Maps
                                </a>
                            </CardContent>
                        </Card>

                        {/* 3. Image Placeholder (Since reporting usually has images) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Attached Images</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 text-gray-400">
                                    <span>No images attached</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN (Meta) */}
                    <div className="space-y-6">
                        {/* 1. Sender Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-md text-xs font-bold tracking-wider text-gray-500 uppercase">Reporter Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{report.sender_name}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-green-50 p-2 text-green-600">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Contact Number</p>
                                        <p className="font-mono font-medium text-gray-900">{report.contact}</p>
                                        <a href={`tel:${report.contact}`} className="text-xs text-blue-600 hover:underline">
                                            Call Now
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-md text-xs font-bold tracking-wider text-gray-500 uppercase">Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Reported On</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(report.created_at)}</p>
                                    </div>
                                </div>

                                {report.resolved_at && (
                                    <>
                                        <div className="ml-2 h-4 w-[1px] bg-gray-300"></div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Resolved On</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(report.resolved_at)}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

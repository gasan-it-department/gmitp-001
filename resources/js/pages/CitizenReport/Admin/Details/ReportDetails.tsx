import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import ImageViewerDialog from '@/pages/Utility/ImageViewerModal';
import { Calendar, ExternalLink, MapPin, Phone, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { ReportDetailsHeader } from './Components/ReportDetailheader';

interface Props {
    report: CommunityReportData | null;
    onClose: () => void;
    onUpdate: () => void;
}

export default function ReportDetails({ report, onClose, onUpdate }: Props) {
    if (report === null)
        return (
            <div>
                <a>SOMETHING WENT WRONG!</a>
            </div>
        );

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const hasCoordinates = report.latitude !== null && report.longitude !== null;
    const googleMapsUrl = hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}` : null;

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <div className="space-y-6 p-6">
            {/* ================= HEADER ================= */}
            <ReportDetailsHeader report={report} onClose={() => onClose()} onUpdate={() => onUpdate()} />
            {/* ================= CONTENT ================= */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Issue Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{report.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                Location Details
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="rounded-lg border bg-gray-50 p-4">
                                <p className="font-medium text-gray-900">{report.location}</p>

                                {hasCoordinates ? (
                                    <p className="mt-1 font-mono text-sm text-gray-500">
                                        Coordinates: Lat: {report.latitude}, Long: {report.longitude}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-sm text-gray-400 italic">Coordinates not available</p>
                                )}
                            </div>

                            <a
                                href={googleMapsUrl ?? undefined}
                                target="_blank"
                                rel="noreferrer"
                                aria-disabled={!hasCoordinates}
                                className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
                                    hasCoordinates
                                        ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600'
                                        : 'cursor-not-allowed bg-gray-300'
                                } `}
                                onClick={(e) => {
                                    if (!hasCoordinates) e.preventDefault();
                                }}
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open in Google Maps
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Attached Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {report.attachments.length === 0 ? (
                                <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed text-gray-400">
                                    No images attached
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {report.attachments.map((a, i) => (
                                        <img
                                            key={i}
                                            src={a.view_url}
                                            alt={`Attachment ${i + 1}`}
                                            className="cursor-pointer rounded-lg border bg-gray-50 object-contain p-2 transition hover:scale-105"
                                            draggable={false}
                                            onClick={() => {
                                                setSelectedImage(a.view_url);
                                                setZoom(1);
                                                setPosition({ x: 0, y: 0 });
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-bold tracking-wider text-gray-500 uppercase">Reporter Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{report.sender_name ?? 'Anonymous'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Contact</p>
                                    <p className="font-mono">{report.contact ?? 'Not provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-bold tracking-wider text-gray-500 uppercase">Remarks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <p className="text-sm">{report.remarks}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs font-bold tracking-wider text-gray-500 uppercase">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <p className="text-sm">{formatDate(report.created_at)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* ================= IMAGE MODAL (DRAG + ZOOM + CENTERED) ================= */}
            <ImageViewerDialog viewing_url={selectedImage} open={!!selectedImage} onOpenChange={() => setSelectedImage(null)} />
        </div>
    );
}

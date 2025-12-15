import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    CommunityReportAttachments,
    CommunityReportData,
} from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import ImageViewerDialog from '@/pages/Utility/ImageViewerModal';
import ImageViewerModal from '@/pages/Utility/ImageViewerModal';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    ExternalLink,
    MapPin,
    Phone,
    User,
    ZoomIn,
    ZoomOut,
    RotateCcw,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface Props {
    report: CommunityReportData;
}

export default function ReportDetailsPage({ report }: Props) {
    const [attachmentsList, setAttachmentList] =
        useState<CommunityReportAttachments[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        setAttachmentList(report.attachments);
    }, [report.attachments]);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
    const isResolved = report.status === 'RESOLVED';
    const statusLabel = report.status || 'PENDING';

    const closeModal = () => {
        setSelectedImage(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        setZoom((prev) => Math.min(Math.max(prev - e.deltaY * 0.001, 0.5), 4));
    };

    const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
        setDragging(true);
        if ('touches' in e) {
            dragStart.current = {
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y,
            };
        } else {
            dragStart.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
        }
    };

    const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragging) return;
        if ('touches' in e) {
            setPosition({
                x: e.touches[0].clientX - dragStart.current.x,
                y: e.touches[0].clientY - dragStart.current.y,
            });
        } else {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y,
            });
        }
    };

    const endDrag = () => setDragging(false);

    return (
        <AdminLayout>
            <div className="space-y-6 p-6">
                {/* ================= HEADER ================= */}
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
                        <div
                            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${isResolved
                                ? 'border-green-300 bg-green-50 text-green-700'
                                : 'border-orange-300 bg-orange-50 text-orange-700'
                                }`}
                        >
                            {isResolved ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <AlertTriangle className="h-4 w-4" />
                            )}
                            {statusLabel}
                        </div>

                        {!isResolved && (
                            <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600 shadow-sm">
                                Mark as Resolved
                            </Button>
                        )}
                    </div>
                </div>

                {/* ================= CONTENT ================= */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Issue Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                                    {report.description}
                                </p>
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
                                    <p className="font-medium text-gray-900">
                                        {report.location}
                                    </p>
                                    <p className="mt-1 font-mono text-sm text-gray-500">
                                        Coordinates: Lat: {report.latitude}, Long:{' '}
                                        {report.longitude}
                                    </p>
                                </div>

                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-orange-600 transition shadow-sm"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open in Google Maps
                                </a>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Attached Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {attachmentsList.length === 0 ? (
                                    <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed text-gray-400">
                                        No images attached
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {attachmentsList.map((a, i) => (
                                            <img
                                                key={i}
                                                src={a.view_url}
                                                alt={`Attachment ${i + 1}`}
                                                className="cursor-pointer rounded-lg border bg-gray-50 p-2 object-contain transition hover:scale-105"
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
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Reporter Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Name
                                        </p>
                                        <p className="font-medium">
                                            {report.sender_name ?? "Anonymous"}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Contact
                                        </p>
                                        <p className="font-mono">
                                            {report.contact ?? "Not provided"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <p className="text-sm">
                                        {formatDate(report.created_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ================= IMAGE MODAL (DRAG + ZOOM + CENTERED) ================= */}
                <ImageViewerDialog
                    viewing_url={selectedImage}
                    open={!!selectedImage}
                    onOpenChange={() => setSelectedImage(null)}
                />
            </div>
        </AdminLayout>
    );
}

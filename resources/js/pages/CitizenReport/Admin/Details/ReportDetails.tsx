import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import ImageViewerDialog from '@/pages/Utility/ImageViewerModal';
import { Calendar, ExternalLink, MapPin, Phone, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { ReportDetailsHeader } from './Components/ReportDetailheader';

interface Props {
    report: CommunityReportData;
}

export default function ReportDetailsPage({ report }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;

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
                <ReportDetailsHeader report={report} />
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
                                    <p className="mt-1 font-mono text-sm text-gray-500">
                                        Coordinates: Lat: {report.latitude}, Long: {report.longitude}
                                    </p>
                                </div>

                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-red-700 hover:to-orange-600"
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
        </AdminLayout>
    );
}

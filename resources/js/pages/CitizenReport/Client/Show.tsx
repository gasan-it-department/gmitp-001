import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Circle, Clock, MapPin, ShieldCheck, XCircle } from 'lucide-react';

type EnumOption = { value: string; label: string };

interface ReportShape {
    id: string;
    category: EnumOption;
    status: EnumOption;
    location_text: string;
    latitude: number | string | null;
    longitude: number | string | null;
    description: string;
    is_anonymous: boolean;
    created_at: string | null;
}

interface PhotoShape {
    id: number | string;
    name: string;
    size: number;
    mime_type: string;
    url: string;
}

interface TimelineStep {
    key: string;
    label: string;
    description: string;
    at: string | null;
    reached: boolean;
}

interface ShowProps {
    report: ReportShape;
    photos: PhotoShape[];
    timeline: TimelineStep[];
}

const statusBadgeClasses = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
        case 'in_progress':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'resolved':
            return 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-300';
        case 'rejected':
            return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300';
        default:
            return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
    }
};

const stepIcon = (key: string, reached: boolean) => {
    const baseClass = reached ? 'text-white' : 'text-muted-foreground';
    const size = 'h-5 w-5';
    switch (key) {
        case 'submitted':
            return <ShieldCheck className={`${baseClass} ${size}`} />;
        case 'acknowledged':
            return reached ? <CheckCircle2 className={`${baseClass} ${size}`} /> : <Circle className={`${baseClass} ${size}`} />;
        case 'in_progress':
            return <Clock className={`${baseClass} ${size}`} />;
        case 'resolved':
            return <CheckCircle2 className={`${baseClass} ${size}`} />;
        case 'rejected':
            return <XCircle className={`${baseClass} ${size}`} />;
        default:
            return <Circle className={`${baseClass} ${size}`} />;
    }
};

const stepBubbleBg = (key: string, reached: boolean): string => {
    if (!reached) return 'bg-muted ring-1 ring-border';
    if (key === 'rejected') return 'bg-red-500';
    if (key === 'resolved') return 'bg-green-500';
    if (key === 'in_progress') return 'bg-blue-500';
    if (key === 'acknowledged') return 'bg-indigo-500';
    return 'bg-primary';
};

export default function Show({ report, photos, timeline }: ShowProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const hasCoordinates = report.latitude !== null && report.longitude !== null;

    return (
        <PublicLayout description="" title="">
            <Head title={`Report — ${report.category.label}`} />

            <div className="container mx-auto max-w-6xl py-8">
                {/* Top bar */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/${slug}/community-report`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to My Reports
                        </Button>
                    </Link>

                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses(
                            report.status.value,
                        )}`}
                    >
                        {report.status.label}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* MAIN DETAILS */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">{report.category.label}</p>
                                <CardTitle className="text-2xl font-bold text-foreground">{report.location_text}</CardTitle>
                                <p className="mt-1 text-xs text-muted-foreground">Submitted {report.created_at ?? '—'}</p>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <div>
                                    <h3 className="mb-1 text-sm font-semibold text-foreground">Description</h3>
                                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{report.description}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</h3>
                                        <p className="flex items-start gap-2 text-sm text-foreground">
                                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                            <span>{report.location_text}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">GPS Coordinates</h3>
                                        {hasCoordinates ? (
                                            <div className="space-y-3">
                                                <a
                                                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                                                >
                                                    {report.latitude}, {report.longitude}
                                                </a>
                                                <div className="overflow-hidden rounded-lg border border-border">
                                                    <iframe
                                                        width="100%"
                                                        height="200"
                                                        style={{ border: 0 }}
                                                        loading="lazy"
                                                        src={`https://maps.google.com/maps?q=${report.latitude},${report.longitude}&z=15&output=embed`}
                                                    ></iframe>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Not provided</p>
                                        )}
                                    </div>
                                </div>

                                {report.is_anonymous && (
                                    <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                                        This report was submitted anonymously — your name is hidden on public displays.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* EVIDENCE PHOTOS */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Evidence Photos
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">({photos.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {photos.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No photos were attached to this report.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                        {photos.map((photo) => (
                                            <a
                                                key={photo.id}
                                                href={photo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30"
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={photo.name}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                    <span className="line-clamp-1 text-[10px] font-medium text-white">{photo.name}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* TIMELINE SIDEBAR */}
                    <div>
                        <Card className="shadow-sm lg:sticky lg:top-6">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Tracking Trail</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Follow your report's lifecycle from submission to resolution.
                                </p>
                            </CardHeader>

                            <CardContent>
                                <ol className="relative space-y-6">
                                    {timeline.map((step, idx) => {
                                        const isLast = idx === timeline.length - 1;
                                        return (
                                            <li key={step.key} className="relative pl-10">
                                                {/* connector line */}
                                                {!isLast && (
                                                    <span
                                                        className={`absolute left-[15px] top-8 h-full w-px ${
                                                            step.reached && timeline[idx + 1]?.reached
                                                                ? 'bg-primary/40'
                                                                : 'bg-border'
                                                        }`}
                                                        aria-hidden
                                                    />
                                                )}

                                                {/* bubble */}
                                                <span
                                                    className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ${stepBubbleBg(
                                                        step.key,
                                                        step.reached,
                                                    )}`}
                                                >
                                                    {stepIcon(step.key, step.reached)}
                                                </span>

                                                <div>
                                                    <p
                                                        className={`text-sm font-semibold ${
                                                            step.reached ? 'text-foreground' : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </p>
                                                    <p
                                                        className={`mt-0.5 text-xs ${
                                                            step.reached ? 'text-muted-foreground' : 'text-muted-foreground/70'
                                                        }`}
                                                    >
                                                        {step.description}
                                                    </p>
                                                    <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                                                        {step.at ?? 'Pending'}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

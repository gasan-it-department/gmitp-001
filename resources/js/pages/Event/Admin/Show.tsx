import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    CalendarDays,
    CalendarRange,
    CheckCircle2,
    Clock3,
    ExternalLink,
    FileText,
    ImageIcon,
    MapPin,
    Pencil,
    Radio,
    Tag,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

type EnumOption = { value: string; label: string };

interface AuditEntry {
    id: number | string;
    event: string | null;
    description: string;
    properties: Record<string, unknown> | null;
    causer_id: string | null;
    created_at: string | null;
}

interface BannerMeta {
    id: number | string;
    name: string;
    mime_type: string | null;
    size: number | null;
    url: string;
}

interface EventDetail {
    id: string;
    title: string;
    description: string;
    type: EnumOption;
    is_published: boolean;
    start_datetime: string | null;
    end_datetime: string | null;
    start_datetime_iso?: string | null;
    end_datetime_iso?: string | null;
    location_name: string | null;
    created_at: string | null;
    created_at_iso?: string | null;
    updated_at: string | null;
    updated_at_iso?: string | null;
    deleted_at: string | null;
    banner: BannerMeta | null;
    audit_log?: AuditEntry[];
}

interface Props {
    event: EventDetail;
}

const typeBadgeClasses = (type: string): string => {
    switch (type) {
        case 'festival':
            return 'border-purple-200 bg-purple-50 text-purple-700';
        case 'government':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'community':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'holiday':
            return 'border-rose-200 bg-rose-50 text-rose-700';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-700';
    }
};

export default function EventAdminShow({ event }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleTogglePublish = () => {
        router.patch(
            `/api/event/${event.id}/publish`,
            {},
            {
                headers: { 'X-Municipality-Slug': slug },
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsPublishing(true),
                onFinish: () => setIsPublishing(false),
            },
        );
    };

    const handleDelete = () => {
        router.delete(`/api/event/${event.id}`, {
            headers: { 'X-Municipality-Slug': slug },
            onStart: () => setIsDeleting(true),
            onSuccess: () => router.visit(`/${slug}/admin/event`),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout>
            <Head title={`${event.title} — Event`} />

            <div className="min-h-full bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
                <main className="mx-auto w-full max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={`/${slug}/admin/event`}
                            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to events
                        </Link>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" onClick={handleTogglePublish} disabled={isPublishing} className="bg-white">
                                {event.is_published ? <Radio className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {isPublishing ? 'Updating…' : event.is_published ? 'Unpublish' : 'Publish event'}
                            </Button>
                            <Link href={`/${slug}/admin/event/${event.id}/edit`}>
                                <Button className="shadow-sm">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit event
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <section className="relative isolate min-h-[360px] overflow-hidden rounded-3xl bg-slate-900 shadow-xl shadow-slate-900/10">
                        {event.banner ? (
                            <img src={event.banner.url} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#475569,_transparent_48%),linear-gradient(135deg,#0f172a,#1e293b)]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-900/10" />
                        {!event.banner && (
                            <CalendarDays className="absolute top-10 right-10 h-44 w-44 text-white/[0.06] sm:h-56 sm:w-56" strokeWidth={1} />
                        )}

                        <div className="relative flex min-h-[360px] flex-col justify-end p-6 sm:p-9 lg:p-12">
                            <div className="mb-5 flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/10">
                                    <Tag className="mr-1.5 h-3.5 w-3.5" />
                                    {event.type.label}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={
                                        event.is_published
                                            ? 'border-emerald-300/30 bg-emerald-400/15 text-emerald-100 backdrop-blur-md'
                                            : 'border-white/20 bg-white/10 text-slate-200 backdrop-blur-md'
                                    }
                                >
                                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${event.is_published ? 'bg-emerald-300' : 'bg-slate-300'}`} />
                                    {event.is_published ? 'Published' : 'Draft'}
                                </Badge>
                            </div>

                            <h1 className="max-w-4xl text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {event.title}
                            </h1>
                            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4 text-slate-300" />
                                    {event.start_datetime ?? 'Schedule not set'}
                                </span>
                                {event.location_name && (
                                    <span className="inline-flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-300" />
                                        {event.location_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-6">
                            <Card className="overflow-hidden border-slate-200 shadow-sm">
                                <CardHeader className="border-b border-slate-100 bg-white px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base text-slate-900">About this event</CardTitle>
                                            <p className="mt-0.5 text-xs text-slate-500">Public event description</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-6 py-7 sm:px-8">
                                    <p className="text-[15px] leading-7 whitespace-pre-wrap text-slate-700">{event.description}</p>
                                </CardContent>
                            </Card>

                            {event.audit_log && event.audit_log.length > 0 && (
                                <Card className="overflow-hidden border-slate-200 shadow-sm">
                                    <CardHeader className="border-b border-slate-100 bg-white px-6 py-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base text-slate-900">Activity history</CardTitle>
                                                    <p className="mt-0.5 text-xs text-slate-500">Recent administrative changes</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="font-medium">
                                                {event.audit_log.length} {event.audit_log.length === 1 ? 'entry' : 'entries'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ol className="divide-y divide-slate-100">
                                            {event.audit_log.map((entry) => (
                                                <li key={entry.id} className="relative px-6 py-5 sm:px-8">
                                                    <div className="flex gap-4">
                                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                                                            <Clock3 className="h-3.5 w-3.5 text-slate-500" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {formatActivityLabel(entry.event, entry.description)}
                                                                </p>
                                                                <time className="shrink-0 text-xs text-slate-500">
                                                                    {entry.created_at ?? 'Date unavailable'}
                                                                </time>
                                                            </div>
                                                            {entry.description && entry.description !== entry.event && (
                                                                <p className="mt-1 text-sm text-slate-500">{entry.description}</p>
                                                            )}
                                                            {entry.properties && Object.keys(entry.properties).length > 0 && (
                                                                <details className="group mt-3">
                                                                    <summary className="w-fit cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-800">
                                                                        View change details
                                                                    </summary>
                                                                    <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">
                                                                        {JSON.stringify(entry.properties, null, 2)}
                                                                    </pre>
                                                                </details>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <aside className="space-y-6 lg:sticky lg:top-24">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-slate-900">Event details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <DetailRow icon={CalendarDays} label="Starts" value={event.start_datetime ?? 'Not set'} />
                                    <DetailRow icon={Clock3} label="Ends" value={event.end_datetime ?? 'No end time specified'} />
                                    <Separator />
                                    <DetailRow icon={MapPin} label="Location" value={event.location_name ?? 'No physical venue specified'} />
                                    <DetailRow
                                        icon={Tag}
                                        label="Event type"
                                        value={event.type.label}
                                        valueClassName={`inline-flex w-fit rounded-md border px-2 py-0.5 text-xs font-semibold ${typeBadgeClasses(event.type.value)}`}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-slate-900">Record information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <RecordRow label="Created" value={event.created_at ?? '—'} />
                                    <RecordRow label="Last updated" value={event.updated_at ?? '—'} />
                                    <RecordRow label="Event ID" value={event.id} mono />
                                    {event.banner && (
                                        <>
                                            <Separator />
                                            <a
                                                href={event.banner.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                                            >
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-xs font-medium text-slate-700">{event.banner.name}</span>
                                                        <span className="block text-[11px] text-slate-500">{formatFileSize(event.banner.size)}</span>
                                                    </span>
                                                </span>
                                                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                            </a>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-red-100 bg-red-50/30 shadow-none">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-900">Danger zone</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-xs leading-5 text-slate-500">
                                        Deleting this event moves it to the trash and removes it from this list.
                                    </p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete event
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    “{event.title}” will be moved to the trash and will no longer appear in the active events list.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                    className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                                                >
                                                    {isDeleting ? 'Deleting…' : 'Delete event'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}

interface DetailRowProps {
    icon: typeof CalendarDays;
    label: string;
    value: string;
    valueClassName?: string;
}

function DetailRow({ icon: Icon, label, value, valueClassName }: DetailRowProps) {
    return (
        <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 pt-0.5">
                <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
                <p className={valueClassName ?? 'mt-0.5 text-sm leading-5 font-medium text-slate-700'}>{value}</p>
            </div>
        </div>
    );
}

function RecordRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 text-xs text-slate-500">{label}</span>
            <span
                className={`min-w-0 text-right text-xs font-medium text-slate-700 ${mono ? 'truncate font-mono' : ''}`}
                title={mono ? value : undefined}
            >
                {value}
            </span>
        </div>
    );
}

function formatActivityLabel(event: string | null, fallback: string): string {
    if (!event) return fallback;

    return event.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return 'Image attachment';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

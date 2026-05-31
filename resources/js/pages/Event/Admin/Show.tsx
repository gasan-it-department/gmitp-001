import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarRange, History, MapPin, Pencil, Trash2 } from 'lucide-react';

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
    location_name: string;
    created_at: string | null;
    updated_at: string | null;
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
            return 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300';
        case 'government':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'community':
            return 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-300';
        case 'holiday':
            return 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-300';
        default:
            return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300';
    }
};

export default function EventAdminShow({ event }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const handleTogglePublish = () => {
        router.patch(
            `/api/event/${event.id}/publish`,
            {},
            { headers: { 'X-Municipality-Slug': slug }, preserveScroll: true },
        );
    };

    const handleDelete = () => {
        if (!confirm(`Delete "${event.title}"?`)) return;

        router.delete(`/api/event/${event.id}`, {
            headers: { 'X-Municipality-Slug': slug },
            onSuccess: () => router.visit(`/${slug}/admin/event`),
        });
    };

    return (
        <AppLayout>
            <Head title={`${event.title} — Event`} />

            <div className="m-6 max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Link href={`/${slug}/admin/event`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleTogglePublish}>
                            {event.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Link href={`/${slug}/admin/event/${event.id}/edit`}>
                            <Button>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleDelete} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl">{event.title}</CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClasses(
                                            event.type.value,
                                        )}`}
                                    >
                                        {event.type.label}
                                    </span>
                                    {event.is_published ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                            Draft
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {event.created_at && <span>Created {event.created_at}</span>}
                                    {event.updated_at && <span> · updated {event.updated_at}</span>}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {event.banner && (
                            <a
                                href={event.banner.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block overflow-hidden rounded-lg border bg-slate-50"
                            >
                                <img src={event.banner.url} alt={event.banner.name} className="h-64 w-full object-cover" />
                            </a>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-3 rounded-lg border bg-slate-50/40 p-3">
                                <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                <div className="text-sm">
                                    <p className="font-medium text-slate-700">Schedule</p>
                                    <p className="text-slate-600">{event.start_datetime ?? '—'}</p>
                                    <p className="text-xs text-slate-500">to {event.end_datetime ?? '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border bg-slate-50/40 p-3">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                <div className="text-sm">
                                    <p className="font-medium text-slate-700">Location</p>
                                    <p className="text-slate-600">{event.location_name}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-500">Description</h2>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{event.description}</p>
                        </div>
                    </CardContent>
                </Card>

                {event.audit_log && event.audit_log.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <History className="h-4 w-4" /> Audit Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {event.audit_log.map((entry) => (
                                    <li key={entry.id} className="border-l-2 border-slate-200 pl-3 text-sm">
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <span className="font-medium text-slate-700">
                                                {entry.event ?? entry.description}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{entry.created_at}</span>
                                        </div>
                                        {entry.properties && Object.keys(entry.properties).length > 0 && (
                                            <pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-[11px] text-slate-600">
                                                {JSON.stringify(entry.properties, null, 2)}
                                            </pre>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

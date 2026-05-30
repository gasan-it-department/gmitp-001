import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, History, Pencil, Trash2 } from 'lucide-react';

type EnumOption = { value: string; label: string };

interface AuditEntry {
    id: number | string;
    event: string | null;
    description: string;
    properties: Record<string, unknown> | null;
    causer_id: string | null;
    created_at: string | null;
}

interface ImageItem {
    id: number | string;
    name: string;
    mime_type: string | null;
    size: number | null;
    url: string;
}

interface AnnouncementDetail {
    id: string;
    title: string;
    content: string;
    type: EnumOption;
    is_published: boolean;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
    author: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        full_name: string;
    } | null;
    images: ImageItem[];
    audit_log: AuditEntry[];
}

interface Props {
    announcement: AnnouncementDetail;
}

const typeBadgeClasses = (type: string): string => {
    switch (type) {
        case 'emergency':
            return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300';
        case 'advisory':
            return 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300';
        case 'utility_interruption':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'roadwork':
            return 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300';
        default:
            return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300';
    }
};

export default function AnnouncementAdminShow({ announcement }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const handleTogglePublish = () => {
        router.patch(
            `/api/announcement/${announcement.id}/publish`,
            {},
            { headers: { 'X-Municipality-Slug': slug }, preserveScroll: true },
        );
    };

    const handleDelete = () => {
        if (!confirm(`Delete "${announcement.title}"?`)) return;

        router.delete(`/api/announcement/${announcement.id}`, {
            headers: { 'X-Municipality-Slug': slug },
            onSuccess: () => router.visit(`/${slug}/admin/announcement`),
        });
    };

    return (
        <AppLayout>
            <Head title={`${announcement.title} — Announcement`} />

            <div className="m-6 max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <Link href={`/${slug}/admin/announcement`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleTogglePublish}>
                            {announcement.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Link href={`/${slug}/admin/announcement/${announcement.id}/edit`}>
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
                                <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClasses(
                                            announcement.type.value,
                                        )}`}
                                    >
                                        {announcement.type.label}
                                    </span>
                                    {announcement.is_published ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                            Draft
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {announcement.created_at && <span>Created {announcement.created_at}</span>}
                                    {announcement.author && <span> · by {announcement.author.full_name || '—'}</span>}
                                    {announcement.updated_at && <span> · updated {announcement.updated_at}</span>}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {announcement.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {announcement.images.map((img) => (
                                    <a
                                        key={img.id}
                                        href={img.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block overflow-hidden rounded-lg border bg-slate-50"
                                    >
                                        <img src={img.url} alt={img.name} className="h-40 w-full object-cover" />
                                    </a>
                                ))}
                            </div>
                        )}

                        <div>
                            <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-500">Content</h2>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{announcement.content}</p>
                        </div>
                    </CardContent>
                </Card>

                {announcement.audit_log && announcement.audit_log.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <History className="h-4 w-4" /> Audit Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {announcement.audit_log.map((entry) => (
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

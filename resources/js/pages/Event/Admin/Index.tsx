import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type EnumOption = { value: string; label: string };

type PaginationLink = { url: string | null; label: string; active: boolean };

interface EventListItem {
    id: string;
    title: string;
    type: EnumOption;
    is_published: boolean;
    start_datetime: string | null;
    end_datetime: string | null;
    location_name: string;
    banner_url: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

interface Props {
    events: {
        data: EventListItem[];
        links?: PaginationLink[];
        meta?: { links: PaginationLink[] };
    };
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

export default function EventAdminIndex({ events }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const list = events?.data ?? [];

    const handleTogglePublish = (id: string) => {
        setTogglingId(id);
        router.patch(
            `/api/event/${id}/publish`,
            {},
            {
                headers: { 'X-Municipality-Slug': slug },
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    const handleDelete = (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This will move it to the trash.`)) return;

        setDeletingId(id);
        router.delete(`/api/event/${id}`, {
            headers: { 'X-Municipality-Slug': slug },
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Events" />

            <div className="m-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
                        <p className="text-sm text-muted-foreground">Schedule and publish municipal events for your citizens.</p>
                    </div>

                    <Link href={`/${slug}/admin/event/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Event
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                            <CalendarDays className="h-8 w-8 opacity-40" />
                                            <span>No events scheduled yet.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {list.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell className="max-w-[20rem]">
                                        <div className="flex items-center gap-3">
                                            {e.banner_url ? (
                                                <img
                                                    src={e.banner_url}
                                                    alt={e.title}
                                                    className="h-10 w-14 shrink-0 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400">
                                                    <CalendarDays className="h-4 w-4" />
                                                </div>
                                            )}
                                            <span className="line-clamp-2 font-medium">{e.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClasses(
                                                e.type.value,
                                            )}`}
                                        >
                                            {e.type.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        <div>{e.start_datetime ?? '—'}</div>
                                        <div className="opacity-70">to {e.end_datetime ?? '—'}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{e.location_name}</TableCell>
                                    <TableCell>
                                        {e.is_published ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                Draft
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/${slug}/admin/event/${e.id}`}>
                                                <Button size="sm" variant="ghost" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/${slug}/admin/event/${e.id}/edit`}>
                                                <Button size="sm" variant="ghost" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant={e.is_published ? 'outline' : 'default'}
                                                onClick={() => handleTogglePublish(e.id)}
                                                disabled={togglingId === e.id}
                                            >
                                                {e.is_published ? 'Unpublish' : 'Publish'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(e.id, e.title)}
                                                disabled={deletingId === e.id}
                                                title="Delete"
                                                className="text-destructive hover:bg-red-50 hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}

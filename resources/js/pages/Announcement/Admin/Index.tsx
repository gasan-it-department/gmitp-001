import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type EnumOption = { value: string; label: string };

type PaginationLink = { url: string | null; label: string; active: boolean };

interface AnnouncementListItem {
    id: string;
    title: string;
    type: EnumOption;
    is_published: boolean;
    images_count: number;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

interface Props {
    announcements: {
        data: AnnouncementListItem[];
        links?: PaginationLink[];
        meta?: { links: PaginationLink[] };
    };
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

export default function AnnouncementAdminIndex({ announcements }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const list = announcements?.data ?? [];
    const paginationLinks = announcements?.links ?? announcements?.meta?.links ?? [];

    const handleTogglePublish = (id: string) => {
        setTogglingId(id);
        router.patch(
            `/api/announcement/${id}/publish`,
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
        router.delete(`/api/announcement/${id}`, {
            headers: { 'X-Municipality-Slug': slug },
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Announcements" />

            <div className="m-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
                        <p className="text-sm text-muted-foreground">Publish public-facing bulletins to your municipality.</p>
                    </div>

                    <Link href={`/${slug}/admin/announcement/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Announcement
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Images</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                            <Megaphone className="h-8 w-8 opacity-40" />
                                            <span>No announcements yet.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {list.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell className="max-w-[28rem] font-medium">
                                        <span className="line-clamp-2">{a.title}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClasses(
                                                a.type.value,
                                            )}`}
                                        >
                                            {a.type.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm tabular-nums">{a.images_count}</TableCell>
                                    <TableCell>
                                        {a.is_published ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                Draft
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{a.created_at ?? '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/${slug}/admin/announcement/${a.id}`}>
                                                <Button size="sm" variant="ghost" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/${slug}/admin/announcement/${a.id}/edit`}>
                                                <Button size="sm" variant="ghost" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant={a.is_published ? 'outline' : 'default'}
                                                onClick={() => handleTogglePublish(a.id)}
                                                disabled={togglingId === a.id}
                                            >
                                                {a.is_published ? 'Unpublish' : 'Publish'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(a.id, a.title)}
                                                disabled={deletingId === a.id}
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

                {/* <Pagination links={paginationLinks} /> */}
            </div>
        </AppLayout>
    );
}

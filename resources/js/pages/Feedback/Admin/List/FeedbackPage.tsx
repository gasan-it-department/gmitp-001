import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { FeedbackData } from '@/Core/Types/Feedback/FeedbackTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, MessageSquare, Star } from 'lucide-react';
import feedbackRoutes from '@/routes/feedback';
import Utility from '@/pages/Utility/Utility';

type PaginationLink = { url: string | null; label: string; active: boolean };

interface Props {
    feedbacks: PaginatedResponse<FeedbackData>;
}

export default function FeedbackPage({ feedbacks }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const list = feedbacks?.data ?? [];
    const paginationLinks = feedbacks?.links ?? feedbacks?.meta?.links ?? [];

    return (
        <AppLayout>
            <Head title="Community Feedback" />

            <div className="m-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Community Feedback</h1>
                        <p className="text-sm text-muted-foreground">Manage and view feedback submitted by residents.</p>
                    </div>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Target Party</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Sender</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Date Reported</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                            <MessageSquare className="h-8 w-8 opacity-40" />
                                            <span>No feedback yet.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {list.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{item.department?.name || 'No Department'}</span>
                                            {item.employee_name && <span className="text-xs text-muted-foreground">Employee: {item.employee_name}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                            {item.subject || '—'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[20rem]">
                                        <span className="line-clamp-2 text-xs">{item.message}</span>
                                    </TableCell>
                                    <TableCell>
                                        {item.is_anonymous || !item.citizen_name ? (
                                            <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                Anonymous
                                            </Badge>
                                        ) : (
                                            <span className="text-sm">{item.citizen_name}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <span className="font-bold text-sm">{item.rating || 0}</span>
                                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {Utility().formatToReadableDate(item.created_at) ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                href={feedbackRoutes.admin.show.url({
                                                    municipality: slug,
                                                    feedback: item.id,
                                                })}
                                            >
                                                <Button size="sm" variant="ghost" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
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

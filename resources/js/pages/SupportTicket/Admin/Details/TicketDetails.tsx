import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Loader2, Lock, Paperclip, PlayCircle, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

type Option = { value: string; label: string };
type Attachment = { id: number; name: string; size: number; mime_type: string; url: string };

type Reply = {
    id: string;
    is_staff: boolean;
    body: string;
    author: { id: string; full_name: string } | null;
    attachments: Attachment[];
    created_at: string | null;
};

type Ticket = {
    id: string;
    reference_no: string;
    audience: Option;
    category: Option;
    priority: Option;
    status: Option;
    subject: string;
    description: string;
    requester: { id: string; full_name: string } | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_number: string | null;
    page_url: string | null;
    app_version: string | null;
    environment: Record<string, unknown> | null;
    assigned_to: string | null;
    resolution_note: string | null;
    created_at: string | null;
    acknowledged_at: string | null;
    in_progress_at: string | null;
    resolved_at: string | null;
    closed_at: string | null;
    reopened_at: string | null;
    attachments: Attachment[];
    replies: Reply[];
};

interface TicketDetailsProps {
    ticket: Ticket;
}

const statusBadgeClasses = (status: string): string => {
    switch (status) {
        case 'open':
            return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300';
        case 'acknowledged':
            return 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-300';
        case 'in_progress':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'resolved':
            return 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-300';
        case 'closed':
            return 'bg-gray-200 text-gray-700 ring-1 ring-inset ring-gray-400';
        case 'reopened':
            return 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-300';
        default:
            return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300';
    }
};

export default function TicketDetails({ ticket }: TicketDetailsProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const headers = { 'X-Municipality-Slug': slug };

    const status = ticket.status.value;
    const [busy, setBusy] = useState(false);
    const [showResolve, setShowResolve] = useState(false);

    const startForm = useForm<{ assigned_to: string }>({ assigned_to: ticket.assigned_to ?? '' });
    const resolveForm = useForm<{ resolution_note: string }>({ resolution_note: '' });
    const replyForm = useForm<{ body: string }>({ body: '' });

    const simpleAction = (path: string) => {
        setBusy(true);
        router.post(`/api/support/${ticket.id}/${path}`, {}, {
            headers,
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    const startProgress = () =>
        startForm.post(`/api/support/${ticket.id}/start-progress`, { headers, preserveScroll: true });

    const resolve = (e: React.FormEvent) => {
        e.preventDefault();
        resolveForm.post(`/api/support/${ticket.id}/resolve`, {
            headers,
            preserveScroll: true,
            onSuccess: () => setShowResolve(false),
        });
    };

    const sendReply = (e: React.FormEvent) => {
        e.preventDefault();
        replyForm.post(`/api/support/${ticket.id}/replies`, {
            headers,
            preserveScroll: true,
            onSuccess: () => replyForm.reset(),
        });
    };

    const canAcknowledge = status === 'open' || status === 'reopened';
    const canStart = status === 'open' || status === 'acknowledged' || status === 'reopened';
    const canResolve = status === 'acknowledged' || status === 'in_progress' || status === 'reopened';
    const canClose = status !== 'closed';

    return (
        <AppLayout>
            <Head title={`Ticket ${ticket.reference_no} — Admin`} />

            <div className="mx-auto min-h-screen w-full max-w-5xl bg-slate-50/50 p-8">
                <Link href={`/${slug}/admin/support`} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to tickets
                </Link>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* MAIN COLUMN */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="border border-slate-200">
                            <CardHeader className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-primary/80">
                                        {ticket.reference_no} · {ticket.category.label}
                                    </span>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusBadgeClasses(status)}`}>
                                        {ticket.status.label}
                                    </span>
                                </div>
                                <CardTitle className="text-xl font-bold tracking-tight">{ticket.subject}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{ticket.description}</p>

                                {ticket.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {ticket.attachments.map((a) => (
                                            <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-primary/40 hover:text-primary">
                                                <Paperclip className="h-3.5 w-3.5" />
                                                <span className="line-clamp-1 max-w-[160px]">{a.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {ticket.resolution_note && (
                                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-green-700">Resolution</p>
                                        <p className="text-sm text-green-900">{ticket.resolution_note}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CONVERSATION */}
                        <Card className="border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Conversation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {ticket.replies.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-slate-400">No replies yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {ticket.replies.map((reply) => (
                                            <div key={reply.id} className={`flex ${reply.is_staff ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${reply.is_staff ? 'bg-primary/10 text-slate-800' : 'bg-slate-100 text-slate-800'}`}>
                                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        {reply.is_staff ? reply.author?.full_name ?? 'Staff' : ticket.requester?.full_name ?? 'Requester'} · {reply.created_at ?? ''}
                                                    </p>
                                                    <p className="whitespace-pre-wrap leading-relaxed">{reply.body}</p>
                                                    {reply.attachments.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {reply.attachments.map((a) => (
                                                                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-primary">
                                                                    <Paperclip className="h-3 w-3" />
                                                                    <span className="line-clamp-1 max-w-[120px]">{a.name}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={sendReply} className="space-y-3 border-t border-slate-100 pt-4">
                                    <Textarea
                                        rows={3}
                                        maxLength={5000}
                                        value={replyForm.data.body}
                                        onChange={(e) => replyForm.setData('body', e.target.value)}
                                        placeholder="Reply to the requester…"
                                        className={`resize-none rounded-xl ${replyForm.errors.body ? 'border-destructive' : 'bg-slate-50'}`}
                                    />
                                    {replyForm.errors.body && <p className="text-xs font-medium text-destructive">{replyForm.errors.body}</p>}
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={replyForm.processing || replyForm.data.body.trim() === ''} className="rounded-xl font-bold">
                                            {replyForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Send Reply
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* SIDEBAR */}
                    <div className="space-y-6">
                        {/* ACTIONS */}
                        <Card className="border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {canAcknowledge && (
                                    <Button onClick={() => simpleAction('acknowledge')} disabled={busy} variant="outline" className="w-full justify-start rounded-xl">
                                        <ThumbsUp className="mr-2 h-4 w-4" />
                                        Acknowledge
                                    </Button>
                                )}

                                {canStart && (
                                    <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                                        <Input
                                            value={startForm.data.assigned_to}
                                            onChange={(e) => startForm.setData('assigned_to', e.target.value)}
                                            placeholder="Assign to (optional)"
                                            className="h-10 rounded-lg bg-white text-sm"
                                        />
                                        <Button onClick={startProgress} disabled={startForm.processing} className="w-full justify-start rounded-lg">
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                            Start Progress
                                        </Button>
                                    </div>
                                )}

                                {canResolve && !showResolve && (
                                    <Button onClick={() => setShowResolve(true)} className="w-full justify-start rounded-xl bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Resolve
                                    </Button>
                                )}

                                {canResolve && showResolve && (
                                    <form onSubmit={resolve} className="space-y-2 rounded-xl border border-green-200 bg-green-50 p-3">
                                        <Textarea
                                            rows={3}
                                            value={resolveForm.data.resolution_note}
                                            onChange={(e) => resolveForm.setData('resolution_note', e.target.value)}
                                            placeholder="Resolution note…"
                                            className={`resize-none rounded-lg bg-white text-sm ${resolveForm.errors.resolution_note ? 'border-destructive' : ''}`}
                                        />
                                        {resolveForm.errors.resolution_note && <p className="text-xs text-destructive">{resolveForm.errors.resolution_note}</p>}
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={resolveForm.processing} className="flex-1 rounded-lg bg-green-600 hover:bg-green-700">
                                                Confirm
                                            </Button>
                                            <Button type="button" variant="ghost" onClick={() => setShowResolve(false)} className="rounded-lg">
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {canClose && (
                                    <Button onClick={() => simpleAction('close')} disabled={busy} variant="outline" className="w-full justify-start rounded-xl text-slate-600">
                                        <Lock className="mr-2 h-4 w-4" />
                                        Close
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* META */}
                        <Card className="border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <Meta label="Requester" value={ticket.requester?.full_name ?? ticket.contact_name ?? 'Guest'} />
                                <Meta label="Audience" value={ticket.audience.label} />
                                <Meta label="Priority" value={ticket.priority.label} />
                                <Meta label="Assigned to" value={ticket.assigned_to ?? '—'} />
                                {ticket.contact_email && <Meta label="Email" value={ticket.contact_email} />}
                                {ticket.contact_number && <Meta label="Phone" value={ticket.contact_number} />}
                                {ticket.page_url && <Meta label="Page URL" value={ticket.page_url} />}
                                {ticket.app_version && <Meta label="App version" value={ticket.app_version} />}
                                <Meta label="Opened" value={ticket.created_at ?? '—'} />
                                {ticket.acknowledged_at && <Meta label="Acknowledged" value={ticket.acknowledged_at} />}
                                {ticket.in_progress_at && <Meta label="In progress" value={ticket.in_progress_at} />}
                                {ticket.resolved_at && <Meta label="Resolved" value={ticket.resolved_at} />}
                                {ticket.closed_at && <Meta label="Closed" value={ticket.closed_at} />}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Meta({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <span className="max-w-[60%] break-words text-right text-sm font-medium text-slate-800">{value}</span>
        </div>
    );
}

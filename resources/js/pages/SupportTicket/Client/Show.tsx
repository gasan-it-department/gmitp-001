import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Circle, Paperclip, RotateCcw } from 'lucide-react';
import { statusBadgeClasses } from './List';

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

type TimelineStep = { key: string; label: string; description: string; at: string | null; reached: boolean };

type Ticket = {
    id: string;
    reference_no: string;
    category: Option;
    priority: Option;
    status: Option;
    subject: string;
    description: string;
    created_at: string | null;
};

interface ShowProps {
    ticket: Ticket;
    attachments: Attachment[];
    replies: Reply[];
    timeline: TimelineStep[];
}

export default function Show({ ticket, attachments, replies, timeline }: ShowProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const { post, processing } = useForm({});

    const canReopen = ticket.status.value === 'resolved' || ticket.status.value === 'closed';

    const reopen = () => {
        post(`/api/support/${ticket.id}/reopen`, {
            preserveScroll: true,
            headers: { 'X-Municipality-Slug': slug },
        });
    };

    return (
        <PublicLayout description="View this private support ticket and its replies." title={`Ticket ${ticket.reference_no}`} noIndex>
            <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
                <Link href={`/${slug}/support`} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to my tickets
                </Link>

                {/* HEADER */}
                <Card className="mb-6 border-2 border-slate-100">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-extrabold tracking-wider text-primary/80 uppercase">
                                {ticket.reference_no} · {ticket.category.label}
                            </span>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusBadgeClasses(
                                    ticket.status.value,
                                )}`}
                            >
                                {ticket.status.label}
                            </span>
                        </div>
                        <CardTitle className="text-xl font-extrabold tracking-tight">{ticket.subject}</CardTitle>
                        <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                            Priority: {ticket.priority.label} · Opened {ticket.created_at ?? '—'}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{ticket.description}</p>

                        {attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {attachments.map((a) => (
                                    <a
                                        key={a.id}
                                        href={a.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-primary/40 hover:text-primary"
                                    >
                                        <Paperclip className="h-3.5 w-3.5" />
                                        <span className="line-clamp-1 max-w-[160px]">{a.name}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* TIMELINE */}
                <Card className="mb-6 border-2 border-slate-100">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold tracking-wider text-slate-500 uppercase">Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-4">
                            {timeline.map((step) => (
                                <li key={step.key} className="flex gap-3">
                                    {step.reached ? (
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                    ) : (
                                        <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-300" />
                                    )}
                                    <div className="space-y-0.5">
                                        <p className={`text-sm font-bold ${step.reached ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                                        <p className="text-xs text-slate-500">{step.description}</p>
                                        {step.at && <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{step.at}</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>

                {/* CONVERSATION */}
                <Card className="border-2 border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold tracking-wider text-slate-500 uppercase">Conversation</CardTitle>
                        {canReopen && (
                            <Button variant="outline" size="sm" onClick={reopen} disabled={processing} className="rounded-xl">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reopen
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {replies.length === 0 ? (
                            <p className="py-4 text-center text-sm text-slate-400">No updates have been posted for this ticket.</p>
                        ) : (
                            <div className="space-y-3">
                                {replies.map((reply) => (
                                    <div key={reply.id} className={`flex ${reply.is_staff ? 'justify-start' : 'justify-end'}`}>
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                                reply.is_staff ? 'bg-slate-100 text-slate-800' : 'bg-primary/10 text-slate-800'
                                            }`}
                                        >
                                            <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                {reply.is_staff ? (reply.author?.full_name ?? 'Support') : 'You'} · {reply.created_at ?? ''}
                                            </p>
                                            <p className="leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                                            {reply.attachments.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {reply.attachments.map((a) => (
                                                        <a
                                                            key={a.id}
                                                            href={a.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-primary"
                                                        >
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
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}

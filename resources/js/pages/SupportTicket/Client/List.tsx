import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, ChevronRight, LifeBuoy, Plus, Tag } from 'lucide-react';

type Option = { value: string; label: string };

type TicketListItem = {
    id: string;
    reference_no: string;
    category: Option;
    priority: Option;
    status: Option;
    subject: string;
    created_at: string | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

interface PaginatedTickets {
    data: TicketListItem[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface ListProps {
    tickets: PaginatedTickets;
}

export const statusBadgeClasses = (status: string): string => {
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

export default function List({ tickets }: ListProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    return (
        <PublicLayout description="" title="">
            <Head title="My Support Tickets" />

            <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 text-center sm:text-left">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Support Tickets</h1>
                        <p className="text-sm font-medium text-slate-500">Track the status of your help requests and bug reports.</p>
                    </div>
                    <Link href={`/${slug}/support/create`} className="w-full sm:w-auto">
                        <Button className="h-12 w-full rounded-2xl bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 sm:w-auto">
                            <Plus className="mr-2 h-5 w-5" />
                            New Ticket
                        </Button>
                    </Link>
                </div>

                {tickets.data.length === 0 ? (
                    <Card className="border-none bg-slate-50/50 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <LifeBuoy className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No tickets yet</h3>
                            <p className="mt-2 max-w-xs text-sm font-medium leading-relaxed text-slate-500">
                                When you submit a help request or bug report, it'll show up here so you can track progress.
                            </p>
                            <Link href={`/${slug}/support/create`} className="mt-6">
                                <Button variant="outline" className="rounded-xl border-2 font-bold hover:border-primary hover:bg-primary hover:text-white">
                                    Open a Ticket
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {tickets.data.map((ticket) => (
                            <Link key={ticket.id} href={`/${slug}/support/${ticket.id}`} className="group block">
                                <Card className="overflow-hidden border-2 border-slate-100 transition-all duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]">
                                    <CardContent className="p-0">
                                        <div className="flex items-center p-4 sm:p-5">
                                            <div className="min-w-0 flex-1 space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="truncate text-xs font-extrabold uppercase tracking-wider text-primary/80">
                                                        {ticket.reference_no} · {ticket.category.label}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${statusBadgeClasses(
                                                            ticket.status.value,
                                                        )}`}
                                                    >
                                                        {ticket.status.label}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors group-hover:text-primary">
                                                        {ticket.subject}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {ticket.created_at ?? '—'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Tag className="h-3.5 w-3.5" />
                                                            {ticket.priority.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                                    <ChevronRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}

                        {tickets.last_page > 1 && (
                            <div className="mt-10 space-y-4">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {tickets.links.map((link, idx) => {
                                        const label = link.label
                                            .replace('&laquo;', '‹')
                                            .replace('&raquo;', '›')
                                            .replace('Previous', '')
                                            .replace('Next', '');
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-slate-50 px-3 text-xs font-bold text-slate-300"
                                                    dangerouslySetInnerHTML={{ __html: label }}
                                                />
                                            );
                                        }
                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-xs font-bold transition-all ${
                                                    link.active
                                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                        : 'border-2 border-slate-100 bg-white text-slate-600 hover:border-primary/30 hover:text-primary'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Showing {tickets.from} to {tickets.to} of {tickets.total} tickets
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

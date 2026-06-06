import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, Inbox, LifeBuoy } from 'lucide-react';

type EnumOption = { value: string; label: string };

type RequesterShape = { id: string; full_name: string } | null;

type AdminTicketListItem = {
    id: string;
    reference_no: string;
    audience: EnumOption;
    category: EnumOption;
    priority: EnumOption;
    status: EnumOption;
    subject: string;
    requester: RequesterShape;
    created_at: string | null;
};

interface SupportTicketsPageProps {
    tickets: PaginatedResponse<AdminTicketListItem>;
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

const priorityBadgeClasses = (priority: string): string => {
    switch (priority) {
        case 'urgent':
            return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300';
        case 'high':
            return 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300';
        case 'low':
            return 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-300';
        default:
            return 'bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-300';
    }
};

export default function SupportTicketsPage({ tickets }: SupportTicketsPageProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    return (
        <AppLayout>
            <Head title="Support Tickets — Admin" />

            <div className="mx-auto min-h-screen w-full bg-slate-50/50 p-8">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                            <LifeBuoy className="h-6 w-6 text-slate-500" />
                            Support Tickets
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Manage help requests and bug reports for {currentMunicipality.name}.</p>
                    </div>
                    <div className="text-xs text-slate-500">
                        {tickets.meta.total} total {tickets.meta.total === 1 ? 'ticket' : 'tickets'}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {tickets.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <Inbox className="mb-3 h-10 w-10 text-slate-400" />
                            <p className="text-base font-semibold text-slate-900">No support tickets yet.</p>
                            <p className="mt-1 text-sm text-slate-500">
                                When users submit help requests or bug reports for {currentMunicipality.name}, they'll appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ref</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Requester</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {tickets.data.map((ticket) => (
                                        <tr key={ticket.id} className="transition-colors hover:bg-slate-50/60">
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-500">{ticket.reference_no}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                <span className="line-clamp-1 max-w-xs">{ticket.subject}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="font-medium text-slate-900">{ticket.requester?.full_name ?? 'Guest'}</span>
                                                <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                                    {ticket.audience.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{ticket.category.label}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeClasses(ticket.priority.value)}`}>
                                                    {ticket.priority.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClasses(ticket.status.value)}`}>
                                                    {ticket.status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/${slug}/admin/support/${ticket.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <Pagination links={tickets.meta.links} />
                </div>
            </div>
        </AppLayout>
    );
}

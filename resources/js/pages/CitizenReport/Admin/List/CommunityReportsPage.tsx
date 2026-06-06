import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, EyeOff, FileText, Inbox } from 'lucide-react';

type EnumOption = { value: string; label: string };

type ReporterShape = { id: string; full_name: string } | null;

type AdminReportListItem = {
    id: string;
    category: EnumOption;
    status: EnumOption;
    location_text: string;
    is_anonymous: boolean;
    reporter: ReporterShape;
    created_at: string | null;
};

interface CommunityReportPageProps {
    reports: PaginatedResponse<AdminReportListItem>;
}

const statusBadgeClasses = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
        case 'in_progress':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'resolved':
            return 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-300';
        case 'rejected':
            return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300';
        default:
            return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
    }
};

export default function CommunityReportsPage({ reports }: CommunityReportPageProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    return (
        <AppLayout>
            <Head title="Community Reports — Admin" />

            <div className="mx-auto min-h-screen w-full bg-slate-50/50 p-8">

                {/* 1. Page Header */}
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                            <FileText className="h-6 w-6 text-slate-500" />
                            Community Reports
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage and track all community reports for {currentMunicipality.name}.
                        </p>
                    </div>
                    <div className="text-xs text-slate-500">
                        {reports.meta.total} total {reports.meta.total === 1 ? 'report' : 'reports'}
                    </div>
                </div>

                {/* 2. Data Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {reports.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <Inbox className="mb-3 h-10 w-10 text-slate-400" />
                            <p className="text-base font-semibold text-slate-900">No community reports yet.</p>
                            <p className="mt-1 text-sm text-slate-500">
                                When citizens file reports for {currentMunicipality.name}, they'll appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Reporter
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Location
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {reports.data.map((report) => (
                                        <tr key={report.id} className="transition-colors hover:bg-slate-50/60">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                                                {report.created_at ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">
                                                        {report.reporter?.full_name ?? 'Unknown'}
                                                    </span>
                                                    {report.is_anonymous && (
                                                        <span
                                                            title="Citizen requested anonymity — do not publish this name."
                                                            className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 ring-1 ring-inset ring-purple-300"
                                                        >
                                                            <EyeOff className="h-3 w-3" />
                                                            Anonymous to Public
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                {report.category.label}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                <span className="line-clamp-1 max-w-xs">{report.location_text}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClasses(
                                                        report.status.value,
                                                    )}`}
                                                >
                                                    {report.status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/${slug}/admin/community-reports/${report.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
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

                {/* 3. Pagination */}
                <div className="mt-4 flex justify-end">
                    <Pagination links={reports.meta.links} />
                </div>
            </div>
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import communityReport from '@/routes/communityReport';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight, Eye, FileText, MapPin, Plus } from 'lucide-react';

type EnumOption = { value: string; label: string };

type ReportListItem = {
    id: string;
    category: EnumOption;
    status: EnumOption;
    location_text: string;
    created_at: string | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

interface PaginatedReports {
    data: ReportListItem[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface ListProps {
    reports: PaginatedReports;
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

export default function List({ reports }: ListProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    return (
        <PublicLayout description="" title="">
            <Head title="My Community Reports" />

            <div className="container mx-auto max-w-5xl py-8">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-2xl font-bold">My Community Reports</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">Track the status of issues you've reported to your local government.</p>
                        </div>
                        <Link href={`/${slug}/community-report/create`}>
                            <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                File a New Report
                            </Button>
                        </Link>
                    </CardHeader>

                    <CardContent>
                        {reports.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
                                <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="text-base font-semibold text-foreground">You haven't filed any reports yet.</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    When you submit a report, it'll appear here so you can track its progress.
                                </p>
                                <Link href={`/${slug}/community-report/create`} className="mt-4">
                                    <Button variant="outline" size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        File a New Report
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Desktop / tablet table */}
                                <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
                                    <table className="min-w-full divide-y divide-border">
                                        <thead className="bg-muted/40">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Category
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Location
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border bg-background">
                                            {reports.data.map((report) => (
                                                <tr key={report.id} className="hover:bg-muted/20">
                                                    <td className="px-4 py-3 text-sm text-foreground">{report.created_at ?? '—'}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-foreground">{report.category.label}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        <span className="line-clamp-1 max-w-xs">{report.location_text}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClasses(
                                                                report.status.value,
                                                            )}`}
                                                        >
                                                            {report.status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link
                                                            href={communityReport.show.url({
                                                                municipality: currentMunicipality.slug,
                                                                report_submission: report.id,
                                                            })}
                                                        >
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

                                {/* Mobile card stack */}
                                <div className="space-y-3 md:hidden">
                                    {reports.data.map((report) => (
                                        <Link
                                            key={report.id}
                                            href={`/${slug}/community-report/${report.id}`}
                                            className="block rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/20"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">{report.category.label}</span>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClasses(
                                                                report.status.value,
                                                            )}`}
                                                        >
                                                            {report.status.label}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="line-clamp-1">{report.location_text}</span>
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">{report.created_at ?? '—'}</p>
                                                </div>
                                                <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {reports.last_page > 1 && (
                                    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                                        <p className="text-xs text-muted-foreground">
                                            Showing <b>{reports.from}</b> to <b>{reports.to}</b> of <b>{reports.total}</b> reports
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1">
                                            {reports.links.map((link, idx) => {
                                                const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                                                if (!link.url) {
                                                    return (
                                                        <span
                                                            key={idx}
                                                            className="rounded-md px-3 py-1 text-xs text-muted-foreground/50"
                                                            dangerouslySetInnerHTML={{ __html: label }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <Link
                                                        key={idx}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                                            link.active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}

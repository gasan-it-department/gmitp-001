import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import communityReport from '@/routes/communityReport';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, ChevronRight, FileText, MapPin, Plus } from 'lucide-react';

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
            return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300';
        case 'acknowledged':
            return 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-300';
        case 'in_progress':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'resolved':
            return 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-300';
        case 'rejected':
            return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300';
        default:
            return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300';
    }
};

export default function List({ reports }: ListProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    return (
        <PublicLayout description="" title="">
            <Head title="Aking mga Ulat" />

            <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
                {/* Header Section */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 text-center sm:text-left">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Aking mga Ulat
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            Subaybayan ang estado ng iyong mga isinumiteng ulat.
                        </p>
                    </div>
                    <Link href={`/${slug}/community-report/create`} className="w-full sm:w-auto">
                        <Button className="h-12 w-full rounded-2xl bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 sm:w-auto">
                            <Plus className="mr-2 h-5 w-5" />
                            Bagong Ulat
                        </Button>
                    </Link>
                </div>

                {reports.data.length === 0 ? (
                    <Card className="border-none bg-slate-50/50 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <FileText className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Wala pang nakatalang ulat</h3>
                            <p className="mt-2 max-w-xs text-sm font-medium text-slate-500 leading-relaxed">
                                Kapag ikaw ay nag-sumite ng ulat, makikita mo ito rito para subaybayan ang progreso nito.
                            </p>
                            <Link href={`/${slug}/community-report/create`} className="mt-6">
                                <Button variant="outline" className="rounded-xl border-2 font-bold hover:bg-primary hover:text-white hover:border-primary">
                                    Magsimula Mag-ulat
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {/* Reports List - Modern Card Design */}
                        {reports.data.map((report) => (
                            <Link
                                key={report.id}
                                href={communityReport.show.url({
                                    municipality: slug,
                                    report_submission: report.id,
                                })}
                                className="group block"
                            >
                                <Card className="overflow-hidden border-2 border-slate-100 transition-all duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]">
                                    <CardContent className="p-0">
                                        <div className="flex items-center p-4 sm:p-5">
                                            <div className="min-w-0 flex-1 space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="truncate text-sm font-extrabold uppercase tracking-wider text-primary/80">
                                                        {report.category.label}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${statusBadgeClasses(
                                                            report.status.value,
                                                        )}`}
                                                    >
                                                        {report.status.label}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <h3 className="line-clamp-1 text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                        {report.location_text}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {report.created_at ?? '—'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            Lokasyon
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <ChevronRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}

                        {/* Pagination Section */}
                        {reports.last_page > 1 && (
                            <div className="mt-10 space-y-4">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {reports.links.map((link, idx) => {
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
                                                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-primary/30 hover:text-primary'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Ipinapakita ang {reports.from} hanggang {reports.to} ng {reports.total} ulat
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

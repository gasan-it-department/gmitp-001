import { Card, CardContent } from '@/components/ui/card';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ClipboardList, FileWarning, History, Map, ReceiptText } from 'lucide-react';

interface Props {
    municipality: MunicipalityType;
}

export default function Index({ municipality }: Props) {
    const reports = [
        {
            title: 'Lease Expiry',
            description: 'Expired, expiring soon, and occupied plots without an active responsible person.',
            href: `/${municipality.slug}/cemetery/admin/reports/leases`,
            icon: ReceiptText,
        },
        {
            title: 'Plot Inventory',
            description: 'Plot status, capacity, occupancy, and square-meter inventory by site, section, and block.',
            href: `/${municipality.slug}/cemetery/admin/reports/plots`,
            icon: Map,
        },
        {
            title: 'Missing Documents',
            description: 'Verified records with pending death certificates, burial permits, and related requirements.',
            href: `/${municipality.slug}/cemetery/admin/reports/missing-documents`,
            icon: FileWarning,
        },
        {
            title: 'Interment Lifecycle',
            description: 'Active, moved, exhumed, transferred-out, and voided interment history.',
            href: `/${municipality.slug}/cemetery/admin/reports/interments`,
            icon: History,
        },
    ];

    return (
        <AppLayout>
            <Head title="Cemetery Reports" />

            <div className="m-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Cemetery Reports</h1>
                    <p className="text-sm text-muted-foreground">Operational reports for cemetery records, plots, documents, and lease follow-up.</p>
                </div>

                <section className="grid gap-4 md:grid-cols-2">
                    {reports.map((report) => {
                        const Icon = report.icon;

                        return (
                            <Link key={report.title} href={report.href}>
                                <Card className="h-full transition hover:border-emerald-200 hover:shadow-md">
                                    <CardContent className="flex gap-4 p-5">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-slate-900">{report.title}</h2>
                                            <p className="mt-1 text-sm text-slate-600">{report.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </section>

                <Card>
                    <CardContent className="flex gap-3 p-5 text-sm text-slate-600">
                        <ClipboardList className="mt-0.5 h-5 w-5 text-slate-500" />
                        <p>Excel exports use the same filters as the on-screen table, so staff can review first and export the exact result set.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import CommunityReportPageTable from '@/pages/BulletinBoard/Admin/Components/CommunityReportPageTable';

interface PaginatedReports {
    data: CommunityReportData;
    links: {
        first: string;
        last: string;
        prev: string;
        next: string;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        total: number;
    };
}

interface CommunityReportPageProps {
    reports: PaginatedReports;
}

export default function CommunityReportPage({ reports }: CommunityReportPageProps) {
    console.log(reports.meta.current_page);
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <CommunityReportPageTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

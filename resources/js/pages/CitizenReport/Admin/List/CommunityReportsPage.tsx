import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AdminLayout from '@/layouts/App/AppLayout';
import CommunityReportPageTable from './Components/CommunityReportsTable';

interface CommunityReportPageProps {
    reports: PaginatedResponse<CommunityReportData>;
}

export default function CommunityReportPage({ reports }: CommunityReportPageProps) {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <CommunityReportPageTable reports={reports} />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

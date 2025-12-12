import AdminLayout from '@/layouts/App/AppLayout';
import { AssistanceRequestTable } from '../RequestList/Components/AssistanceRequestTable';
import { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

export interface AssistanceApiResponse {
    data: AssistanceRequest[];
    meta: PaginationMeta;
    links: any;
}

interface Props {
    data: AssistanceApiResponse;
    filters?: any;
}

export default function AdminDashboard({ data, filters }: Props) {
    return (
        <AdminLayout>
            <div className="min-h-screen bg-background">
                <div className="flex">
                    <main className="flex-1 space-y-6 p-6">
                        <AssistanceRequestTable data={data} filters={filters}/>
                        {/* Welcome Section */}
                        {/* <div className="mb-8">
                            <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome back,</h1>
                        </div> */}

                        {/* Summary Cards */}
                        {/* <SummaryCards /> */}
                        {/* <AdminSchedule /> */}
                    </main>
                </div>
            </div>
        </AdminLayout>
    );
}

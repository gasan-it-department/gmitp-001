import AdminLayout from '@/layouts/App/AppLayout';
import { AssistanceRequestTable } from '../RequestList/Components/AssistanceRequestTable';

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <div className="min-h-screen bg-background">
                <div className="flex">
                    <main className="flex-1 space-y-6 p-6">
                        <AssistanceRequestTable/>
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

import AdminLayout from '@/layouts/App/AppLayout';
import CommunityReportPageTable from './Components/CommunityReportPageTable';

export default function CommunityReportPage() {
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
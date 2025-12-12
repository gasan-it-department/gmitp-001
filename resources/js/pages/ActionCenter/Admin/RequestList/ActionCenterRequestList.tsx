// resources/js/Pages/ActionCenter/Admin/RequestList/ActionCenterRequestList.tsx
import AdminLayout from '@/layouts/App/AppLayout';
import { AssistanceApiResponse, AssistanceRequestTable } from './Components/AssistanceRequestTable';

interface Props {
    requests: AssistanceApiResponse;
    filters: any;
}

export default function ActionCenterRequestList({ requests, filters }: Props) {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        {/* Pass the props down to the table */}
                        <AssistanceRequestTable data={requests} filters={filters} />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

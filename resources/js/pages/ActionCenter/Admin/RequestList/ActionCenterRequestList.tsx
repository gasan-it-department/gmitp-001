//components and layput
import AdminLayout from '@/layouts/App/AppLayout';
import { AssistanceRequestTable } from './Components/AssistanceRequestTable';

export default function ActionCenterRequestList() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <AssistanceRequestTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

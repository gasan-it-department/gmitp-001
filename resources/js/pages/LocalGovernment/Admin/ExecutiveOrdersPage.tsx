import AdminLayout from '@/layouts/App/AppLayout';
import ExecutiveOrdersTable from './Components/ExecutiveOrdersTable';

export default function ExecutiveOrdersPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <ExecutiveOrdersTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
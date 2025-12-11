import AdminLayout from '@/layouts/App/AppLayout';
import AwardsTable from './Components/AwardsTable';

export default function AwardsPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <AwardsTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

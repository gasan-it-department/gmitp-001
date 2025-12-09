
import AdminLayout from '@/layouts/App/AppLayout';
import OfficePageTable from './Components/OfficePageTable';

export default function OfficialsPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <OfficePageTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
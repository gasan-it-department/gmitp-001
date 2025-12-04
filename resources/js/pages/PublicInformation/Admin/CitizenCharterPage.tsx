import AdminLayout from '@/layouts/App/AppLayout';
import CitizenCharterTable from './Components/CitizenCharterTable';

export default function BiddingPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <CitizenCharterTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
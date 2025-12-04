import AdminLayout from '@/layouts/App/AppLayout';
import BiddingTable from './Components/BiddingTable';

export default function BiddingPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <BiddingTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
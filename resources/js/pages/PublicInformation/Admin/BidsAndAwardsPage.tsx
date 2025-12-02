import AdminLayout from '@/layouts/App/AppLayout';
import BidsAndAwardsTable from './Components/BidsAndAwardsTable';

export default function BidsAndAwardsPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <BidsAndAwardsTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
import AdminLayout from '@/layouts/App/AppLayout';
import FeedbackPageTable from './Components/FeedbackPageTable';

export default function FeedbackPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        {/* <EventPageTable /> */}
                        <FeedbackPageTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
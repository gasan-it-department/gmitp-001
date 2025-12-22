import AdminLayout from '@/layouts/App/AppLayout';
import AddEditEventsDialog from './Components/AddEditEventsDialog';
import EventPageTable from './Components/EventPageTable';

export default function () {
    return (
        <AdminLayout>
            <section>
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <EventPageTable />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

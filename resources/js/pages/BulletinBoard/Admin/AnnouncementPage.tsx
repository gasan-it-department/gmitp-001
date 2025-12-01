
import AdminLayout from '@/layouts/App/AppLayout';
import AnnouncementPageTable from './Components/AnnouncementPageTable';

export default function AnnouncementPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <AnnouncementPageTable/>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
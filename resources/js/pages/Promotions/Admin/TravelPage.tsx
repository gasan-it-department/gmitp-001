
import AdminLayout from '@/layouts/App/AppLayout';
import TravelPageEditor from './Components/TravelPageEditor';
export default function TravelPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <TravelPageEditor />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
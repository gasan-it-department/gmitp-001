
import AdminLayout from '@/layouts/App/AppLayout';
import OfficialsPageEditor from './Components/OfficialsPageEditor';

export default function OfficialsPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <OfficialsPageEditor />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
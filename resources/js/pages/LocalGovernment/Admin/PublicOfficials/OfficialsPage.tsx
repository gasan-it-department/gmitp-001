
import AdminLayout from '@/layouts/App/AppLayout';
import OfficialsPageEditor from './Create/OfficialsPageEditor';
import YearTermsList from '../TermsOfService/List/YearTermsList';
import OfficialsList from './List/OfficialsList';

export default function OfficialsPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <YearTermsList />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}